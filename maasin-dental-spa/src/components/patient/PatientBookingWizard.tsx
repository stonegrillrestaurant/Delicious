import React, { useState } from 'react';
import { DentalService, Dentist, ClinicLocation, Appointment } from '../../types/dental';
import { 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2, 
  Download, 
  CalendarPlus
} from 'lucide-react';

interface PatientBookingWizardProps {
  services: DentalService[];
  dentists: Dentist[];
  locations: ClinicLocation[];
  onBookingComplete: (newAppointment: Appointment) => void;
  onOpenIntakeForm: () => void;
  initialSelectedServiceId?: string;
  initialSelectedDentistId?: string;
}

export const PatientBookingWizard: React.FC<PatientBookingWizardProps> = ({
  services,
  dentists,
  locations,
  onBookingComplete,
  onOpenIntakeForm,
  initialSelectedServiceId,
  initialSelectedDentistId,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form selections
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialSelectedServiceId || services[0].id
  );
  const [selectedDentistId, setSelectedDentistId] = useState<string>(
    initialSelectedDentistId || dentists[0].id
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string>(locations[0].id);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-09');
  const [selectedTime, setSelectedTime] = useState<string>('10:00');

  // Patient info
  const [patientName, setPatientName] = useState('Emma Watson');
  const [patientPhone, setPatientPhone] = useState('0917 555 0182');
  const [patientEmail, setPatientEmail] = useState('emma.watson@example.com');
  const [insuranceCarrier, setInsuranceCarrier] = useState('Maxicare Dental HMO');
  const [notes, setNotes] = useState('');

  // Confirmation state
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];
  const currentDentist = dentists.find((d) => d.id === selectedDentistId) || dentists[0];
  const currentLocation = locations.find((l) => l.id === selectedLocationId) || locations[0];

  const availableTimeSlots = [
    '08:30',
    '09:15',
    '10:00',
    '11:00',
    '13:30',
    '14:15',
    '15:00',
    '16:00',
  ];

  const handleConfirmBooking = () => {
    const newApt: Appointment = {
      id: `apt_${Date.now()}`,
      patientId: 'user_pat_101',
      patientName,
      patientPhone,
      patientEmail,
      dentistId: currentDentist.id,
      dentistName: currentDentist.name,
      serviceId: currentService.id,
      serviceName: currentService.name,
      serviceCode: currentService.code,
      locationId: currentLocation.id,
      locationName: currentLocation.name,
      operatoryChair: currentDentist.chairAssignment || 'Operatory 1',
      date: selectedDate,
      time: selectedTime,
      durationMinutes: currentService.durationMinutes,
      status: 'confirmed',
      type: 'in_person',
      totalCost: currentService.standardFee,
      insuranceStatus: insuranceCarrier.includes('Self') ? 'self_pay' : 'verified',
      noShowRiskScore: 'low',
      notes,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setConfirmedAppointment(newApt);
    onBookingComplete(newApt);
    setStep(6);
  };

  // Calendar event helpers
  const handleDownloadIcs = () => {
    if (!confirmedAppointment) return;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MaasinDentalSpa//Dental Booking OS//EN
BEGIN:VEVENT
SUMMARY:${confirmedAppointment.serviceName} - Maasin Dental Spa (${confirmedAppointment.dentistName})
DESCRIPTION:Dental appointment at Maasin Dental Spa. Ruperto K. Kangleon St, Maasin, Southern Leyte. Tel: 053 570 -8220.
LOCATION:${currentLocation.address}, ${currentLocation.city}, ${currentLocation.state}
DTSTART:20261009T100000Z
DTEND:20261009T110000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MaasinDentalSpa-Appointment-${confirmedAppointment.date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGoogleCalendarUrl = () => {
    if (!confirmedAppointment) return '#';
    const title = encodeURIComponent(`${confirmedAppointment.serviceName} - Maasin Dental Spa`);
    const details = encodeURIComponent(
      `Appointment with Dr. Alfred G. Roa III, DMD at Maasin Dental Spa. Ruperto K. Kangleon St, Maasin, 6600 Southern Leyte. Tel: 053 570 -8220.`
    );
    const loc = encodeURIComponent(`Ruperto K. Kangleon St, Maasin, 6600 Southern Leyte, Philippines`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${loc}&dates=20261009T100000Z/20261009T110000Z`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden max-w-4xl mx-auto">
      {/* Step Progress Header */}
      <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/60 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Smart Dental Booking</h2>
          <p className="text-xs text-slate-500">Real-time chair booking in under 60 seconds</p>
        </div>

        {step <= 5 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span>Step {step} of 5</span>
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 transition-all duration-300 rounded-full"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Select Dental Care Service
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose the treatment or checkup you require today.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {services.map((service) => {
                const isSelected = selectedServiceId === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/40 shadow-xs ring-2 ring-teal-500/10'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm">{service.name}</span>
                        {service.popular && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">{service.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{service.durationMinutes} mins</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900">₱{service.standardFee.toLocaleString()}</span>
                        {service.insuranceCoveredPercent > 0 && (
                          <span className="text-[10px] text-teal-700 block">
                            Up to {service.insuranceCoveredPercent}% ins. covered
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="py-2.5 px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              >
                Continue to Doctor <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Doctor */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Choose Your Doctor / Specialist
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Our team consists of board-certified endodontists, implantologists, and cosmetic dentists.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {dentists.map((dentist) => {
                const isSelected = selectedDentistId === dentist.id;
                return (
                  <div
                    key={dentist.id}
                    onClick={() => setSelectedDentistId(dentist.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/40 shadow-xs ring-2 ring-teal-500/10'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
                    }`}
                  >
                    <img
                      src={dentist.avatar}
                      alt={dentist.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm">{dentist.name}</h4>
                        <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                          ★ {dentist.rating} ({dentist.reviewsCount})
                        </span>
                      </div>
                      <span className="text-xs text-teal-800 font-semibold block">{dentist.specialty}</span>
                      <p className="text-[11px] text-slate-500 leading-tight mt-1 line-clamp-2">
                        {dentist.bio}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="py-2.5 px-4 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="py-2.5 px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                Continue to Location <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Location */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. Select Clinic Location
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Convenient modern dental studios equipped with 3D CBCT imaging and sterile operatories.
              </p>
            </div>

            <div className="space-y-3">
              {locations.map((loc) => {
                const isSelected = selectedLocationId === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocationId(loc.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/40 shadow-xs ring-2 ring-teal-500/10'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600 mt-0.5">
                        <MapPin className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{loc.name}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {loc.address}, {loc.city}, {loc.state} {loc.zip}
                        </p>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                          <span>Phone: {loc.phone}</span>
                          <span>·</span>
                          <span>{loc.chairsCount} Operatories Available</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="font-mono text-slate-500">{loc.operatingHours.split('|')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="py-2.5 px-4 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="py-2.5 px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                Continue to Date & Time <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Pick Date & Time */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                4. Select Available Date & Time Slot
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Chair availability is synchronized live with {currentDentist.name}&apos;s schedule.
              </p>
            </div>

            {/* Date selection row */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { date: '2026-10-08', day: 'Today', sub: 'Oct 8' },
                { date: '2026-10-09', day: 'Tomorrow', sub: 'Oct 9' },
                { date: '2026-10-12', day: 'Monday', sub: 'Oct 12' },
                { date: '2026-10-13', day: 'Tuesday', sub: 'Oct 13' },
              ].map((d) => (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedDate === d.date
                      ? 'border-teal-600 bg-teal-600 text-white font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block font-bold">{d.day}</span>
                  <span className="text-[11px] opacity-80">{d.sub}</span>
                </button>
              ))}
            </div>

            {/* Time slot pills */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">Available Chair Slots:</span>
              <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                {availableTimeSlots.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-2xs ring-2 ring-teal-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {time} {parseInt(time, 10) < 12 ? 'AM' : 'PM'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(3)}
                className="py-2.5 px-4 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="py-2.5 px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                Continue to Review & Insurance <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Patient Info & Insurance */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                5. Patient Details & Insurance Verification
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                We will verify your dental benefits prior to your arrival so there are zero surprise bills.
              </p>
            </div>

            {/* Booking Summary Box */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block font-medium">Selected Service</span>
                <span className="font-bold text-slate-900">{currentService.name}</span>
                <span className="text-teal-700 font-mono block mt-0.5">
                  Standard Fee: ₱{currentService.standardFee.toLocaleString()} ({currentService.durationMinutes} min)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Doctor & Location</span>
                <span className="font-bold text-slate-900">{currentDentist.name}</span>
                <span className="text-slate-600 block mt-0.5 font-mono">
                  {selectedDate} at {selectedTime} · {currentLocation.name}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Phone (for SMS Reminders)</label>
                <input
                  type="text"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dental HMO / Insurance</label>
                <select
                  value={insuranceCarrier}
                  onChange={(e) => setInsuranceCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Maxicare Dental HMO">Maxicare Dental HMO (Accredited)</option>
                  <option value="PhilCare Dental">PhilCare Health Systems</option>
                  <option value="Intellicare / Asalus">Intellicare / Asalus Dental</option>
                  <option value="Medicard Philippines">Medicard Philippines</option>
                  <option value="Self-Pay / Cash / Maya / GCash">Self-Pay / Cash / Maya / GCash</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                Any Symptoms, Tooth Pain, or Anxieties to Share? (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none text-xs"
                placeholder="e.g. Mild sensitivity to cold water on lower left side; slight dental anxiety."
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(4)}
                className="py-2.5 px-4 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleConfirmBooking}
                className="py-2.5 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Complete Confirmed Booking
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Confirmation Screen with Calendar Sync */}
        {step === 6 && confirmedAppointment && (
          <div className="text-center py-6 space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                Booking Confirmed
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                You&apos;re All Set, {confirmedAppointment.patientName}!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                A confirmation SMS & calendar invite has been dispatched to {confirmedAppointment.patientPhone}.
              </p>
            </div>

            {/* Appointment Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900">{confirmedAppointment.serviceName}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Dentist:</span>
                <span className="font-bold text-slate-900">{confirmedAppointment.dentistName}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-bold font-mono text-teal-800">
                  {confirmedAppointment.date} at {confirmedAppointment.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-medium text-slate-700">{confirmedAppointment.locationName}</span>
              </div>
            </div>

            {/* Calendar Sync Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={handleGoogleCalendarUrl()}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <CalendarPlus className="w-4 h-4 text-teal-600" /> Add to Google Calendar
              </a>
              <button
                onClick={handleDownloadIcs}
                className="py-2 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Download className="w-4 h-4 text-teal-600" /> Apple / Outlook (.ics)
              </button>
            </div>

            {/* Digital Intake Callout */}
            <div className="pt-4 max-w-md mx-auto border-t border-slate-100">
              <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-950 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-left">
                  <span className="font-bold block">Save 15 minutes at check-in</span>
                  <span className="text-[11px] text-teal-800">Complete your medical history and e-sign now.</span>
                </div>
                <button
                  onClick={onOpenIntakeForm}
                  className="py-2 px-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs"
                >
                  Fill Intake Form
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
