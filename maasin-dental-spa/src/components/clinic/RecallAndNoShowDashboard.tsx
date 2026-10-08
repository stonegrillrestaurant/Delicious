import React, { useState } from 'react';
import { Appointment } from '../../types/dental';
import { 
  BellRing, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Smartphone,
  TrendingDown,
  Clock,
  ShieldAlert
} from 'lucide-react';

interface RecallAndNoShowDashboardProps {
  appointments: Appointment[];
}

export const RecallAndNoShowDashboard: React.FC<RecallAndNoShowDashboardProps> = ({ appointments }) => {
  const [activeTab, setActiveTab] = useState<'recalls' | 'noshow'>('noshow');
  const [campaignDispatched, setCampaignDispatched] = useState(false);

  // Filter high/medium risk appointments
  const atRiskAppointments = appointments.filter((a) => a.noShowRiskScore === 'high' || a.noShowRiskScore === 'medium');

  const recallPatients = [
    {
      id: 'rec_1',
      name: 'Michael Chang',
      phone: '(415) 555-9921',
      lastVisit: '2026-04-02 (6 months ago)',
      dueService: 'Comprehensive Cleaning & Bitewings (D1110)',
      status: 'due',
      preferredTime: 'Mornings',
    },
    {
      id: 'rec_2',
      name: 'Samantha Brooks',
      phone: '(415) 555-3310',
      lastVisit: '2026-07-10 (3 months ago)',
      dueService: 'Periodontal Maintenance Therapy (D4910)',
      status: 'sms_sent',
      preferredTime: 'Afternoons',
    },
    {
      id: 'rec_3',
      name: 'Oliver Queen',
      phone: '(415) 555-8842',
      lastVisit: '2026-03-15 (7 months ago)',
      dueService: 'Semi-Annual Oral Cancer Screen & Prophy',
      status: 'overdue',
      preferredTime: 'Fridays',
    },
  ];

  const handleDispatchCampaign = () => {
    setCampaignDispatched(true);
    setTimeout(() => setCampaignDispatched(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Top Bar */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Patient Retention & No-Show Intelligence</h2>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
              Autonomous Cadence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Machine learning prediction on patient attendance probabilities paired with automated recall outreach.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('noshow')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'noshow' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> No-Show Risk Radar ({atRiskAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('recalls')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'recalls' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BellRing className="w-3.5 h-3.5 text-teal-600" /> Hygiene Recalls (3)
          </button>
        </div>
      </div>

      {activeTab === 'noshow' ? (
        <div className="p-6 space-y-6">
          {/* Key Metrics row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Practice No-Show Rate</span>
              <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">2.4%</div>
              <span className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> -4.1% vs national dental average (6.5%)
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Chair Time Protected</span>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">18.5 hrs</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Saved through automated standby replacements</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Cadence Response Rate</span>
              <div className="text-2xl font-bold text-teal-700 font-mono mt-1">94.2%</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Two-way SMS confirmations received</span>
            </div>
          </div>

          {/* At-Risk Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Active Flagged Appointments Requiring Intervention
              </h3>
              <span className="text-xs text-slate-500">Sorted by dynamic risk score</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Patient & Phone</th>
                    <th className="py-3 px-4">Date / Chair</th>
                    <th className="py-3 px-4">Procedure</th>
                    <th className="py-3 px-6">Identified Risk Predictors</th>
                    <th className="py-3 px-4 text-right">Cadence Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {atRiskAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                            apt.noShowRiskScore === 'high'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {apt.noShowRiskScore} Risk
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{apt.patientName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{apt.patientPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div>{apt.date}</div>
                        <span className="text-[11px] text-slate-500">{apt.time} ({apt.operatoryChair})</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">{apt.serviceName}</span>
                      </td>
                      <td className="py-3.5 px-6 max-w-sm">
                        <p className="text-slate-600 leading-relaxed">
                          {apt.noShowRiskFactor ||
                            'First visit with clinic + morning rain forecast + booking made > 14 days ago without deposit.'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={handleDispatchCampaign}
                          className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-all"
                        >
                          <Smartphone className="w-3.5 h-3.5" /> Dispatch 2-Way SMS
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Recalls Tab */
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Automated Preventive Recall Cadence
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeting patients due for semi-annual prophylaxis cleanings and periodontal recalls.
              </p>
            </div>

            <button
              onClick={handleDispatchCampaign}
              className="py-2 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Send className="w-4 h-4" /> Dispatch Batch Recall SMS
            </button>
          </div>

          {campaignDispatched && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Recall campaign dispatched successfully to 3 patients via Twilio SMS & WhatsApp gateway with direct 1-click booking link!
              </span>
            </div>
          )}

          <div className="space-y-3">
            {recallPatients.map((rec) => (
              <div key={rec.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{rec.name}</span>
                    <span className="font-mono text-slate-500 text-[11px]">{rec.phone}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        rec.status === 'overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : rec.status === 'sms_sent'
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rec.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-1 text-slate-600">
                    <strong>Due Procedure: </strong>
                    <span className="text-teal-800 font-medium">{rec.dueService}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Last Visit: {rec.lastVisit} · Patient Prefers: {rec.preferredTime}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDispatchCampaign}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700 flex items-center gap-1"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-teal-600" /> Resend SMS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
