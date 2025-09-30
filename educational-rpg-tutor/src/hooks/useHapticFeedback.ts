import { useState, useEffect, useCallback, useRef } from 'react';
import type { HapticCapabilities, HapticPreferences, HapticOptions, HapticCategory } from '../types/haptics';
import HapticEngine from '../utils/hapticEngine';

const DEFAULT_PREFERENCES: HapticPreferences = {
  enabled: true,
  intensity: 'medium',
  categorySettings: {
    ui: true,
    achievement: true,
    feedback: true,
    notification: true,
    error: true,
    success: true
  },
  customPatterns: {}
};

export const useHapticFeedback = () => {
  const [capabilities, setCapabilities] = useState<HapticCapabilities>({
    isSupported: false,
    hasVibrationAPI: false,
    hasGamepadHaptics: false,
    maxDuration: 0,
    supportedPatterns: []
  });
  
  const [preferences, setPreferences] = useState<HapticPreferences>(DEFAULT_PREFERENCES);
  const [isActive, setIsActive] = useState(false);
  
  const hapticEngine = useRef(HapticEngine.getInstance());
  const cooldownTimers = useRef<Map<string, number>>(new Map());

  // Initialize capabilities and preferences
  useEffect(() => {
    const caps = hapticEngine.current.getCapabilities();
    setCapabilities(caps);

    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem('hapticPreferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch (error) {
        console.warn('Failed to parse haptic preferences:', error);
      }
    }
  }, []);

  /**
   * Update haptic preferences
   */
  const updatePreferences = useCallback((newPreferences: Partial<HapticPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    
    // Save to localStorage
    localStorage.setItem('hapticPreferences', JSON.stringify(updated));
  }, [preferences]);

  /**
   * Check if haptic should be triggered based on preferences
   */
  const shouldTriggerHaptic = useCallback((category: HapticCategory): boolean => {
    if (!capabilities.isSupported || !preferences.enabled) {
      return false;
    }
    
    return preferences.categorySettings[category];
  }, [capabilities.isSupported, preferences.enabled, preferences.categorySettings]);

  /**
   * Trigger haptic feedback with cooldown management
   */
  const triggerHaptic = useCallback(async (
    patternId: string,
    options: HapticOptions & { cooldown?: number } = {}
  ): Promise<boolean> => {
    const pattern = hapticEngine.current.getPattern(patternId);
    if (!pattern || !shouldTriggerHaptic(pattern.category)) {
      return false;
    }

    // Check cooldown
    if (options.cooldown && cooldownTimers.current.has(patternId)) {
      const lastTriggered = cooldownTimers.current.get(patternId)!;
      if (Date.now() - lastTriggered < options.cooldown) {
        return false;
      }
    }

    setIsActive(true);
    
    try {
      const success = await hapticEngine.current.triggerHaptic(patternId, {
        ...options,
        intensity: options.intensity || preferences.intensity
      });

      if (success && options.cooldown) {
        cooldownTimers.current.set(patternId, Date.now());
      }

      // Reset active state after estimated duration
      const estimatedDuration = pattern.pattern.reduce((sum, duration) => sum + duration, 0);
      setTimeout(() => setIsActive(false), estimatedDuration + 100);

      return success;
    } catch (error) {
      console.error('Haptic trigger error:', error);
      setIsActive(false);
      return false;
    }
  }, [shouldTriggerHaptic, preferences.intensity]);

  /**
   * Trigger custom haptic pattern
   */
  const triggerCustomHaptic = useCallback(async (
    pattern: number[],
    options: HapticOptions = {}
  ): Promise<boolean> => {
    if (!capabilities.isSupported || !preferences.enabled) {
      return false;
    }

    setIsActive(true);
    
    try {
      const success = await hapticEngine.current.triggerCustomHaptic(pattern, {
        ...options,
        intensity: options.intensity || preferences.intensity
      });

      const estimatedDuration = pattern.reduce((sum, duration) => sum + duration, 0);
      setTimeout(() => setIsActive(false), estimatedDuration + 100);

      return success;
    } catch (error) {
      console.error('Custom haptic trigger error:', error);
      setIsActive(false);
      return false;
    }
  }, [capabilities.isSupported, preferences.enabled, preferences.intensity]);

  /**
   * UI interaction haptics
   */
  const uiHaptics = {
    buttonTap: useCallback((options?: HapticOptions) => 
      triggerHaptic('ui-button-tap', { cooldown: 50, ...options }), [triggerHaptic]),
    
    buttonPress: useCallback((options?: HapticOptions) => 
      triggerHaptic('ui-button-press', { cooldown: 100, ...options }), [triggerHaptic]),
    
    hover: useCallback((options?: HapticOptions) => 
      triggerHaptic('ui-hover', { cooldown: 200, ...options }), [triggerHaptic]),
    
    focus: useCallback((options?: HapticOptions) => 
      triggerHaptic('ui-focus', { cooldown: 150, ...options }), [triggerHaptic]),
    
    swipe: useCallback((options?: HapticOptions) => 
      triggerHaptic('ui-swipe', { cooldown: 300, ...options }), [triggerHaptic]),
    
    scroll: useCallback((options?: HapticOptions) => 
      triggerHaptic('ui-scroll', { cooldown: 100, ...options }), [triggerHaptic])
  };

  /**
   * Achievement haptics
   */
  const achievementHaptics = {
    levelUp: useCallback((options?: HapticOptions) => 
      triggerHaptic('achievement-level-up', { intensity: 'heavy', ...options }), [triggerHaptic]),
    
    questComplete: useCallback((options?: HapticOptions) => 
      triggerHaptic('achievement-quest-complete', { intensity: 'heavy', ...options }), [triggerHaptic]),
    
    skillUnlock: useCallback((options?: HapticOptions) => 
      triggerHaptic('achievement-skill-unlock', { intensity: 'medium', ...options }), [triggerHaptic]),
    
    badgeEarned: useCallback((options?: HapticOptions) => 
      triggerHaptic('achievement-badge-earned', { intensity: 'medium', ...options }), [triggerHaptic]),
    
    streakBonus: useCallback((options?: HapticOptions) => 
      triggerHaptic('achievement-streak-bonus', { intensity: 'medium', ...options }), [triggerHaptic]),
    
    majorAchievement: useCallback((options?: HapticOptions) => 
      triggerHaptic('achievement-major', { intensity: 'heavy', ...options }), [triggerHaptic])
  };

  /**
   * Feedback haptics
   */
  const feedbackHaptics = {
    correct: useCallback((options?: HapticOptions) => 
      triggerHaptic('feedback-correct', { intensity: 'medium', ...options }), [triggerHaptic]),
    
    incorrect: useCallback((options?: HapticOptions) => 
      triggerHaptic('feedback-incorrect', { intensity: 'light', ...options }), [triggerHaptic]),
    
    hint: useCallback((options?: HapticOptions) => 
      triggerHaptic('feedback-hint', { intensity: 'light', ...options }), [triggerHaptic]),
    
    progress: useCallback((options?: HapticOptions) => 
      triggerHaptic('feedback-progress', { intensity: 'light', cooldown: 500, ...options }), [triggerHaptic]),
    
    completion: useCallback((options?: HapticOptions) => 
      triggerHaptic('feedback-completion', { intensity: 'medium', ...options }), [triggerHaptic])
  };

  /**
   * Notification haptics
   */
  const notificationHaptics = {
    message: useCallback((options?: HapticOptions) => 
      triggerHaptic('notification-message', { intensity: 'medium', ...options }), [triggerHaptic]),
    
    reminder: useCallback((options?: HapticOptions) => 
      triggerHaptic('notification-reminder', { intensity: 'medium', ...options }), [triggerHaptic]),
    
    alert: useCallback((options?: HapticOptions) => 
      triggerHaptic('notification-alert', { intensity: 'heavy', ...options }), [triggerHaptic]),
    
    system: useCallback((options?: HapticOptions) => 
      triggerHaptic('notification-system', { intensity: 'light', ...options }), [triggerHaptic])
  };

  /**
   * Error haptics
   */
  const errorHaptics = {
    validation: useCallback((options?: HapticOptions) => 
      triggerHaptic('error-validation', { intensity: 'medium', ...options }), [triggerHaptic]),
    
    network: useCallback((options?: HapticOptions) => 
      triggerHaptic('error-network', { intensity: 'medium', ...options }), [triggerHaptic]),
    
    system: useCallback((options?: HapticOptions) => 
      triggerHaptic('error-system', { intensity: 'heavy', ...options }), [triggerHaptic]),
    
    critical: useCallback((options?: HapticOptions) => 
      triggerHaptic('error-critical', { intensity: 'heavy', ...options }), [triggerHaptic])
  };

  /**
   * Success haptics
   */
  const successHaptics = {
    save: useCallback((options?: HapticOptions) => 
      triggerHaptic('success-save', { intensity: 'light', cooldown: 1000, ...options }), [triggerHaptic]),
    
    submit: useCallback((options?: HapticOptions) => 
      triggerHaptic('success-submit', { intensity: 'medium', ...options }), [triggerHaptic]),
    
    complete: useCallback((options?: HapticOptions) => 
      triggerHaptic('success-complete', { intensity: 'medium', ...options }), [triggerHaptic]),
    
    celebration: useCallback((options?: HapticOptions) => 
      triggerHaptic('success-celebration', { intensity: 'heavy', ...options }), [triggerHaptic])
  };

  /**
   * Stop all haptic feedback
   */
  const stopHaptic = useCallback(() => {
    hapticEngine.current.stopHaptic();
    setIsActive(false);
  }, []);

  /**
   * Test haptic functionality
   */
  const testHaptic = useCallback(async (): Promise<boolean> => {
    return hapticEngine.current.testHaptic();
  }, []);

  /**
   * Clear all cooldown timers
   */
  const clearCooldowns = useCallback(() => {
    cooldownTimers.current.clear();
  }, []);

  /**
   * Toggle haptic feedback globally
   */
  const toggleHaptics = useCallback(() => {
    updatePreferences({ enabled: !preferences.enabled });
  }, [preferences.enabled, updatePreferences]);

  /**
   * Set haptic intensity
   */
  const setIntensity = useCallback((intensity: 'light' | 'medium' | 'heavy') => {
    updatePreferences({ intensity });
  }, [updatePreferences]);

  /**
   * Toggle category-specific haptics
   */
  const toggleCategoryHaptics = useCallback((category: HapticCategory) => {
    updatePreferences({
      categorySettings: {
        ...preferences.categorySettings,
        [category]: !preferences.categorySettings[category]
      }
    });
  }, [preferences.categorySettings, updatePreferences]);

  return {
    // State
    capabilities,
    preferences,
    isActive,
    isSupported: capabilities.isSupported,
    
    // Core functions
    triggerHaptic,
    triggerCustomHaptic,
    stopHaptic,
    testHaptic,
    
    // Categorized haptics
    uiHaptics,
    achievementHaptics,
    feedbackHaptics,
    notificationHaptics,
    errorHaptics,
    successHaptics,
    
    // Preferences management
    updatePreferences,
    toggleHaptics,
    setIntensity,
    toggleCategoryHaptics,
    
    // Utility functions
    clearCooldowns
  };
};