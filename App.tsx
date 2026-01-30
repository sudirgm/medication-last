
import React, { useState, useEffect } from 'react';
import { Medication, Language } from './types';
import { getMedications, saveMedications } from './services/medicationStore';
import MedicationCard from './components/MedicationCard';
import AddMedicationForm from './components/AddMedicationForm';
import VoiceInterface from './components/VoiceInterface';
import { translations } from './i18n';

const App: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [lang, setLang] = useState<Language>('en-US');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  
  const t = translations[lang] || translations['en-US'];

  useEffect(() => {
    const saved = getMedications();
    setMedications(saved);
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    saveMedications(medications);
  }, [medications]);

  const totalDosesToday = medications.reduce((acc, m) => acc + m.frequency, 0);
  const takenDosesToday = medications.reduce((acc, m) => {
    const today = new Date().toDateString();
    return acc + m.logs.filter(log => new Date(log).toDateString() === today).length;
  }, 0);

  const overallProgress = totalDosesToday > 0 ? (takenDosesToday / totalDosesToday) * 100 : 0;

  const handleAddMedication = (data: Omit<Medication, 'id' | 'logs' | 'lastTakenDate' | 'startDate'>) => {
    const newMed: Medication = {
      ...data,
      id: crypto.randomUUID(),
      logs: [],
      lastTakenDate: null,
      startDate: new Date().toISOString()
    };
    setMedications(prev => [...prev, newMed]);
    setShowAddForm(false);
  };

  const handleEditMedication = (id: string, updates: Partial<Medication>) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    setEditingMedication(null);
    setShowAddForm(false);
  };

  const handleTakeMedication = (id: string) => {
    setMedications(prev => prev.map(m => {
      if (m.id === id) {
        const newTimestamp = new Date().toISOString();
        return { 
          ...m, 
          logs: [...m.logs, newTimestamp],
          lastTakenDate: newTimestamp 
        };
      }
      return m;
    }));
  };

  const handleDeleteMedication = (id: string) => {
    const confirmationText = t.deleteConfirm || "Remove this medication?";
    if (window.confirm(confirmationText)) {
      setMedications(prev => {
        const filtered = prev.filter(m => m.id !== id);
        return filtered;
      });
      // Ensure we clear the editing state if the deleted item was being edited
      if (editingMedication?.id === id) {
        setEditingMedication(null);
        setShowAddForm(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 glass-effect border-b border-slate-100 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">MedRemind</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-lg font-black text-indigo-600 leading-none block">{Math.round(overallProgress)}%</span>
              <span className="text-[10px] font-black text-slate-400 uppercase">{t.progress}</span>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-slate-100 relative overflow-hidden bg-slate-50">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-indigo-500 transition-all duration-700"
                style={{ height: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">{t.schedule}</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-slate-900 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all active:scale-95"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4" /></svg>
            {t.newMedicine}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {medications.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white/50 rounded-2xl border-2 border-dashed border-slate-100">
              <p className="text-sm font-bold text-slate-400">{t.noMeds}</p>
            </div>
          ) : (
            [...medications]
              .sort((a, b) => (a.times[0] || '').localeCompare(b.times[0] || ''))
              .map(med => (
                <MedicationCard
                  key={med.id}
                  lang={lang}
                  medication={med}
                  onTake={handleTakeMedication}
                  onDelete={handleDeleteMedication}
                  onEdit={(m) => { setEditingMedication(m); setShowAddForm(true); }}
                />
              ))
          )}
        </div>

        <div className="h-44" />
      </main>

      <VoiceInterface medications={medications} lang={lang} onLangChange={setLang} />

      {showAddForm && (
        <AddMedicationForm
          lang={lang}
          onAdd={handleAddMedication}
          onEdit={handleEditMedication}
          onCancel={() => { setShowAddForm(false); setEditingMedication(null); }}
          initialData={editingMedication}
        />
      )}
    </div>
  );
};

export default App;
