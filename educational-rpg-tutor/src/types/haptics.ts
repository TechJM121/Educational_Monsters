export interface HapticPattern {
  id: string;
  name: string;
  pattern: number[];
  description: string;
  category: HapticCategory;
}

export type HapticCategory = 
  | 'ui' 
  | 'achievement' 
  | 'feedback' 
  | 'notification' 
  | 'error' 
  | 'success';

export interface HapticOptions {
  intensity?: 'light' | 'medium' | 'heavy';
  duration?: number;
  pattern?: number[];
  delay?: number;
}

export interface HapticCapabilities {
  isSupported: boolean;
  hasVibrationAPI: boolean;
  hasGamepadHaptics: boolean;
  maxDuration: number;
  supportedPatterns: string[];
}

export interface HapticPreferences {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
  categorySettings: Record<HapticCategory, boolean>;
  customPatterns: Record<string, number[]>;
}

export interface HapticFeedbackState {
  isActive: boolean;
  currentPattern: string | null;
  queuedPatterns: string[];
  lastTriggered: number;
}

export interface RPGHapticLibrary {
  ui: {
    buttonTap: HapticPattern;
    buttonPress: HapticPattern;
    hover: HapticPattern;
    focus: HapticPattern;
    swipe: HapticPattern;
    scroll: HapticPattern;
  };
  achievement: {
    levelUp: HapticPattern;
    questComplete: HapticPattern;
    skillUnlock: HapticPattern;
    badgeEarned: HapticPattern;
    streakBonus: HapticPattern;
    majorAchievement: HapticPattern;
  };
  feedback: {
    correct: HapticPattern;
    incorrect: HapticPattern;
    hint: HapticPattern;
    progress: HapticPattern;
    completion: HapticPattern;
  };
  notification: {
    message: HapticPattern;
    reminder: HapticPattern;
    alert: HapticPattern;
    system: HapticPattern;
  };
  error: {
    validation: HapticPattern;
    network: HapticPattern;
    system: HapticPattern;
    critical: HapticPattern;
  };
  success: {
    save: HapticPattern;
    submit: HapticPattern;
    complete: HapticPattern;
    celebration: HapticPattern;
  };
}