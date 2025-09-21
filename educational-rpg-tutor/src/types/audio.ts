export interface AudioContextState {
  context: AudioContext | null;
  isInitialized: boolean;
  isSupported: boolean;
  masterVolume: number;
  isMuted: boolean;
}

export interface SoundEffect {
  id: string;
  name: string;
  url: string;
  buffer: AudioBuffer | null;
  category: SoundCategory;
  volume: number;
  loop: boolean;
  preload: boolean;
}

export type SoundCategory = 
  | 'ui' 
  | 'achievement' 
  | 'ambient' 
  | 'feedback' 
  | 'celebration' 
  | 'notification';

export interface AudioPreferences {
  masterVolume: number;
  categoryVolumes: Record<SoundCategory, number>;
  isMuted: boolean;
  enableHaptics: boolean;
  audioQuality: 'low' | 'medium' | 'high';
}

export interface PlaySoundOptions {
  volume?: number;
  playbackRate?: number;
  loop?: boolean;
  fadeIn?: number;
  fadeOut?: number;
  delay?: number;
}

export interface AudioLoadingState {
  isLoading: boolean;
  loadedCount: number;
  totalCount: number;
  failedSounds: string[];
}

export interface RPGSoundLibrary {
  ui: {
    buttonClick: SoundEffect;
    buttonHover: SoundEffect;
    modalOpen: SoundEffect;
    modalClose: SoundEffect;
    tabSwitch: SoundEffect;
    inputFocus: SoundEffect;
    inputError: SoundEffect;
    inputSuccess: SoundEffect;
  };
  achievement: {
    levelUp: SoundEffect;
    questComplete: SoundEffect;
    skillUnlock: SoundEffect;
    badgeEarned: SoundEffect;
    streakBonus: SoundEffect;
  };
  ambient: {
    magicalSparkle: SoundEffect;
    techHum: SoundEffect;
    natureWind: SoundEffect;
    cosmicResonance: SoundEffect;
  };
  feedback: {
    correctAnswer: SoundEffect;
    wrongAnswer: SoundEffect;
    hintReveal: SoundEffect;
    progressSave: SoundEffect;
  };
  celebration: {
    confetti: SoundEffect;
    fanfare: SoundEffect;
    chime: SoundEffect;
    applause: SoundEffect;
  };
  notification: {
    messageReceived: SoundEffect;
    reminderAlert: SoundEffect;
    systemNotification: SoundEffect;
  };
}