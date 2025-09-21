import { SoundEffect, SoundCategory, RPGSoundLibrary, AudioLoadingState } from '../types/audio';
import AudioContextManager from './audioContext';

class SoundLibraryManager {
  private static instance: SoundLibraryManager;
  private sounds: Map<string, SoundEffect> = new Map();
  private loadingState: AudioLoadingState = {
    isLoading: false,
    loadedCount: 0,
    totalCount: 0,
    failedSounds: []
  };
  private listeners: Set<(state: AudioLoadingState) => void> = new Set();

  private constructor() {}

  static getInstance(): SoundLibraryManager {
    if (!SoundLibraryManager.instance) {
      SoundLibraryManager.instance = new SoundLibraryManager();
    }
    return SoundLibraryManager.instance;
  }

  /**
   * Initialize the RPG sound library with placeholder URLs
   * In a real implementation, these would point to actual audio files
   */
  async initializeLibrary(): Promise<void> {
    const soundDefinitions: RPGSoundLibrary = {
      ui: {
        buttonClick: this.createSoundEffect('ui-button-click', 'Button Click', '/sounds/ui/button-click.mp3', 'ui'),
        buttonHover: this.createSoundEffect('ui-button-hover', 'Button Hover', '/sounds/ui/button-hover.mp3', 'ui'),
        modalOpen: this.createSoundEffect('ui-modal-open', 'Modal Open', '/sounds/ui/modal-open.mp3', 'ui'),
        modalClose: this.createSoundEffect('ui-modal-close', 'Modal Close', '/sounds/ui/modal-close.mp3', 'ui'),
        tabSwitch: this.createSoundEffect('ui-tab-switch', 'Tab Switch', '/sounds/ui/tab-switch.mp3', 'ui'),
        inputFocus: this.createSoundEffect('ui-input-focus', 'Input Focus', '/sounds/ui/input-focus.mp3', 'ui'),
        inputError: this.createSoundEffect('ui-input-error', 'Input Error', '/sounds/ui/input-error.mp3', 'ui'),
        inputSuccess: this.createSoundEffect('ui-input-success', 'Input Success', '/sounds/ui/input-success.mp3', 'ui'),
      },
      achievement: {
        levelUp: this.createSoundEffect('achievement-level-up', 'Level Up', '/sounds/achievement/level-up.mp3', 'achievement'),
        questComplete: this.createSoundEffect('achievement-quest-complete', 'Quest Complete', '/sounds/achievement/quest-complete.mp3', 'achievement'),
        skillUnlock: this.createSoundEffect('achievement-skill-unlock', 'Skill Unlock', '/sounds/achievement/skill-unlock.mp3', 'achievement'),
        badgeEarned: this.createSoundEffect('achievement-badge-earned', 'Badge Earned', '/sounds/achievement/badge-earned.mp3', 'achievement'),
        streakBonus: this.createSoundEffect('achievement-streak-bonus', 'Streak Bonus', '/sounds/achievement/streak-bonus.mp3', 'achievement'),
      },
      ambient: {
        magicalSparkle: this.createSoundEffect('ambient-magical-sparkle', 'Magical Sparkle', '/sounds/ambient/magical-sparkle.mp3', 'ambient', { loop: true }),
        techHum: this.createSoundEffect('ambient-tech-hum', 'Tech Hum', '/sounds/ambient/tech-hum.mp3', 'ambient', { loop: true }),
        natureWind: this.createSoundEffect('ambient-nature-wind', 'Nature Wind', '/sounds/ambient/nature-wind.mp3', 'ambient', { loop: true }),
        cosmicResonance: this.createSoundEffect('ambient-cosmic-resonance', 'Cosmic Resonance', '/sounds/ambient/cosmic-resonance.mp3', 'ambient', { loop: true }),
      },
      feedback: {
        correctAnswer: this.createSoundEffect('feedback-correct-answer', 'Correct Answer', '/sounds/feedback/correct-answer.mp3', 'feedback'),
        wrongAnswer: this.createSoundEffect('feedback-wrong-answer', 'Wrong Answer', '/sounds/feedback/wrong-answer.mp3', 'feedback'),
        hintReveal: this.createSoundEffect('feedback-hint-reveal', 'Hint Reveal', '/sounds/feedback/hint-reveal.mp3', 'feedback'),
        progressSave: this.createSoundEffect('feedback-progress-save', 'Progress Save', '/sounds/feedback/progress-save.mp3', 'feedback'),
      },
      celebration: {
        confetti: this.createSoundEffect('celebration-confetti', 'Confetti', '/sounds/celebration/confetti.mp3', 'celebration'),
        fanfare: this.createSoundEffect('celebration-fanfare', 'Fanfare', '/sounds/celebration/fanfare.mp3', 'celebration'),
        chime: this.createSoundEffect('celebration-chime', 'Chime', '/sounds/celebration/chime.mp3', 'celebration'),
        applause: this.createSoundEffect('celebration-applause', 'Applause', '/sounds/celebration/applause.mp3', 'celebration'),
      },
      notification: {
        messageReceived: this.createSoundEffect('notification-message-received', 'Message Received', '/sounds/notification/message-received.mp3', 'notification'),
        reminderAlert: this.createSoundEffect('notification-reminder-alert', 'Reminder Alert', '/sounds/notification/reminder-alert.mp3', 'notification'),
        systemNotification: this.createSoundEffect('notification-system', 'System Notification', '/sounds/notification/system.mp3', 'notification'),
      }
    };

    // Flatten the sound definitions and register them
    const allSounds: SoundEffect[] = [];
    Object.values(soundDefinitions).forEach(category => {
      Object.values(category).forEach(sound => {
        allSounds.push(sound);
      });
    });

    // Register all sounds
    allSounds.forEach(sound => {
      this.sounds.set(sound.id, sound);
    });

    // Load preload sounds
    await this.loadPreloadSounds();
  }

