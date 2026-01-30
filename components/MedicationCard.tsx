
import React from 'react';
import { Medication } from '../types';

interface MedicationCardProps {
  medication: Medication;
  onTake: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (med: Medication) => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication, onTake, onDelete, onEdit }) => {
  const today = new Date().toDateString();
  const logsToday = medication.logs.filter(log => new Date(log).toDateString() === today);
  const takenTodayCount = logsToday.length;
  const isFullyTakenToday = takenTodayCount >= medication.frequency;

  const lastLog = logsToday.length > 0 ? logsToday[logsToday.length - 1] : null;
  const lastTakenTime = lastLog
    ? new Date(lastLog).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  // Course duration calculation
  const start = new Date(medication.startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const currentDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const courseProgressPercent = Math.min((currentDay / medication.duration) * 100, 100);

  // Next Dose Calculation
  const getNextDoseInfo = () => {
    if (isFullyTakenToday) {
      return { time: medication.time, label: 'Tomorrow' };
    }

    const [hours, minutes] = medication.time.split(':').map(Number);
    const firstDoseToday = new Date();
    firstDoseToday.setHours(hours, minutes, 0, 0);

    // If multiple doses, assume a 4-hour gap between them
    const nextDoseDate = new Date(firstDoseToday);
    nextDoseDate.setHours(firstDoseToday.getHours() + (takenTodayCount * 4));

    const nextTimeStr = nextDoseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Check if overdue
    if (nextDoseDate < new Date()) {
      return { time: nextTimeStr, label: 'As soon as possible', isOverdue: true };
    }

    return { time: nextTimeStr, label: 'Today' };
  };

  const nextDose = getNextDoseInfo();

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('drop')) return '💧';
    if (n.includes('pill') || n.includes('aspirin')) return '💊';
    if (n.includes('liquid') || n.includes('syrup')) return '🧪';
    return '💊';
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(medication.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(medication);
  };

  return (
    <div className={`relative overflow-hidden p-7 rounded-[2.5rem] transition-all duration-500 transform ${
      isFullyTakenToday 
        ? 'bg-green-50/80 border-2 border-green-200 shadow-sm scale-[0.98]' 
        : 'bg-white border-2 border-transparent shadow-xl hover:shadow-2xl translate-y-[-2px]'
    }`}>
      
      {/* Top Action Buttons */}
      <div className="absolute top-4 right-4 z-30 flex gap-1">
        <button 
          type="button"
          onClick={handleEdit}
          className="text-slate-300 hover:text-blue-500 p-3 transition-all active:scale-75 group/edit"
          aria-label="Edit Medication"
        >
          <svg className="w-7 h-7 group-hover/edit:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button 
          type="button"
          onClick={handleDelete}
          className="text-slate-300 hover:text-red-500 p-3 transition-all active:scale-75 group/del"
          aria-label="Delete Medication"
        >
          <svg className="w-7 h-7 group-hover/del:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className={`absolute -right-4 -top-4 text-7xl opacity-10 pointer-events-none select-none transition-transform duration-700 ${isFullyTakenToday ? 'rotate-12 scale-110' : ''}`}>
        {getIcon(medication.name)}
      </div>

      <div className="flex items-start relative z-10 pr-20">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 flex items-center justify-center text-3xl rounded-2xl shadow-inner ${isFullyTakenToday ? 'bg-green-100' : 'bg-blue-50'}`}>
             {getIcon(medication.name)}
          </div>
          <div>
            <h3 className={`text-3xl font-black capitalize tracking-tight leading-none mb-1 ${isFullyTakenToday ? 'text-green-800' : 'text-slate-800'}`}>
              {medication.name}
            </h3>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className={`text-lg font-bold ${isFullyTakenToday ? 'text-green-600' : 'text-blue-500'}`}>
                  Taken {takenTodayCount} of {medication.frequency} today
                </p>
                {!isFullyTakenToday && (
                  <span className={`text-sm font-black px-3 py-1 rounded-full ${nextDose.isOverdue ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-400'}`}>
                    Next: {nextDose.time} {nextDose.label === 'Today' ? '' : `(${nextDose.label})`}
                  </span>
                )}
                {isFullyTakenToday && (
                  <span className="text-sm font-black px-3 py-1 rounded-full bg-green-100 text-green-600">
                    Next: {nextDose.time} (Tomorrow)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Course: Day {Math.min(currentDay, medication.duration)} of {medication.duration}
                </span>
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 transition-all duration-500" style={{ width: `${courseProgressPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 relative z-10">
        {isFullyTakenToday ? (
          <div className="flex items-center gap-3 py-5 px-6 bg-green-500 text-white rounded-2xl animate-in fade-in zoom-in duration-300">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-2xl font-black">All Done Today!</p>
              <p className="text-lg font-bold opacity-90">Last taken at {lastTakenTime}</p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onTake(medication.id)}
            className="w-full py-6 bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white text-3xl font-black rounded-3xl shadow-lg hover:shadow-blue-200 transition-all flex flex-col items-center justify-center gap-1 group"
          >
            <div className="flex items-center gap-3">
              <span>I Took It</span>
              <svg className="w-8 h-8 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {takenTodayCount > 0 && (
              <span className="text-sm font-bold opacity-70">
                Tap to record dose {takenTodayCount + 1}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MedicationCard;
