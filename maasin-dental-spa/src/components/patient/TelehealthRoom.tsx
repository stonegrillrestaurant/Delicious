import React, { useState } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare, 
  Camera, 
  Share2, 
  ShieldCheck, 
  Send,
  Maximize2,
  X
} from 'lucide-react';

interface TelehealthRoomProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName?: string;
  patientName?: string;
}

export const TelehealthRoom: React.FC<TelehealthRoomProps> = ({
  isOpen,
  onClose,
  doctorName = 'Dr. Alfred G. Roa III, DMD',
  patientName = 'Emma Watson',
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: doctorName,
      text: 'Hello Emma! Can you see and hear me clearly? How is the discomfort on your lower left molar today?',
      time: '16:01',
    },
    {
      sender: patientName,
      text: 'Hi Dr. Roa! Yes, the throbbing has calmed down quite a bit since starting the medication.',
      time: '16:02',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [photoSent, setPhotoSent] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText) return;
    setChatMessages([
      ...chatMessages,
      {
        sender: patientName,
        text: inputText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputText('');

    // Simulated doctor reply after 1.5s
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: doctorName,
          text: 'That is great news. The periapical tissues are responding to the therapy. Let us inspect the tooth contour on camera.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  const handleSendPhoto = () => {
    setPhotoSent(true);
    setChatMessages((prev) => [
      ...prev,
      {
        sender: patientName,
        text: '📸 [Intraoral High-Res Photo Captured & Transmitted to Doctor]',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setTimeout(() => setPhotoSent(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top bar */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">Tele-Dentistry Secure Consultation</span>
            <span className="text-slate-400 font-mono">· Room #TD-8921</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-teal-400 bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-800/60">
              <ShieldCheck className="w-4 h-4" />
              <span>End-to-End Encrypted HIPAA Video</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video & Chat Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Main Video Viewport (8 cols) */}
          <div className="lg:col-span-8 bg-black relative flex items-center justify-center overflow-hidden">
            {/* Doctor HD Feed */}
            <div className="w-full h-full relative flex items-center justify-center">
              <img
                src="/3d45e9e3-1f2f-4230-ad78-3f9ae8154d49.jpg"
                alt={doctorName}
                className="w-full h-full object-cover opacity-90"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-white text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-bold">{doctorName}</span>
                <span className="text-slate-400 text-[11px]">(Maasin Dental Spa)</span>
              </div>
            </div>

            {/* Patient Picture-in-Picture Feed */}
            <div className="absolute bottom-16 right-4 w-44 h-32 rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-800">
              {isVideoOn ? (
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
                  alt={patientName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                  Camera Paused
                </div>
              )}
              <div className="absolute bottom-1.5 left-2 text-[10px] text-white font-semibold bg-black/60 px-1.5 py-0.5 rounded">
                You (Emma)
              </div>
            </div>

            {/* Call Controls Floating Bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700 shadow-xl">
              <button
                onClick={() => setIsAudioOn((v) => !v)}
                className={`p-3 rounded-xl transition-all ${
                  isAudioOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
                title={isAudioOn ? 'Mute Mic' : 'Unmute Mic'}
              >
                {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOn((v) => !v)}
                className={`p-3 rounded-xl transition-all ${
                  isVideoOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
                title={isVideoOn ? 'Turn Video Off' : 'Turn Video On'}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={handleSendPhoto}
                className="p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all"
                title="Snap Intraoral Tooth Snapshot for Doctor"
              >
                <Camera className="w-5 h-5" />
              </button>

              <button
                onClick={onClose}
                className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all flex items-center gap-1.5 px-4 font-bold text-xs"
              >
                <PhoneOff className="w-5 h-5" /> End Call
              </button>
            </div>
          </div>

          {/* In-Call Telehealth Chat Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 border-l border-slate-800 flex flex-col justify-between p-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-teal-400" /> Live Consultation Feed
                </span>
                <span className="text-[11px] text-slate-400">Audio 48kHz Stereo</span>
              </div>

              {/* Chat Message List */}
              <div className="space-y-3 py-3 overflow-y-auto max-h-[50vh]">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-xs ${
                      msg.sender === patientName
                        ? 'bg-teal-950/60 border border-teal-800 text-teal-100 ml-4'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                      <span>{msg.sender}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{msg.time}</span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type question or symptom note..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
