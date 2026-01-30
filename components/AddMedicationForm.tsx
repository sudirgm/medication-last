
import React, { useState, useEffect } from 'react';
import { Medication, Language } from '../types';
import { translations } from '../i18n';

interface AddMedicationFormProps {
  onAdd: (med: Omit<Medication, 'id' | 'logs' | 'lastTakenDate' | 'startDate'>) => void;
  onEdit: (id: string, updates: Partial<Medication>) => void;
  onCancel: () => void;
  lang: Language;
  initialData?: Medication | null;
}

const AddMedicationForm: React.FC<AddMedicationFormProps> = ({ onAdd, onEdit, onCancel, lang, initialData }) => {
  const [name, setName] = useState('');
  const [times, setTimes] = useState<string[]>(['09:00']);
  const [duration, setDuration] = useState('30');
  const [frequency, setFrequency] = useState('1');
  
  const t = translations[lang] || translations['en-US'];

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTimes(initialData.times);
      setDuration(initialData.duration.toString());
      setFrequency(initialData.frequency.toString());
    }
  }, [initialData]);

  const handleFrequencyChange = (val: string) => {
    const freq = parseInt(val) || 1;
    setFrequency(val);
    
    // Adjust times array length based on frequency
    setTimes(prev => {
      const newTimes = [...prev];
      if (freq > newTimes.length) {
        for (let i = newTimes.length; i < freq; i++) {
          newTimes.push('12:00');
        }
      } else {
        return newTimes.slice(0, freq);
      }
      return newTimes;
    });
  };

  const handleTimeChange = (index: number, val: string) => {
    setTimes(prev => {
      const newTimes = [...prev];
      newTimes[index] = val;
      return newTimes;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || times.some(t => !t) || !duration || !frequency) return;
    
    const medData = { 
      name, 
      times, 
      duration: parseInt(duration), 
      frequency: parseInt(frequency)
    };

    if (initialData) {
      onEdit(initialData.id, medData);
    } else {
      onAdd(medData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-slate-900">{initialData ? t.edit : t.newMedicine}</h2>
          <button onClick={onCancel} className="p-1 text-slate-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.medName}</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 p-3 text-base font-bold rounded-xl outline-none border-2 border-transparent focus:border-indigo-500 transition-all"/>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.frequency}</label>
              <input type="number" required min="1" max="12" value={frequency} onChange={(e) => handleFrequencyChange(e.target.value)} className="w-full bg-slate-50 p-3 text-base font-bold rounded-xl outline-none border-2 border-transparent focus:border-indigo-500 transition-all"/>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.duration}</label>
              <input type="number" required min="1" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-slate-50 p-3 text-base font-bold rounded-xl outline-none border-2 border-transparent focus:border-indigo-500 transition-all"/>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule Times</label>
            <div className="grid grid-cols-2 gap-2">
              {times.map((time, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 pointer-events-none">#{idx + 1}</span>
                  <input 
                    type="time" 
                    required 
                    value={time} 
                    onChange={(e) => handleTimeChange(idx, e.target.value)} 
                    className="w-full bg-slate-50 p-2 pl-7 text-sm font-bold rounded-lg outline-none border-2 border-transparent focus:border-indigo-500 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-indigo-600 text-white text-lg font-black rounded-xl active:scale-95 shadow-lg mt-2">{initialData ? t.edit : t.newMedicine}</button>
        </form>
      </div>
    </div>
  );
};

export default AddMedicationForm;
