import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, where,
  serverTimestamp, setDoc, updateDoc,
} from 'firebase/firestore';
import {
  GoogleAuthProvider, getRedirectResult, onAuthStateChanged,
  signInWithRedirect, signOut, User as FirebaseUser,
} from 'firebase/auth';
import { CalendarDays, Check, LogOut, Phone, UserRound } from 'lucide-react';
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
    getRedirectResult(authClient).catch((err: Error) => setError(authMessage(err)));
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
      await signInWithRedirect(auth, new GoogleAuthProvider());
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
      <main className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-slate-50 px-4 py-8 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <Brand />
          <section className="mt-10 grid gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 md:grid-cols-2">
            <div className="self-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Maasin City · Southern Leyte</p>
              <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">Dental appointments, made simple.</h1>
              <p className="mt-4 text-sm leading-6 text-slate-600">Request a visit, choose a service, and the clinic desk will confirm your schedule.</p>
              <button onClick={signIn} className="mt-6 inline-flex items-center rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800">
                <GoogleMark /> Continue with Google
              </button>
              <p className="mt-3 text-xs text-slate-500">Sign in to request an appointment and view your bookings.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <h2 className="font-bold text-slate-900">Common appointments</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                {SERVICES.slice(0, 4).map((service) => <li key={service} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-teal-700" />{service}</li>)}
              </ul>
              <p className="mt-5 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">The clinic will confirm availability and any applicable fee before your visit.</p>
              <a href="tel:0535708220" className="mt-3 inline-flex items-center text-sm font-semibold text-teal-800"><Phone className="mr-2 h-4 w-4" />053 570 8220</a>
            </div>
          </section>
          {error && <Alert kind="error">{error}</Alert>}
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
  return message;
}
