# Maasin Dental Spa booking setup

## Firebase project

Use a dedicated Firebase project for the clinic. Do not use the Stone Grill payroll project.

1. Create a Firebase Web App in that project.
2. Enable Google under Authentication > Sign-in method.
3. Add stonegrillresto.net to Authentication > Settings > Authorized domains.
4. Create the default Cloud Firestore database.
5. Copy firestore.rules into Firestore Rules and publish them.
6. In GitHub > Settings > Secrets and variables > Actions > Variables, add:
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_APP_ID
   - VITE_FIREBASE_STORAGE_BUCKET (optional)
   - VITE_FIREBASE_MESSAGING_SENDER_ID (optional)

Firebase web config values are public identifiers. Firestore Security Rules, not secrecy of the web config, protect the data.

## Assign the first admin/doctor

1. Sign in to the deployed app once with the owner's Google account.
2. In Firebase Console > Firestore Data, open users/{that-uid}.
3. Change role from patient to adminDoctor.
4. Sign out and back in. The owner can then assign clinicDesk to the desk attendant after that person signs in once.

The app supports only patient, clinicDesk, and adminDoctor. Roles are stored in Firestore and checked by the rules. The owner role must be seeded through Firebase Console before the first admin can manage users.

## Included workflow

Patients sign in with Google and request a service/date/time. Requests stay pending until the clinic desk confirms them. The desk attendant can confirm, check in, complete, or cancel appointments. Admin/doctor can also manage clinic user roles.

This version does not include payment, medical records, insurance claims, telehealth, automated SMS, or AI diagnosis.
