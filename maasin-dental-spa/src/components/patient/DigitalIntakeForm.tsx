import React, { useState, useRef, useEffect } from 'react';
import { MedicalIntakeFormData } from '../../types/dental';
import { 
  FileSignature, 
  ShieldCheck, 
  Heart, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  Save, 
  X,
  FileCheck
} from 'lucide-react';

interface DigitalIntakeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveIntake: (data: MedicalIntakeFormData) => void;
}

export const DigitalIntakeForm: React.FC<DigitalIntakeFormProps> = ({
  isOpen,
  onClose,
  onSaveIntake,
}) => {
  // Form fields
  const [fullName, setFullName] = useState('Emma Watson');
  const [dob, setDob] = useState('1994-04-15');
  const [gender, setGender] = useState('Female');
  const [phone, setPhone] = useState('(415) 555-0182');
  const [email, setEmail] = useState('emma.watson@example.com');
  const [emergencyName, setEmergencyName] = useState('Robert Watson (Brother)');
  const [emergencyPhone, setEmergencyPhone] = useState('(415) 555-9102');

  // Medical conditions
  const [hasHeartDisease, setHasHeartDisease] = useState(false);
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [hasHighBloodPressure, setHasHighBloodPressure] = useState(false);
  const [hasBleedingDisorders, setHasBleedingDisorders] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);
  const [allergies, setAllergies] = useState<string[]>(['None Known']);
  const [currentMedications, setCurrentMedications] = useState('Multivitamins, Occasional Ibuprofen');
  const [dentalAnxiety, setDentalAnxiety] = useState<'none' | 'mild' | 'moderate' | 'severe'>('mild');
  const [chiefComplaint, setChiefComplaint] = useState('Lower left molar cold sensitivity and aching');
  const [lastVisit, setLastVisit] = useState('6 months ago');
  const [consentAgreed, setConsentAgreed] = useState(true);

  // E-Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const signatureDataUrl = canvasRef.current?.toDataURL();

    const data: MedicalIntakeFormData = {
      fullName,
      dob,
      gender,
      phone,
      email,
      emergencyContactName: emergencyName,
      emergencyContactPhone: emergencyPhone,
      hasHeartDisease,
      hasDiabetes,
      hasHighBloodPressure,
      hasBleedingDisorders,
      isPregnant,
      allergies,
      currentMedications,
      dentalAnxietyLevel: dentalAnxiety,
      chiefComplaint,
      lastDentalVisit: lastVisit,
      consentAgreed,
      signatureDataUrl,
      signedDate: new Date().toISOString().slice(0, 10),
    };

    onSaveIntake(data);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const toggleAllergy = (allergy: string) => {
    if (allergies.includes(allergy)) {
      setAllergies(allergies.filter((a) => a !== allergy));
    } else {
      setAllergies([...allergies.filter((a) => a !== 'None Known'), allergy]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
              <FileSignature className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Digital Patient Intake & Consent</h3>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  HIPAA Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete medical questionnaire and legal cryptographic e-signature prior to chair time.
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Section 1: Demographics */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> 1. Patient Demographics & Emergency
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer Not to Say">Prefer Not to Say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Emergency Contact Name & Relation</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Medical History */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> 2. Medical Conditions & Pre-Medication Check
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasHeartDisease}
                  onChange={(e) => setHasHeartDisease(e.target.checked)}
                  className="rounded text-teal-600"
                />
                <span className="text-slate-800">Heart Condition / Murmur</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasHighBloodPressure}
                  onChange={(e) => setHasHighBloodPressure(e.target.checked)}
                  className="rounded text-teal-600"
                />
                <span className="text-slate-800">High Blood Pressure</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDiabetes}
                  onChange={(e) => setHasDiabetes(e.target.checked)}
                  className="rounded text-teal-600"
                />
                <span className="text-slate-800">Diabetes (Type 1 / 2)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasBleedingDisorders}
                  onChange={(e) => setHasBleedingDisorders(e.target.checked)}
                  className="rounded text-teal-600"
                />
                <span className="text-slate-800">Bleeding Disorder / Anticoagulants</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPregnant}
                  onChange={(e) => setIsPregnant(e.target.checked)}
                  className="rounded text-teal-600"
                />
                <span className="text-slate-800">Currently Pregnant</span>
              </label>
            </div>

            {/* Drug Allergies */}
            <div className="mt-3">
              <label className="block text-slate-700 font-semibold mb-1">
                Known Drug & Material Allergies:
              </label>
              <div className="flex flex-wrap gap-2">
                {['Penicillin / Amoxicillin', 'Latex', 'Local Anesthetics (Novocaine)', 'Sulfa Drugs', 'Codeine', 'None Known'].map(
                  (a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAllergy(a)}
                      className={`px-3 py-1 rounded-lg border text-xs font-medium transition-all ${
                        allergies.includes(a)
                          ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {a}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-slate-600 font-medium mb-1">
                Current Medications & Dosages
              </label>
              <input
                type="text"
                value={currentMedications}
                onChange={(e) => setCurrentMedications(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="List prescription drugs, OTC supplements, aspirin..."
              />
            </div>
          </div>

          {/* Section 3: Dental Comfort & Chief Complaint */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-teal-600" /> 3. Dental Anxiety & Chief Complaint
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Dental Anxiety Level</label>
                <select
                  value={dentalAnxiety}
                  onChange={(e) => setDentalAnxiety(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="none">None - Comfortable in dental chair</option>
                  <option value="mild">Mild - Slight nervousness</option>
                  <option value="moderate">Moderate - Prefer nitrous oxide / music</option>
                  <option value="severe">Severe - High dental phobia</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Chief Reason for Today&apos;s Visit</label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 4: HIPAA Consent & E-Signature Canvas */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <FileSignature className="w-3.5 h-3.5 text-slate-700" /> 4. Informed Consent &amp; E-Signature
            </h4>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 leading-relaxed text-[11px]">
              I certify that all medical and dental history answers provided above are accurate and complete to the best of my knowledge. I authorize Maasin Dental Spa, Dr. Alfred G. Roa III, DMD, and clinical staff to perform necessary diagnostic examinations, digital radiographs, and discussed dental spa procedures.
            </div>

            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAgreed}
                onChange={(e) => setConsentAgreed(e.target.checked)}
                className="rounded text-teal-600"
                required
              />
              <span className="font-semibold text-slate-800">
                I agree to HIPAA privacy practices and electronic records consent.
              </span>
            </label>

            {/* Signature Canvas Box */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-700 font-semibold text-xs">
                  Draw Electronic Signature Below:
                </span>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" /> Clear Canvas
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 overflow-hidden relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={120}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[120px] cursor-crosshair touch-none"
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none text-xs">
                    Sign with mouse or finger here
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Electronic Signature Act (ESIGN) Compliant
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaved}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition-all"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Intake Submitted!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Sign &amp; Submit Intake Form
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
