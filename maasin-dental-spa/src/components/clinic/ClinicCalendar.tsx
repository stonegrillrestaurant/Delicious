import React, { useState } from 'react';
import { Appointment, AppointmentStatus, Dentist, ClinicLocation } from '../../types/dental';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  UserCheck, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Filter, 
  MapPin, 
  Phone, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface ClinicCalendarProps {
  appointments: Appointment[];
  dentists: Dentist[];
  locations: ClinicLocation[];
  onUpdateStatus: (appointmentId: string, newStatus: AppointmentStatus) => void;
  onReschedule: (appointmentId: string, newTime: string, newChair: string) => void;
  onNewAppointmentClick: () => void;
}

export const ClinicCalendar: React.FC<ClinicCalendarProps> = ({
  appointments,
  dentists,
  locations,
  onUpdateStatus,
  onReschedule,
  onNewAppointmentClick,
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>(locations[0].id);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-08');
  const [chairViewFilter, setChairViewFilter] = useState<'all' | string>('all');
  const [activeAppointmentModal, setActiveAppointmentModal] = useState<Appointment | null>(null);

  const operatoryChairs = [
    'Spa Operatory 1',
    'Spa Operatory 2',
    'Hygiene Suite 3',
  ];

  const timeSlots = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
  ];

  const filteredAppointments = appointments.filter(
    (apt) => apt.locationId === selectedLocationId && apt.date === selectedDate
  );

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'in_chair':
        return 'bg-purple-100 text-purple-800 border-purple-200 animate-pulse';
      case 'checked_in':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'confirmed':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'scheduled':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'no_show':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'cancelled':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getRiskBadge = (risk: Appointment['noShowRiskScore']) => {
    if (risk === 'high') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
          <AlertCircle className="w-3 h-3" /> High No-Show Risk
        </span>
      );
    }
    if (risk === 'medium') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
          Med Risk
        </span>
      );
    }
    return (
      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
        Low Risk
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Calendar Top Bar */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Operatory Chair Matrix</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {locations.find((l) => l.id === selectedLocationId)?.name}
              </span>
              <span>·</span>
              <span>Today ({filteredAppointments.length} Appointments)</span>
            </div>
          </div>
        </div>

        {/* Location & Date Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Location Switcher */}
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

          {/* Date Picker Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSelectedDate('2026-10-07')}
              className={`px-2 py-1 rounded-lg ${
                selectedDate === '2026-10-07' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Oct 7
            </button>
            <button
              onClick={() => setSelectedDate('2026-10-08')}
              className={`px-2 py-1 rounded-lg ${
                selectedDate === '2026-10-08' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Today (Oct 8)
            </button>
            <button
              onClick={() => setSelectedDate('2026-10-09')}
              className={`px-2 py-1 rounded-lg ${
                selectedDate === '2026-10-09' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Oct 9
            </button>
          </div>

          <button
            onClick={onNewAppointmentClick}
            className="py-2 px-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Book Chair
          </button>
        </div>
      </div>

      {/* Operatory Chairs Grid Header */}
      <div className="overflow-x-auto">
        <div className="min-w-[950px]">
          {/* Chairs column header */}
          <div className="grid grid-cols-12 bg-slate-50/90 border-b border-slate-200 text-xs font-semibold text-slate-600">
            <div className="col-span-2 py-3 px-4 border-r border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
              Time Slot
            </div>
            {operatoryChairs.map((chair, idx) => (
              <div key={chair} className="col-span-3 py-3 px-3 border-r border-slate-200 last:border-r-0">
                <div className="font-bold text-slate-900">{chair}</div>
                <div className="text-[10px] text-slate-500 font-normal truncate">
                  {idx === 0
                    ? 'Dr. Alfred G. Roa III, DMD'
                    : idx === 1
                    ? 'Dr. Kristina Tan, DMD'
                    : 'Oral Spa & Whitening'}
                </div>
              </div>
            ))}
            <div className="col-span-1 py-3 px-2">
              <div className="font-bold text-slate-900 text-[11px]">Virtual</div>
              <div className="text-[9px] text-slate-500 font-normal">Video</div>
            </div>
          </div>

          {/* Time Rows */}
          <div className="divide-y divide-slate-100">
            {timeSlots.map((time) => {
              return (
                <div key={time} className="grid grid-cols-12 min-h-[92px] hover:bg-slate-50/30 transition-colors">
                  {/* Time label */}
                  <div className="col-span-2 p-3 border-r border-slate-200 flex flex-col justify-start">
                    <span className="font-mono font-bold text-slate-700 text-xs">{time}</span>
                    <span className="text-[10px] text-slate-400">
                      {parseInt(time, 10) < 12 ? 'AM' : 'PM'}
                    </span>
                  </div>

                  {/* Operatory Columns */}
                  {operatoryChairs.map((chair) => {
                    const matchedApts = filteredAppointments.filter(
                      (apt) => apt.operatoryChair.includes(chair) && apt.time.startsWith(time.slice(0, 2))
                    );

                    return (
                      <div
                        key={chair}
                        className="col-span-3 p-1.5 border-r border-slate-200 last:border-r-0 relative group min-h-[85px]"
                      >
                        {matchedApts.length > 0 ? (
                          matchedApts.map((apt) => (
                            <div
                              key={apt.id}
                              onClick={() => setActiveAppointmentModal(apt)}
                              className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-teal-500 transition-all cursor-pointer flex flex-col justify-between h-full"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="font-bold text-slate-900 text-xs truncate">
                                    {apt.patientName}
                                  </span>
                                  <span
                                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${getStatusBadge(
                                      apt.status
                                    )}`}
                                  >
                                    {apt.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-[11px] text-teal-800 font-medium truncate leading-tight">
                                  {apt.serviceName}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                                <span>{apt.time} ({apt.durationMinutes}m)</span>
                                {getRiskBadge(apt.noShowRiskScore)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="w-full h-full border border-dashed border-transparent hover:border-slate-300 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-slate-400 font-medium">+ Open Slot</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Virtual Chair Column */}
                  <div className="col-span-1 p-1 relative group">
                    {filteredAppointments
                      .filter((apt) => apt.type === 'telehealth' && apt.time.startsWith(time.slice(0, 2)))
                      .map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => setActiveAppointmentModal(apt)}
                          className="p-2 rounded-xl bg-teal-50 border border-teal-200 shadow-2xs hover:shadow-md cursor-pointer text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-teal-950 text-xs truncate">
                              {apt.patientName}
                            </span>
                            <span className="text-[9px] bg-teal-200 text-teal-900 font-bold px-1.5 py-0.5 rounded">
                              Telehealth
                            </span>
                          </div>
                          <p className="text-[11px] text-teal-800 truncate">{apt.serviceName}</p>
                          <span className="text-[10px] text-teal-600 block mt-1 font-mono">{apt.time}</span>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Appointment Detail / Status Management Modal */}
      {activeAppointmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Operatory Chair Dispatch
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {activeAppointmentModal.patientName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-mono">{activeAppointmentModal.patientPhone}</span>
                  <span>·</span>
                  <span>{activeAppointmentModal.patientEmail}</span>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${getStatusBadge(
                  activeAppointmentModal.status
                )}`}
              >
                {activeAppointmentModal.status.replace('_', ' ')}
              </span>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-medium block">Service &amp; Procedure</span>
                  <span className="font-bold text-slate-900">{activeAppointmentModal.serviceName}</span>
                  <span className="text-[11px] text-slate-500 font-mono block">
                    Code: {activeAppointmentModal.serviceCode} (₱{activeAppointmentModal.totalCost.toLocaleString()})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Doctor & Operatory</span>
                  <span className="font-bold text-slate-900">{activeAppointmentModal.dentistName}</span>
                  <span className="text-[11px] text-teal-700 font-medium block">
                    {activeAppointmentModal.operatoryChair}
                  </span>
                </div>
              </div>

              {/* No-show risk scoring */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span>AI Attendance Reliability Analysis</span>
                    {getRiskBadge(activeAppointmentModal.noShowRiskScore)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {activeAppointmentModal.noShowRiskFactor ||
                      'Patient has 98% attendance reliability across past 4 visits. Automated 2-hour SMS reminder dispatched.'}
                  </p>
                </div>
              </div>

              {activeAppointmentModal.notes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-950">
                  <span className="font-bold block text-[11px] text-amber-800 uppercase tracking-wider mb-0.5">
                    Chairside Clinical Notes:
                  </span>
                  <p className="text-xs leading-relaxed">{activeAppointmentModal.notes}</p>
                </div>
              )}

              {/* Status Update Actions */}
              <div className="pt-2">
                <span className="font-semibold text-slate-700 block mb-2">Advance Chair Status:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onUpdateStatus(activeAppointmentModal.id, 'checked_in');
                      setActiveAppointmentModal(null);
                    }}
                    className="p-2 border border-slate-200 rounded-xl text-center hover:bg-slate-50 font-medium text-slate-700"
                  >
                    Check In Patient
                  </button>
                  <button
                    onClick={() => {
                      onUpdateStatus(activeAppointmentModal.id, 'in_chair');
                      setActiveAppointmentModal(null);
                    }}
                    className="p-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl font-bold hover:bg-purple-100"
                  >
                    Seat in Chair
                  </button>
                  <button
                    onClick={() => {
                      onUpdateStatus(activeAppointmentModal.id, 'completed');
                      setActiveAppointmentModal(null);
                    }}
                    className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold hover:bg-emerald-100"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  onUpdateStatus(activeAppointmentModal.id, 'cancelled');
                  setActiveAppointmentModal(null);
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium"
              >
                Cancel Appointment
              </button>
              <button
                onClick={() => setActiveAppointmentModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
