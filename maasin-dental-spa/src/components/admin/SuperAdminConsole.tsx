import React from 'react';
import { 
  Building, 
  ShieldCheck, 
  Server, 
  CreditCard, 
  CheckCircle2, 
  Activity, 
  Layers, 
  Globe 
} from 'lucide-react';

export const SuperAdminConsole: React.FC = () => {
  const tenantClinics = [
    {
      id: 'clinic_1',
      name: 'Maasin Dental Spa (Dr. Alfred G. Roa III, DMD)',
      plan: 'Enterprise Dental Spa Operating OS',
      locationsCount: 1,
      chairsCount: 3,
      mrr: '₱35,000 / mo',
      status: 'active',
      hipaaBaaStatus: 'Executed & DOH/PRC Verified',
      hipaaAudit: '100% Pass',
    },
    {
      id: 'clinic_2',
      name: 'Visayas Aesthetic Dental Care',
      plan: 'Pro Operating System (₱35,000/mo)',
      locationsCount: 1,
      chairsCount: 6,
      mrr: '₱35,000 / mo',
      status: 'active',
      hipaaBaaStatus: 'Executed (Signed 2025)',
      hipaaAudit: '100% Pass',
    },
    {
      id: 'clinic_3',
      name: 'Southern Leyte Smile Studio & Ortho',
      plan: 'Pro Operating System (₱35,000/mo)',
      locationsCount: 2,
      chairsCount: 8,
      mrr: '₱70,000 / mo',
      status: 'active',
      hipaaBaaStatus: 'Executed (Signed 2026)',
      hipaaAudit: '100% Pass',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Multi-Tenant Network &amp; SaaS Governance
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              Super Admin Root Scope
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Global tenant provisioning, BAA legal compliance, and multi-tenant billing orchestrator.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <ShieldCheck className="w-4 h-4" /> Global HIPAA BAA Active
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Top summary row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Active SaaS Clinics</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">48 Practices</div>
            <span className="text-[11px] text-emerald-600 mt-1 block">99.98% SLA Uptime</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Platform MRR</span>
            <div className="text-2xl font-bold font-mono text-purple-700 mt-1">₱2,450,000</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Recurring Subscription Billing</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Total Chairs Managed</span>
            <div className="text-2xl font-bold font-mono text-teal-700 mt-1">214 Chairs</div>
            <span className="text-[11px] text-teal-700 mt-1 block">Across 62 Studios</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">KMS Key Rotation</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">Compliant</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Next rotation: in 42 days</span>
          </div>
        </div>

        {/* Tenant Roster */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-teal-600" /> Provisioned Tenant Organizations
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Organization Name</th>
                  <th className="py-3 px-4">Subscription Tier</th>
                  <th className="py-3 px-4">Studios / Chairs</th>
                  <th className="py-3 px-4">Monthly Rate</th>
                  <th className="py-3 px-4">HIPAA BAA Agreement</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenantClinics.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{tenant.name}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{tenant.plan}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {tenant.locationsCount} Studios · {tenant.chairsCount} Operatories
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{tenant.mrr}</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {tenant.hipaaBaaStatus}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {tenant.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
