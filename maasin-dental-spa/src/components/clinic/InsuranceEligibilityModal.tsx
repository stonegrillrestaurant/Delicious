import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  DollarSign, 
  FileCheck,
  Building,
  User,
  X
} from 'lucide-react';

interface InsuranceEligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
}

export const InsuranceEligibilityModal: React.FC<InsuranceEligibilityModalProps> = ({
  isOpen,
  onClose,
  patientName = 'Emma Watson',
}) => {
  const [payer, setPayer] = useState('Maxicare Dental HMO');
  const [subscriberId, setSubscriberId] = useState('MC-981024881');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedTime, setVerifiedTime] = useState('Today at 08:35 AM');

  if (!isOpen) return null;

  const handleRecheck = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Real-Time Insurance Eligibility</h3>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> EDI 271 Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated electronic clearinghouse check · Payer ID: 00431
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member and Payer details */}
        <div className="my-4 p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Patient / Subscriber</span>
            <span className="font-bold text-slate-900">{patientName}</span>
            <span className="text-[11px] text-slate-500 font-mono block">DOB: 04/15/1994</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Dental HMO / Insurer</span>
            <span className="font-bold text-teal-800">{payer}</span>
            <span className="text-[11px] text-slate-500 font-mono block">Plan: Platinum Comprehensive</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Member ID &amp; Card</span>
            <span className="font-mono font-bold text-slate-800">{subscriberId}</span>
            <span className="text-[11px] text-slate-500 font-mono block">Account # PH-889104</span>
          </div>
        </div>

        {/* Benefit Schedule Breakdown */}
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
              <span className="text-slate-400 font-medium block mb-1">Annual Maximum Benefit</span>
              <span className="font-mono font-bold text-base text-slate-900">₱50,000.00</span>
              <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                ₱38,000.00 Remaining
              </span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
              <span className="text-slate-400 font-medium block mb-1">Annual Copay / Deductible</span>
              <span className="font-mono font-bold text-base text-slate-900">₱1,500.00</span>
              <span className="text-[11px] text-teal-700 font-medium block mt-1">
                ₱1,500.00 Met (100%)
              </span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
              <span className="text-slate-400 font-medium block mb-1">Effective Coverage</span>
              <span className="font-mono font-bold text-base text-slate-900">Active</span>
              <span className="text-[11px] text-slate-500 font-medium block mt-1">
                Renews Jan 1, 2027
              </span>
            </div>
          </div>

          {/* Procedure Category Percentages */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <span className="font-bold text-slate-800 block text-xs">Coverage By Procedure Category:</span>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700 block">Preventive & Diagnostic</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">100%</span>
                <span className="text-[10px] text-slate-400 block">Exams, Prophy, 4-Bitewings</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700 block">Basic Restorative</span>
                <span className="font-mono font-bold text-teal-700 text-sm">80%</span>
                <span className="text-[10px] text-slate-400 block">Resin Fillings, Scaling</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700 block">Major & Endodontic</span>
                <span className="font-mono font-bold text-cyan-700 text-sm">75%</span>
                <span className="text-[10px] text-slate-400 block">Root Canals, Crowns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Last verified: <strong className="text-slate-700">{verifiedTime}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRecheck}
              disabled={isVerifying}
              className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              Re-run 270 Check
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
