import React, { useState } from 'react';
import { AiTriageResult } from '../../types/dental';
import { triageDentalSymptoms } from '../../services/geminiDentalAi';
import { 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2, 
  X, 
  ArrowRight,
  HeartPulse,
  Activity,
  Info
} from 'lucide-react';

interface AiTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBooking: (serviceName: string) => void;
}

export const AiTriageModal: React.FC<AiTriageModalProps> = ({
  isOpen,
  onClose,
  onSelectBooking,
}) => {
  const [symptomsText, setSymptomsText] = useState(
    'Sharp throbbing pain in my lower left molar whenever I drink cold water or bite down. Pain has lingered for 3 days and woke me up last night.'
  );
  const [painLevel, setPainLevel] = useState<number>(7);
  const [duration, setDuration] = useState('3 days');
  const [swelling, setSwelling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiTriageResult | null>(null);

  if (!isOpen) return null;

  const handleRunTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await triageDentalSymptoms(symptomsText, painLevel, duration, swelling);
      setResult(res);
    } finally {
      setIsLoading(false);
    }
  };

  const setPreset = (text: string, pain: number, hasSwelling: boolean) => {
    setSymptomsText(text);
    setPainLevel(pain);
    setSwelling(hasSwelling);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-xl shadow-xs">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">AI Dental Symptom Triage</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                  Powered by Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Clinical decision support for urgency detection, pain assessment, and immediate routing.
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

        {!result ? (
          /* Input Form */
          <form onSubmit={handleRunTriage} className="mt-4 space-y-4 text-xs">
            {/* Quick Symptom Chips */}
            <div>
              <span className="font-semibold text-slate-700 block mb-1.5">Common Quick Symptoms:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setPreset(
                      'Throbbing lower left toothache sensitive to cold water and hot tea for 3 days.',
                      7,
                      false
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-[11px]"
                >
                  Throbbing Molar Pain
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPreset(
                      'Puffiness and swollen bump on my gum near upper tooth with constant ache.',
                      8,
                      true
                    )
                  }
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px]"
                >
                  Swollen Gum / Abscess
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPreset(
                      'Gums bleed slightly when brushing or flossing, no severe sharp pain.',
                      3,
                      false
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-[11px]"
                >
                  Bleeding Gums
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPreset(
                      'Chipped corner of upper front tooth while eating lunch, sharp edge against tongue.',
                      4,
                      false
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-[11px]"
                >
                  Chipped Enamel
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Describe Your Symptoms & Location
              </label>
              <textarea
                value={symptomsText}
                onChange={(e) => setSymptomsText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="What does the discomfort feel like? Sharp, dull, throbbing, tender to chewing?"
                required
              />
            </div>

            {/* Pain Slider */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                <span>Self-Reported Pain Severity:</span>
                <span className="font-mono font-bold text-teal-700 text-sm">{painLevel} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(Number(e.target.value))}
                className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 - Mild Discomfort</span>
                <span>5 - Moderate Ache</span>
                <span>10 - Unbearable Emergency</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Symptom Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Under 24 hours">Under 24 hours</option>
                  <option value="2-3 days">2-3 days</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="Over a month">Over a month</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Visible Facial / Gum Swelling
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="swelling"
                      checked={swelling === true}
                      onChange={() => setSwelling(true)}
                      className="text-teal-600"
                    />
                    <span className="text-slate-800">Yes, Swollen</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer ml-3">
                    <input
                      type="radio"
                      name="swelling"
                      checked={swelling === false}
                      onChange={() => setSwelling(false)}
                      className="text-teal-600"
                    />
                    <span className="text-slate-800">No Swelling</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-2 transition-all disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Clinical Signals...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run AI Triage Evaluation
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Triage Results Screen */
          <div className="mt-4 space-y-4 text-xs animate-in fade-in duration-200">
            {/* Urgency Score Card */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                result.urgencyLevel === 'Emergency'
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : result.urgencyLevel === 'Urgent'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-teal-50 border-teal-300 text-teal-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl text-white ${
                    result.urgencyLevel === 'Emergency'
                      ? 'bg-rose-600'
                      : result.urgencyLevel === 'Urgent'
                      ? 'bg-amber-600'
                      : 'bg-teal-600'
                  }`}
                >
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block">
                    Clinical Urgency Classification
                  </span>
                  <div className="text-lg font-bold">
                    {result.urgencyLevel} Priority (Urgency Score: {result.urgencyScore}/100)
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Recommended Window:</span>
                <span className="font-bold">
                  {result.urgencyLevel === 'Emergency'
                    ? 'Same-Day / Immediate'
                    : result.urgencyLevel === 'Urgent'
                    ? 'Within 24-48 Hours'
                    : 'Within 7-14 Days'}
                </span>
              </div>
            </div>

            {/* Clinical Etiology */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Probable Etiology & Assessment:</span>
              <p className="text-slate-700 leading-relaxed">{result.clinicalSummary}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {result.possibleConditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-white border border-slate-200 text-slate-700"
                  >
                    {cond}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Procedure */}
            <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-teal-700 block">
                  Recommended Routing Procedure:
                </span>
                <span className="font-bold text-slate-900 text-sm">{result.suggestedServiceName}</span>
                <span className="text-[11px] text-teal-800 block">
                  CDT Code: {result.suggestedCdtCode} · Specialist: {result.recommendedSpecialist}
                </span>
              </div>
              <button
                onClick={() => {
                  onSelectBooking(result.suggestedServiceName);
                  onClose();
                }}
                className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition-all"
              >
                Book This Slot <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pre-Visit Home Care & Warnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Comfort Measures Before Visit:
                </span>
                <ul className="space-y-1 text-slate-600">
                  {result.homeCareAdvice.map((advice, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200">
                <span className="font-bold text-rose-800 block mb-1.5 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Red-Flag Emergency Signs:
                </span>
                <ul className="space-y-1 text-rose-900">
                  {result.warningFlags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                ← Test Different Symptoms
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800"
              >
                Close Triage
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
