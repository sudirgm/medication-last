
import React, { useState, useEffect, useRef } from 'react';
import { Medication, VoiceState } from '../types';

interface VoiceInterfaceProps {
  medications: Medication[];
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ medications }) => {
  const [state, setState] = useState<VoiceState>('idle');
  const [response, setResponse] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  
  const recognitionRef = useRef<any>(null);
  const medicationsRef = useRef<Medication[]>(medications);

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
          handleProperAnalysis(current.toLowerCase());
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

  const handleProperAnalysis = (text: string) => {
    setState('processing');
    
    const currentMeds = medicationsRef.current;
    const today = new Date().toDateString();
    
    if (currentMeds.length === 0) {
      const msg = "You don't have any medications in your list yet. Please add some first.";
      setResponse(msg);
      speakResponse(msg);
      return;
    }

    // Identify if the user is asking about a SPECIFIC medication
    const specificMed = currentMeds.find(m => text.includes(m.name.toLowerCase()));

    if (specificMed) {
      const logsToday = specificMed.logs.filter(log => new Date(log).toDateString() === today);
      const takenCount = logsToday.length;
      const freq = specificMed.frequency;

      if (takenCount === 0) {
        const msg = `No, you haven't taken your ${specificMed.name} today. You need to take it ${freq} ${freq === 1 ? 'time' : 'times'}.`;
        setResponse(msg);
        speakResponse(msg);
      } else if (takenCount < freq) {
        const msg = `You have taken your ${specificMed.name} ${takenCount} ${takenCount === 1 ? 'time' : 'times'} so far. You still need to take it ${freq - takenCount} more ${freq - takenCount === 1 ? 'time' : 'times'} today.`;
        setResponse(msg);
        speakResponse(msg);
      } else {
        const msg = `Yes! You are all done with your ${specificMed.name} for today. You took all ${freq} doses.`;
        setResponse(msg);
        speakResponse(msg);
      }
      return;
    }

    // Otherwise, perform a COMPLETE analysis of the entire list
    const completed: string[] = [];
    const partial: string[] = [];
    const notStarted: string[] = [];

    currentMeds.forEach(m => {
      const logsToday = m.logs.filter(log => new Date(log).toDateString() === today);
      const count = logsToday.length;
      if (count === 0) {
        notStarted.push(m.name);
      } else if (count < m.frequency) {
        partial.push(`${m.name} (taken ${count} of ${m.frequency})`);
      } else {
        completed.push(m.name);
      }
    });

    let statusMsg = `You have ${currentMeds.length} ${currentMeds.length === 1 ? 'medication' : 'medications'} in total. `;

    if (completed.length > 0) {
      statusMsg += `You've finished ${completed.join(' and ')}. `;
    }

    if (partial.length > 0) {
      statusMsg += `For your remaining ones: ${partial.join(', and ')}. `;
    }

    if (notStarted.length > 0) {
      statusMsg += `You still haven't taken your ${notStarted.join(', or ')} at all today.`;
    }

    if (completed.length === currentMeds.length) {
      statusMsg = `Wonderful news! You have taken every single dose of all your medications today. You are 100% complete!`;
    }

    setResponse(statusMsg);
    speakResponse(statusMsg);
  };

  const speakResponse = (text: string) => {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setState('speaking');
    utterance.onend = () => {
      setState('idle');
      setTranscript('');
      setTimeout(() => {
        setResponse('');
      }, 5000); // Leave it on screen a bit longer for elderly users to read
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
        
        {state === 'listening' && transcript && (
          <div className="mb-4 text-2xl font-bold text-blue-600 italic bg-blue-50 px-6 py-3 rounded-full animate-pulse shadow-sm">
            "{transcript}..."
          </div>
        )}

        {response && (
          <div className="mb-6 w-full glass-card bg-white border-4 border-blue-100 p-8 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-4 text-blue-500 font-black tracking-widest text-sm uppercase">
              <span className="flex h-3 w-3 rounded-full bg-blue-500 animate-pulse"></span>
              Full Analysis
            </div>
            <p className="text-3xl font-black text-slate-800 leading-tight">
              {response}
            </p>
          </div>
        )}
        
        <div className="relative flex items-center justify-center">
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
            ) : state === 'processing' || state === 'speaking' ? (
              <svg className="w-16 h-16 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
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
           state === 'processing' ? 'Thinking...' : 
           state === 'speaking' ? 'Speaking...' : 
           'Ask "How am I doing today?"'}
        </p>
      </div>
    </div>
  );
};

export default VoiceInterface;
