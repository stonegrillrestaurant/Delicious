import React, { useState } from 'react';
import { parseNaturalLanguageBooking } from '../../services/geminiDentalAi';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Loader2, 
  Check, 
  Calendar, 
  Clock, 
  User, 
  X,
  ArrowRight
} from 'lucide-react';

interface VoiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBookingIntent: (intent: {
    serviceKeywords?: string;
    doctorName?: string;
    preferredDay?: string;
    preferredTime?: string;
  }) => void;
}

export const VoiceBookingModal: React.FC<VoiceBookingModalProps> = ({
  isOpen,
  onClose,
  onApplyBookingIntent,
}) => {
  const [speechText, setSpeechText] = useState(
    'I want to book an ultrasonic cleaning with Dr. Alfred Roa III next Thursday afternoon around 2 PM.'
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);

  if (!isOpen) return null;

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate listening transcription
      setTimeout(() => {
        setSpeechText('I need an emergency root canal consultation with Dr. Alfred Roa III at Maasin Dental Spa because of sharp molar pain.');
        setIsRecording(false);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!speechText) return;
    setIsParsing(true);
    try {
      const res = await parseNaturalLanguageBooking(speechText);
      setParsedResult(res);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-50 text-cyan-700 rounded-xl">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Voice &amp; Natural Language Booking</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800">
                  AI Voice Assistant
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Speak or type in everyday speech; DentaFlow schedules the optimal chair.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Microphone Simulator */}
        <div className="my-5 flex flex-col items-center justify-center text-center">
          <button
            type="button"
            onClick={toggleRecording}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-200'
                : 'bg-teal-600 text-white hover:bg-teal-700 hover:scale-105'
            }`}
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <span className="text-xs font-semibold text-slate-700 mt-2">
            {isRecording ? 'Listening to voice audio...' : 'Tap microphone to speak'}
          </span>
          <span className="text-[11px] text-slate-400">or edit natural sentence below</span>
        </div>

        <form onSubmit={handleParse} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Transcribed Voice Intent
            </label>
            <textarea
              value={speechText}
              onChange={(e) => setSpeechText(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
              placeholder="e.g. Book a dental cleaning next Thursday at 2pm with Dr. Alfred Roa III"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={isParsing}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-60"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Structuring Intent...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Parse Voice Intent
                </>
              )}
            </button>
          </div>
        </form>

        {/* Parsed Result Display */}
        {parsedResult && (
          <div className="mt-4 p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs space-y-2 animate-in fade-in">
            <span className="font-bold text-teal-900 block text-[11px] uppercase tracking-wider">
              Extracted Booking Parameters:
            </span>
            <div className="grid grid-cols-2 gap-2 text-slate-800">
              <div>
                <strong className="text-slate-500">Service:</strong> {parsedResult.serviceKeywords}
              </div>
              <div>
                <strong className="text-slate-500">Doctor:</strong> {parsedResult.doctorName}
              </div>
              <div>
                <strong className="text-slate-500">Day:</strong> {parsedResult.preferredDay}
              </div>
              <div>
                <strong className="text-slate-500">Time:</strong> {parsedResult.preferredTime}
              </div>
            </div>

            <div className="pt-2 border-t border-teal-200/60 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onApplyBookingIntent(parsedResult);
                  onClose();
                }}
                className="py-2 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition-all"
              >
                Apply to Booking Flow <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
