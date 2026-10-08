import React, { useState } from 'react';
import { WaitlistEntry } from '../../types/dental';
import { 
  Users, 
  Send, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Calendar,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface WaitlistManagerProps {
  waitlist: WaitlistEntry[];
  onFillSlot: (entry: WaitlistEntry) => void;
  onRemoveEntry: (id: string) => void;
  onAddEntry: (entry: WaitlistEntry) => void;
}

export const WaitlistManager: React.FC<WaitlistManagerProps> = ({
  waitlist,
  onFillSlot,
  onRemoveEntry,
  onAddEntry,
}) => {
  const [dispatchedId, setDispatchedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New entry form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newService, setNewService] = useState('Emergency Pain Evaluation');
  const [newUrgency, setNewUrgency] = useState<'high' | 'medium' | 'routine'>('high');
  const [newNotes, setNewNotes] = useState('');

  const handleDispatchOffer = (entry: WaitlistEntry) => {
    setDispatchedId(entry.id);
    setTimeout(() => {
      onFillSlot(entry);
      setDispatchedId(null);
    }, 1200);
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    const entry: WaitlistEntry = {
      id: `wait_${Date.now()}`,
      patientName: newName,
      patientPhone: newPhone,
      serviceName: newService,
      urgency: newUrgency,
      preferredDays: ['Monday', 'Wednesday', 'Friday'],
      preferredTimeOfDay: 'morning',
      notes: newNotes,
      addedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    onAddEntry(entry);
    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
    setNewNotes('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Smart Cancellation Auto-Fill</h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                {waitlist.length} Standby Patients
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Algorithm matches sudden chair openings to patient schedule preferences with 1-click SMS offers.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Add to Standby
        </button>
      </div>

      {/* Waitlist Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Urgency</th>
              <th className="py-3 px-4">Patient Name & Contact</th>
              <th className="py-3 px-4">Requested Service</th>
              <th className="py-3 px-4">Preferred Window</th>
              <th className="py-3 px-6">Clinical Triage Notes</th>
              <th className="py-3 px-4 text-right">Auto-Fill Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {waitlist.map((entry) => {
              const isDispatched = dispatchedId === entry.id;
              return (
                <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        entry.urgency === 'high'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                          : entry.urgency === 'medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {entry.urgency}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{entry.patientName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{entry.patientPhone}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-800">{entry.serviceName}</span>
                    {entry.dentistPreferredName && (
                      <span className="text-[11px] text-teal-700 block mt-0.5">
                        Prefers: {entry.dentistPreferredName}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-700 font-medium capitalize">
                      {entry.preferredTimeOfDay} ({entry.preferredDays.join(', ')})
                    </div>
                    <span className="text-[10px] text-slate-400">Added: {entry.addedAt}</span>
                  </td>
                  <td className="py-3.5 px-6 max-w-xs">
                    <p className="text-slate-600 leading-relaxed truncate">{entry.notes}</p>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDispatchOffer(entry)}
                        disabled={isDispatched}
                        className={`py-1.5 px-3 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all ${
                          isDispatched
                            ? 'bg-emerald-600 text-white'
                            : 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white'
                        }`}
                      >
                        {isDispatched ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" /> Booked!
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" /> Dispatch SMS Slot Offer
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => onRemoveEntry(entry.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Standby Waitlist Patient</h3>
            <p className="text-xs text-slate-500 mb-4">
              Patient will be notified instantly via SMS whenever a cancellation slot occurs.
            </p>

            <form onSubmit={handleCreateEntry} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. Rachel Adams"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Phone (for SMS)</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                  placeholder="(415) 555-0199"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Requested Service</label>
                  <select
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Emergency Pain Evaluation">Emergency Pain Eval</option>
                    <option value="Comprehensive Exam & Cleaning">Exam & Cleaning</option>
                    <option value="Crown Seat / Prep">Crown Seat / Prep</option>
                    <option value="Dental Implant Consult">Dental Implant Consult</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clinical Urgency</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="high">High (Pain / Acute)</option>
                    <option value="medium">Medium</option>
                    <option value="routine">Routine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical / Patient Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  placeholder="Can arrive within 30 minutes if morning slot opens"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold"
                >
                  Save to Standby
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
