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

## Loyverse online receipt sync

The owner connects Loyverse from the existing Staff Desk using **Connect Loyverse**. The registered Loyverse app must use this exact Redirect URL:

`https://asia-southeast1-stone-grill-app.cloudfunctions.net/loyverseOAuthCallback`

The registered client ID is configured as a default in `functions/index.js`. Store the Loyverse App secret in Firebase Secret Manager; never put it in website code or GitHub:

```sh
firebase functions:secrets:set LOYVERSE_CLIENT_SECRET --project stone-grill-app
```

After setting the secret, deploy the existing test project from Cloud Shell using the deployment command above. The deploy command targets `stone-grill-orders-test`; it does not switch production.

When staff verifies a payment, the backend creates one Loyverse sales receipt. It sends the item prices saved with the customer order, checks Loyverse for an existing receipt with the same order number before retrying, and shows sync status in the order details. An owner can retry a failed sync. This creates a completed receipt, not an open POS/KDS ticket.

Before using a real order, the Loyverse account needs one store, matching item names with one variant per item, and a GCash payment type. QR payment prefers a payment type whose name contains QR or GCash; GCash number payment uses a GCash type without QR in its name. If the catalogue cannot be matched, the order remains in the Orders app and the staff detail shows the reason instead of silently recording a wrong item.
