import React, { useState } from 'react';
import { TreatmentPlan, TreatmentPlanItem } from '../../types/dental';
import { explainTreatmentPlan } from '../../services/geminiDentalAi';
import { 
  Plus, 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  Printer, 
  Trash2, 
  Loader2,
  Clock,
  Layers
} from 'lucide-react';

interface TreatmentPlanBuilderProps {
  plan: TreatmentPlan;
  onUpdatePlan: (plan: TreatmentPlan) => void;
}

export const TreatmentPlanBuilder: React.FC<TreatmentPlanBuilderProps> = ({
  plan,
  onUpdatePlan,
}) => {
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [activePhaseFilter, setActivePhaseFilter] = useState<number | 'all'>('all');
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  // New item form state
  const [newTooth, setNewTooth] = useState<number>(14);
  const [newCode, setNewCode] = useState('D2391');
  const [newDesc, setNewDesc] = useState('Resin-based composite - 1 surface');
  const [newPhase, setNewPhase] = useState<1 | 2 | 3>(2);
  const [newFee, setNewFee] = useState<number>(1800);
  const [newInsuranceEst, setNewInsuranceEst] = useState<number>(1500);

  const handleGenerateAiExplainer = async () => {
    setIsGeneratingAi(true);
    const summaryText = plan.items
      .map((item) => `- Tooth #${item.toothNumber || 'General'}: ${item.description} (${item.cdtCode}), Phase ${item.phase}, Fee: ₱${item.fee}`)
      .join('\n');

    try {
      const explanation = await explainTreatmentPlan(summaryText);
      onUpdatePlan({
        ...plan,
        aiPlainEnglishExplanation: explanation,
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleStatusChange = (itemId: string, newStatus: TreatmentPlanItem['status']) => {
    const updatedItems = plan.items.map((item) =>
      item.id === itemId ? { ...item, status: newStatus } : item
    );
    onUpdatePlan({
      ...plan,
      items: updatedItems,
    });
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = plan.items.filter((item) => item.id !== itemId);
    const totalFee = updatedItems.reduce((acc, i) => acc + i.fee, 0);
    const insTotal = updatedItems.reduce((acc, i) => acc + i.insuranceEstimatedCoverage, 0);
    onUpdatePlan({
      ...plan,
      items: updatedItems,
      totalFee,
      insuranceEstimatedTotal: insTotal,
      patientEstimatedTotal: totalFee - insTotal,
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: TreatmentPlanItem = {
      id: `tx_${Date.now()}`,
      toothNumber: newTooth,
      cdtCode: newCode,
      description: newDesc,
      phase: newPhase,
      fee: newFee,
      insuranceEstimatedCoverage: newInsuranceEst,
      patientEstimatedCost: Math.max(0, newFee - newInsuranceEst),
      status: 'planned',
      priority: newPhase === 1 ? 'urgent' : newPhase === 2 ? 'recommended' : 'optional',
    };

    const updatedItems = [...plan.items, newItem];
    const totalFee = updatedItems.reduce((acc, i) => acc + i.fee, 0);
    const insTotal = updatedItems.reduce((acc, i) => acc + i.insuranceEstimatedCoverage, 0);

    onUpdatePlan({
      ...plan,
      items: updatedItems,
      totalFee,
      insuranceEstimatedTotal: insTotal,
      patientEstimatedTotal: totalFee - insTotal,
    });

    setShowAddItemModal(false);
  };

  const filteredItems = plan.items.filter(
    (item) => activePhaseFilter === 'all' || item.phase === activePhaseFilter
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Comprehensive Treatment Plan</h2>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Case
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Phased restorative and endodontic care roadmap with real-time CDT fee schedule & insurance estimator.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Print or Export PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print / Export</span>
          </button>
          <button
            onClick={() => setShowAddItemModal(true)}
            className="py-2 px-3.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Procedure
          </button>
        </div>
      </div>

      {/* Summary Financial Cards */}
      <div className="p-6 bg-slate-50/60 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Total Gross Production</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">₱{plan.totalFee.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Full standard fee before insurance</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-teal-700 mb-1">
            <span>Est. Insurance Benefit</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-700 font-mono">
            ₱{plan.insuranceEstimatedTotal.toLocaleString()}
          </div>
          <span className="text-[11px] text-teal-600/80 mt-1 block">PhilHealth / HMO Coverage (71% effective)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
            <span>Patient Out-of-Pocket</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono">
            ₱{plan.patientEstimatedTotal.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Eligible for 3-month installment (₱{Math.round(plan.patientEstimatedTotal / 3).toLocaleString()}/mo)
          </span>
        </div>
      </div>

      {/* Phase Filter Controls */}
      <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" /> Filter:
          </span>
          <button
            onClick={() => setActivePhaseFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activePhaseFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Phases ({plan.items.length})
          </button>
          <button
            onClick={() => setActivePhaseFilter(1)}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activePhaseFilter === 1
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Phase 1: Urgent Relief
          </button>
          <button
            onClick={() => setActivePhaseFilter(2)}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activePhaseFilter === 2
                ? 'bg-teal-700 text-white'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
            }`}
          >
            Phase 2: Restorative
          </button>
          <button
            onClick={() => setActivePhaseFilter(3)}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activePhaseFilter === 3
                ? 'bg-purple-700 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            Phase 3: Cosmetic / Recall
          </button>
        </div>

        <button
          onClick={handleGenerateAiExplainer}
          disabled={isGeneratingAi}
          className="py-1.5 px-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-60"
        >
          {isGeneratingAi ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing Plan...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> AI Plain-English Explainer
            </>
          )}
        </button>
      </div>

      {/* AI Plain English Explanation Card */}
      {plan.aiPlainEnglishExplanation && (
        <div className="mx-6 my-4 p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-950">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
              AI Patient-Friendly Care Summary
            </h4>
          </div>
          <p className="text-xs leading-relaxed text-teal-900 whitespace-pre-line">
            {plan.aiPlainEnglishExplanation}
          </p>
        </div>
      )}

      {/* Procedures Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Phase</th>
              <th className="py-3 px-4">Tooth</th>
              <th className="py-3 px-4">CDT Code</th>
              <th className="py-3 px-6">Clinical Procedure</th>
              <th className="py-3 px-4 text-right">Fee</th>
              <th className="py-3 px-4 text-right">Ins. Est</th>
              <th className="py-3 px-4 text-right">Patient Est</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                      item.phase === 1
                        ? 'bg-rose-100 text-rose-800'
                        : item.phase === 2
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    Phase {item.phase}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                  {item.toothNumber ? `#${item.toothNumber}` : '—'}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">{item.cdtCode}</td>
                <td className="py-3.5 px-6">
                  <div className="font-semibold text-slate-900">{item.description}</div>
                  {item.surface && (
                    <span className="text-[11px] text-slate-500 font-mono">Surface: {item.surface}</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-800">
                  ₱{item.fee.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-teal-700 font-medium">
                  ₱{item.insuranceEstimatedCoverage.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                  ₱{item.patientEstimatedCost.toLocaleString()}
                </td>
                <td className="py-3.5 px-4">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as TreatmentPlanItem['status'])}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="declined">Declined</option>
                  </select>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Treatment Procedure</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter dental procedure details and estimate insurance coverage.
            </p>

            <form onSubmit={handleAddItem} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tooth Number (1-32)</label>
                  <input
                    type="number"
                    min="1"
                    max="32"
                    value={newTooth}
                    onChange={(e) => setNewTooth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Treatment Phase</label>
                  <select
                    value={newPhase}
                    onChange={(e) => setNewPhase(Number(e.target.value) as 1 | 2 | 3)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="1">Phase 1: Urgent Relief</option>
                    <option value="2">Phase 2: Restorative</option>
                    <option value="3">Phase 3: Cosmetic / Recall</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CDT Code</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Procedure Standard Fee (₱)</label>
                  <input
                    type="number"
                    value={newFee}
                    onChange={(e) => setNewFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Procedure Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Insurance Coverage (₱)</label>
                <input
                  type="number"
                  value={newInsuranceEst}
                  onChange={(e) => setNewInsuranceEst(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Patient responsibility will be: ₱{Math.max(0, newFee - newInsuranceEst).toLocaleString()}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Add Procedure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
