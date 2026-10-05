const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const sdk = require('firebase/firestore');
const babel = require('@babel/core');
const base = 'artifacts/stone-grill-v1/users/TY8qdAMRtsZf48ibeNqdTNdO0aE2';
const admins = ['xqFeiAnYOjOW9VwqTLFBS8n82nM2', 'wtqmtdILKPVyufqoHnkIsu3tmwB3', 'cVahyUL7J4P46IrW0jKrkPy0L772'];
let env, staff, other, outsider, html;
before(async () => {
  html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  env = await initializeTestEnvironment({ projectId: 'demo-payroll-privacy', firestore: {
    host: '127.0.0.1', port: 8085, rules: fs.readFileSync(path.join(__dirname, '../payroll.firestore.rules'), 'utf8')
  }});
  await env.clearFirestore();
  staff = env.authenticatedContext('employee-a', { email: 'a@example.com', email_verified: true }).firestore();
  other = env.authenticatedContext('employee-b', { email: 'b@example.com', email_verified: true }).firestore();
  outsider = env.authenticatedContext('unknown', { email: 'unknown@example.com', email_verified: true }).firestore();
  await env.withSecurityRulesDisabled(async c => {
    const db = c.firestore();
    await sdk.setDoc(sdk.doc(db, base, 'employees', '1'), { staffEmail: 'a@example.com', name: 'Employee A' });
    await sdk.setDoc(sdk.doc(db, base, 'employees', '2'), { staffEmail: 'b@example.com', name: 'Employee B' });
    for (const col of ['attendance', 'cash_advances', 'payroll_entries']) {
      await sdk.setDoc(sdk.doc(db, base, col, 'own-string'), { empId: '1', amount: 100 });
      await sdk.setDoc(sdk.doc(db, base, col, 'own-number'), { empId: 1, amount: 100 });
      await sdk.setDoc(sdk.doc(db, base, col, 'other'), { empId: '2', amount: 100 });
    }
  });
});
after(async () => { if (env) await env.cleanup(); });

test('HTML module and JSX compile', () => {
  for (const type of ['module', 'text/babel']) {
    const code = html.match(new RegExp('<script type="' + type + '">([\\s\\S]*?)</script>'))[1];
    babel.transformSync(code, { presets: [require.resolve('@babel/preset-react')], sourceType: 'module' });
  }
});

test('all three admins retain read and write access', async () => {
  for (const uid of admins) {
    const db = env.authenticatedContext(uid).firestore();
    await assertSucceeds(sdk.getDocs(sdk.collection(db, base, 'employees')));
    await assertSucceeds(sdk.setDoc(sdk.doc(db, base, 'attendance', 'admin-' + uid), { empId: '1' }));
  }
});

test('employees can query only their own profile and records, including legacy numeric IDs', async () => {
  const profile = await assertSucceeds(sdk.getDocs(sdk.query(sdk.collection(staff, base, 'employees'), sdk.where('staffEmail', 'in', ['a@example.com']))));
  assert.deepEqual(profile.docs.map(d => d.id), ['1']);
  await assertFails(sdk.getDocs(sdk.collection(staff, base, 'employees')));
  await assertFails(sdk.getDoc(sdk.doc(staff, base, 'employees', '2')));
  for (const col of ['attendance', 'cash_advances', 'payroll_entries']) {
    const rows = await assertSucceeds(sdk.getDocs(sdk.query(sdk.collection(staff, base, col), sdk.where('empId', 'in', ['1', 1]))));
    assert.ok(rows.docs.every(d => String(d.data().empId) === '1'));
    await assertFails(sdk.getDocs(sdk.collection(staff, base, col)));
    await assertFails(sdk.getDoc(sdk.doc(staff, base, col, 'other')));
    await assertFails(sdk.updateDoc(sdk.doc(staff, base, col, 'own-string'), { amount: 999 }));
  }
  await assertFails(sdk.updateDoc(sdk.doc(staff, base, 'employees', '1'), { staffEmail: 'b@example.com' }));
});

