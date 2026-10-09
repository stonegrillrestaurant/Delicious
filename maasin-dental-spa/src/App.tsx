import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, where,
  serverTimestamp, setDoc, updateDoc,
} from 'firebase/firestore';
import {
  GoogleAuthProvider, onAuthStateChanged,
  signInWithPopup, signOut, User as FirebaseUser,
} from 'firebase/auth';
import { CalendarDays, Check, LogOut, MapPin, Phone, UserRound } from 'lucide-react';
import { auth, db, firebaseConfigured } from './firebase';

type Role = 'patient' | 'clinicDesk' | 'adminDoctor';
type UserProfile = { uid: string; displayName: string; email: string; photoURL: string; role: Role };
type Appointment = {
  id: string; patientUid: string; patientName: string; patientEmail: string;
  patientPhone: string; service: string; date: string; time: string; notes: string;
  status: 'pending' | 'confirmed' | 'checkedIn' | 'completed' | 'cancelled';
};
type StaffProfile = UserProfile;

const SERVICES = [
  'Dental consultation / check-up',
  'Cleaning / scaling',
  'Tooth filling',
  'Tooth extraction',
  'Other (please describe in notes)',
];
const ROLE_LABEL: Record<Role, string> = {
  patient: 'Patient',
  clinicDesk: 'Clinic desk attendant',
  adminDoctor: 'Admin / Doctor',
};
const STATUS_LABEL: Record<Appointment['status'], string> = {
  pending: 'For confirmation',
  confirmed: 'Confirmed',
  checkedIn: 'Checked in',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
const today = new Date().toLocaleDateString('en-CA');

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profiles, setProfiles] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState<'appointments' | 'book' | 'users'>('appointments');
  const [form, setForm] = useState({ service: SERVICES[0], date: '', time: '', phone: '', notes: '' });

  const isDesk = profile?.role === 'clinicDesk';
  const isAdmin = profile?.role === 'adminDoctor';
  const isStaff = isDesk || isAdmin;

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const authClient = auth;
    return onAuthStateChanged(authClient, (nextUser) => {
      setUser(nextUser);
      setProfile(null);
      setAppointments([]);
      setProfiles([]);
      setError('');
      if (!nextUser) setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const userRef = doc(db, 'users', user.uid);
    let unsubscribeProfile = () => {};

    const prepareProfile = async () => {
      try {
        const existing = await getDoc(userRef);
        if (!existing.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName || 'Patient',
            email: user.email || '',
            photoURL: user.photoURL || '',
            role: 'patient',
            createdAt: serverTimestamp(),
          });
        }
        unsubscribeProfile = onSnapshot(userRef, (snapshot) => {
          const data = snapshot.data();
          if (!data) return;
          setProfile({
            uid: user.uid,
            displayName: data.displayName || user.displayName || 'Patient',
            email: data.email || user.email || '',
            photoURL: data.photoURL || user.photoURL || '',
            role: isRole(data.role) ? data.role : 'patient',
          });
          setLoading(false);
        }, (err) => {
          setError('Could not load your clinic role. ' + authMessage(err));
          setLoading(false);
        });
      } catch (err) {
        setError('Could not create your patient profile. Check the Firestore rules. ' + authMessage(err));
        setLoading(false);
      }
    };

    setLoading(true);
    void prepareProfile();
    return () => unsubscribeProfile();
  }, [user?.uid]);

  useEffect(() => {
    if (!user || !profile || !db) return;
    const source = collection(db, 'appointments');
    const appointmentQuery = isStaff
      ? query(source, orderBy('requestedAt', 'desc'))
      : query(source, where('patientUid', '==', user.uid));
    const unsubscribe = onSnapshot(appointmentQuery, (snapshot) => {
      const rows = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() } as Appointment))
        .filter((item) => isStaff || item.patientUid === user.uid)
        .sort((a, b) => (b.date + 'T' + b.time).localeCompare(a.date + 'T' + a.time));
      setAppointments(rows);
    }, (err) => setError('Could not load appointments. ' + authMessage(err)));

    let unsubscribeProfiles = () => {};
    if (isAdmin) {
      unsubscribeProfiles = onSnapshot(collection(db, 'users'), (snapshot) => {
        setProfiles(snapshot.docs.map((item) => item.data() as StaffProfile)
          .sort((a, b) => a.displayName.localeCompare(b.displayName)));
      }, (err) => setError('Could not load clinic access. ' + authMessage(err)));
    }
    return () => {
      unsubscribe();
      unsubscribeProfiles();
    };
  }, [user?.uid, profile?.role]);

  const visibleAppointments = useMemo(
    () => appointments.filter((item) => isStaff || item.patientUid === user?.uid),
    [appointments, isStaff, user?.uid],
  );
  const waitingCount = visibleAppointments.filter((item) => item.status === 'pending').length;

  const signIn = async () => {
    if (!auth) return;
    setError('');
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      setError(authMessage(err));
    }
  };

  const submitBooking = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !db) return;
    if (!form.date || !form.time || !form.phone.trim()) {
      setError('Enter your mobile number and preferred date and time.');
      return;
    }
    if (form.date < today) {
      setError('Choose today or a future date.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await addDoc(collection(db, 'appointments'), {
        patientUid: user.uid,
        patientName: user.displayName || 'Patient',
        patientEmail: user.email || '',
        patientPhone: form.phone.trim(),
        service: form.service,
        date: form.date,
        time: form.time,
        notes: form.notes.trim(),
        status: 'pending',
        requestedAt: serverTimestamp(),
      });
      setForm({ service: SERVICES[0], date: '', time: '', phone: '', notes: '' });
      setNotice('Request sent. The clinic desk will contact you to confirm it.');
      setTab('appointments');
    } catch (err) {
      setError('Booking could not be saved. ' + authMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (appointment: Appointment, status: Appointment['status']) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'appointments', appointment.id), { status, updatedAt: serverTimestamp() });
      setNotice('Appointment marked ' + STATUS_LABEL[status].toLowerCase() + '.');
      setError('');
    } catch (err) {
      setError('Could not update appointment. ' + authMessage(err));
    }
  };

  const changeRole = async (person: StaffProfile, role: Role) => {
    if (!db || !isAdmin || person.uid === user?.uid) return;
    try {
      await updateDoc(doc(db, 'users', person.uid), { role, updatedAt: serverTimestamp() });
      setNotice(person.displayName + ' is now ' + ROLE_LABEL[role] + '.');
      setError('');
    } catch (err) {
      setError('Could not update role. ' + authMessage(err));
    }
  };

  if (!firebaseConfigured) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <Brand />
          <h1 className="mt-8 text-2xl font-bold text-slate-900">Online booking is being set up</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Please call the clinic while online booking is being configured.</p>
          <a className="mt-5 inline-flex rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white" href="tel:0535708220">
            <Phone className="mr-2 h-4 w-4" /> Call 053 570 8220
          </a>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f3f7f5] px-4 py-5 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <Brand />
            <a href="tel:0535708220" className="inline-flex items-center rounded-full border border-teal-200 bg-white px-4 py-2.5 text-sm font-bold text-teal-900 shadow-sm hover:bg-teal-50">
              <Phone className="mr-2 h-4 w-4" />053 570 8220
            </a>
          </header>

          <section className="relative isolate mt-6 grid min-h-[500px] overflow-hidden rounded-[2rem] bg-teal-950 shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
            <img src="/maasin-dental-spa/clinic-hero.jpg" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-teal-950/75 to-teal-950/45" />
            <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-100">Thoughtful dental care · Maasin City</p>
              <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl">A healthier smile starts with a simple visit.</h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/85">Request an appointment online. Choose the care you need, send your preferred schedule, and our clinic desk will contact you to confirm availability.</p>

              <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-lg">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-teal-100">
                  <img src="/maasin-dental-spa/clinic/dentist-profile.jpg" alt="Dr. Alfred G. Roa III" className="absolute right-0 top-0 h-[185%] w-auto max-w-none" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-800">Your dentist</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-900">Dr. Alfred G. Roa III, DMD</p>
                  <p className="mt-0.5 text-sm text-slate-600">Maasin Dental Spa · Southern Leyte</p>
                </div>
              </div>

              <button onClick={signIn} className="mt-6 inline-flex w-fit items-center rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-teal-600">
                <GoogleMark /> Continue with Google
              </button>
              <p className="mt-3 text-xs leading-5 text-white/75">Sign in to request an appointment and view your bookings. Your first sign-in creates a patient account.</p>
            </div>

            <aside className="m-5 flex flex-col justify-end rounded-3xl border border-white/70 bg-white/95 p-5 shadow-2xl backdrop-blur sm:m-8 sm:p-7 lg:self-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal-800">Maasin Dental Spa</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">Care close to home.</h2>
              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="text-sm font-bold text-slate-900">Visit the clinic</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">Ruperto K. Kangleon St, Maasin City, 6600 Southern Leyte</p>
                <a href="https://maps.google.com/?q=Maasin+Dental+Spa+Ruperto+K+Kangleon+Street+Maasin+City" target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-bold text-teal-800 hover:text-teal-950">Open map <span className="ml-1" aria-hidden="true">↗</span></a>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="text-sm font-bold text-slate-900">Common appointments</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">Consultation, cleaning, fillings, and tooth extractions. Choose “Other” to describe a different concern.</p>
              </div>
              <a href="tel:0535708220" className="mt-5 inline-flex items-center justify-center rounded-xl bg-teal-800 px-4 py-3 text-sm font-bold text-white hover:bg-teal-900"><Phone className="mr-2 h-4 w-4" />Call 053 570 8220</a>
              <p className="mt-3 text-xs leading-5 text-slate-500">Requests are not confirmed until the clinic contacts you. The clinic will confirm schedule and any applicable fee.</p>
            </aside>
          </section>

          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-800">A look inside</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">Maasin Dental Spa gallery</h2></div>
              <p className="max-w-md text-sm leading-6 text-slate-600">A few photos of our clinic, dentist, and care team.</p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <img src="/maasin-dental-spa/clinic/dentist-and-patient.jpg" alt="Dentist caring for a patient" loading="lazy" className="h-52 w-full object-cover" />
                <figcaption className="px-4 py-3 text-sm font-semibold text-slate-800">Personal dental care</figcaption>
              </figure>
              <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <img src="/maasin-dental-spa/clinic/clinic-room.jpg" alt="Dental treatment room" loading="lazy" className="h-52 w-full object-cover" />
                <figcaption className="px-4 py-3 text-sm font-semibold text-slate-800">Our treatment room</figcaption>
              </figure>
              <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <img src="/maasin-dental-spa/clinic/care-team.jpg" alt="Dental care team at work" loading="lazy" className="h-52 w-full object-cover" />
                <figcaption className="px-4 py-3 text-sm font-semibold text-slate-800">Our care team</figcaption>
              </figure>
              <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <img src="/maasin-dental-spa/clinic/clinic-sign.jpg" alt="Maasin Dental Spa clinic sign" loading="lazy" className="h-52 w-full object-cover" />
                <figcaption className="px-4 py-3 text-sm font-semibold text-slate-800">Welcome to our clinic</figcaption>
              </figure>
            </div>
          </section>

          <p className="mx-auto mt-6 max-w-3xl pb-4 text-center text-xs leading-5 text-slate-500">Appointment requests are not confirmed until the clinic contacts you. The clinic will confirm the schedule and any applicable fee before your visit.</p>
          {error && <div className="mx-auto max-w-3xl"><Alert kind="error">{error}</Alert></div>}
        </div>
      </main>
    );
  }

  if (loading || !profile) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-600">Loading your clinic account…</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Brand compact />
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold text-slate-900">{profile.displayName}</div>
              <div className="text-xs text-slate-500">{ROLE_LABEL[profile.role]}</div>
            </div>
            {profile.photoURL ? <img src={profile.photoURL} alt="" className="h-9 w-9 rounded-full" /> : <UserRound className="h-8 w-8 text-slate-400" />}
            <button onClick={() => auth && signOut(auth)} aria-label="Sign out" className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-7">
        {!isStaff && (
          <section className="mb-6 grid overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm sm:grid-cols-[220px_1fr]">
            <div className="relative h-40 overflow-hidden bg-teal-100 sm:h-full sm:min-h-44"><img src="/maasin-dental-spa/clinic/dentist-profile.jpg" alt="Dr. Alfred G. Roa III" className="absolute right-0 top-0 h-[185%] w-auto max-w-none" /></div>
            <div className="p-5 sm:p-6">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-teal-800">Your dentist · Maasin Dental Spa</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-950">Dr. Alfred G. Roa III, DMD</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Ruperto K. Kangleon St, Maasin City, Southern Leyte. Request your preferred appointment and the clinic desk will contact you to confirm.</p>
              <a href="tel:0535708220" className="mt-3 inline-flex items-center text-sm font-bold text-teal-800"><Phone className="mr-2 h-4 w-4" />053 570 8220</a>
            </div>
          </section>
        )}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Maasin Dental Spa</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{ROLE_LABEL[profile.role]} portal</h1>
            <p className="mt-1 text-sm text-slate-600">{isStaff ? 'Manage appointment requests and clinic access.' : 'Request a visit and keep track of your appointments.'}</p>
          </div>
          {isStaff && <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-900"><strong>{waitingCount}</strong> waiting for confirmation</div>}
        </div>

        <nav className="mb-5 flex flex-wrap gap-2">
          <Tab active={tab === 'appointments'} onClick={() => setTab('appointments')}>Appointments</Tab>
          {!isStaff && <Tab active={tab === 'book'} onClick={() => setTab('book')}>Request appointment</Tab>}
          {isAdmin && <Tab active={tab === 'users'} onClick={() => setTab('users')}>Clinic access</Tab>}
        </nav>

        {notice && <Alert kind="success">{notice}</Alert>}
        {error && <Alert kind="error">{error}</Alert>}

        {tab === 'book' && !isStaff && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-slate-900">Request an appointment</h2>
            <p className="mt-1 text-sm text-slate-500">Your request stays pending until the clinic confirms it.</p>
            <form onSubmit={submitBooking} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Service
                <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm">
                  {SERVICES.map((service) => <option key={service}>{service}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">Mobile number
                <input required type="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" placeholder="09XX XXX XXXX" />
              </label>
              <label className="text-sm font-medium text-slate-700">Preferred date
                <input required type="date" min={today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-700">Preferred time
                <input required type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">Notes (optional)
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} maxLength={500} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" placeholder="Anything the clinic should know?" />
              </label>
              <div className="sm:col-span-2">
                <button disabled={saving} className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60">{saving ? 'Sending request…' : 'Send appointment request'}</button>
              </div>
            </form>
          </section>
        )}

        {tab === 'appointments' && (
          <section className="space-y-3">
            {visibleAppointments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-teal-700" />
                <h2 className="mt-3 font-bold text-slate-900">No appointments yet</h2>
                <p className="mt-1 text-sm text-slate-500">{isStaff ? 'New patient requests will appear here.' : 'Request your first appointment when you are ready.'}</p>
                {!isStaff && <button onClick={() => setTab('book')} className="mt-4 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white">Request an appointment</button>}
              </div>
            ) : visibleAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} clinicStaff={Boolean(isStaff)} patientUid={user.uid} onStatus={updateStatus} />
            ))}
          </section>
        )}

        {tab === 'users' && isAdmin && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Clinic access</h2>
            <p className="mt-1 text-sm text-slate-500">A person must sign in once before their role can be changed. The first admin/doctor role is assigned in Firebase Console.</p>
            <div className="mt-4 divide-y divide-slate-100">
              {profiles.map((person) => (
                <div key={person.uid} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0"><div className="truncate text-sm font-semibold text-slate-900">{person.displayName}</div><div className="truncate text-xs text-slate-500">{person.email}</div></div>
                  <select disabled={person.uid === user.uid} value={person.role} onChange={(e) => changeRole(person, e.target.value as Role)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100" aria-label={'Role for ' + person.displayName}>
                    <option value="patient">Patient</option>
                    <option value="clinicDesk">Clinic desk attendant</option>
                    <option value="adminDoctor">Admin / Doctor</option>
                  </select>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-500">
          <span>Maasin Dental Spa · Ruperto K. Kangleon St, Maasin City, Southern Leyte</span>
          <a href="tel:0535708220" className="font-semibold text-teal-800">Call 053 570 8220</a>
        </footer>
      </div>
    </main>
  );
}

function AppointmentCard({ appointment, clinicStaff, patientUid, onStatus }: {
  appointment: Appointment; clinicStaff: boolean; patientUid: string;
  onStatus: (appointment: Appointment, status: Appointment['status']) => void;
}) {
  const canCancel = appointment.patientUid === patientUid && appointment.status === 'pending';
  const nextStatus: Appointment['status'] | null =
    appointment.status === 'pending' ? 'confirmed' :
    appointment.status === 'confirmed' ? 'checkedIn' :
    appointment.status === 'checkedIn' ? 'completed' : null;
  const badge = appointment.status === 'confirmed' || appointment.status === 'completed'
    ? 'bg-emerald-50 text-emerald-800'
    : appointment.status === 'cancelled' ? 'bg-rose-50 text-rose-700'
    : 'bg-amber-50 text-amber-800';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {clinicStaff && <p className="text-sm font-bold text-slate-900">{appointment.patientName}</p>}
          <p className="mt-0.5 font-semibold text-slate-800">{appointment.service}</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><CalendarDays className="h-4 w-4 text-teal-700" />{appointment.date} · {appointment.time}</p>
          {clinicStaff && <p className="mt-1 flex items-center gap-2 text-sm text-slate-600"><Phone className="h-4 w-4 text-teal-700" />{appointment.patientPhone}</p>}
          {appointment.notes && <p className="mt-2 text-sm text-slate-500">Note: {appointment.notes}</p>}
        </div>
        <span className={'rounded-full px-3 py-1 text-xs font-bold ' + badge}>{STATUS_LABEL[appointment.status]}</span>
      </div>
      {(canCancel || (clinicStaff && nextStatus)) && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          {canCancel && <button onClick={() => onStatus(appointment, 'cancelled')} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">Cancel request</button>}
          {clinicStaff && nextStatus && <button onClick={() => onStatus(appointment, nextStatus)} className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white">{nextStatus === 'confirmed' ? 'Confirm appointment' : nextStatus === 'checkedIn' ? 'Check in patient' : 'Mark completed'}</button>}
          {clinicStaff && appointment.status !== 'cancelled' && appointment.status !== 'completed' && <button onClick={() => onStatus(appointment, 'cancelled')} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">Cancel</button>}
        </div>
      )}
    </article>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-700 text-white"><CalendarDays className="h-5 w-5" /></div><div><div className={'font-extrabold tracking-tight text-slate-900 ' + (compact ? 'text-base' : 'text-lg')}>Maasin Dental Spa</div>{!compact && <div className="text-xs text-slate-500">Appointment booking</div>}</div></div>;
}
function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={'rounded-xl border px-4 py-2.5 text-sm font-semibold ' + (active ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100')}>{children}</button>;
}
function Alert({ kind, children }: { kind: 'error' | 'success'; children: React.ReactNode }) {
  return <div role="status" className={'mb-4 rounded-xl border px-4 py-3 text-sm ' + (kind === 'error' ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900')}>{children}</div>;
}
function GoogleMark() {
  return <span aria-hidden className="mr-2 grid h-5 w-5 place-items-center rounded-full bg-white text-sm font-bold text-blue-600">G</span>;
}
function isRole(value: unknown): value is Role {
  return value === 'patient' || value === 'clinicDesk' || value === 'adminDoctor';
}
function authMessage(error: unknown) {
  const message = error instanceof Error ? error.message : 'Please try again.';
  if (message.includes('permission-denied')) return 'Your Google account is not allowed to do that. Ask the clinic admin to check its Firebase role.';
  if (message.includes('auth/unauthorized-domain')) return 'Add this website to Firebase Authentication authorized domains.';
  if (message.includes('auth/popup-blocked')) return 'Your browser blocked the Google sign-in window. Allow pop-ups for stonegrillresto.net and try again.';
  if (message.includes('auth/popup-closed-by-user')) return 'Google sign-in was closed before it finished. Try again.';
  return message;
}
