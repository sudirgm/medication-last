
export interface Medication {
  id: string;
  name: string;
  time: string; // Preferred time for the first dose/reminder
  duration: number; // Number of days the course lasts
  frequency: number; // Number of times per day
  startDate: string; // ISO Date string when the medication started
  logs: string[]; // Array of ISO Date strings for every time it was taken
  lastTakenDate: string | null; // Keep for legacy/convenience (latest log)
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';
