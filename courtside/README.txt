COURTSIDE GATHERINGS - SYSTEM QUICK GUIDE
Last updated: 2026-09-28

PURPOSE
This file is the quick operational guide for the Courtside Gatherings booking, payment, verification, staff, live-court, and reporting system.

OFFICIAL FIREBASE PROJECT
Project ID: courtside-project
Project number: 346137142476

IMPORTANT:
Do not use the old stone-grill-payroll Firebase project for Courtside operations.
All current Courtside pages must use courtside-config.js.

--------------------------------------------------
1. MAIN PAGES
--------------------------------------------------

CUSTOMER BOOKING
https://stonegrillresto.net/courtside/booking.html

ADMIN / OPERATIONS PANEL
https://stonegrillresto.net/pickle-dashboard/admin.html

PAYMENT VERIFICATION
https://stonegrillresto.net/courtside/verify-payment.html

PUBLIC LIVE DISPLAY
https://stonegrillresto.net/pickle-dashboard/live.html

AUTH TEST
https://stonegrillresto.net/courtside/auth-test.html

--------------------------------------------------
2. CURRENT TEMPORARY ROLES
--------------------------------------------------

SYSTEM OWNER / SECURITY ACCOUNT
courtsidegatherings@gmail.com

Purpose:
- emergency/backend access
- security account
- system owner
- should not be used as one person's normal working identity

WORKING ADMIN
ninoxx@gmail.com

Purpose:
- admin operations
- payment verification
- reports
- schedule control
- management actions

STAFF 1
Firebase UID:
r4UwTxOgiKcEkHimmlAkVVlUJMt1

Purpose:
- live venue operations
- walk-in/manual registration
- queue/court operations
- check-in when enabled
- no payment verification
- no reports/history/security controls

Staff 2 and the remaining Admin accounts can be added after their real Firebase accounts are confirmed.

--------------------------------------------------
3. SYSTEM FLOW
--------------------------------------------------

CUSTOMER FLOW

1. Customer opens booking.html.
2. Public schedule is read-only until the customer signs in.
3. Customer signs in with Google.
4. Customer chooses Open Play or Rent Court.
5. Firebase checks availability before the booking is confirmed.
6. For Rent Court, confirming the selected time creates a temporary hold.
7. Private rental hold duration: 10 minutes.
8. Customer submits GCash reference number.
9. Booking becomes PENDING VERIFICATION.
10. Admin verifies the reference.
11. Booking becomes VERIFIED.
12. Staff checks customer in at the venue.
13. Booking becomes CHECKED-IN.
14. Open Play players enter the live court/queue only after check-in.
15. After the session ends, the active customer status should no longer remain available for another check-in.

MAIN STATUS FLOW

PENDING -> VERIFIED -> CHECKED-IN -> FINISHED / EXPIRED

PENDING
Payment/reference submitted but not yet verified.

VERIFIED
Payment confirmed by Admin. Customer has not yet physically arrived.

CHECKED-IN
Customer physically arrived and Staff/Admin accepted the customer into the session.

FINISHED
Customer checked in and completed/used the session.

EXPIRED
Verified/reserved customer did not arrive before the session ended.

--------------------------------------------------
4. RENT COURT RULES
--------------------------------------------------

Courts 1-4:
P250 per hour

Courts 5-6:
P350 per hour

Customer may book one hour or multiple hours.

The schedule can be selected before confirmation by more than one visitor.
The actual protection happens when Firebase confirms the booking hold.

When the customer confirms the selected rental time:
- Firebase creates hourly slotLocks
- the time becomes unavailable to other customers
- customer gets 10 minutes to submit payment reference

If the customer closes the payment window before submitting payment:
- the unpaid private-rental hold should be released
- the court/time becomes available again

If the 10-minute hold expires without payment:
- the hold is considered expired
- the court/time can be reused

If another customer confirms an overlapping time first:
- Firebase must reject the conflicting booking
- customer must choose another available time

--------------------------------------------------
5. OPEN PLAY RULES
--------------------------------------------------

A court is RENT COURT / available by default.

Open Play exists only when Admin manually assigns a court/date/time as Open Play.

Open Play session includes:
- court
- date
- start time
- end time
- price per player
- max players

Max players can be adjusted by Admin per Open Play court/session.

Online Open Play customers:
- reserve through booking.html
- submit payment
- become VERIFIED after Admin verification
- must not enter the live queue simply because payment is verified
- enter the live court/queue only after physical CHECK-IN