test('unknown, signed-out, and unverified accounts cannot read payroll', async () => {
  const unknownRows = await assertSucceeds(sdk.getDocs(sdk.query(sdk.collection(outsider, base, 'employees'), sdk.where('staffEmail', 'in', ['unknown@example.com']))));
  assert.equal(unknownRows.size, 0);
  const unverified = env.authenticatedContext('unverified', { email: 'a@example.com', email_verified: false }).firestore();
  for (const db of [outsider, unverified, env.unauthenticatedContext().firestore()]) {
    await assertFails(sdk.getDoc(sdk.doc(db, base, 'employees', '1')));
    await assertFails(sdk.getDoc(sdk.doc(db, base, 'cash_advances', 'own-string')));
  }
});

function requestData(overrides = {}) {
  return { empId: '1', requesterUid: 'employee-a', amount: 250, reason: 'Groceries',
    dateRequested: new Date().toISOString(), requestedAt: sdk.serverTimestamp(), status: 'Pending', ...overrides };
}

test('employees may request cash for themselves but cannot spoof identity, approval, amount, timestamps, or ledger writes', async () => {
  const ref = sdk.doc(staff, base, 'ca_requests', 'validation');
  await assertSucceeds(sdk.setDoc(ref, requestData()));
  for (const override of [{ empId: '2' }, { requesterUid: 'employee-b' }, { amount: -1 }, { amount: 0 },
    { amount: '250' }, { reason: '' }, { reason: 'x'.repeat(501) }, { status: 'Approved' },
    { requestedAt: sdk.Timestamp.fromMillis(1) }, { receivedByUid: 'employee-a' }]) {
    await assertFails(sdk.setDoc(sdk.doc(staff, base, 'ca_requests', 'invalid-' + Math.random()), requestData(override)));
  }
  await assertFails(sdk.setDoc(sdk.doc(outsider, base, 'ca_requests', 'outsider'), requestData({ requesterUid: 'unknown' })));
  await assertFails(sdk.updateDoc(ref, { status: 'Approved' }));
  await assertFails(sdk.updateDoc(ref, { amount: 500 }));
  await assertFails(sdk.deleteDoc(ref));
  await assertFails(sdk.setDoc(sdk.doc(staff, base, 'cash_advances', 'spoof'), { empId: '1', amount: 250 }));
  await assertFails(sdk.getDoc(sdk.doc(other, base, 'ca_requests', 'validation')));
  await assertSucceeds(sdk.getDocs(sdk.query(sdk.collection(staff, base, 'ca_requests'), sdk.where('empId', 'in', ['1', 1]))));
});

// Exercise the actual HTML handlers against the emulator, not a second implementation.
function handlers(db, user, role, request = { amount: '300', reason: 'Medicine' }) {
  const start = html.indexOf('            const runCAAction');
  const end = html.indexOf('            const handlePrintReceipt', start);
  const alerts = [];
  // VM objects have a different prototype; the SDK expects its own realm's plain objects.
  const local = data => Object.fromEntries(Object.entries(data));
  const bridge = { ...sdk, db,
    addDoc: (ref, data) => sdk.addDoc(ref, local(data)),
    updateDoc: (ref, data) => sdk.updateDoc(ref, local(data)),
    runTransaction: (database, action) => sdk.runTransaction(database, transaction => action({
      get: ref => transaction.get(ref),
      set: (ref, data) => transaction.set(ref, local(data)),
      update: (ref, data) => transaction.update(ref, local(data))
    }))
  };
  const context = vm.createContext({ window: { fb: bridge, confirm: () => true },
    user, userRole: role, isAdmin: role === 'Admin', currentBiometricId: '1', staffCaRequest: request,
    caActionLock: { current: false }, setCaBusy: () => {}, setStaffCaRequest: () => {},
    alert: message => alerts.push(message), formatMoney: String,
    getVaultCol: col => sdk.collection(db, base, col), getVaultDoc: (col, id) => sdk.doc(db, base, col, id)
  });
  vm.runInContext(html.slice(start, end) + '\nthis.api = { handleStaffSubmitCARequest, handleApproveCARequest, handleRejectCARequest, handleDisburseCARequest, handleConfirmCAReceived };', context);
  return { ...context.api, alerts };
}

