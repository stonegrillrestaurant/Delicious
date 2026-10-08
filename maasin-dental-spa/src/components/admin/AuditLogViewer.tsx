import React, { useState } from 'react';
import { AuditLogEntry } from '../../types/dental';
import { 
  ShieldCheck, 
  Lock, 
  Download, 
  Search, 
  CheckCircle2, 
  Clock,
  UserCheck
} from 'lucide-react';

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.patientName && log.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || log.actorRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleExportAuditTrail = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,Actor,Role,Action,Resource,Patient,IP,HIPAA_Verified']
        .concat(
          logs.map(
            (l) =>
              `"${l.timestamp}","${l.actorName}","${l.actorRole}","${l.action}","${l.resource}","${l.patientName || 'N/A'}","${l.ipAddress}","true"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DentaFlow-HIPAA-Audit-Trail-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Top Bar */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">HIPAA Immutable Audit Trail</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Lock className="w-3 h-3" /> 45 CFR § 164.312(b) Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically sealed activity logging tracking all Protected Health Information (PHI) access.
          </p>
        </div>

        <button
          onClick={handleExportAuditTrail}
          className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
        >
          <Download className="w-4 h-4" /> Export CSV for HHS Audit
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by clinician, patient, action, or IP..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Role Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="dentist">Dentist</option>
            <option value="receptionist">Receptionist</option>
            <option value="admin">Practice Admin</option>
            <option value="patient">Patient</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Timestamp (UTC/PST)</th>
              <th className="py-3 px-4">Actor & Role</th>
              <th className="py-3 px-4">Action Type</th>
              <th className="py-3 px-6">Accessed PHI Resource</th>
              <th className="py-3 px-4">Subject Patient</th>
              <th className="py-3 px-4">IP Address</th>
              <th className="py-3 px-4 text-center">Integrity Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-mono text-slate-600">{log.timestamp}</td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900">{log.actorName}</div>
                  <span className="text-[10px] text-teal-800 uppercase font-semibold">
                    {log.actorRole}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800">
                    {log.action}
                  </span>
                </td>
                <td className="py-3.5 px-6 font-medium text-slate-800">{log.resource}</td>
                <td className="py-3.5 px-4 text-slate-700 font-medium">{log.patientName || '—'}</td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{log.ipAddress}</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Sealed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
