import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Camera, 
  ChevronRight,
  ExternalLink,
  Award
} from 'lucide-react';
import { CLINIC_PHOTOS } from '../../data/mockData';

interface ClinicShowcaseBannerProps {
  onBookClick: () => void;
  onTriageClick: () => void;
}

export const ClinicShowcaseBanner: React.FC<ClinicShowcaseBannerProps> = ({
  onBookClick,
  onTriageClick,
}) => {
  const [activePhoto, setActivePhoto] = useState<string>(CLINIC_PHOTOS.lobbyWallLogo);

  const photos = [
    {
      url: CLINIC_PHOTOS.lobbyWallLogo,
      title: 'Maasin Dental Spa Signage',
      subtitle: 'Dr. Alfred G. Roa III, DMD Wall Emblem',
    },
    {
      url: CLINIC_PHOTOS.doctorOperatory,
      title: 'Dr. Alfred Roa III in Operatory',
      subtitle: 'Clinical Light Curing & Patient Care',
    },
    {
      url: CLINIC_PHOTOS.operatoryChair,
      title: 'Spa Dental Chair Suite',
      subtitle: 'Ergonomic Blue Operatory with Natural Light',
    },
    {
      url: CLINIC_PHOTOS.receptionDesk,
      title: 'Lobby & Reception Lounge',
      subtitle: 'Relaxing Spa Atmosphere & Warm Wood Paneling',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Content Column (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Dental Spa &amp; Wellness
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Maasin, Southern Leyte
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Maasin Dental Spa
            </h1>
            <p className="text-sm font-semibold text-teal-800 mt-1 flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600" />
              Dr. Alfred G. Roa III, DMD
            </p>

            <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
              Experience gentle, soothing dental wellness in the heart of Maasin City. Offering comprehensive restorative dentistry, cosmetic smile makeovers, endodontics, and relaxing dental spa treatments.
            </p>

            {/* Address & Contact Information Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Clinic Address</span>
                  <span className="text-slate-600 leading-snug block">
                    Ruperto K. Kangleon St, Maasin, 6600 Southern Leyte
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Contact &amp; Landline</span>
                  <a
                    href="tel:0535708220"
                    className="font-mono font-bold text-teal-800 hover:text-teal-900 text-sm block"
                  >
                    053 570 -8220
                  </a>
                  <span className="text-[11px] text-slate-400">Direct Reception Booking</span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Clinic Hours: Mon - Sat: 8:30 AM - 5:30 PM | Sun: By Appointment</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <button
              onClick={onBookClick}
              className="py-2.5 px-5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
            >
              <span>Book Appointment with Dr. Alfred Roa III</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onTriageClick}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>AI Symptom Checker</span>
            </button>
            <a
              href="tel:0535708220"
              className="py-2.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>Call 053 570 -8220</span>
            </a>
          </div>
        </div>

        {/* Right Real Clinic Photo Showcase Column (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 p-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800">
          <div>
            <div className="flex items-center justify-between text-white text-xs mb-2">
              <span className="font-bold flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-teal-400" /> Real Clinic Gallery
              </span>
              <span className="text-[11px] text-slate-400">Maasin City, Southern Leyte</span>
            </div>

            {/* Active Highlighted Photo */}
            <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-black border border-slate-800 shadow-inner group">
              <img
                src={activePhoto}
                alt="Maasin Dental Spa Dr. Alfred Roa III"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                onError={(e) => {
                  // graceful fallback to dental photography if local file URL behaves differently
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-3 text-white">
                <span className="text-xs font-bold block">
                  {photos.find((p) => p.url === activePhoto)?.title}
                </span>
                <span className="text-[11px] text-slate-300">
                  {photos.find((p) => p.url === activePhoto)?.subtitle}
                </span>
              </div>
            </div>
          </div>

          {/* 4 Photo Selector Thumbnails */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setActivePhoto(photo.url)}
                className={`relative rounded-lg overflow-hidden aspect-4/3 border-2 transition-all ${
                  activePhoto === photo.url
                    ? 'border-teal-400 ring-2 ring-teal-500/20 shadow-md'
                    : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=200&q=80';
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
