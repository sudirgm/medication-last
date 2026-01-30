
import React, { useState, useEffect } from 'react';
import { Medication } from './types';
import { getMedications, saveMedications } from './services/medicationStore';
import MedicationCard from './components/MedicationCard';
import AddMedicationForm from './components/AddMedicationForm';
import VoiceInterface from './components/VoiceInterface';

const App: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    // Migration: ensure old data supports logs and frequency
    const saved = getMedications();
    const migrated = saved.map(m => {
      const logs = m.logs || (m.lastTakenDate ? [m.lastTakenDate] : []);
      return {
        ...m,
        duration: m.duration || 30,
        frequency: m.frequency || 1,
        startDate: m.startDate || new Date().toISOString(),
        logs: logs,
        lastTakenDate: logs.length > 0 ? logs[logs.length - 1] : null
      };
    });
    setMedications(migrated);
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    saveMedications(medications);
  }, [medications]);

  // Daily summary stats
  const totalDosesToday = medications.reduce((acc, m) => acc + m.frequency, 0);
  const takenDosesToday = medications.reduce((acc, m) => {
    const today = new Date().toDateString();
    return acc + m.logs.filter(log => new Date(log).toDateString() === today).length;
  }, 0);

  const progress = totalDosesToday > 0 ? (takenDosesToday / totalDosesToday) * 100 : 0;

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
    setMedications(prev => prev.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ));
    setEditingMedication(null);
    setShowAddForm(false);
  };

  const handleTakeMedication = (id: string) => {
    setMedications(prev => prev.map(m => {
      if (m.id === id) {
        const newTimestamp = new Date().toISOString();
        const updatedLogs = [...m.logs, newTimestamp];
        return { 
          ...m, 
          logs: updatedLogs,
          lastTakenDate: newTimestamp 
        };
      }
      return m;
    }));
  };

  const handleDeleteMedication = (id: string) => {
    const confirmed = window.confirm("Are you sure you want to remove this medication?");
    if (confirmed) {
      setMedications(prev => prev.filter(m => m.id !== id));
    }
  };

  const openEditForm = (med: Medication) => {
    setEditingMedication(med);
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingMedication(null);
  };

  return (
    <div className="min-h-screen pb-64 relative">
      {/* Dynamic Header */}
      <header className="w-full bg-white/70 backdrop-blur-md border-b-4 border-slate-100 p-8 sticky top-0 z-30 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center max-w-2xl mx-auto w-full">
          <div>
            <h1 className="text-4xl font-black text-slate-800 leading-none mb-1">
              {greeting}
            </h1>
            <p className="text-xl font-bold text-slate-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-2xl font-black px-8 py-4 rounded-[1.5rem] shadow-xl shadow-blue-200 transition-all active:scale-95"
          >
            + New
          </button>
        </div>

        {/* Daily Progress */}
        {medications.length > 0 && (
          <div className="max-w-2xl mx-auto w-full px-2">
            <div className="flex justify-between mb-2 items-end">
              <span className="text-lg font-black text-slate-600 uppercase tracking-tighter">Today's Goals</span>
              <span className="text-lg font-black text-blue-600">{takenDosesToday} / {totalDosesToday} doses taken</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-2xl mx-auto px-6 mt-12">
        {medications.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-16 text-center border-4 border-dashed border-slate-200 shadow-xl mt-12 animate-in zoom-in-95 duration-500">
            <div className="text-9xl mb-8 animate-bounce">📦</div>
            <p className="text-4xl font-black text-slate-800 mb-4">No Medicine Yet</p>
            <p className="text-2xl font-bold text-slate-400 mb-12">Tap the Blue button at the top to add your first medicine!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-12 py-6 bg-blue-600 text-white text-3xl font-black rounded-3xl shadow-2xl hover:bg-blue-700 transition-all active:scale-95"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-slate-800 flex items-center gap-3">
              Your List 📋
            </h2>
            <div className="grid grid-cols-1 gap-8">
              {medications.sort((a, b) => a.time.localeCompare(b.time)).map(med => (
                <MedicationCard
                  key={med.id}
                  medication={med}
                  onTake={handleTakeMedication}
                  onDelete={handleDeleteMedication}
                  onEdit={openEditForm}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Overlays */}
      <VoiceInterface medications={medications} />

      {showAddForm && (
        <AddMedicationForm
          onAdd={handleAddMedication}
          onEdit={handleEditMedication}
          onCancel={closeForm}
          initialData={editingMedication}
        />
      )}
    </div>
  );
};

export default App;
