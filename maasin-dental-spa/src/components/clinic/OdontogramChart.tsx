import React, { useState } from 'react';
import { ToothRecord, ToothCondition, ToothSurface } from '../../types/dental';
import { 
  Activity, 
  Info, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface OdontogramChartProps {
  teeth: ToothRecord[];
  onUpdateTooth: (updatedTooth: ToothRecord) => void;
  onAddTreatmentItem?: (toothNumber: number, description: string, cdtCode: string, fee: number) => void;
}

export const OdontogramChart: React.FC<OdontogramChartProps> = ({
  teeth,
  onUpdateTooth,
  onAddTreatmentItem,
}) => {
  const [selectedToothNum, setSelectedToothNum] = useState<number>(19); // default to tooth 19
  const [activeSurfaceMode, setActiveSurfaceMode] = useState<ToothCondition>('caries');
  const [viewMode, setViewMode] = useState<'chart' | 'periodontal'>('chart');

  const selectedTooth = teeth.find((t) => t.toothNumber === selectedToothNum) || teeth[0];

  // Split into Upper Arch (#1 to #16) and Lower Arch (#32 down to #17 or #17 to #32)
  const upperTeeth = teeth.filter((t) => t.toothNumber >= 1 && t.toothNumber <= 16);
  // Lower teeth displayed in anatomical quadrant order (#32 to #17) so right matches upper right
  const lowerTeeth = [
    ...teeth.filter((t) => t.toothNumber >= 25 && t.toothNumber <= 32).reverse(),
    ...teeth.filter((t) => t.toothNumber >= 17 && t.toothNumber <= 24).reverse(),
  ];

  const getConditionColor = (cond: ToothCondition) => {
    switch (cond) {
      case 'caries':
        return 'bg-rose-500 text-white border-rose-600';
      case 'composite_filling':
        return 'bg-sky-400 text-white border-sky-500';
      case 'amalgam_filling':
        return 'bg-slate-500 text-white border-slate-600';
      case 'crown_porcelain':
        return 'bg-amber-400 text-amber-950 border-amber-500';
      case 'root_canal':
        return 'bg-purple-500 text-white border-purple-600';
      case 'implant':
        return 'bg-teal-500 text-white border-teal-600';
      case 'extracted':
        return 'bg-slate-200 text-slate-400 border-slate-300 opacity-60';
      case 'veneer':
        return 'bg-emerald-400 text-white border-emerald-500';
      case 'fractured':
        return 'bg-orange-500 text-white border-orange-600';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getSurfaceColor = (cond: ToothCondition) => {
    switch (cond) {
      case 'caries':
        return '#f43f5e'; // rose-500
      case 'composite_filling':
        return '#38bdf8'; // sky-400
      case 'amalgam_filling':
        return '#64748b'; // slate-500
      case 'crown_porcelain':
        return '#fbbf24'; // amber-400
      case 'root_canal':
        return '#a855f7'; // purple-500
      case 'implant':
        return '#14b8a6'; // teal-500
      default:
        return '#f8fafc'; // slate-50 (healthy enamel)
    }
  };

  const handleSurfaceClick = (surface: ToothSurface) => {
    if (!selectedTooth) return;
    const currentSurfaceCondition = selectedTooth.surfaces[surface];
    const newCondition = currentSurfaceCondition === activeSurfaceMode ? 'healthy' : activeSurfaceMode;

    const updated: ToothRecord = {
      ...selectedTooth,
      surfaces: {
        ...selectedTooth.surfaces,
        [surface]: newCondition,
      },
      generalCondition:
        newCondition !== 'healthy'
          ? newCondition
          : Object.values({ ...selectedTooth.surfaces, [surface]: newCondition }).some((c) => c !== 'healthy')
          ? selectedTooth.generalCondition
          : 'healthy',
    };
    onUpdateTooth(updated);
  };

  const handleQuickConditionSet = (cond: ToothCondition) => {
    if (!selectedTooth) return;
    const updated: ToothRecord = {
      ...selectedTooth,
      generalCondition: cond,
      surfaces: {
        occlusal: cond,
        mesial: cond,
        distal: cond,
        buccal: cond,
        lingual: cond,
      },
    };
    onUpdateTooth(updated);
  };

  const handleResetTooth = () => {
    if (!selectedTooth) return;
    const updated: ToothRecord = {
      ...selectedTooth,
      generalCondition: 'healthy',
      surfaces: {
        occlusal: 'healthy',
        mesial: 'healthy',
        distal: 'healthy',
        buccal: 'healthy',
        lingual: 'healthy',
      },
      bleedingOnProbing: false,
      periodontalPocketDepths: [2, 2, 2, 2, 2, 2],
      plannedTreatment: '',
    };
    onUpdateTooth(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header Controls */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Interactive Odontogram</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              Universal 32-Tooth Chart
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any tooth to inspect surfaces, pocket depth, or link to clinical treatment plan.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'chart' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Restorative Chart
          </button>
          <button
            onClick={() => setViewMode('periodontal')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'periodontal' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Periodontal Probing (BOP)
          </button>
        </div>
      </div>

      {/* Main Odontogram Canvas Area */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Arch Map (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Upper Arch Container */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Upper Right (Maxillary Quadrant 1)</span>
              <span className="text-slate-400">MAXILLARY ARCH</span>
              <span>Upper Left (Maxillary Quadrant 2)</span>
            </div>

            <div className="grid grid-cols-8 md:grid-cols-16 gap-1.5">
              {upperTeeth.map((tooth) => {
                const isSelected = tooth.toothNumber === selectedToothNum;
                const isExtracted = tooth.generalCondition === 'extracted';
                return (
                  <button
                    key={tooth.toothNumber}
                    onClick={() => setSelectedToothNum(tooth.toothNumber)}
                    className={`relative flex flex-col items-center p-1.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-white shadow-md ring-2 ring-teal-500/20 z-10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-slate-600 mb-1">#{tooth.toothNumber}</span>

                    {/* Tooth anatomical surface SVG */}
                    <div className="relative w-8 h-8">
                      {isExtracted ? (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-lg">
                          ✕
                        </div>
                      ) : (
                        <svg viewBox="0 0 40 40" className="w-full h-full">
                          {/* Buccal surface (top) */}
                          <polygon
                            points="0,0 40,0 30,10 10,10"
                            fill={getSurfaceColor(tooth.surfaces.buccal)}
                            stroke="#cbd5e1"
                            strokeWidth="1"
                          />
                          {/* Lingual surface (bottom) */}
                          <polygon
                            points="10,30 30,30 40,40 0,40"
                            fill={getSurfaceColor(tooth.surfaces.lingual)}
                            stroke="#cbd5e1"
                            strokeWidth="1"
                          />
                          {/* Mesial surface (left) */}
                          <polygon
                            points="0,0 10,10 10,30 0,40"
                            fill={getSurfaceColor(tooth.surfaces.mesial)}
                            stroke="#cbd5e1"
                            strokeWidth="1"
                          />
                          {/* Distal surface (right) */}
                          <polygon
                            points="40,0 30,10 30,30 40,40"
                            fill={getSurfaceColor(tooth.surfaces.distal)}
                            stroke="#cbd5e1"
                            strokeWidth="1"
                          />
                          {/* Occlusal surface (center) */}
                          <rect
                            x="10"
                            y="10"
                            width="20"
                            height="20"
                            fill={getSurfaceColor(tooth.surfaces.occlusal)}
                            stroke="#cbd5e1"
                            strokeWidth="1"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Condition badge / indicator */}
                    {viewMode === 'chart' ? (
                      <span
                        className={`mt-1.5 w-2 h-2 rounded-full ${
                          tooth.generalCondition === 'caries'
                            ? 'bg-rose-500 animate-pulse'
                            : tooth.generalCondition === 'root_canal'
                            ? 'bg-purple-500'
                            : tooth.generalCondition === 'crown_porcelain'
                            ? 'bg-amber-400'
                            : tooth.generalCondition === 'composite_filling'
                            ? 'bg-sky-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                    ) : (
                      <div className="mt-1 flex items-center gap-0.5 text-[9px] font-mono">
                        <span
                          className={`font-semibold ${
                            Math.max(...tooth.periodontalPocketDepths) >= 5
                              ? 'text-rose-600'
                              : Math.max(...tooth.periodontalPocketDepths) >= 4
                              ? 'text-amber-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {Math.max(...tooth.periodontalPocketDepths)}mm
                        </span>
                        {tooth.bleedingOnProbing && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lower Arch Container */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Lower Right (Mandibular Quadrant 4)</span>
              <span className="text-slate-400">MANDIBULAR ARCH</span>
              <span>Lower Left (Mandibular Quadrant 3)</span>
            </div>

            <div className="grid grid-cols-8 md:grid-cols-16 gap-1.5">
              {lowerTeeth.map((tooth) => {
                const isSelected = tooth.toothNumber === selectedToothNum;
                const isExtracted = tooth.generalCondition === 'extracted';
                return (
                  <button
                    key={tooth.toothNumber}
                    onClick={() => setSelectedToothNum(tooth.toothNumber)}
                    className={`relative flex flex-col items-center p-1.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-white shadow-md ring-2 ring-teal-500/20 z-10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-slate-600 mb-1">#{tooth.toothNumber}</span>

                    {/* Tooth surface SVG */}
                    <div className="relative w-8 h-8">
                      {isExtracted ? (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-lg">
                          ✕
                        </div>
                      ) : (
                        <svg viewBox="0 0 40 40" className="w-full h-full">
                          <polygon
                            points="0,0 40,0 30,10 10,10"
                            fill={getSurfaceColor(tooth.surfaces.buccal)}
                            stroke="#cbd5e1"
                            strokeWidth="1"
                          />
                          <polygon
                            points="10,30 30,30 40,40 0,40"
                            fill={getSurfaceColor(tooth.surfaces.lingual)}
                            stroke="#cbd5e1"
                            strokeWidth="1"
                          />
                          <polygon
                            points="0,0 10,10 10,30 0,40"
                            fill={getSurfaceColor(tooth.surfaces.mesial)}
                            stroke="#cbd5e1"
                            strokeWidth="1"
                          />
                          <polygon
                            points="40,0 30,10 30,30 40,40"
                            fill={getSurfaceColor(tooth.surfaces.distal)}
                            stroke="#cbd5e1"
                            strokeWidth="1"
                          />
                          <rect
                            x="10"
                            y="10"
                            width="20"
                            height="20"
                            fill={getSurfaceColor(tooth.surfaces.occlusal)}
                            stroke="#cbd5e1"
                            strokeWidth="1"
                          />
                        </svg>
                      )}
                    </div>

                    {viewMode === 'chart' ? (
                      <span
                        className={`mt-1.5 w-2 h-2 rounded-full ${
                          tooth.generalCondition === 'caries'
                            ? 'bg-rose-500 animate-pulse'
                            : tooth.generalCondition === 'root_canal'
                            ? 'bg-purple-500'
                            : tooth.generalCondition === 'crown_porcelain'
                            ? 'bg-amber-400'
                            : tooth.generalCondition === 'composite_filling'
                            ? 'bg-sky-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                    ) : (
                      <div className="mt-1 flex items-center gap-0.5 text-[9px] font-mono">
                        <span
                          className={`font-semibold ${
                            Math.max(...tooth.periodontalPocketDepths) >= 5
                              ? 'text-rose-600'
                              : Math.max(...tooth.periodontalPocketDepths) >= 4
                              ? 'text-amber-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {Math.max(...tooth.periodontalPocketDepths)}mm
                        </span>
                        {tooth.bleedingOnProbing && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
            <span className="font-semibold text-slate-700">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Active Caries (Cavity)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>Composite Resin</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Ceramic Crown</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Root Canal Seal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span>Implant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span>Extracted / Missing</span>
            </div>
          </div>
        </div>

        {/* Selected Tooth Inspector & Editor (4 cols) */}
        <div className="lg:col-span-4 bg-slate-50/80 rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Tooth Inspector</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Tooth #{selectedTooth.toothNumber}
                </h3>
                <p className="text-xs text-slate-500">{selectedTooth.name}</p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${getConditionColor(
                  selectedTooth.generalCondition
                )}`}
              >
                {selectedTooth.generalCondition.replace('_', ' ')}
              </span>
            </div>

            {/* Interactive Anatomical Surface Clicker */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">Surface Mapping:</span>
                <span className="text-[11px] text-slate-500">Click a quadrant to paint</span>
              </div>

              {/* Surface Tool Selector */}
              <div className="grid grid-cols-3 gap-1 mb-3">
                {(['caries', 'composite_filling', 'crown_porcelain'] as ToothCondition[]).map((cond) => (
                  <button
                    key={cond}
                    onClick={() => setActiveSurfaceMode(cond)}
                    className={`py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                      activeSurfaceMode === cond
                        ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cond === 'caries' ? 'Caries (Red)' : cond === 'composite_filling' ? 'Resin (Sky)' : 'Crown (Gold)'}
                  </button>
                ))}
              </div>

              {/* Enlarged 5-surface interactive SVG */}
              <div className="w-32 h-32 mx-auto relative my-2 bg-white rounded-2xl shadow-inner border border-slate-200 p-3 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full cursor-pointer select-none">
                  {/* Buccal (Top) */}
                  <polygon
                    points="0,0 100,0 75,25 25,25"
                    fill={getSurfaceColor(selectedTooth.surfaces.buccal)}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    onClick={() => handleSurfaceClick('buccal')}
                    className="hover:opacity-80 transition-opacity"
                  />
                  <text x="50" y="17" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">
                    B
                  </text>

                  {/* Lingual (Bottom) */}
                  <polygon
                    points="25,75 75,75 100,100 0,100"
                    fill={getSurfaceColor(selectedTooth.surfaces.lingual)}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    onClick={() => handleSurfaceClick('lingual')}
                    className="hover:opacity-80 transition-opacity"
                  />
                  <text x="50" y="90" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">
                    L
                  </text>

                  {/* Mesial (Left) */}
                  <polygon
                    points="0,0 25,25 25,75 0,100"
                    fill={getSurfaceColor(selectedTooth.surfaces.mesial)}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    onClick={() => handleSurfaceClick('mesial')}
                    className="hover:opacity-80 transition-opacity"
                  />
                  <text x="14" y="54" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">
                    M
                  </text>

                  {/* Distal (Right) */}
                  <polygon
                    points="100,0 75,25 75,75 100,100"
                    fill={getSurfaceColor(selectedTooth.surfaces.distal)}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    onClick={() => handleSurfaceClick('distal')}
                    className="hover:opacity-80 transition-opacity"
                  />
                  <text x="86" y="54" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">
                    D
                  </text>

                  {/* Occlusal (Center) */}
                  <rect
                    x="25"
                    y="25"
                    width="50"
                    height="50"
                    fill={getSurfaceColor(selectedTooth.surfaces.occlusal)}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    onClick={() => handleSurfaceClick('occlusal')}
                    className="hover:opacity-80 transition-opacity"
                  />
                  <text x="50" y="54" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#334155">
                    O
                  </text>
                </svg>
              </div>
            </div>

            {/* Quick condition actions */}
            <div className="mt-4">
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">Whole Tooth Status:</span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => handleQuickConditionSet('healthy')}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-medium text-slate-700 flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Healthy
                </button>
                <button
                  onClick={() => handleQuickConditionSet('root_canal')}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-medium text-purple-700 flex items-center justify-center gap-1"
                >
                  <Activity className="w-3.5 h-3.5 text-purple-600" /> Root Canal
                </button>
                <button
                  onClick={() => handleQuickConditionSet('crown_porcelain')}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-medium text-amber-800 flex items-center justify-center gap-1"
                >
                  Porcelain Crown
                </button>
                <button
                  onClick={() => handleQuickConditionSet('extracted')}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-medium text-slate-600 flex items-center justify-center gap-1"
                >
                  Extracted
                </button>
              </div>
            </div>

            {/* Periodontal Probing 6-Point Matrix */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Periodontal Probing (mm):</span>
                <label className="flex items-center gap-1 text-[11px] font-normal text-rose-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTooth.bleedingOnProbing}
                    onChange={(e) =>
                      onUpdateTooth({
                        ...selectedTooth,
                        bleedingOnProbing: e.target.checked,
                      })
                    }
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  Bleeding (BOP)
                </label>
              </div>
              <div className="grid grid-cols-6 gap-1 text-center font-mono text-xs">
                {selectedTooth.periodontalPocketDepths.map((depth, idx) => (
                  <div
                    key={idx}
                    className={`py-1 rounded border font-semibold ${
                      depth >= 5
                        ? 'bg-rose-100 border-rose-300 text-rose-700'
                        : depth >= 4
                        ? 'bg-amber-100 border-amber-300 text-amber-700'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {depth}
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Note / Findings */}
            {selectedTooth.notes && (
              <div className="mt-3 p-2.5 rounded-lg bg-teal-50/70 border border-teal-200 text-xs text-teal-900 flex items-start gap-1.5">
                <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>{selectedTooth.notes}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-5 pt-3 border-t border-slate-200 flex flex-col gap-2">
            {onAddTreatmentItem && (
              <button
                onClick={() => {
                  if (selectedTooth.generalCondition === 'root_canal') {
                    onAddTreatmentItem(selectedTooth.toothNumber, 'Molar Endodontic Therapy', 'D3330', 12500);
                  } else if (selectedTooth.generalCondition === 'crown_porcelain') {
                    onAddTreatmentItem(selectedTooth.toothNumber, 'Porcelain Ceramic Crown', 'D2740', 14000);
                  } else {
                    onAddTreatmentItem(selectedTooth.toothNumber, 'Composite Resin Restoration (MOD)', 'D2392', 2200);
                  }
                }}
                className="w-full py-2.5 px-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Add Tooth #{selectedTooth.toothNumber} to Treatment Plan
              </button>
            )}

            <button
              onClick={handleResetTooth}
              className="w-full py-2 px-3 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset to Healthy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
