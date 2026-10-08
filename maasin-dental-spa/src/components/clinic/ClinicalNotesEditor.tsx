import React, { useState } from 'react';
import { ClinicalSOAPNote, Prescription } from '../../types/dental';
import { 
  FileText, 
  Pill, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  BookOpen,
  Plus
} from 'lucide-react';

interface ClinicalNotesEditorProps {
  notes: ClinicalSOAPNote[];
  prescriptions: Prescription[];
  onAddNote: (note: ClinicalSOAPNote) => void;
  onAddPrescription: (rx: Prescription) => void;
}

export const ClinicalNotesEditor: React.FC<ClinicalNotesEditorProps> = ({
  notes,
  prescriptions,
  onAddNote,
  onAddPrescription,
}) => {
  const [activeTab, setActiveTab] = useState<'soap' | 'prescriptions'>('soap');

  // SOAP State
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [noteSavedMessage, setNoteSavedMessage] = useState(false);

  // E-Prescription State
  const [medication, setMedication] = useState('Amoxicillin');
  const [dosage, setDosage] = useState('500 mg Capsule');
  const [frequency, setFrequency] = useState('Take 1 capsule every 8 hours by mouth');
  const [duration, setDuration] = useState('7 Days');
  const [quantity, setQuantity] = useState(21);
  const [instructions, setInstructions] = useState('Take with food. Complete entire course as directed.');
  const [rxSuccessMsg, setRxSuccessMsg] = useState(false);

  const applyTemplate = (type: 'endo' | 'restorative' | 'exam') => {
    if (type === 'endo') {
      setSubjective('Patient reports persistent dull, throbbing pain in lower left quadrant triggered by cold and mastication. Pain woke patient twice at night.');
      setObjective('Tooth #19: Deep cavitated lesion on distal surface. Endo-Ice cold test: lingering severe pain (>20s). Percussion: moderately positive. Palpation: normal. Radiograph: radiolucency into pulp chamber.');
      setAssessment('1. Tooth #19: Symptomatic Irreversible Pulpitis with Symptomatic Apical Periodontitis (ICD-10 K04.01).');
      setPlan('1. Microscopic endodontic therapy Tooth #19.\n2. Local anesthesia: 4% Septocaine 1:100k epi (1 carpule) + 2% Lidocaine 1:100k epi (1 carpule).\n3. Medium rubber dam isolation.\n4. Working lengths confirmed via electronic apex locator (MB: 21mm, ML: 21mm, D: 21.5mm).\n5. CaOH medicament placed, Cavit temporary seal.\n6. E-prescribed Amoxicillin & Ibuprofen.');
    } else if (type === 'restorative') {
      setSubjective('Routine visit for planned tooth-colored composite restoration on upper molar #14. Patient asymptomatic.');
      setObjective('Tooth #14: Occlusal groove staining with explorer catch and incipient enamel breakdown on bitewing.');
      setAssessment('Tooth #14: Dental Caries of Enamel (ICD-10 K02.51).');
      setPlan('1. 2% Lidocaine 1:100k epi infiltration.\n2. Caries excavated with high-speed diamond and slow-speed round bur.\n3. Selective enamel etch 15 sec, Scotchbond Universal adhesive, light-cure 10 sec.\n4. Filtek Supreme Ultra composite shade A2 placed in 2mm increments.\n5. Occlusion verified in centric and excursive with articulating paper. High-gloss polish achieved.');
    } else {
      setSubjective('Presents for comprehensive 6-month preventive exam and prophylaxis. No specific discomfort.');
      setObjective('Extraoral/Intraoral soft tissue exam: WNL. Full-mouth periodontal probing depths 1-3mm with no bleeding. Calculus localized to lingual surfaces of lower anterior teeth.');
      setAssessment('Generalized Health with localized mild plaque-induced gingivitis (ICD-10 K05.10).');
      setPlan('1. Ultrasonic supragingival scaling and fine hand scaling.\n2. Prophy cup polishing with fine fluoride paste.\n3. Flossed all interproximal contacts.\n4. Oral hygiene instruction: electric toothbrush technique + floss daily.\n5. Recall in 6 months.');
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjective || !objective) return;
    const newNote: ClinicalSOAPNote = {
      id: `soap_${Date.now()}`,
      patientId: 'user_pat_101',
      dentistId: 'dent_1',
      dentistName: 'Dr. Alfred G. Roa III, DMD',
      date: new Date().toISOString().slice(0, 10),
      subjective,
      objective,
      assessment,
      plan,
      signedAt: `${new Date().toLocaleTimeString()} PST (Dr. Alfred G. Roa III, DMD - PRC #0048192)`,
    };
    onAddNote(newNote);
    setNoteSavedMessage(true);
    setTimeout(() => setNoteSavedMessage(false), 2500);
  };

  const handleSendRx = (e: React.FormEvent) => {
    e.preventDefault();
    const newRx: Prescription = {
      id: `rx_${Date.now()}`,
      patientId: 'user_pat_101',
      patientName: 'Emma Watson',
      medication,
      dosage,
      frequency,
      duration,
      quantity,
      refills: 0,
      instructions,
      prescribedBy: 'Dr. Alfred G. Roa III, DMD (PRC: 0048192, PTR: 991823)',
      date: new Date().toISOString().slice(0, 10),
      pharmacyStatus: 'sent',
    };
    onAddPrescription(newRx);
    setRxSuccessMsg(true);
    setTimeout(() => setRxSuccessMsg(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Top Header & Tab Controls */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Clinical EHR Documentation</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              HIPAA Compliant Record
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Patient: Emma Watson (DOB: 04/15/1994) · Chart #DF-99214
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('soap')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'soap' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> SOAP Clinical Notes ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'prescriptions' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pill className="w-3.5 h-3.5" /> E-Prescriptions ({prescriptions.length})
          </button>
        </div>
      </div>

      {activeTab === 'soap' ? (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Note Editor Form (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Quick Templates Bar */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-600" /> Insert Dental SOAP Template:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => applyTemplate('endo')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium"
                >
                  Endo Therapy
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('restorative')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium"
                >
                  Composite Filling
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('exam')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium"
                >
                  Exam & Cleaning
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  S - Subjective (Chief Complaint & Patient History)
                </label>
                <textarea
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  placeholder="Patient reports pain level, trigger, medications taken..."
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  O - Objective (Clinical Exam, Cold Testing, Probing, X-Ray Findings)
                </label>
                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono text-[11px]"
                  placeholder="Tooth #, thermal test response, percussion, mobility, bone level..."
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  A - Assessment (Clinical Diagnosis & ICD-10 Codes)
                </label>
                <textarea
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. Tooth #19 Symptomatic Irreversible Pulpitis (K04.01)"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  P - Plan (Procedures Rendered, Anesthesia, Prescriptions, Next Visit)
                </label>
                <textarea
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  placeholder="Anesthetic dosage, rotary instrumentation, temporary seal, follow-up..."
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Auto-stamped with DEA & NPI electronic cryptographic key</span>
                </div>

                <div className="flex items-center gap-2">
                  {noteSavedMessage && (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Note Saved!
                    </span>
                  )}
                  <button
                    type="submit"
                    className="py-2 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl font-semibold shadow-xs transition-all"
                  >
                    Sign & Save SOAP Record
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Historical Notes Feed (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 overflow-y-auto max-h-[520px]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Previous Clinical Encounters
            </h3>

            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900">{n.dentistName}</span>
                    <span className="font-mono text-slate-400 text-[11px]">{n.date}</span>
                  </div>

                  <div className="mt-2 space-y-1.5 text-slate-700">
                    <div>
                      <span className="font-semibold text-teal-800">S: </span>
                      <span className="text-slate-600">{n.subjective}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-teal-800">O: </span>
                      <span className="text-slate-600 font-mono text-[11px]">{n.objective}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-teal-800">A: </span>
                      <span className="text-slate-800 font-medium">{n.assessment}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-teal-800">P: </span>
                      <span className="text-slate-600 whitespace-pre-line">{n.plan}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Signed: {n.signedAt}</span>
                    <span className="text-teal-700 font-semibold">Locked</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Prescriptions Tab */
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* E-Rx Dispatch Form (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                Connected to Surescripts® e-prescribing network. Automatic penicillin allergy and NSAID safety cross-check enabled.
              </span>
            </div>

            <form onSubmit={handleSendRx} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Medication</label>
                  <select
                    value={medication}
                    onChange={(e) => setMedication(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Amoxicillin">Amoxicillin (First-line antibiotic)</option>
                    <option value="Clindamycin">Clindamycin (Penicillin allergy)</option>
                    <option value="Ibuprofen">Ibuprofen (Anti-inflammatory)</option>
                    <option value="Chlorhexidine 0.12%">Chlorhexidine Gluconate 0.12% Oral Rinse</option>
                    <option value="Acetaminophen-Codeine #3">Acetaminophen w/ Codeine #3</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sig (Frequency & Administration)</label>
                <input
                  type="text"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dispense Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Instructions</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                {rxSuccessMsg && (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Transmitted to CVS Pharmacy!
                  </span>
                )}
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 transition-all ml-auto"
                >
                  <Send className="w-4 h-4" /> Transmit E-Prescription
                </button>
              </div>
            </form>
          </div>

          {/* Active Prescriptions List (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-teal-600" /> Active Pharmacy Orders
            </h3>

            {prescriptions.map((rx) => (
              <div key={rx.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-xs">
                <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{rx.medication}</h4>
                    <span className="font-mono text-slate-600">{rx.dosage} · Qty: {rx.quantity}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {rx.pharmacyStatus}
                  </span>
                </div>

                <div className="py-2 space-y-1 text-slate-600 text-xs">
                  <div><strong className="text-slate-800">Sig:</strong> {rx.frequency}</div>
                  <div><strong className="text-slate-800">Instructions:</strong> {rx.instructions}</div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Prescriber: {rx.prescribedBy}</span>
                  <span>Issued: {rx.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
