
import React, { useState, useEffect, useRef } from 'react';
import { Medication, VoiceState } from '../types';

interface VoiceInterfaceProps {
  medications: Medication[];
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ medications }) => {
  const [state, setState] = useState<VoiceState>('idle');
  const [response, setResponse] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  
  // Use refs to avoid re-initializing the SpeechRecognition object unnecessarily
  const recognitionRef = useRef<any>(null);
  const medicationsRef = useRef<Medication[]>(medications);

  // Sync ref with props
  useEffect(() => {
    medicationsRef.current = medications;
  }, [medications]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = true;

      recognition.onstart = () => {
        setState('listening');
      };

      recognition.onresult = (event: any) => {
        const current = event.results[0][0].transcript;
        setTranscript(current);
        
        if (event.results[0].isFinal) {
          handleLocalCheck(current.toLowerCase());
        }
      };

      recognition.onend = () => {
        setState(prev => (prev === 'listening' ? 'idle' : prev));
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setState('idle');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleLocalCheck = (text: string) => {
    setState('processing');
    
    const currentMeds = medicationsRef.current;
    
    if (currentMeds.length === 0) {
      const msg = "You don't have any medications in your list yet.";
      setResponse(msg);
      speakResponse(msg);
      return;
    }

    // Check if the user is asking about a SPECIFIC medication
    const foundMed = currentMeds.find(m => text.includes(m.name.toLowerCase()));
    
    let statusMsg = "";

    // If a specific medication is found, answer for just that one
    if (foundMed) {
      const isTakenToday = foundMed.lastTakenDate 
        ? new Date(foundMed.lastTakenDate).toDateString() === new Date().toDateString()
        : false;

      if (isTakenToday) {
        const timeTaken = new Date(foundMed.lastTakenDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        statusMsg = `Yes, you took your ${foundMed.name} today at ${timeTaken}.`;
      } else {
        statusMsg = `No, you haven't taken your ${foundMed.name} yet. It is scheduled for ${foundMed.time}.`;
      }
    } 
    // Otherwise, handle general queries about MULTIPLE medications
    else if (text.includes('all') || text.includes('medications') || text.includes('meds') || text.includes('pills') || text.includes('medicine') || text.includes('status')) {
      const today = new Date().toDateString();
      const taken = currentMeds.filter(m => m.lastTakenDate && new Date(m.lastTakenDate).toDateString() === today);
      const remaining = currentMeds.filter(m => !m.lastTakenDate || new Date(m.lastTakenDate).toDateString() !== today);

      if (remaining.length === 0) {
        statusMsg = `Excellent! You have taken all ${currentMeds.length} of your medications for today.`;
      } else if (taken.length === 0) {
        statusMsg = `You haven't taken any of your ${currentMeds.length} medications yet today. Your first one is ${remaining[0].name} at ${remaining[0].time}.`;
      } else {
        const remainingNames = remaining.map(m => `${m.name} at ${m.time}`).join(', and ');
        statusMsg = `You have taken ${taken.length} ${taken.length === 1 ? 'medication' : 'medications'}. You still need to take ${remainingNames}.`;
      }
    } 
    // Fallback
    else {
      statusMsg = "I'm not sure which medication you mean. You can ask about a specific one by name, or ask for the status of all your meds.";
    }

    setResponse(statusMsg);
    speakResponse(statusMsg);
  };

  const speakResponse = (text: string) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setState('speaking');
    utterance.onend = () => {
      setState('idle');
      setTranscript('');
      // Automatically close the dialogue box after speech finishes with a slight delay for smooth transition
      setTimeout(() => {
        setResponse('');
      }, 1500);
    };
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        setResponse('');
        setTranscript('');
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Recognition start error:", e);
      }
    } else {
      alert("Voice features are not supported in this browser.");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-8 flex flex-col items-center z-40 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
      <div className="w-full max-w-lg pointer-events-auto flex flex-col items-center">
        
        {/* User's Live Transcript */}
        {state === 'listening' && transcript && (
          <div className="mb-4 text-2xl font-bold text-blue-600 italic bg-blue-50 px-6 py-3 rounded-full animate-pulse shadow-sm">
            "{transcript}..."
          </div>
        )}

        {/* Local Response Bubble */}
        {response && (
          <div className="mb-6 w-full glass-card bg-white/90 border-4 border-blue-100 p-8 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-3 text-blue-500 font-black tracking-widest text-sm uppercase">
              <span className="flex h-3 w-3 rounded-full bg-blue-500"></span>
              Medication Status
            </div>
            <p className="text-3xl font-black text-slate-800 leading-tight">
              {response}
            </p>
          </div>
        )}
        
        <div className="relative flex items-center justify-center">
          {/* Animated Rings for Listening */}
          {state === 'listening' && (
            <>
              <div className="pulse-ring w-32 h-32" style={{ animationDelay: '0s' }}></div>
              <div className="pulse-ring w-32 h-32" style={{ animationDelay: '0.5s' }}></div>
            </>
          )}

          <button
            onClick={state === 'idle' ? startListening : undefined}
            disabled={state === 'processing' || state === 'speaking'}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 ${
              state === 'listening' 
                ? 'bg-red-500 border-8 border-red-100 scale-110' 
                : state === 'processing' || state === 'speaking'
                ? 'bg-slate-200 cursor-wait scale-95'
                : 'bg-blue-600 hover:bg-blue-700 border-8 border-white hover:scale-105'
            }`}
          >
            {state === 'listening' ? (
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            ) : state === 'processing' ? (
              <svg className="w-16 h-16 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-16 h-16 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        <p className="mt-6 text-2xl font-black text-slate-800 tracking-tight text-center drop-shadow-sm">
          {state === 'listening' ? 'Listening...' : 
           state === 'processing' ? 'Checking...' : 
           state === 'speaking' ? 'Talking...' : 
           'Ask "Did I take my meds?"'}
        </p>
      </div>
    </div>
  );
};

export default VoiceInterface;