Walk-ins:
- are entered manually at the venue
- are allowed only on a court manually configured as Open Play
- are part of venue/staff operation
- only walk-in/manual payments should count toward the live Today's Revenue total

--------------------------------------------------
6. PAYMENT
--------------------------------------------------

PAYMENT QR FILE
/courtside/IMG_4950.jpeg

The filename should remain the same when replacing the QR image in the future.
Replace the image file only; booking.html should continue using the same path.

GCASH MOBILE
09173065956

Customer UI should provide:
- QR image
- tap-to-copy mobile number
- GCash reference input
- optional payment screenshot

CUSTOMER HELP
Mobile: 09173065956
Messenger: https://m.me/courtsidegatherings

Payment screenshot is optional.
GCash reference number is required.

PAYMENT AMOUNT MODEL
The booking calculates the amount the customer is expected to pay.
If the customer has a carried balance from an earlier CONSIDER decision, that balance is added to the next payment total.

During verification the Admin enters:
- the actual GCash reference received
- the actual amount received

Admin then chooses:
VERIFY
Normal verification. The booking proceeds.

CONSIDER
The booking proceeds, but any shortage is carried to customerBalances and an immutable balanceTransactions record is created. The customer sees the outstanding balance and it is added to the next payment total.

ALLOW
The booking proceeds and the Admin deliberately accepts the difference. No shortage is carried forward.

A payment amount mismatch is not automatically treated as a system error. The Admin makes the business decision and the system records what happened.

--------------------------------------------------
7. PAYMENT VERIFICATION
--------------------------------------------------

Verification is Admin-only.

Admin workflow:
1. Open verify-payment.html.
2. Enter the exact GCash reference.
3. Firebase searches paymentSubmissions.
4. One exact valid pending record -> verify.
5. Duplicate reference -> stop and review.
6. No match -> remain pending and review details.

Verification page is where payment details belong.

It should show:
- pending submissions
- verified bookings
- date/time
- customer/player name
- court/service
- reference
- amount
- clear action buttons

Do not use the Verification page for physical customer check-in.

--------------------------------------------------
8. STAFF / LIVE OPERATIONS
--------------------------------------------------

The operations panel is the venue-facing workspace.

Staff should be able to:
- operate current courts
- add walk-ins
- move players between valid Open Play courts
- manage queue/matches
- extend playing time when space is available
- record venue payments
- perform physical check-in when the check-in workflow is enabled

Staff must NOT:
- verify GCash references
- edit payment references
- open sensitive reports/history
- manage security/backend roles

Only one active controller should change live state at a time.
Other authorized operators may be view-only while another controller owns the live-panel lease.

--------------------------------------------------
9. LIVE PAGE
--------------------------------------------------

live.html is a public display.

It now uses:
pickleball/publicLive

NOT:
pickleball/currentState

Reason:
publicLive is a privacy-safe copy of the operational display data.

The Admin/Staff panel writes currentState.
It also publishes a sanitized display version to publicLive.

Do not place private customer payment/contact data in publicLive.

--------------------------------------------------
10. TODAY'S REVENUE
--------------------------------------------------

The live Today's Revenue number is for venue/manual collections only.

Include:
- paid walk-in Open Play
- manual venue rental payments
- applicable manual extensions

Do NOT include online GCash booking payments in this live venue-cash total.

Online payment records are tracked separately through paymentSubmissions/bookings.

--------------------------------------------------
11. SAVE DAY REPORT
--------------------------------------------------

The old destructive "End Day & Archive" behavior has been changed.

Current intended behavior:
SAVE DAY REPORT DOES NOT RESET THE LIVE DAY.

Example:
- Admin saves a report at 3:00 PM -> snapshot contains records from start of day through 3:00 PM.
- Admin saves again at 4:00 PM -> new snapshot contains records from start of day through 4:00 PM.

The live board must remain unchanged.

Snapshots are written to:
daySnapshots

Admin audit action is written to:
eventLogs

History/report records should include the Admin who created the record.

--------------------------------------------------
12. IMPORTANT FIRESTORE COLLECTIONS
--------------------------------------------------

customers
Customer profile/private customer data.

publicSchedule
Privacy-safe shared court schedule.

openPlaySessions
Admin-created Open Play sessions.

openPlayRegistrations
Customer Open Play registration records.

openPlaySeatLocks
Atomic Open Play seat/capacity protection.

privateRentalBookings
Private rental records.

