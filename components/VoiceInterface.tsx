
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
    if (currentMeds.length === 0) {
      const msg = t.noMeds; setResponse(msg); speakResponse(msg); return;
    }

    const today = new Date().toDateString();
    
    // Scan for medicine names in transcript
    const foundMed = currentMeds.find(m => text.includes(m.name.toLowerCase()));

    let msg = "";
    if (foundMed) {
      const logsToday = foundMed.logs.filter(l => new Date(l).toDateString() === today);
      if (logsToday.length > 0) {
        const lastLog = new Date(logsToday[logsToday.length - 1]);
        const timeStr = lastLog.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        msg = t.voiceYes(foundMed.name, timeStr);
      } else {
        msg = t.voiceNo(foundMed.name);
      }
    } else {
      // General summary
      const totalToTake = currentMeds.reduce((acc, m) => acc + m.frequency, 0);
      const totalTaken = currentMeds.reduce((acc, m) => acc + m.logs.filter(l => new Date(l).toDateString() === today).length, 0);
      msg = t.voiceSummary(totalTaken, totalToTake);
    }
    
    setResponse(msg);
    speakResponse(msg);
  };

  const speakResponse = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // CRITICAL: Bind voice synthesis to the selected language locale
    utterance.lang = lang;
    utterance.onstart = () => setState('speaking');
    utterance.onend = () => { setState('idle'); setTranscript(''); setTimeout(() => setResponse(''), 6000); };
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pointer-events-none flex flex-col items-center gap-3">
      {response && (
        <div className="w-full max-w-sm glass-effect p-4 rounded-2xl shadow-xl border border-indigo-50 pointer-events-auto animate-in slide-in-from-bottom-2">
          <p className="text-sm font-bold text-slate-800 leading-tight">
            {response}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 bg-slate-900 rounded-full p-1.5 pr-4 shadow-2xl pointer-events-auto border border-slate-700">
        <div className="relative">
          {state === 'listening' && <div className="pulse-ring w-10 h-10 left-0 top-0" />}
          <button
            onClick={() => recognitionRef.current?.start()}
            disabled={state === 'processing' || state === 'speaking'}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative z-10 ${
              state === 'listening' ? 'bg-rose-500 scale-110' : 
              state === 'speaking' || state === 'processing' ? 'bg-indigo-500' : 
              'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            {state === 'listening' ? (
              <div className="flex gap-0.5"><div className="w-0.5 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" /><div className="w-0.5 h-5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" /><div className="w-0.5 h-3 bg-white rounded-full animate-bounce" /></div>
            ) : state === 'processing' || state === 'speaking' ? (
              <svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"/></svg>
            )}
          </button>
        </div>

        <div className="flex flex-col min-w-[80px]">
          <p className="text-white text-[10px] font-black uppercase tracking-tight leading-none">
            {state === 'listening' ? t.listening : state === 'processing' ? t.thinking : state === 'speaking' ? t.speaking : 'Voice'}
          </p>
          <p className="text-slate-400 text-[9px] font-bold mt-0.5 truncate max-w-[100px]">
            {transcript || t.prompt}
          </p>
        </div>

        <div className="relative ml-1 border-l border-slate-700 pl-3">
          <button onClick={() => setShowPicker(!showPicker)} className="text-white text-xs font-black flex items-center gap-1">
            {t.name?.substring(0, 3)}
            <svg className={`w-2 h-2 transition-transform ${showPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showPicker && (
            <div className="absolute bottom-full mb-3 right-0 bg-white shadow-2xl rounded-xl p-1 flex flex-col gap-1 min-w-[100px] border border-slate-100 pointer-events-auto max-h-[200px] overflow-y-auto">
              {(Object.keys(translations) as Language[]).map(l => (
                <button key={l} onClick={() => { onLangChange(l); setShowPicker(false); }} className={`p-2 rounded-lg text-[10px] font-bold text-left ${lang === l ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-700'}`}>
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
