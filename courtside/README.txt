COURTSIDE GATHERINGS - PHASE 1 TEST

File: booking.html

Included now:
- Firebase connection using current Courtside/Stone Grill Firebase project config supplied by owner
- Date-driven 6-court calendar
- Courts 1-4 = P250/hour
- Courts 5-6 = P350/hour
- Google sign-in
- Persistent users/{uid} customer profile
- Open Play calendar blocks from openPlaySessions
- Click Open Play to register
- Private rental selection + duration + automatic price
- Firestore transaction + slotLocks to prevent private double-booking
- Real-time listeners for bookings and Open Play
- Payment records/UI are intentionally the next phase; current actions stop at pending_payment

IMPORTANT BEFORE LIVE TESTING:
Firestore Security Rules must allow the required authenticated reads/writes. Do not use open public rules for production.

To create a test Open Play manually in Firestore:
Collection: openPlaySessions
Document: any auto/custom ID
Fields:
  date (string): 2026-09-25
  courtId (number): 3
  startTime (string): 15:00
  endTime (string): 20:00
  pricePerPlayer (number): 100
  maxPlayers (number): 12
  status (string): scheduled

Then open booking.html and select Sep 25, 2026.
