# Maasin Dental Spa booking setup

## Firebase project

Use the dedicated Firebase project `spa-booking-a4fb7`. Do not use the Stone Grill payroll project.

1. Create a Firebase Web App in the clinic project.
2. Enable Google under Authentication > Sign-in method.
3. Add `stonegrillresto.net` to Authentication > Settings > Authorized domains.
4. Create the default Cloud Firestore database in `asia-southeast1` (Singapore).
5. Publish the rules in `firestore.rules` under Firestore > Rules.

The Firebase Web App configuration is in `src/firebase.ts`. Web configuration values are public identifiers. Firestore Security Rules, not secrecy of the web config, protect clinic data. Do not put service account keys or OAuth client secrets in the app.

## Assign the first admin/doctor

1. Sign in to the deployed app once with the owner's Google account.
2. In Firebase Console > Firestore Data, open `users/{that-uid}`.
3. Change `role` from `patient` to `adminDoctor`.
4. Sign out and back in. The owner can then assign `clinicDesk` to the desk attendant after that person signs in once.

The app supports only `patient`, `clinicDesk`, and `adminDoctor`. Roles are stored in Firestore and checked by the rules. The owner role must be seeded through Firebase Console before the first admin can manage users.

## Included workflow

Patients sign in with Google and request a service/date/time. Requests stay pending until the clinic desk confirms them. The desk attendant can confirm, check in, complete, or cancel appointments. Admin/doctor can also manage clinic user roles.

This version does not include payment, medical records, insurance claims, telehealth, automated SMS, or AI diagnosis.