slotLocks
Atomic hourly private-rental protection.

paymentSubmissions
Submitted payment/reference records including expected amount, actual amount received, and Admin decision.

customerBalances
Current outstanding balance per customer.

balanceTransactions
Immutable audit ledger for carried balances and later balance settlements.

playerActivity
Attendance/activity records.

rewardTransactions
Future loyalty/reward ledger.

adminSessions/livePanel
Live Panel controller lease.

pickleball/currentState
Private operational/live state for Admin/Staff.

pickleball/publicLive
Privacy-safe public TV/live display state.

pickleball/historyVault
Admin history/report storage.

eventLogs
Permanent operator/admin event audit records.

daySnapshots
Non-destructive cumulative daily report snapshots.

--------------------------------------------------
13. FIRESTORE RULES
--------------------------------------------------

RULE FILE
/courtside/firestore.rules

IMPORTANT:
The GitHub rules file may contain newer rules than what is currently published in Firebase.

Do not assume a GitHub rules edit is live.

Whenever rules are changed:
1. Review the complete firestore.rules file.
2. Publish the same rules in Firebase Firestore Rules.
3. Wait for publish confirmation.
4. Test with one Admin, one Staff, and one normal Customer.
5. Do not open the database with allow read, write: if true.

CURRENT DEVELOPMENT NOTE
The latest workflow requires the newer role/staff/publicLive/daySnapshots/eventLogs rules.
Do not start full workflow testing until the updated rules are deliberately published.

--------------------------------------------------
14. QUICK TROUBLESHOOTING
--------------------------------------------------

CUSTOMER CANNOT BOOK
Check:
- customer signed in with Google
- correct date selected
- selected court/time is still free
- hold has not expired
- Firestore rules are published
- booking.html is using courtside-project

PAYMENT SUBMITTED BUT ADMIN CANNOT SEE IT
Check:
- paymentSubmissions
- payment status = pending_verification
- same Firebase project
- Admin is using an authorized account
- Firestore rules are published

ADMIN CANNOT ENTER ADMIN PANEL
Check:
- Google account email
- email is verified
- account exists in courtside-config.js role map
- Firestore rules contain same authorization

STAFF CANNOT ENTER OPERATIONS
Check:
- Staff signed into the correct Google/Firebase account
- Firebase UID matches the STAFF_UIDS entry
- Firestore rules are published with the same UID

CUSTOMER SHOWS VERIFIED BUT NOT IN LIVE COURT
This is normally correct until physical CHECK-IN.
VERIFIED does not automatically mean the player is present.

LIVE PAGE SHOWS DB BLOCKED / NO DATA
Check:
- live.html uses courtside-project
- live.html reads pickleball/publicLive
- publicLive rule allows public read
- Admin/Staff panel has saved/published a current sanitized live state

COURT LOOKS BOOKED BUT CUSTOMER HOLD SHOULD BE EXPIRED
Check:
- privateRentalBookings status
- holdUntil
- slotLocks
- publicSchedule
Do not manually delete records unless the normal release/expiry workflow has failed and the Admin is deliberately resolving the exception.

--------------------------------------------------
15. DEVELOPMENT SAFETY RULE
--------------------------------------------------

Before adding any new feature, protect this order:

BOOKING/PAYMENT TRUTH
        ->
ADMIN VERIFICATION
        ->
STAFF CHECK-IN
        ->
LIVE OPERATIONS
        ->
REPORTS / HISTORY

Do not make currentState the booking authority.
Do not let Verification directly add players into the live queue.
Do not let Staff edit payment truth.
Do not let customer-facing pages expose private operational data.

If a new feature can be handled by the existing structure, extend the existing structure instead of creating another parallel source of truth.

--------------------------------------------------
16. CURRENT TESTING PRIORITY
--------------------------------------------------

Finish and test this complete cycle before adding new major features:

Admin creates Open Play / court schedule
        ->
Customer books
        ->
Customer submits payment
        ->
Admin verifies
        ->
Customer appears VERIFIED
        ->
Staff checks in customer
        ->
Open Play player enters live court/queue
        ->
Live page reflects current state
        ->
Customer status updates
        ->
Day report can be saved without resetting operations

After this cycle works reliably, test:
- multi-hour rentals
- overlapping rental attempts
- expired 10-minute holds
- multiple bookings by same customer
- advance bookings
- no-show/EXPIRED
- FINISHED sessions
- manual extensions
- staff shift changes
- reports and printing

END OF QUICK GUIDE
