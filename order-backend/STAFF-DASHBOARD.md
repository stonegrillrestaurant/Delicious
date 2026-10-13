# Staff dashboard review branch

The Firebase staff dashboard is now tracked in GitHub. This branch adds the previously deployed Firebase backend and staff source, then improves the dashboard for phones. It does not replace the legacy customer ordering page in `order/index.html` or `order/main.js`. Do not deploy the repository root to Firebase: the current Firebase customer checkout remains in the existing Cloud Shell `order-backend/public/order` folder until its source is brought into a separate change.

## Behavior

- One shared active queue, oldest received first, with a total badge and Received / Acknowledged / Verified row indicators. Opening details marks an order seen; this is not payment verification.
- Phones show either the queue or the selected order, with Back to orders. Desktop keeps the queue beside details. Payment reference, amount, customer contact and service are visible in details.
- Verify payment directly against the actual funds received. QR can be verified by owner, admin or cashier; GCash number is owner-only. Table acceptance is combined with verification for reservations. Cooking is optional; Mark ready and Finished (claimed / served) are separate actual milestones.
- Completion or cancellation removes the order from the active queue and preserves history by Philippine received date. Authorized cancellation requires a reason. Cancellation does not issue a refund.
- Owner-only Users & roles supports temporary admin assignments. Demotion clears the loaded roster and sign-in history. Server-side permissions remain authoritative on every action.
- Device alert settings and team activity are expandable. Offline/cached state pauses mutations. A timed-out request asks staff to check the live result before retrying. Cancellation drafts survive live refreshes; backup print requests are guarded while running.
- Notification order links survive initial loading and open the matching details. Alert sounds repeat for unseen orders until opened by the team.

## Checks

Backend (Node 22):

```sh
cd order-backend/functions
npm ci
npm test
```

Staff UI:

```sh
cd order-backend/ui-tests
npm ci
npm test
```

The automated tests cover payment permissions and preparation gates, reference uniqueness, role revocation, oldest-first shared queue, history boundaries, cancellation drafts, notification links and mobile navigation. Browser checks exercised queue, details, verify → ready → finish and owner roster at 320, 390, 768 and 1440 pixels with synthetic demo data. Real sign-in, GCash funds and device push still require the connected test site and actual devices; demo tests do not certify those services.

## Apply only these staff files to the existing test deployment

In a checkout of this branch, run the following staging command. It preserves the existing Firebase checkout, profile, assets and Firebase configuration. It makes a backup and copies only the three revised dashboard files. It does not deploy anything.

```sh
python3 order-backend/stage-staff-update.py
```

Then inspect the staged files and use the existing Cloud Shell backend directory to deploy only test Hosting:

```sh
cd ~/stone-grill-orders-test/order-backend
firebase deploy --only hosting --project stone-grill-app
```

The staging helper refuses any hosting site other than `stone-grill-orders-test`. No functions or shared Firestore rules need redeployment for this UI update. Backend source and rules in this branch are a recovery baseline for the existing Firebase deployment, not an instruction to overwrite other project configuration.

Keep this branch unmerged until the test dashboard is reviewed. Production domains remain excluded from the backend CORS allowlist.
