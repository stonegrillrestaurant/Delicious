# Employee privacy and cash advance requests

Employees load only their own masterlist profile, attendance, payroll entries, cash ledger, and requests. A verified login email must match the profile's `staffEmail`. Unknown accounts receive no payroll records. All three existing administrator UIDs retain full access.

## Apply the change

1. Merge and deploy the updated `sys/index.html` first.
2. In the employee masterlist, check that each employee has their own unique registered email. Re-save any email containing uppercase letters or surrounding spaces; the form now normalizes it. Do not assign an administrator account to test employee access: the three administrator UIDs always open the admin interface.
3. In **Firebase project stone-grill-payroll → Firestore Database → Rules**, replace the complete rules with `sys/payroll.firestore.rules` and publish. The existing `/pickleball` rule is retained exactly in effect; this change protects the Stone Grill payroll vault only.
4. Check a registered employee account, an unknown account, and an admin account. Staff should see their own records and request form; unknown users should see the access-denied screen; admins should see the whole payroll app.

Until the new rules are published, the old broad signed-in read permission still applies and employee request creation may be denied. Updating the HTML alone does not protect the database.

## Cash advance workflow

1. The employee submits an amount and reason. The request records their authenticated UID and a server timestamp.
2. An admin approves or rejects it. Approval alone creates no cash ledger entry.
3. After physically handing over the money, the admin selects **Record cash handed over**. A transaction records the handover and creates one linked cash ledger entry. Repeating the action cannot create another entry.
4. The employee selects **I received the cash** after receiving it. This records their authenticated UID and a server timestamp; they cannot alter the request amount, approval, ledger, or another employee's request.

The admin's Cash Advance page shows request history and the request, approval, handover, receipt, and rejection dates. Printing a voucher does not change its status or prove receipt. Confirmations are records of actions by the signed-in accounts.

Old Approved/Printed requests remain unchanged because the former approval handler already posted them to the ledger. They cannot be handed over again through this workflow. Old Pending requests may still be processed; records without an authenticated requester UID cannot receive an employee confirmation. Ask employees to submit new requests for future advances.

## Verification

Tests use the Firestore emulator and exercise the actual handlers extracted from the HTML. They cover JSX syntax, all three admins, employee-only queries (including older numeric employee IDs), unknown/unverified/signed-out users, forged requests, restricted edits, approval without a ledger charge, atomic handover, duplicate handover, employee receipt, and legacy requests.

With Node 20+ and a supported Java installation, run from the repository root:

```sh
npm install --prefix sys/tests
NODE_PATH="$PWD/sys/tests/node_modules" sys/tests/node_modules/.bin/firebase emulators:exec --only firestore --project demo-payroll-privacy --config sys/firebase.test.json 'node --test sys/tests/payroll-security.test.cjs'
```

The demo project runs locally; the tests do not write to the live payroll database.
