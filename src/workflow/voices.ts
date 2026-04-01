export interface Voice {
  value: string;
  label: string;
  gender: 'female' | 'male';
  locale: string;
  group: 'multilingual' | 'standard';
}

export const voices: Voice[] = [
  // Multilingual (12)
  { value: 'en-US-AvaMultilingualNeural', label: 'Ava', gender: 'female', locale: 'en-US', group: 'multilingual' },
  { value: 'en-US-AndrewMultilingualNeural', label: 'Andrew', gender: 'male', locale: 'en-US', group: 'multilingual' },
  { value: 'en-US-EmmaMultilingualNeural', label: 'Emma', gender: 'female', locale: 'en-US', group: 'multilingual' },
  { value: 'en-US-BrianMultilingualNeural', label: 'Brian', gender: 'male', locale: 'en-US', group: 'multilingual' },
  { value: 'de-DE-SeraphinaMultilingualNeural', label: 'Seraphina', gender: 'female', locale: 'de-DE', group: 'multilingual' },
  { value: 'de-DE-FlorianMultilingualNeural', label: 'Florian', gender: 'male', locale: 'de-DE', group: 'multilingual' },
  { value: 'es-ES-ElviraMultilingualNeural', label: 'Elvira', gender: 'female', locale: 'es-ES', group: 'multilingual' },
  { value: 'es-ES-AlvaroMultilingualNeural', label: 'Alvaro', gender: 'male', locale: 'es-ES', group: 'multilingual' },
  { value: 'fr-FR-VivienneMultilingualNeural', label: 'Vivienne', gender: 'female', locale: 'fr-FR', group: 'multilingual' },
  { value: 'fr-FR-RemyMultilingualNeural', label: 'Remy', gender: 'male', locale: 'fr-FR', group: 'multilingual' },
  { value: 'it-IT-GiuseppeMultilingualNeural', label: 'Giuseppe', gender: 'male', locale: 'it-IT', group: 'multilingual' },
  { value: 'ja-JP-NanamiMultilingualNeural', label: 'Nanami', gender: 'female', locale: 'ja-JP', group: 'multilingual' },

  // Standard English US (8)
  { value: 'en-US-AriaNeural', label: 'Aria', gender: 'female', locale: 'en-US', group: 'standard' },
  { value: 'en-US-GuyNeural', label: 'Guy', gender: 'male', locale: 'en-US', group: 'standard' },
  { value: 'en-US-JennyNeural', label: 'Jenny', gender: 'female', locale: 'en-US', group: 'standard' },
  { value: 'en-US-MichelleNeural', label: 'Michelle', gender: 'female', locale: 'en-US', group: 'standard' },
  { value: 'en-US-RogerNeural', label: 'Roger', gender: 'male', locale: 'en-US', group: 'standard' },
  { value: 'en-US-SteffanNeural', label: 'Steffan', gender: 'male', locale: 'en-US', group: 'standard' },
  { value: 'en-US-ChristopherNeural', label: 'Christopher', gender: 'male', locale: 'en-US', group: 'standard' },
  { value: 'en-US-EricNeural', label: 'Eric', gender: 'male', locale: 'en-US', group: 'standard' },

  // Standard English UK (5)
  { value: 'en-GB-LibbyNeural', label: 'Libby', gender: 'female', locale: 'en-GB', group: 'standard' },
  { value: 'en-GB-MaisieNeural', label: 'Maisie', gender: 'female', locale: 'en-GB', group: 'standard' },
  { value: 'en-GB-RyanNeural', label: 'Ryan', gender: 'male', locale: 'en-GB', group: 'standard' },
  { value: 'en-GB-SoniaNeural', label: 'Sonia', gender: 'female', locale: 'en-GB', group: 'standard' },
  { value: 'en-GB-ThomasNeural', label: 'Thomas', gender: 'male', locale: 'en-GB', group: 'standard' },

  // Standard English Australia (2)
  { value: 'en-AU-NatashaNeural', label: 'Natasha', gender: 'female', locale: 'en-AU', group: 'standard' },
  { value: 'en-AU-WilliamNeural', label: 'William', gender: 'male', locale: 'en-AU', group: 'standard' },

  // Standard English Canada (2)
  { value: 'en-CA-ClaraNeural', label: 'Clara', gender: 'female', locale: 'en-CA', group: 'standard' },
  { value: 'en-CA-LiamNeural', label: 'Liam', gender: 'male', locale: 'en-CA', group: 'standard' },

  // Standard English India (2)
  { value: 'en-IN-NeerjaNeural', label: 'Neerja', gender: 'female', locale: 'en-IN', group: 'standard' },
  { value: 'en-IN-PrabhatNeural', label: 'Prabhat', gender: 'male', locale: 'en-IN', group: 'standard' },

  // Standard English Ireland (1)
  { value: 'en-IE-EmilyNeural', label: 'Emily', gender: 'female', locale: 'en-IE', group: 'standard' },

  // Standard English Philippines (1)
  { value: 'en-PH-JamesNeural', label: 'James', gender: 'male', locale: 'en-PH', group: 'standard' },

  // Standard English South Africa (1)
  { value: 'en-ZA-LeahNeural', label: 'Leah', gender: 'female', locale: 'en-ZA', group: 'standard' },

  // Standard Spanish US (2)
  { value: 'es-US-AlonsoNeural', label: 'Alonso', gender: 'male', locale: 'es-US', group: 'standard' },
  { value: 'es-US-PalomaNeural', label: 'Paloma', gender: 'female', locale: 'es-US', group: 'standard' },

  // Standard Spanish Spain (2)
  { value: 'es-ES-AbrilNeural', label: 'Abril', gender: 'female', locale: 'es-ES', group: 'standard' },
  { value: 'es-ES-ArnauNeural', label: 'Arnau', gender: 'male', locale: 'es-ES', group: 'standard' },

  // Standard French France (2)
  { value: 'fr-FR-DeniseNeural', label: 'Denise', gender: 'female', locale: 'fr-FR', group: 'standard' },
  { value: 'fr-FR-HenriNeural', label: 'Henri', gender: 'male', locale: 'fr-FR', group: 'standard' },

  // Standard German Germany (2)
  { value: 'de-DE-KatjaNeural', label: 'Katja', gender: 'female', locale: 'de-DE', group: 'standard' },
  { value: 'de-DE-ConradNeural', label: 'Conrad', gender: 'male', locale: 'de-DE', group: 'standard' },

  // Standard Italian Italy (2)
  { value: 'it-IT-ElsaNeural', label: 'Elsa', gender: 'female', locale: 'it-IT', group: 'standard' },
  { value: 'it-IT-IsabellaNeural', label: 'Isabella', gender: 'female', locale: 'it-IT', group: 'standard' },

  // Standard Japanese Japan (2)
  { value: 'ja-JP-KeitaNeural', label: 'Keita', gender: 'male', locale: 'ja-JP', group: 'standard' },
  { value: 'ja-JP-NanamiNeural', label: 'Nanami', gender: 'female', locale: 'ja-JP', group: 'standard' },

  // Standard Chinese Mandarin (4)
  { value: 'zh-CN-XiaoxiaoNeural', label: 'Xiaoxiao', gender: 'female', locale: 'zh-CN', group: 'standard' },
  { value: 'zh-CN-YunxiNeural', label: 'Yunxi', gender: 'male', locale: 'zh-CN', group: 'standard' },
  { value: 'zh-CN-YunjianNeural', label: 'Yunjian', gender: 'male', locale: 'zh-CN', group: 'standard' },
  { value: 'zh-CN-XiaoyiNeural', label: 'Xiaoyi', gender: 'female', locale: 'zh-CN', group: 'standard' },

  // Standard Chinese Cantonese (1)
  { value: 'zh-HK-HiuGaaiNeural', label: 'HiuGaai', gender: 'female', locale: 'zh-HK', group: 'standard' },

  // Standard Hindi India (2)
  { value: 'hi-IN-MadhurNeural', label: 'Madhur', gender: 'male', locale: 'hi-IN', group: 'standard' },
  { value: 'hi-IN-SwaraNeural', label: 'Swara', gender: 'female', locale: 'hi-IN', group: 'standard' }
];

export const multilingualVoices = voices.filter(v => v.group === 'multilingual');
export const standardVoices = voices.filter(v => v.group === 'standard');

export function getVoiceByValue(value: string) {
  return voices.find(v => v.value === value);
}
