import React, { useState } from 'react';
import { DentalXRay } from '../../types/dental';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sliders, 
  Eye, 
  Maximize2, 
  FileText, 
  ShieldCheck,
  Compass
} from 'lucide-react';

interface XRayViewerProps {
  xrays: DentalXRay[];
}

export const XRayViewer: React.FC<XRayViewerProps> = ({ xrays }) => {
  const [selectedXRayId, setSelectedXRayId] = useState<string>(xrays[0]?.id || '');
  const [brightness, setBrightness] = useState<number>(100); // 100%
  const [contrast, setContrast] = useState<number>(110); // 110%
  const [invert, setInvert] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [showRuler, setShowRuler] = useState<boolean>(false);

  const activeXRay = xrays.find((x) => x.id === selectedXRayId) || xrays[0];

  const handleResetFilters = () => {
    setBrightness(100);
    setContrast(110);
    setInvert(false);
    setZoom(1);
    setShowRuler(false);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
      {/* Radiograph Header */}
      <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              DICOM High-Resolution Radiograph Viewer
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
              Diagnostic Grade
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Patient: {activeXRay?.patientName} · {activeXRay?.teethCovered} · Taken {activeXRay?.date}
          </p>
        </div>

        {/* Thumbnail Selector */}
        <div className="flex items-center gap-2">
          {xrays.map((xray) => (
            <button
              key={xray.id}
              onClick={() => {
                setSelectedXRayId(xray.id);
                handleResetFilters();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedXRayId === xray.id
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {xray.type} ({xray.teethCovered.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Main Radiograph Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Radiograph Viewport (8 cols) */}
        <div className="lg:col-span-8 relative bg-black min-h-[420px] flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800 select-none">
          {/* Simulated X-Ray image with interactive CSS filters */}
          <div
            className="relative transition-transform duration-100 ease-out flex items-center justify-center p-4 max-w-full"
            style={{
              transform: `scale(${zoom})`,
            }}
          >
            <img
              src={activeXRay.imageUrl}
              alt={activeXRay.teethCovered}
              className="max-h-[380px] w-auto object-contain rounded-lg shadow-2xl filter"
              style={{
                filter: `brightness(${brightness}%) contrast(${contrast}%) ${
                  invert ? 'invert(100%) hue-rotate(180deg)' : 'grayscale(100%)'
                }`,
              }}
            />

            {/* Diagnostic Caliper / Ruler Overlay */}
            {showRuler && (
              <div className="absolute top-1/4 left-1/3 bg-teal-500/20 border-2 border-teal-400 text-teal-200 px-3 py-1.5 rounded text-xs font-mono backdrop-blur-xs flex items-center gap-2 shadow-lg animate-pulse">
                <Compass className="w-4 h-4 text-teal-400" />
                <span>Working Length: 21.5 mm (Apex ±0.5mm)</span>
              </div>
            )}
          </div>

          {/* Floating Viewport Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 pointer-events-auto text-xs shadow-md">
              <button
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
                className="p-1 hover:text-teal-400 text-slate-300 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px] text-slate-400 px-1">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
                className="p-1 hover:text-teal-400 text-slate-300 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-slate-700 mx-1" />
              <button
                onClick={() => setInvert((v) => !v)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  invert ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Invert Negative
              </button>
              <button
                onClick={() => setShowRuler((r) => !r)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  showRuler ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Endo Ruler
              </button>
              <button
                onClick={handleResetFilters}
                className="p-1 hover:text-rose-400 text-slate-400 ml-1 transition-colors"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-mono pointer-events-auto">
              Sensor: Dexis Platinum HD
            </div>
          </div>
        </div>

        {/* Radiologist Findings & Sliders (4 cols) */}
        <div className="lg:col-span-4 p-5 bg-slate-900 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Image Adjustments */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-3">
                <Sliders className="w-4 h-4 text-teal-400" />
                <span>Image Density & Contrast</span>
              </div>

              <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Brightness:</span>
                    <span className="font-mono text-teal-400">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-teal-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Contrast:</span>
                    <span className="font-mono text-teal-400">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="220"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-teal-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Diagnostic Findings */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <span>Diagnostic Radiographic Findings</span>
              </div>
              <ul className="space-y-2 text-xs">
                {activeXRay.findings.map((finding, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-slate-300 leading-relaxed flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clinician Signature Note */}
            <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-800/50 text-xs text-teal-300">
              <div className="flex items-center gap-1.5 font-semibold text-teal-200 mb-1">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Verified by Radiologist</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                {activeXRay.radiologistNotes}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>HIPAA-Compliant Storage</span>
            <span>AES-256 Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
