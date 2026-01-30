
import React, { useState, useEffect } from 'react';
import { Medication } from '../types';

interface AddMedicationFormProps {
  onAdd: (med: Omit<Medication, 'id' | 'logs' | 'lastTakenDate' | 'startDate'>) => void;
  onEdit: (id: string, updates: Partial<Medication>) => void;
  onCancel: () => void;
  initialData?: Medication | null;
}

const AddMedicationForm: React.FC<AddMedicationFormProps> = ({ onAdd, onEdit, onCancel, initialData }) => {
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [frequency, setFrequency] = useState('1');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTime(initialData.time);
      setDuration(initialData.duration.toString());
      setFrequency((initialData.frequency || 1).toString());
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !time || !duration || !frequency) return;

    if (initialData) {
      onEdit(initialData.id, { 
        name, 
        time, 
        duration: parseInt(duration),
        frequency: parseInt(frequency)
      });
    } else {
      onAdd({ 
        name, 
        time, 
        duration: parseInt(duration),
        frequency: parseInt(frequency)
      });
    }
    
    setName('');
    setTime('');
    setDuration('30');
    setFrequency('1');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-500 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-black text-slate-800">
            {initialData ? 'Edit Pill ✏️' : 'New Pill 💊'}
          </h2>
          <button onClick={onCancel} className="text-slate-300 hover:text-slate-500">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-2xl font-black text-slate-700 mb-3">Medicine Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Aspirin"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-6 text-2xl font-bold border-4 border-slate-100 bg-slate-50 rounded-3xl focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
            />
          </div>

          <div>
            <label className="block text-xl font-black text-slate-700 mb-3">Daily Frequency (Times per day)</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                required
                min="1"
                max="24"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="flex-1 p-6 text-3xl font-black border-4 border-slate-100 bg-slate-50 rounded-3xl focus:border-blue-500 focus:bg-white outline-none transition-all"
              />
              <span className="text-xl font-bold text-slate-400">Times</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xl font-black text-slate-700 mb-3">Remind At</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-6 text-3xl font-black border-4 border-slate-100 bg-slate-50 rounded-3xl focus:border-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xl font-black text-slate-700 mb-3">Course (Days)</label>
              <input
                type="number"
                required
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-6 text-3xl font-black border-4 border-slate-100 bg-slate-50 rounded-3xl focus:border-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-6 text-2xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-3xl transition-all"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-[2] py-6 text-2xl font-black text-white bg-blue-600 hover:bg-blue-700 rounded-3xl shadow-xl shadow-blue-100 transition-all active:scale-95"
            >
              {initialData ? 'Update' : 'Add it!'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicationForm;
