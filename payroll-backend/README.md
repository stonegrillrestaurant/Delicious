# Payroll cash-advance SMS alert

This isolated Cloud Function watches for newly created pending cash-advance
requests and sends one owner alert through TextBee. The request is committed
before the function runs. TextBee errors are caught and recorded only in the
separate `payrollSmsAlerts` collection; payroll never reads that collection.

Store the provider settings in the server-only Firestore document
`payrollPrivateConfig/textbee` with string fields `apiKey`, `deviceId`, and
`recipient`. The payroll security rules expose no client access to that
top-level collection. Use international E.164 format for the recipient, such
as `+639171234567`.

Deploy only this isolated function codebase:

```bash
cd payroll-backend
npm --prefix functions install
firebase deploy --only functions:stone-grill-payroll-alerts --project stone-grill-payroll
```