  /**
   * Create a sound effect definition
   */
  private createSoundEffect(
    id: string, 
    name: string, 
    url: string, 
    category: SoundCategory,
    options: Partial<SoundEffect> = {}
  ): SoundEffect {
    return {
      id,
      name,
      url,
      buffer: null,
      category,
      volume: 1.0,
      loop: false,
      preload: category === 'ui' || category === 'feedback', // Preload UI and feedback sounds
      ...options
    };
  }

  /**
   * Load sounds marked for preloading
   */
  private async loadPreloadSounds(): Promise<void> {
    const preloadSounds = Array.from(this.sounds.values()).filter(sound => sound.preload);
    
    if (preloadSounds.length === 0) return;

    this.loadingState = {
      isLoading: true,
      loadedCount: 0,
      totalCount: preloadSounds.length,
      failedSounds: []
    };
    this.notifyListeners();

    const loadPromises = preloadSounds.map(sound => this.loadSound(sound.id));
    await Promise.allSettled(loadPromises);

    this.loadingState.isLoading = false;
    this.notifyListeners();
  }

  /**
   * Load a specific sound by ID
   */
  async loadSound(soundId: string): Promise<boolean> {
    const sound = this.sounds.get(soundId);
    if (!sound) {
      console.warn(`Sound not found: ${soundId}`);
      return false;
    }

    if (sound.buffer) {
      return true; // Already loaded
    }

    const audioContext = AudioContextManager.getInstance().getContext();
    if (!audioContext) {
      console.warn('Audio context not available');
      return false;
    }

    try {
      // For demo purposes, create a synthetic sound buffer
      // In a real implementation, you would fetch the actual audio file
      const buffer = this.createSyntheticSound(audioContext, sound.category);
      sound.buffer = buffer;
      
      this.loadingState.loadedCount++;
      this.notifyListeners();
      
      return true;
    } catch (error) {
      console.error(`Failed to load sound ${soundId}:`, error);
      this.loadingState.failedSounds.push(soundId);
      this.notifyListeners();
      return false;
    }
  }

  /**
   * Create synthetic sound for demo purposes
   * In a real implementation, this would be replaced with actual audio file loading
   */
  private createSyntheticSound(audioContext: AudioContext, category: SoundCategory): AudioBuffer {
    const sampleRate = audioContext.sampleRate;
    const duration = this.getSyntheticSoundDuration(category);
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Generate different waveforms based on category
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      channelData[i] = this.generateWaveform(t, category) * this.getEnvelope(t, duration);
    }

    return buffer;
  }

  /**
   * Get duration for synthetic sounds based on category
   */
  private getSyntheticSoundDuration(category: SoundCategory): number {
    switch (category) {
      case 'ui': return 0.1;
      case 'feedback': return 0.3;
      case 'achievement': return 1.0;
      case 'celebration': return 1.5;
      case 'notification': return 0.5;
      case 'ambient': return 2.0;
      default: return 0.2;
    }
  }

  /**
   * Generate waveform based on category
   */
  private generateWaveform(t: number, category: SoundCategory): number {
    switch (category) {
      case 'ui':
        return Math.sin(2 * Math.PI * 800 * t) * 0.3;
      case 'feedback':
        return Math.sin(2 * Math.PI * 440 * t) * 0.4;
      case 'achievement':
        return Math.sin(2 * Math.PI * 523.25 * t) * 0.5 + Math.sin(2 * Math.PI * 659.25 * t) * 0.3;
      case 'celebration':
        return (Math.sin(2 * Math.PI * 523.25 * t) + Math.sin(2 * Math.PI * 659.25 * t) + Math.sin(2 * Math.PI * 783.99 * t)) * 0.3;
      case 'notification':
        return Math.sin(2 * Math.PI * 1000 * t) * 0.4;
      case 'ambient':
        return (Math.sin(2 * Math.PI * 220 * t) + Math.sin(2 * Math.PI * 330 * t)) * 0.2;
      default:
        return Math.sin(2 * Math.PI * 440 * t) * 0.3;
    }
  }

  /**
   * Generate envelope for sound shaping
   */
  private getEnvelope(t: number, duration: number): number {
    const attackTime = Math.min(0.01, duration * 0.1);
    const releaseTime = Math.min(0.1, duration * 0.3);
    
    if (t < attackTime) {
      return t / attackTime;
    } else if (t > duration - releaseTime) {
      return (duration - t) / releaseTime;
    } else {
      return 1;
    }
  }

  /**
   * Get a sound by ID
   */
  getSound(soundId: string): SoundEffect | undefined {
    return this.sounds.get(soundId);
  }

  /**
   * Get all sounds by category
   */
  getSoundsByCategory(category: SoundCategory): SoundEffect[] {
    return Array.from(this.sounds.values()).filter(sound => sound.category === category);
  }

  /**
   * Get loading state
   */
  getLoadingState(): AudioLoadingState {
    return { ...this.loadingState };
  }

  /**
   * Subscribe to loading state changes
   */
  subscribe(listener: (state: AudioLoadingState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.loadingState));
  }
}

export default SoundLibraryManager;