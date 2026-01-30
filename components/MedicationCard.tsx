
import React from 'react';
import { Medication, Language } from '../types';
import { translations } from '../i18n';

interface MedicationCardProps {
  medication: Medication;
  lang: Language;
  onTake: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (med: Medication) => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication, lang, onTake, onDelete, onEdit }) => {
  const t = translations[lang] || translations['en-US'];
  const today = new Date().toDateString();
  const logsToday = medication.logs.filter(log => new Date(log).toDateString() === today);
  const takenTodayCount = logsToday.length;
  const isFullyTakenToday = takenTodayCount >= medication.frequency;

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('drop')) return '💧';
    if (n.includes('pill') || n.includes('aspirin')) return '💊';
    if (n.includes('liquid') || n.includes('syrup')) return '🧪';
    return '💊';
  };

  return (
    <div className={`relative p-4 rounded-2xl border transition-all card-shadow ${
      isFullyTakenToday ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'
    }`}>
      <div className="absolute top-3 right-3 flex gap-1">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(medication); }}
          className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
          aria-label="Edit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(medication.id); }}
          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          aria-label="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl">
            {getIcon(medication.name)}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-lg font-black text-slate-900 truncate capitalize">
              {medication.name}
            </h3>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {[...medication.times].sort().map((time, i) => (
                <span key={i} className="text-[10px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                  {time}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end mb-0.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Daily Goal</span>
            <span className="text-[10px] font-black text-indigo-600">{takenTodayCount} / {medication.frequency}</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ${isFullyTakenToday ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min((takenTodayCount / medication.frequency) * 100, 100)}%` }}
            />
          </div>

          {!isFullyTakenToday ? (
            <button
              onClick={() => onTake(medication.id)}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-sm hover:bg-indigo-600 active:scale-[0.98] shadow-sm"
            >
              {t.markTaken}
            </button>
          ) : (
            <div className="w-full bg-emerald-100 text-emerald-700 py-3 rounded-xl font-black text-center text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              {t.doneToday}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicationCard;
