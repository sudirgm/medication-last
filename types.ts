
export type Language = 
  | 'en-US' | 'es-ES' | 'hi-IN' | 'ta-IN' | 'te-IN' | 'bn-IN' 
  | 'ml-IN' | 'kn-IN' | 'mr-IN' | 'fr-FR' | 'de-DE' | 'zh-CN' | 'ja-JP';

export interface Medication {
  id: string;
  name: string;
  time: string;
  duration: number;
  frequency: number;
  startDate: string;
  logs: string[];
  lastTakenDate: string | null;
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';