test('request → approve → one atomic handover → employee receipt, with duplicate and forged confirmation blocked', async () => {
  const employee = handlers(staff, { uid: 'employee-a' }, 'Staff');
  await employee.handleStaffSubmitCARequest({ preventDefault() {} });
  const rows = await sdk.getDocs(sdk.query(sdk.collection(staff, base, 'ca_requests'), sdk.where('empId', 'in', ['1', 1])));
  const created = rows.docs.find(d => d.data().reason === 'Medicine');
  assert.ok(created, employee.alerts.join("; "));
  const ref = sdk.doc(staff, base, 'ca_requests', created.id);
  await assertFails(sdk.updateDoc(ref, { status: 'Received', receivedByUid: 'employee-a', receivedAt: sdk.serverTimestamp() }));
  const adminDb = env.authenticatedContext(admins[0]).firestore();
  const admin = handlers(adminDb, { uid: admins[0] }, 'Admin');
  const req = { id: created.id, ...created.data() };
  await admin.handleApproveCARequest(req);
  assert.equal((await sdk.getDoc(ref)).data().status, 'Approved');
  assert.equal((await sdk.getDoc(sdk.doc(adminDb, base, 'cash_advances', 'request_' + req.id))).exists(), false);
  await admin.handleDisburseCARequest(req);
  assert.equal((await sdk.getDoc(ref)).data().status, 'Disbursed');
  const ledgerRef = sdk.doc(adminDb, base, 'cash_advances', 'request_' + req.id);
  assert.equal((await sdk.getDoc(ledgerRef)).data().amount, 300);
  await admin.handleDisburseCARequest(req);
  assert.ok(admin.alerts.some(message => message.includes('Only a new approved request')));
  await assertFails(sdk.updateDoc(ref, { status: 'Received', receivedByUid: 'employee-b', receivedAt: sdk.serverTimestamp() }));
  await assertFails(sdk.updateDoc(ref, { status: 'Received', receivedByUid: 'employee-a', receivedAt: sdk.serverTimestamp(), amount: 999 }));
  await assertFails(sdk.updateDoc(sdk.doc(other, base, 'ca_requests', req.id), { status: 'Received', receivedByUid: 'employee-b', receivedAt: sdk.serverTimestamp() }));
  await employee.handleConfirmCAReceived(req);
  const received = (await sdk.getDoc(ref)).data();
  assert.equal(received.status, 'Received');
  assert.equal(received.receivedByUid, 'employee-a');
  assert.ok(received.requestedAt && received.approvedAt && received.disbursedAt && received.receivedAt);
  await assertFails(sdk.updateDoc(ref, { status: 'Received', receivedByUid: 'employee-a', receivedAt: sdk.serverTimestamp() }));
});

test('legacy approvals cannot create a duplicate ledger entry; rejection is recorded', async () => {
  const adminDb = env.authenticatedContext(admins[1]).firestore();
  const admin = handlers(adminDb, { uid: admins[1] }, 'Admin');
  const legacyRef = sdk.doc(adminDb, base, 'ca_requests', 'legacy');
  await sdk.setDoc(legacyRef, { empId: '1', amount: 100, reason: 'Old', status: 'Approved' });
  await admin.handleDisburseCARequest({ id: 'legacy', amount: 100 });
  assert.equal((await sdk.getDoc(sdk.doc(adminDb, base, 'cash_advances', 'request_legacy'))).exists(), false);
  assert.equal((await sdk.getDoc(legacyRef)).data().status, 'Approved');
  const rejectRef = sdk.doc(staff, base, 'ca_requests', 'reject');
  await sdk.setDoc(rejectRef, requestData());
  await admin.handleRejectCARequest('reject');
  const rejected = (await sdk.getDoc(rejectRef)).data();
  assert.equal(rejected.status, 'Rejected');
  assert.equal(rejected.rejectedByUid, admins[1]);
});


test('legacy pending requests can be approved and handed over once without rewriting old approvals', async () => {
  const db = env.authenticatedContext(admins[2]).firestore();
  const admin = handlers(db, { uid: admins[2] }, 'Admin');
  const ref = sdk.doc(db, base, 'ca_requests', 'legacy-pending');
  await sdk.setDoc(ref, { empId: '1', amount: 150, reason: 'Old pending', status: 'Pending' });
  await admin.handleApproveCARequest({ id: 'legacy-pending' });
  await admin.handleDisburseCARequest({ id: 'legacy-pending', amount: 150 });
  assert.equal((await sdk.getDoc(ref)).data().status, 'Disbursed');
  assert.equal((await sdk.getDoc(sdk.doc(db, base, 'cash_advances', 'request_legacy-pending'))).data().amount, 150);
  await admin.handleDisburseCARequest({ id: 'legacy-pending', amount: 150 });
  assert.equal((await sdk.getDoc(ref)).data().status, 'Disbursed');
});
