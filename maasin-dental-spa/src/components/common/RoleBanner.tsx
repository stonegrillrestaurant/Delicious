import React from 'react';
import { UserRole } from '../../types/dental';
import { 
  User, 
  Stethoscope, 
  ClipboardList, 
  Building2, 
  ShieldAlert, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface RoleBannerProps {
  currentRole: UserRole;
  activeView: string;
  onChangeView: (view: any) => void;
  onOpenBooking: () => void;
  onOpenTriage: () => void;
}

export const RoleBanner: React.FC<RoleBannerProps> = ({
  currentRole,
  activeView,
  onChangeView,
  onOpenBooking,
  onOpenTriage,
}) => {
  const getRoleDetails = () => {
    switch (currentRole) {
      case 'patient':
        return {
          title: 'Maasin Dental Spa — Patient Portal',
          subtitle: 'Book appointments, view treatment plans by Dr. Alfred Roa III, digital radiographs, and contactless payments.',
          icon: User,
          badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
          actions: [
            { id: 'portal', label: 'My Dental Portal' },
            { id: 'booking', label: 'Smart Booking Wizard', action: onOpenBooking },
            { id: 'triage', label: 'AI Symptom Checker', action: onOpenTriage },
          ],
        };
      case 'dentist':
        return {
          title: 'Dentist Operating Suite — Dr. Alfred G. Roa III, DMD',
          subtitle: 'Interactive 32-tooth Odontogram, periodontal probing, phased treatment plans, SOAP clinical notes, and DICOM viewer.',
          icon: Stethoscope,
          badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
          actions: [
            { id: 'odontogram', label: 'Interactive Odontogram' },
            { id: 'treatment_plan', label: 'Treatment Plan Builder' },
            { id: 'soap_notes', label: 'SOAP Notes & E-Rx' },
            { id: 'xrays', label: 'DICOM Radiographs' },
            { id: 'calendar', label: 'Spa Chair Schedule' },
          ],
        };
      case 'receptionist':
        return {
          title: 'Front Desk & Reception Suite — Maria Santos (Maasin Dental Spa)',
          subtitle: 'Chair scheduling matrix, standby waitlist auto-fill, real-time HMO/insurance checks, and patient recall outreach.',
          icon: ClipboardList,
          badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
          actions: [
            { id: 'calendar', label: 'Operatory Chair Matrix' },
            { id: 'waitlist', label: 'Standby Auto-Fill Waitlist' },
            { id: 'recall', label: 'Recall & No-Show Radar' },
            { id: 'booking', label: 'Book Walk-In Patient', action: onOpenBooking },
          ],
        };
      case 'admin':
        return {
          title: 'Clinic Director Dashboard — Dr. Alfred G. Roa III',
          subtitle: 'Maasin Dental Spa practice production KPIs, chair utilization %, patient retention, and audit trail.',
          icon: Building2,
          badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          actions: [
            { id: 'analytics', label: 'Practice Performance KPIs' },
            { id: 'audit_logs', label: 'HIPAA Audit Trail' },
            { id: 'calendar', label: 'All Locations Schedule' },
            { id: 'recall', label: 'Recall Automation' },
          ],
        };
      case 'superadmin':
        return {
          title: 'Super Admin Multi-Tenant Cloud Console (Network Level)',
          subtitle: 'Multi-clinic SaaS subscription management, BAA legal governance, encryption KMS health, and platform MRR analytics.',
          icon: ShieldAlert,
          badgeColor: 'bg-slate-900 text-white border-slate-800',
          actions: [
            { id: 'superadmin', label: 'Multi-Tenant Governance' },
            { id: 'analytics', label: 'Aggregate KPIs' },
            { id: 'audit_logs', label: 'Global Audit Logs' },
          ],
        };
    }
  };

  const details = getRoleDetails();
  const Icon = details.icon;

  return (
    <div className="bg-slate-50 border-b border-slate-200/80 py-3.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs text-slate-800">
            <Icon className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{details.title}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${details.badgeColor}`}
              >
                {currentRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{details.subtitle}</p>
          </div>
        </div>

        {/* View Switcher Chips for Active Role */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {details.actions.map((act) => {
            const isActive = activeView === act.id;
            return (
              <button
                key={act.id}
                onClick={() => {
                  if (act.action) {
                    act.action();
                  } else {
                    onChangeView(act.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white border-teal-700 shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                }`}
              >
                {act.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
