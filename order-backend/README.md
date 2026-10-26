# Complete Stone Grill ordering test project

This checkout builds the customer ordering page, Google/email sign-in, profile and order progress/history, staff/admin dashboard, menu and payment QR assets, and Firebase backend together. The legacy restaurant pages at the repository root are not used by this build.

## One deployment command

Use a fresh checkout in Cloud Shell. Existing Firebase/Google credentials and permissions for `stone-grill-app` are required. No new Firebase project, app registration or customer/staff accounts are needed.

```sh
git clone --branch codex/staff-dashboard-mobile --single-branch https://github.com/stonegrillrestaurant/Delicious.git ~/stone-grill-complete
cd ~/stone-grill-complete/order-backend
nvm install 22
npm run deploy:test
```

If `~/stone-grill-complete` already exists, update that branch in its existing checkout instead of cloning over it. Do not run this build in the old hand-managed `~/stone-grill-orders-test/order-backend` directory: its `public` folder is preserved by a build guard.

The command installs the locked server/UI dependencies, builds the full site, runs the backend and UI tests, deploys the orders functions plus Firestore rules/indexes and Storage rules, verifies/imports existing payment references, then publishes test Hosting. It initializes the ignored environment file with the already-known public Storage bucket setting if that file is absent. There are no Telegram credentials.

## HitPay hosted checkout

The customer page includes a HitPay hosted checkout option. The order backend creates the payment request using the server-side `HITPAY_API_KEY`; the customer browser never receives that key. The order remains pending until the `payment_request.completed` webhook validates the raw-body HMAC signature with `HITPAY_WEBHOOK_SALT`, checks the PHP amount and order reference, then records payment verification. The manual QR and GCash-number options remain available during setup and verification.

Before deploying the HitPay backend, configure Firebase Functions secrets named exactly `HITPAY_API_KEY` and `HITPAY_WEBHOOK_SALT`. For sandbox, leave `HITPAY_API_BASE_URL` at its default, `https://api.sandbox.hit-pay.com/v1`. In HitPay Sandbox, register the webhook URL `https://asia-southeast1-stone-grill-app.cloudfunctions.net/hitpayWebhook` for `payment_request.completed`. For production, use the production API key and webhook salt and set `HITPAY_API_BASE_URL` to `https://api.hit-pay.com/v1`. Do not switch production credentials or publish the production site until sandbox checkout and webhook verification have succeeded.

## Payment verification SMS

When an authorized cashier or admin changes an order's payment status to `verified`, the backend queues one confirmation SMS to the customer's saved Philippine mobile number using the registered TextBee Android device. The SMS reports that payment was received and verified and points the customer to My Orders. TextBee accepting a message means it is queued; delivery is not guaranteed. An SMS failure is recorded separately and never changes the payment verification.

Before deploying the function, create a fresh TextBee API key and revoke any key that has been shared in chat. Keep the API key and device ID in Firebase Secret Manager; do not put either in GitHub, the website, or a shell command. In Cloud Shell, run `firebase functions:secrets:set TEXTBEE_API_KEY --project stone-grill-app` and then `firebase functions:secrets:set TEXTBEE_DEVICE_ID --project stone-grill-app`, entering each value only at its hidden prompt. After that, the existing GitHub Actions deployment can deploy the function from `main`.

If dependency installation, tests, backend deployment or reference migration fails, it stops before the Hosting publication step. Firebase services deploy separately; this is not an atomic release and already-successful backend/rule changes are not rolled back automatically. Fix the reported error and rerun the same command.

Only the `stone-grill-orders` functions codebase and `stone-grill-orders-test` Hosting site are targeted in project `stone-grill-app`. Firestore and Storage rules are project-wide: the tracked Firestore rules preserve comments and the owner/Genarlyn daily-sales collection access. Reconcile any later console rule edits before running deployment; the CLI releases the tracked rules. No accounts, sales records, roles or orders are deleted by this command.

## Resulting pages

- Customer ordering: https://stone-grill-orders-test.web.app/order/
- Customer profile, current progress and history: https://stone-grill-orders-test.web.app/order/account/
- Staff/admin: https://stone-grill-orders-test.web.app/order/staff/

The site root redirects to `/order/`. Production `stonegrillresto.net` is not switched. The backend source now includes the production origin, but Functions must be redeployed before the live site can call it; Firebase Authentication must also authorize `stonegrillresto.net`. Authentication provider settings, authorized domains and the public Web Push key remain those previously configured for this Firebase project.

GitHub automatically builds this branch and runs the backend and customer/staff flow tests on pull requests and branch updates. The check also verifies that the deployment command targets the test site. It does not deploy Firebase or touch production. Open the pull request’s **Checks** tab to see the result; no terminal is needed for this validation.

## Build and check without deployment

```sh
npm run build
npm ci --prefix functions
npm ci --prefix ui-tests
npm test
npm run deploy:test -- --dry-run
```

`web/order` contains the complete Firebase customer frontend. The build copies the staff source from `../order/staff` and the shared Firebase configuration from `../order/firebase-config.js`. The customer menu is generated from `functions/menu.json`, so the frontend/server catalog cannot drift. Generated `public` files are ignored in Git. The build validates local HTML links/assets, JSON, manifests and browser JavaScript syntax. Test pages use noindex and test-site canonical links.

Automated checks cover pricing, payment references, permissions, preparation and completion, profiles/progress, retry behavior, and the staff queue/mobile interactions. Real Google sign-in, external GCash funds and push notifications must still be verified on the deployed test site with actual accounts/devices before any production launch.
