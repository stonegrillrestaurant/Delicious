# Payroll cash-advance SMS alert

This isolated Cloud Function watches for newly created pending cash-advance
requests and sends one owner alert through TextBee. The request is committed
before the function runs. TextBee errors are caught and recorded only in the
separate `payrollSmsAlerts` collection; payroll never reads that collection.

Configure secrets in the `stone-grill-payroll` Firebase project:

```bash
firebase functions:secrets:set TEXTBEE_API_KEY
firebase functions:secrets:set TEXTBEE_DEVICE_ID
firebase functions:secrets:set PAYROLL_ALERT_RECIPIENT
```

Use international E.164 format for the recipient, such as `+639171234567`.

Deploy only this isolated function codebase:

```bash
cd payroll-backend
npm --prefix functions install
firebase deploy --only functions:stone-grill-payroll-alerts --project stone-grill-payroll
```
