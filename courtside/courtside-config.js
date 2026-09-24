// Courtside Gatherings — shared Firebase/role configuration.
// All Courtside pages import this file so project identity and admin roles stay aligned.

export const firebaseConfig = {
  apiKey: "AIzaSyBMKGhDmLs4PMMYgDwALQ5iuDJl-MSY9ls",
  authDomain: "courtside-project.firebaseapp.com",
  projectId: "courtside-project",
  storageBucket: "courtside-project.firebasestorage.app",
  messagingSenderId: "346137142476",
  appId: "1:346137142476:web:c0a03cf5109c2d1fc0ce69"
};

export const ADMIN_EMAILS = new Set([
  "courtsidegatherings@gmail.com",
  "lzl.lopez@yahoo.com",
  "dod_ong@yahoo.com"
]);

export function isAuthorizedAdmin(user) {
  if (!user) return false;
  const email = String(user.email || "").trim().toLowerCase();
  return Boolean(user.emailVerified) && ADMIN_EMAILS.has(email);
}
