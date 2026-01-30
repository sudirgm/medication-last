
import { Language } from './types';

export const translations: Record<Language, any> = {
  'en-US': {
    name: 'English',
    progress: 'Progress',
    schedule: 'Your Schedule',
    newMedicine: 'New Medicine',
    noMeds: 'No medications yet.',
    deleteConfirm: 'Remove this medicine?',
    markTaken: 'Take Medicine',
    doneToday: 'Done for today',
    edit: 'Update',
    cancel: 'Cancel',
    medName: 'Medicine Name',
    frequency: 'Frequency',
    time: 'Daily Time',
    duration: 'Duration (Days)',
    listening: 'Listening...',
    thinking: 'Checking...',
    speaking: 'Speaking...',
    prompt: 'Tap to check progress',
    voiceYes: (name: string, time: string) => `Yes, you took your ${name} at ${time}.`,
    voiceNo: (name: string) => `No, you haven't taken ${name} yet today.`,
    voiceSummary: (taken: number, total: number) => `You've taken ${taken} of ${total} doses today.`,
    voiceDetail: (name: string, freq: number, taken: number) => 
      `${name} should be taken ${freq} ${freq === 1 ? 'time' : 'times'} a day. You have taken it ${taken} ${taken === 1 ? 'time' : 'times'} so far.`
  },
  'ta-IN': {
    name: 'தமிழ்',
    progress: 'முன்னேற்றம்',
    schedule: 'உங்கள் அட்டவணை',
    newMedicine: 'புதிய மருந்து',
    noMeds: 'மருந்துகள் எதுவும் இல்லை.',
    deleteConfirm: 'இந்த மருந்தை நீக்கவா?',
    markTaken: 'மருந்து எடு',
    doneToday: 'இன்று முடிந்தது',
    edit: 'புதுப்பி',
    cancel: 'ரத்து',
    medName: 'மருந்து பெயர்',
    frequency: 'எத்தனை முறை',
    time: 'நேரம்',
    duration: 'நாட்கள்',
    listening: 'கேட்கிறேன்...',
    thinking: 'ஆராய்கிறேன்...',
    speaking: 'பேசுகிறேன்...',
    prompt: 'பேசத் தொடங்குங்கள்',
    voiceYes: (name: string, time: string) => `ஆம், நீங்கள் ${name} மருந்தை ${time} மணிக்கு எடுத்துக்கொண்டீர்கள்.`,
    voiceNo: (name: string) => `இல்லை, நீங்கள் இன்று இன்னும் ${name} மருந்து எடுக்கவில்லை.`,
    voiceSummary: (taken: number, total: number) => `இன்று நீங்கள் ${total} மருந்துகளில் ${taken} மருந்துகளை எடுத்துள்ளீர்கள்.`,
    voiceDetail: (name: string, freq: number, taken: number) => 
      `${name} மருந்தை ஒரு நாளைக்கு ${freq} முறை எடுக்க வேண்டும். நீங்கள் இதுவரை ${taken} முறை எடுத்துள்ளீர்கள்.`
  },
  'hi-IN': {
    name: 'हिन्दी',
    progress: 'प्रगति',
    schedule: 'आपका शेड्यूल',
    newMedicine: 'नई दवा',
    noMeds: 'अभी कोई दवा नहीं है।',
    deleteConfirm: 'क्या आप इस दवा को हटाना चाहते हैं?',
    markTaken: 'दवा लें',
    doneToday: 'आज का कार्य पूर्ण',
    edit: 'बदलें',
    cancel: 'रद्द करें',
    medName: 'दवा का नाम',
    frequency: 'बार (दिन में)',
    time: 'समय',
    duration: 'अवधि (दिन)',
    listening: 'सुन रहा हूँ...',
    thinking: 'जाँच रहा हूँ...',
    speaking: 'बोल रहा हूँ...',
    prompt: 'पूछने के लिए दबाएं',
    voiceYes: (name: string, time: string) => `हाँ, आपने ${time} बजे ${name} ले ली थी।`,
    voiceNo: (name: string) => `नहीं, आपने आज अभी तक ${name} नहीं ली है।`,
    voiceSummary: (taken: number, total: number) => `आपने आज ${total} में से ${taken} खुराक ले ली है।`,
    voiceDetail: (name: string, freq: number, taken: number) => 
      `${name} को दिन में ${freq} बार लेना चाहिए। आपने अब तक इसे ${taken} बार लिया है।`
  },
  'te-IN': {
    name: 'తెలుగు',
    progress: 'ప్రగతి',
    schedule: 'మీ షెడ్యూల్',
    newMedicine: 'కొత్త మందు',
    noMeds: 'మందులు ఏవీ లేవు.',
    deleteConfirm: 'ఈ మందును తీసివేయాలా?',
    markTaken: 'మందు తీసుకోండి',
    doneToday: 'ఈ రోజుకు పూర్తయింది',
    listening: 'వింటున్నాను...',
    prompt: 'ప్రశ్నించడానికి నొక్కండి',
    voiceDetail: (name: string, freq: number, taken: number) => 
      `${name} రోజుకు ${freq} సార్లు తీసుకోవాలి. మీరు ఇప్పటివరకు ${taken} సార్లు తీసుకున్నారు.`
  },
  'bn-IN': {
    name: 'বাংলা',
    progress: 'অগ্রগতি',
    schedule: 'আপনার তালিকা',
    newMedicine: 'নতুন ওষুধ',
    noMeds: 'কোনো ওষুধ নেই।',
    deleteConfirm: 'ওষুধটি কি মুছে ফেলতে চান?',
    markTaken: 'ওষুধ নিন',
    doneToday: 'আজকের মতো শেষ',
    listening: 'শুনছি...',
    prompt: 'প্রশ্ন করতে চাপুন',
    voiceDetail: (name: string, freq: number, taken: number) => 
      `${name} দিনে ${freq} বার নেওয়া উচিত। আপনি এ পর্যন্ত ${taken} বার নিয়েছেন।`
  },
  'ml-IN': {
    name: 'മലയാളം',
    progress: 'പുരോഗതി',
    schedule: 'ഷെഡ്യൂൾ',
    newMedicine: 'പുതിയ മരുന്ന്',
    noMeds: 'മരുന്നുകൾ ഒന്നുമില്ല.',
    deleteConfirm: 'ഈ മരുന്ന് നീക്കം ചെയ്യണോ?',
    markTaken: 'മരുന്ന് കഴിക്കുക',
    doneToday: 'ഇന്നത്തേക്ക് കഴിഞ്ഞു',
    listening: 'കേൾക്കുന്നു...',
    prompt: 'ചോദിക്കാൻ അമർത്തുക',
    voiceDetail: (name: string, freq: number, taken: number) => 
      `${name} በቀን ${freq} തവണ എടുക്കണം. നിങ്ങൾ ഇതുവരെ ${taken} തവണ എടുത്തു.`
  },
  'kn-IN': {
    name: 'ಕನ್ನಡ',
    progress: 'ಪ್ರಗತಿ',
    schedule: 'ನಿಮ್ಮ ವೇಳಾಪಟ್ಟಿ',
    newMedicine: 'ಹೊಸ ಔಷಧಿ',
    deleteConfirm: 'ಈ ಔಷಧಿಯನ್ನು ತೆಗೆದುಹಾಕಬೇಕೆ?',
    markTaken: 'ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳಿ',
    listening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ...',
    prompt: 'ಕೇಳಲು ಒತ್ತಿರಿ',
    voiceDetail: (name: string, freq: number, taken: number) => 
      `${name} ದಿನಕ್ಕೆ ${freq} ಬಾರಿ ತೆಗೆದುಕೊಳ್ಳಬೇಕು. ನೀವು ಇಲ್ಲಿಯವರೆಗೆ ${taken} ಬಾರಿ ತೆಗೆದುಕೊಂಡಿದ್ದೀರಿ.`
  },
  'mr-IN': {
    name: 'मराठी',
    progress: 'प्रगति',
    schedule: 'वेळापत्रक',
    newMedicine: 'नवीन औषध',
    deleteConfirm: 'हे औषध काढून टाकायचे?',
    markTaken: 'औषध घ्या',
    listening: 'ऐकत आहे...',
    prompt: 'विचारण्यासाठी दाबा',
    voiceDetail: (name: string, freq: number, taken: number) => 
      `${name} दिवसातून ${freq} वेळा घ्यावे लागते. आपण आतापर्यंत ${taken} वेळा घेतले आहे.`
  },
  'es-ES': {
    name: 'Español',
    progress: 'Progreso',
    schedule: 'Tu Horario',
    newMedicine: 'Nueva Medicina',
    noMeds: 'Sin medicinas.',
    deleteConfirm: '¿Eliminar esta medicina?',
    markTaken: 'Tomar Medicina',
    doneToday: 'Listo por hoy',
    listening: 'Escuchando...',
    prompt: 'Pulsa para preguntar',
    voiceDetail: (name: string, freq: number, taken: number) => 
      `${name} debe tomarse ${freq} veces al día. La ha tomado ${taken} veces hasta ahora.`
  },
  'fr-FR': {
    name: 'Français',
    progress: 'Progrès',
    schedule: 'Votre Calendrier',
    newMedicine: 'Nouveau Médicament',
    deleteConfirm: 'Supprimer ce médicament ?',
    markTaken: 'Prendre',
    listening: 'Écoute...',
    prompt: 'Appuyez pour demander',
    voiceDetail: (name: string, freq: number, taken: number) => 
      `${name} doit être pris ${freq} fois par jour. Vous l'avez pris ${taken} fois jusqu'à présent.`
  },
  'de-DE': {
    name: 'Deutsch',
    progress: 'Fortschritt',
    schedule: 'Zeitplan',
    newMedicine: 'Neue Medizin',
    deleteConfirm: 'Dieses Medikament entfernen?',
    markTaken: 'Einnehmen',
    listening: 'Zuhören...',
    prompt: 'Fragen',
    voiceDetail: (name: string, freq: number, taken: number) => 
      `${name} sollte ${freq} Mal täglich eingenommen werden. Sie haben es bisher ${taken} Mal eingenommen.`
  },
  'zh-CN': {
    name: '中文',
    progress: '进度',
    schedule: '日程',
    newMedicine: '新药物',
    deleteConfirm: '删除此药物？',
    markTaken: '服用',
    listening: '正在听...',
    prompt: '点击提问',
    voiceDetail: (name: string, freq: number, taken: number) => 
      `${name} 每天应服用 ${freq} 次。您目前已服用 ${taken} 次。`
  },
  'ja-JP': {
    name: '日本語',
    progress: '進捗',
    schedule: 'スケジュール',
    newMedicine: '新しい薬',
    deleteConfirm: 'この薬を削除しますか？',
    markTaken: '服用する',
    listening: '聞いています...',
    prompt: 'タップして質問',
    voiceDetail: (name: string, freq: number, taken: number) => 
      `${name} は 1 日に ${freq} 回服用する必要があります。これまでに ${taken} 回服用しました。`
  }
};
