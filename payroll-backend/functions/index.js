'use strict';

const {onDocumentCreated} = require('firebase-functions/v2/firestore');
const {initializeApp} = require('firebase-admin/app');
const {getFirestore, Timestamp} = require('firebase-admin/firestore');

initializeApp();

const db = getFirestore();

const MASTER_UID = 'TY8qdAMRtsZf48ibeNqdTNdO0aE2';
const REQUEST_PATH = `artifacts/stone-grill-v1/users/${MASTER_UID}/ca_requests/{requestId}`;
const PRIVATE_CONFIG_PATH = 'payrollPrivateConfig/textbee';

function money(value) {
  return Number(value).toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function safeReason(error) {
  const value = error instanceof Error ? error.message : String(error || 'Unknown error');
  return value.replace(/[\r\n]+/g, ' ').slice(0, 300);
}

async function writeAlertLog(requestId, data) {
  try {
    await db.collection('payrollSmsAlerts').doc(requestId).set({
      requestId,
      updatedAt: Timestamp.now(),
      ...data,
    }, {merge: true});
  } catch (error) {
    console.error('Could not write isolated payroll SMS log', requestId, safeReason(error));
  }
}

async function getTextBeeConfig() {
  const snapshot = await db.doc(PRIVATE_CONFIG_PATH).get();
  if (!snapshot.exists) throw new Error('TextBee private configuration is missing');

  const config = snapshot.data() || {};
  const apiKey = String(config.apiKey || '').trim();
  const deviceId = String(config.deviceId || '').trim();
  const recipient = String(config.recipient || '').trim();
  if (!apiKey || !deviceId) throw new Error('TextBee private configuration is incomplete');
  if (!/^\+[1-9]\d{7,14}$/.test(recipient)) {
    throw new Error('TextBee recipient must use international E.164 format');
  }
  return {apiKey, deviceId, recipient};
}

exports.notifyAdminOfCashAdvance = onDocumentCreated({
  document: REQUEST_PATH,
  region: 'asia-southeast1',
  maxInstances: 2,
  timeoutSeconds: 30,
  memory: '256MiB',
  retry: false,
}, async event => {
  const requestId = event.params.requestId;

  // This observer is intentionally fail-open. The request already exists before
  // this function runs, and no SMS outcome is written back to the payroll data.
  try {
    const request = event.data?.data();
    if (!request || request.status !== 'Pending') {
      await writeAlertLog(requestId, {status: 'skipped', reason: 'Not a pending request'});
      return;
    }

    const amount = Number(request.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      await writeAlertLog(requestId, {status: 'skipped', reason: 'Invalid amount'});
      return;
    }

    let employeeName = `Employee ${String(request.empId || '').trim() || 'unknown'}`;
    try {
      const employee = await db.doc(
        `artifacts/stone-grill-v1/users/${MASTER_UID}/employees/${String(request.empId)}`
      ).get();
      if (employee.exists) {
        const profile = employee.data();
        employeeName = profile.name ||
          `${profile.firstName || ''} ${profile.lastName || ''}`.trim() ||
          employeeName;
      }
    } catch (error) {
      console.warn('Employee name lookup failed; sending alert with employee ID', requestId, safeReason(error));
    }

    const {apiKey, deviceId, recipient} = await getTextBeeConfig();

    const response = await fetch('https://api.textbee.dev/api/v1/gateway/send-sms', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        deviceId,
        recipients: [recipient],
        message: `Stone Grill Payroll: New cash advance request from ${employeeName} - PHP ${money(amount)}. Open payroll to approve or reject.`,
      }),
      signal: AbortSignal.timeout(15000),
    });

    let responseBody = {};
    try { responseBody = await response.json(); } catch (_) {}
    if (!response.ok) {
      throw new Error(`TextBee HTTP ${response.status}`);
    }

    await writeAlertLog(requestId, {
      status: 'accepted',
      acceptedAt: Timestamp.now(),
      smsBatchId: responseBody?.data?.smsBatchId || responseBody?.smsBatchId || null,
    });
  } catch (error) {
    // Swallow every provider/configuration failure so TextBee can never affect
    // cash-advance submission, approval, rejection, or any payroll calculation.
    console.error('Isolated TextBee payroll alert failed', requestId, safeReason(error));
    await writeAlertLog(requestId, {
      status: 'failed',
      failedAt: Timestamp.now(),
      reason: safeReason(error),
    });
  }
});
