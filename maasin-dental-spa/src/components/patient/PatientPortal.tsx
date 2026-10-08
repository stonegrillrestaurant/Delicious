import React, { useState } from 'react';
import { 
  Appointment, 
  TreatmentPlan, 
  DentalXRay, 
  Invoice, 
  Prescription,
  MedicalIntakeFormData
} from '../../types/dental';
import { 
  Calendar, 
  Clock, 
  Video, 
  FileText, 
  CreditCard, 
  Pill, 
  Eye, 
  CheckCircle2, 
  DollarSign, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { XRayViewer } from '../clinic/XRayViewer';

interface PatientPortalProps {
  appointments: Appointment[];
  treatmentPlan: TreatmentPlan;
  xrays: DentalXRay[];
  invoices: Invoice[];
  prescriptions: Prescription[];
  intakeData?: MedicalIntakeFormData | null;
  onOpenBooking: () => void;
  onOpenTelehealth: () => void;
  onOpenIntake: () => void;
  onPayInvoice: (invoiceId: string) => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  appointments,
  treatmentPlan,
  xrays,
  invoices,
  prescriptions,
  intakeData,
  onOpenBooking,
  onOpenTelehealth,
  onOpenIntake,
  onPayInvoice,
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'treatment' | 'xrays' | 'billing' | 'prescriptions'>('appointments');
  const [paymentSuccessId, setPaymentSuccessId] = useState<string | null>(null);

  const handlePay = (invId: string) => {
    setPaymentSuccessId(invId);
    setTimeout(() => {
      onPayInvoice(invId);
      setPaymentSuccessId(null);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Patient Welcome Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80"
            alt="Emma Watson"
            className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-400/40 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Emma Watson</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Patient #DF-99214
              </span>
            </div>
            <div className="text-xs text-teal-200/80 flex flex-wrap items-center gap-3 mt-1">
              <span>Primary Doctor: <strong>Dr. Alfred G. Roa III, DMD</strong></span>
              <span>·</span>
              <span>Clinic: <strong>Maasin Dental Spa</strong> (Ruperto K. Kangleon St, Maasin)</span>
              <span>·</span>
              <a href="tel:0535708220" className="underline hover:text-white font-mono">
                Tel: 053 570 -8220
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenIntake}
            className="py-2 px-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs border border-white/20 transition-all flex items-center gap-1.5"
          >
            <FileCheck className="w-4 h-4 text-teal-300" />
            <span>{intakeData ? 'View Medical Intake' : 'Complete Intake'}</span>
          </button>
          <button
            onClick={onOpenBooking}
            className="py-2 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            + Book Appointment
          </button>
        </div>
      </div>

      {/* Portal Navigation Tabs */}
      <div className="px-6 border-b border-slate-200 flex flex-wrap items-center gap-1 bg-slate-50/70 text-xs font-medium">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`py-3.5 px-4 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'appointments'
              ? 'border-teal-600 text-teal-900 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" /> Appointments ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab('treatment')}
          className={`py-3.5 px-4 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'treatment'
              ? 'border-teal-600 text-teal-900 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> My Teeth &amp; Care Plan
        </button>

        <button
          onClick={() => setActiveTab('xrays')}
          className={`py-3.5 px-4 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'xrays'
              ? 'border-teal-600 text-teal-900 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-4 h-4" /> Digital X-Rays ({xrays.length})
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`py-3.5 px-4 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'billing'
              ? 'border-teal-600 text-teal-900 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Invoices &amp; Pay ({invoices.filter((i) => i.status === 'pending').length} Due)
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`py-3.5 px-4 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'prescriptions'
              ? 'border-teal-600 text-teal-900 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pill className="w-4 h-4" /> E-Prescriptions ({prescriptions.length})
        </button>
      </div>

      <div className="p-6">
        {/* Tab 1: Appointments */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Scheduled Appointments
              </h3>
              <span className="text-xs text-slate-500">Live chair sync enabled</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-bold text-slate-900 text-sm">{apt.serviceName}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          apt.status === 'in_chair'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : apt.status === 'confirmed'
                            ? 'bg-teal-100 text-teal-800 border-teal-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {apt.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 mb-3">
                      <div className="font-medium text-slate-900 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <span>
                          {apt.date} at {apt.time} ({apt.durationMinutes} mins)
                        </span>
                      </div>
                      <div className="text-slate-500">Doctor: {apt.dentistName}</div>
                      <div className="text-slate-500">Location: {apt.locationName}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">₱{apt.totalCost.toLocaleString()}</span>

                    {apt.type === 'telehealth' ? (
                      <button
                        onClick={onOpenTelehealth}
                        className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <Video className="w-3.5 h-3.5" /> Enter Virtual Exam Room
                      </button>
                    ) : (
                      <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Chair Check-In
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Treatment Plan */}
        {activeTab === 'treatment' && (
          <div className="space-y-4">
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
                  AI Plain-English Care Summary
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-teal-950">
                {treatmentPlan.aiPlainEnglishExplanation}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Phase</th>
                    <th className="py-3 px-4">Tooth</th>
                    <th className="py-3 px-4">CDT Code</th>
                    <th className="py-3 px-6">Procedure</th>
                    <th className="py-3 px-4 text-right">Standard Fee</th>
                    <th className="py-3 px-4 text-right">Ins. Paid</th>
                    <th className="py-3 px-4 text-right">Your Cost</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {treatmentPlan.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-700">Phase {item.phase}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {item.toothNumber ? `#${item.toothNumber}` : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{item.cdtCode}</td>
                      <td className="py-3 px-6 font-semibold text-slate-900">{item.description}</td>
                      <td className="py-3 px-4 text-right font-mono">₱{item.fee.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono text-teal-700 font-medium">
                        ₱{item.insuranceEstimatedCoverage.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ₱{item.patientEstimatedCost.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: X-Rays */}
        {activeTab === 'xrays' && (
          <div>
            <XRayViewer xrays={xrays} />
          </div>
        )}

        {/* Tab 4: Billing & Payments */}
        {activeTab === 'billing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Statements &amp; Contactless Payments
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>PCI-DSS Level 1 Encrypted · GCash, Maya, Cards &amp; Dental HMO Accepted</span>
              </div>
            </div>

            <div className="space-y-3">
              {invoices.map((inv) => {
                const isProcessing = paymentSuccessId === inv.id;
                return (
                  <div
                    key={inv.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm font-mono">{inv.invoiceNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <div className="text-slate-500 mt-1">
                        Date: {inv.date} · Due: {inv.dueDate}
                      </div>

                      <div className="mt-2 text-slate-700">
                        {inv.items.map((it, i) => (
                          <div key={i} className="text-[11px]">
                            • {it.description} (₱{it.amount.toLocaleString()})
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-slate-500 text-[11px]">
                        Total: ₱{inv.totalAmount.toLocaleString()} (HMO/Ins. Paid ₱{inv.insurancePortion.toLocaleString()})
                      </div>
                      <div className="text-2xl font-bold font-mono text-slate-900 my-1">
                        ₱{inv.patientPortion.toLocaleString()}
                      </div>

                      {inv.status === 'pending' ? (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handlePay(inv.id)}
                            disabled={isProcessing}
                            className="py-2 px-4 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs transition-all flex items-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            {isProcessing ? 'Processing Payment...' : `Pay Patient Portion (₱${inv.patientPortion.toLocaleString()})`}
                          </button>
                        </div>
                      ) : (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settled in Full
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 5: Prescriptions */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Active Dental E-Prescriptions
            </h3>
            {prescriptions.map((rx) => (
              <div key={rx.id} className="p-4 rounded-xl border border-slate-200 bg-white text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{rx.medication}</h4>
                    <span className="font-mono text-slate-600">{rx.dosage} · Qty: {rx.quantity}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Transmitted to Mercury Drug / Rose Pharmacy
                  </span>
                </div>
                <div className="mt-2 text-slate-600">
                  <p><strong>Frequency:</strong> {rx.frequency}</p>
                  <p className="mt-0.5"><strong>Special Instructions:</strong> {rx.instructions}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                  Prescriber: {rx.prescribedBy} · Date: {rx.date}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
