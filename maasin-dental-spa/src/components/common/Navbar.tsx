import React from 'react';
import { UserRole, User } from '../../types/dental';
import { 
  Sparkles, 
  Mic, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Activity, 
  Bell, 
  ChevronDown, 
  Users, 
  Building,
  HeartPulse,
  Download
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSelectRole: (role: UserRole) => void;
  onOpenTriage: () => void;
  onOpenVoiceBooking: () => void;
  onOpenDocs: () => void;
  onOpenInsuranceModal: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectRole,
  onOpenTriage,
  onOpenVoiceBooking,
  onOpenDocs,
  onOpenInsuranceModal,
  unreadCount = 2,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center font-extrabold text-base shadow-sm ring-2 ring-teal-500/20">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                Maasin <span className="text-teal-600">Dental Spa</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200 font-mono">
                DMD
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 -mt-0.5">
              <span className="font-semibold text-slate-700">Dr. Alfred G. Roa III</span>
              <span>·</span>
              <a href="tel:0535708220" className="hover:text-teal-600 font-mono text-[10px]">
                053 570 -8220
              </a>
            </div>
          </div>
        </div>

        {/* Global Quick Actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onOpenTriage}
            className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 border border-teal-200/80 text-teal-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Symptom Triage</span>
          </button>

          <button
            onClick={onOpenVoiceBooking}
            className="py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Mic className="w-3.5 h-3.5 text-teal-600" />
            <span>Voice Booking</span>
          </button>

          <button
            onClick={onOpenInsuranceModal}
            className="py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Insurance 270 Check</span>
          </button>

          <button
            onClick={onOpenDocs}
            className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span>PRD &amp; Architecture</span>
          </button>
        </div>

        {/* Role Switcher & Persona Details + Download Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/maasin-dental-spa.zip"
            download="maasin-dental-spa.zip"
            className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Download full project ZIP (ready for GitHub Desktop & Visual Studio)"
          >
            <Download className="w-3.5 h-3.5 text-white animate-bounce" />
            <span>Download ZIP</span>
          </a>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs">
            <span className="text-[11px] font-semibold text-slate-500 pl-2 hidden sm:inline">
              Role:
            </span>
            <select
              value={currentUser.role}
              onChange={(e) => onSelectRole(e.target.value as UserRole)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="patient">Patient (Emma)</option>
              <option value="dentist">Dentist (Dr. Alfred Roa III)</option>
              <option value="receptionist">Receptionist (Maria)</option>
              <option value="admin">Clinic Director (Dr. Roa)</option>
              <option value="superadmin">Super Admin (Network)</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 pl-1 border-l border-slate-200">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <div className="hidden lg:block text-left text-xs leading-tight">
              <span className="font-bold text-slate-900 block truncate max-w-[120px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-teal-700 font-semibold uppercase">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
