
import React, { useState, useEffect, useRef } from 'react';
import { Medication, VoiceState, Language } from '../types';
import { translations } from '../i18n';

interface VoiceInterfaceProps {
  medications: Medication[];
  lang: Language;
  onLangChange: (lang: Language) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ medications, lang, onLangChange }) => {
  const [state, setState] = useState<VoiceState>('idle');
  const [response, setResponse] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [showPicker, setShowPicker] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const medicationsRef = useRef<Medication[]>(medications);
  const t = translations[lang] || translations['en-US'];

  useEffect(() => {
    medicationsRef.current = medications;
  }, [medications]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = lang;
      recognition.interimResults = true;
      recognition.onstart = () => setState('listening');
      recognition.onresult = (event: any) => {
        const current = event.results[0][0].transcript;
        setTranscript(current);
        if (event.results[0].isFinal) handleStatusCheck(current.toLowerCase());
      };
      recognition.onend = () => setState(prev => prev === 'listening' ? 'idle' : prev);
      recognitionRef.current = recognition;
    }
  }, [lang]);

  const handleStatusCheck = (text: string) => {
    setState('processing');
    const currentMeds = medicationsRef.current;
    const today = new Date().toDateString();
    
    if (currentMeds.length === 0) {
      const msg = t.noMeds; 
      setResponse(msg); 
      speakResponse(msg); 
      return;
    }

    // 1. Identify if user is asking about a specific medication
    const foundMed = currentMeds.find(m => text.includes(m.name.toLowerCase()));

    let finalMessage = "";

    if (foundMed) {
      // Intent: Specific medication check
      const logsToday = foundMed.logs.filter(l => new Date(l).toDateString() === today);
      const takenCount = logsToday.length;
      
      if (takenCount > 0) {
        const lastLog = new Date(logsToday[logsToday.length - 1]);
        const timeStr = lastLog.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        finalMessage = t.voiceYes(foundMed.name, timeStr);
      } else {
        finalMessage = t.voiceNo(foundMed.name);
      }
      
      // Add schedule details
      if (t.voiceDetail) {
        finalMessage += " " + t.voiceDetail(foundMed.name, foundMed.frequency, takenCount);
      }
    } else {
      // Intent: General summary or unidentified medication
      const summaryParts = currentMeds.map(m => {
        const takenCount = m.logs.filter(l => new Date(l).toDateString() === today).length;
        if (t.voiceDetail) {
          return t.voiceDetail(m.name, m.frequency, takenCount);
        }
        return `${m.name}: ${takenCount}/${m.frequency}.`;
      });
      
      const totalToTake = currentMeds.reduce((acc, m) => acc + m.frequency, 0);
      const totalTaken = currentMeds.reduce((acc, m) => acc + m.logs.filter(l => new Date(l).toDateString() === today).length, 0);
      
      finalMessage = summaryParts.join(' ') + " " + t.voiceSummary(totalTaken, totalToTake);
    }
    
    setResponse(finalMessage);
    speakResponse(finalMessage);
  };

  const speakResponse = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onstart = () => setState('speaking');
    utterance.onend = () => { 
      setState('idle'); 
      setTranscript(''); 
      setTimeout(() => setResponse(''), 8000); 
    };
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pointer-events-none flex flex-col items-center gap-3">
      {response && (
        <div className="w-full max-w-sm glass-effect p-5 rounded-3xl shadow-2xl border border-indigo-100 pointer-events-auto animate-in slide-in-from-bottom-4 duration-300">
          <p className="text-base font-bold text-slate-800 leading-snug">
            {response}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 bg-slate-900 rounded-full p-2 pr-5 shadow-2xl pointer-events-auto border border-slate-700 active:scale-95 transition-transform">
        <div className="relative">
          {state === 'listening' && <div className="pulse-ring w-12 h-12 left-0 top-0" />}
          <button
            onClick={() => recognitionRef.current?.start()}
            disabled={state === 'processing' || state === 'speaking'}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all relative z-10 ${
              state === 'listening' ? 'bg-rose-500 scale-110 shadow-lg shadow-rose-500/50' : 
              state === 'speaking' || state === 'processing' ? 'bg-indigo-500' : 
              'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            {state === 'listening' ? (
              <div className="flex gap-0.5">
                <div className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1 h-6 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1 h-4 bg-white rounded-full animate-bounce" />
              </div>
            ) : state === 'processing' || state === 'speaking' ? (
              <svg className="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"/>
              </svg>
            )}
          </button>
        </div>

        <div className="flex flex-col min-w-[100px]">
          <p className="text-white text-[11px] font-black uppercase tracking-wider leading-none">
            {state === 'listening' ? t.listening : state === 'processing' ? t.thinking : state === 'speaking' ? t.speaking : 'Voice Help'}
          </p>
          <p className="text-slate-400 text-[10px] font-bold mt-1 truncate max-w-[140px]">
            {transcript || t.prompt}
          </p>
        </div>

        <div className="relative ml-2 border-l border-slate-700 pl-4">
          <button onClick={() => setShowPicker(!showPicker)} className="text-white text-xs font-black flex items-center gap-1.5 py-1">
            {t.name}
            <svg className={`w-3 h-3 transition-transform duration-300 ${showPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showPicker && (
            <div className="absolute bottom-full mb-4 right-0 bg-white shadow-2xl rounded-2xl p-1.5 flex flex-col gap-1 min-w-[130px] border border-slate-100 pointer-events-auto max-h-[250px] overflow-y-auto">
              {(Object.keys(translations) as Language[]).map(l => (
                <button 
                  key={l} 
                  onClick={() => { onLangChange(l); setShowPicker(false); }} 
                  className={`p-3 rounded-xl text-xs font-black text-left transition-colors ${lang === l ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  {translations[l]?.name || l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
