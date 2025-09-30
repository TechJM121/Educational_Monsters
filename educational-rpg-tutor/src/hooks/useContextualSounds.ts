import { useCallback, useRef } from 'react';
import { useAudioSystem } from './useAudioSystem';
import type { PlaySoundOptions } from '../types/audio';

export interface ContextualSoundOptions extends PlaySoundOptions {
  priority?: 'low' | 'medium' | 'high';
  interrupt?: boolean;
  cooldown?: number;
}

export interface SoundTiming {
  delay?: number;
  duration?: number;
  fadeIn?: number;
  fadeOut?: number;
}

export const useContextualSounds = () => {
  const { playSound, isReady, preferences } = useAudioSystem();
  const cooldownTimers = useRef<Map<string, number>>(new Map());
  const activeSounds = useRef<Set<string>>(new Set());

  /**
   * Play a contextual sound with enhanced options
   */
  const playContextualSound = useCallback(async (
    soundId: string,
    options: ContextualSoundOptions = {}
  ): Promise<boolean> => {
    if (!isReady || preferences.isMuted) {
      return false;
    }

    // Check cooldown
    if (options.cooldown && cooldownTimers.current.has(soundId)) {
      const lastPlayed = cooldownTimers.current.get(soundId)!;
      if (Date.now() - lastPlayed < options.cooldown) {
        return false;
      }
    }

    // Handle interruption
    if (options.interrupt && activeSounds.current.has(soundId)) {
      // In a real implementation, we would stop the existing sound
      activeSounds.current.delete(soundId);
    }

    // Play the sound
    const success = await playSound(soundId, options);
    
    if (success) {
      // Track active sound
      activeSounds.current.add(soundId);
      
      // Set cooldown timer
      if (options.cooldown) {
        cooldownTimers.current.set(soundId, Date.now());
      }
      
      // Remove from active sounds after estimated duration
      const estimatedDuration = options.duration || 1000;
      setTimeout(() => {
        activeSounds.current.delete(soundId);
      }, estimatedDuration);
    }

    return success;
  }, [playSound, isReady, preferences.isMuted]);

  /**
   * Button interaction sounds
   */
  const buttonSounds = {
    click: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('ui-button-click', { 
        volume: 0.6, 
        cooldown: 100,
        ...options 
      }), [playContextualSound]),
    
    hover: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('ui-button-hover', { 
        volume: 0.3, 
        cooldown: 200,
        ...options 
      }), [playContextualSound]),
    
    focus: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('ui-input-focus', { 
        volume: 0.4, 
        cooldown: 150,
        ...options 
      }), [playContextualSound])
  };

  /**
   * Achievement and celebration sounds
   */
  const achievementSounds = {
    levelUp: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('achievement-level-up', { 
        volume: 1.0, 
        priority: 'high',
        interrupt: true,
        ...options 
      }), [playContextualSound]),
    
    questComplete: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('achievement-quest-complete', { 
        volume: 0.9, 
        priority: 'high',
        ...options 
      }), [playContextualSound]),
    
    skillUnlock: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('achievement-skill-unlock', { 
        volume: 0.8, 
        priority: 'medium',
        ...options 
      }), [playContextualSound]),
    
    badgeEarned: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('achievement-badge-earned', { 
        volume: 0.7, 
        priority: 'medium',
        ...options 
      }), [playContextualSound])
  };

  /**
   * Learning feedback sounds
   */
  const feedbackSounds = {
    correct: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('feedback-correct-answer', { 
        volume: 0.8, 
        priority: 'high',
        ...options 
      }), [playContextualSound]),
    
    incorrect: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('feedback-wrong-answer', { 
        volume: 0.6, 
        priority: 'medium',
        ...options 
      }), [playContextualSound]),
    
    hint: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('feedback-hint-reveal', { 
        volume: 0.5, 
        priority: 'low',
        ...options 
      }), [playContextualSound]),
    
    save: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('feedback-progress-save', { 
        volume: 0.4, 
        priority: 'low',
        cooldown: 2000,
        ...options 
      }), [playContextualSound])
  };

  /**
   * Modal and navigation sounds
   */
  const navigationSounds = {
    modalOpen: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('ui-modal-open', { 
        volume: 0.5, 
        fadeIn: 0.1,
        ...options 
      }), [playContextualSound]),
    
    modalClose: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('ui-modal-close', { 
        volume: 0.4, 
        fadeOut: 0.1,
        ...options 
      }), [playContextualSound]),
    
    tabSwitch: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('ui-tab-switch', { 
        volume: 0.3, 
        cooldown: 300,
        ...options 
      }), [playContextualSound])
  };

  /**
   * Form interaction sounds
   */
  const formSounds = {
    inputFocus: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('ui-input-focus', { 
        volume: 0.3, 
        cooldown: 200,
        ...options 
      }), [playContextualSound]),
    
    inputError: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('ui-input-error', { 
        volume: 0.6, 
        priority: 'medium',
        ...options 
      }), [playContextualSound]),
    
    inputSuccess: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('ui-input-success', { 
        volume: 0.5, 
        priority: 'medium',
        ...options 
      }), [playContextualSound])
  };

  /**
   * Notification sounds
   */
  const notificationSounds = {
    message: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('notification-message-received', { 
        volume: 0.7, 
        priority: 'medium',
        ...options 
      }), [playContextualSound]),
    
    reminder: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('notification-reminder-alert', { 
        volume: 0.8, 
        priority: 'high',
        ...options 
      }), [playContextualSound]),
    
    system: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('notification-system', { 
        volume: 0.6, 
        priority: 'medium',
        cooldown: 1000,
        ...options 
      }), [playContextualSound])
  };

  /**
   * Celebration sounds with synchronized timing
   */
  const celebrationSounds = {
    confetti: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('celebration-confetti', { 
        volume: 0.8, 
        priority: 'high',
        ...options 
      }), [playContextualSound]),
    
    fanfare: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('celebration-fanfare', { 
        volume: 1.0, 
        priority: 'high',
        interrupt: true,
        ...options 
      }), [playContextualSound]),
    
    chime: useCallback((options?: ContextualSoundOptions) => 
      playContextualSound('celebration-chime', { 
        volume: 0.7, 
        priority: 'medium',
        ...options 
      }), [playContextualSound])
  };

  /**
   * Play synchronized sound sequence for complex interactions
   */
  const playSoundSequence = useCallback(async (
    sounds: Array<{ soundId: string; timing: SoundTiming; options?: ContextualSoundOptions }>
  ): Promise<void> => {
    for (const { soundId, timing, options = {} } of sounds) {
      if (timing.delay) {
        await new Promise(resolve => setTimeout(resolve, timing.delay));
      }
      
      await playContextualSound(soundId, {
        ...options,
        fadeIn: timing.fadeIn,
        fadeOut: timing.fadeOut
      });
    }
  }, [playContextualSound]);

  /**
   * Synchronized achievement celebration
   */
  const playAchievementCelebration = useCallback(async (
    type: 'levelUp' | 'questComplete' | 'majorAchievement' = 'levelUp'
  ): Promise<void> => {
    const sequences = {
      levelUp: [
        { soundId: 'achievement-level-up', timing: { delay: 0, fadeIn: 0.1 } },
        { soundId: 'celebration-chime', timing: { delay: 500, fadeIn: 0.1 } }
      ],
      questComplete: [
        { soundId: 'achievement-quest-complete', timing: { delay: 0, fadeIn: 0.1 } },
        { soundId: 'celebration-fanfare', timing: { delay: 300, fadeIn: 0.2 } }
      ],
      majorAchievement: [
        { soundId: 'achievement-level-up', timing: { delay: 0, fadeIn: 0.1 } },
        { soundId: 'celebration-fanfare', timing: { delay: 200, fadeIn: 0.2 } },
        { soundId: 'celebration-confetti', timing: { delay: 800, fadeIn: 0.1 } }
      ]
    };

    await playSoundSequence(sequences[type]);
  }, [playSoundSequence]);

  /**
   * Clear all cooldown timers
   */
  const clearCooldowns = useCallback(() => {
    cooldownTimers.current.clear();
  }, []);

  /**
   * Get active sound count for debugging
   */
  const getActiveSoundCount = useCallback(() => {
    return activeSounds.current.size;
  }, []);

  return {
    // Core functionality
    playContextualSound,
    playSoundSequence,
    
    // Categorized sounds
    buttonSounds,
    achievementSounds,
    feedbackSounds,
    navigationSounds,
    formSounds,
    notificationSounds,
    celebrationSounds,
    
    // Special sequences
    playAchievementCelebration,
    
    // Utility functions
    clearCooldowns,
    getActiveSoundCount,
    
    // State
    isReady
  };
};