// Courtside Gatherings — shared Firebase/role configuration.
// Temporary role map for the workflow-testing phase.
// Keep the shared Courtside account as the security/system-owner identity,
// use personal accounts for day-to-day admin/staff actions, and move to
// backend-managed roles after the workflow is proven.

export const firebaseConfig = {
  apiKey: "AIzaSyBMKGhDmLs4PMMYgDwALQ5iuDJl-MSY9ls",
  authDomain: "courtside-project.firebaseapp.com",
  projectId: "courtside-project",
  storageBucket: "courtside-project.firebasestorage.app",
  messagingSenderId: "346137142476",
  appId: "1:346137142476:web:c0a03cf5109c2d1fc0ce69"
};

export const OWNER_EMAILS = new Set([
  "courtsidegatherings@gmail.com"
]);

export const ADMIN_EMAILS = new Set([
  "ninoxx@gmail.com"
]);

// Liezl Lopez — confirmed admin Firebase UID.
export const ADMIN_UIDS = new Set([
  "0vm1YjSUohR15LGiduxUdSx2eD92"
]);

// Confirmed Staff 1 account. Add Staff 2 here when its Firebase UID is confirmed.
export const STAFF_UIDS = new Set([
  "r4UwTxOgiKcEkHimmlAkVVlUJMt1"
]);

function normalizedEmail(user) {
  return String(user?.email || "").trim().toLowerCase();
}

export function isSystemOwner(user) {
  if (!user || !user.emailVerified) return false;
  return OWNER_EMAILS.has(normalizedEmail(user));
}

export function isAuthorizedAdmin(user) {
  if (!user || !user.emailVerified) return false;

  return isSystemOwner(user)
    || ADMIN_EMAILS.has(normalizedEmail(user))
    || ADMIN_UIDS.has(String(user.uid || ""));
}

export function isAuthorizedStaff(user) {
  if (!user || !user.emailVerified) return false;
  return STAFF_UIDS.has(String(user.uid || ""));
}

export function isAuthorizedOperator(user) {
  return isAuthorizedAdmin(user) || isAuthorizedStaff(user);
}

export function courtsideRole(user) {
  if (isSystemOwner(user)) return "owner";
  if (isAuthorizedAdmin(user)) return "admin";
  if (isAuthorizedStaff(user)) return "staff";
  return "customer";
}
