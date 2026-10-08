import React, { useState } from 'react';
import { ClinicLocation } from '../../types/dental';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar, 
  Activity, 
  MapPin, 
  ArrowUpRight, 
  Building,
  CheckCircle2,
  PieChart
} from 'lucide-react';

interface PracticeAnalyticsProps {
  locations: ClinicLocation[];
}

export const PracticeAnalytics: React.FC<PracticeAnalyticsProps> = ({ locations }) => {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Analytics Top Bar */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Practice Performance Intelligence</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live KPI Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Production, collections, chair utilization, and case acceptance across all clinic operatories.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === 'month' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeRange('quarter')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === 'quarter' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            Q3 2026
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === 'year' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            Full Year
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Top 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Gross Production</span>
              <DollarSign className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">₱485,250</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% vs last month
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Net Collections</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">₱462,800</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-0.5">
              <span>95.4% Collection Rate</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Spa Chair Utilization</span>
              <Activity className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">92.4%</div>
            <div className="text-[11px] text-slate-500 mt-1">3 active operatory suites</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Case Acceptance</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">84.6%</div>
            <div className="text-[11px] text-purple-700 font-medium mt-1">
              Dr. Alfred Roa III care plans
            </div>
          </div>
        </div>

        {/* Multi-Location Comparison */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-teal-600" /> Multi-Location Production Comparison
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <div key={loc.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900">{loc.name}</span>
                  <span className="font-mono text-slate-400 text-[11px]">{loc.chairsCount} Operatories</span>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Address:</span>
                    <span className="font-medium text-slate-800 text-right">Ruperto K. Kangleon St, Maasin</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Contact:</span>
                    <span className="font-mono font-bold text-teal-800">053 570 -8220</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Monthly Production:</span>
                    <span className="font-mono font-bold text-slate-900">₱485,250</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Chair Occupancy:</span>
                    <span className="font-mono font-medium text-teal-800">92.4%</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>No-Show Rate:</span>
                    <span className="font-mono font-medium text-emerald-700">1.4%</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Procedure Revenue Distribution */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-teal-600" /> Clinical Procedure Revenue Mix
          </h3>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Endodontic Therapy (D3330 Root Canals)</span>
                <span className="font-mono font-bold">₱150,400 (31%)</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '31%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Restorative &amp; Crowns (D2740 Ceramic Crowns)</span>
                <span className="font-mono font-bold">₱135,800 (28%)</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Preventive &amp; Ultrasonic Cleaning (D0120/D1110)</span>
                <span className="font-mono font-bold">₱111,600 (23%)</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '23%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Implants &amp; Surgical Extractions (D7140)</span>
                <span className="font-mono font-bold">₱87,450 (18%)</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-600 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
