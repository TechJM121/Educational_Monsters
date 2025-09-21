import { HapticCapabilities, HapticPattern, HapticOptions, HapticCategory, RPGHapticLibrary } from '../types/haptics';

class HapticEngine {
  private static instance: HapticEngine;
  private capabilities: HapticCapabilities;
  private patterns: Map<string, HapticPattern> = new Map();
  private isActive = false;
  private currentTimeout: number | null = null;

  private constructor() {
    this.capabilities = this.detectCapabilities();
    this.initializePatterns();
  }

  static getInstance(): HapticEngine {
    if (!HapticEngine.instance) {
      HapticEngine.instance = new HapticEngine();
    }
    return HapticEngine.instance;
  }

  /**
   * Detect device haptic capabilities
   */
  private detectCapabilities(): HapticCapabilities {
    const hasVibrationAPI = 'vibrate' in navigator;
    const hasGamepadHaptics = 'getGamepads' in navigator;
    
    // Check for more advanced haptic APIs (iOS Safari, Chrome Android)
    const hasAdvancedHaptics = 'hapticFeedback' in navigator || 
                              'vibrate' in navigator && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    return {
      isSupported: hasVibrationAPI || hasGamepadHaptics,
      hasVibrationAPI,
      hasGamepadHaptics,
      maxDuration: hasVibrationAPI ? 5000 : 0, // 5 second max for safety
      supportedPatterns: hasVibrationAPI ? ['single', 'double', 'triple', 'pattern'] : []
    };
  }

  /**
   * Initialize RPG-themed haptic patterns
   */
  private initializePatterns(): void {
    const patterns: RPGHapticLibrary = {
      ui: {
        buttonTap: this.createPattern('ui-button-tap', 'Button Tap', [50], 'Quick tap feedback', 'ui'),
        buttonPress: this.createPattern('ui-button-press', 'Button Press', [100], 'Firm press feedback', 'ui'),
        hover: this.createPattern('ui-hover', 'Hover', [25], 'Subtle hover feedback', 'ui'),
        focus: this.createPattern('ui-focus', 'Focus', [30], 'Focus state feedback', 'ui'),
        swipe: this.createPattern('ui-swipe', 'Swipe', [40, 20, 40], 'Swipe gesture feedback', 'ui'),
        scroll: this.createPattern('ui-scroll', 'Scroll', [20], 'Scroll feedback', 'ui')
      },
      achievement: {
        levelUp: this.createPattern('achievement-level-up', 'Level Up', [200, 100, 200, 100, 300], 'Level up celebration', 'achievement'),
        questComplete: this.createPattern('achievement-quest-complete', 'Quest Complete', [150, 50, 150, 50, 250], 'Quest completion', 'achievement'),
        skillUnlock: this.createPattern('achievement-skill-unlock', 'Skill Unlock', [100, 50, 100, 50, 200], 'New skill unlocked', 'achievement'),
        badgeEarned: this.createPattern('achievement-badge-earned', 'Badge Earned', [120, 80, 120], 'Badge achievement', 'achievement'),
        streakBonus: this.createPattern('achievement-streak-bonus', 'Streak Bonus', [80, 40, 80, 40, 80], 'Streak milestone', 'achievement'),
        majorAchievement: this.createPattern('achievement-major', 'Major Achievement', [300, 100, 200, 100, 200, 100, 400], 'Major milestone', 'achievement')
      },
      feedback: {
        correct: this.createPattern('feedback-correct', 'Correct Answer', [100, 50, 100], 'Correct response', 'feedback'),
        incorrect: this.createPattern('feedback-incorrect', 'Incorrect Answer', [200], 'Incorrect response', 'feedback'),
        hint: this.createPattern('feedback-hint', 'Hint', [60, 30, 60], 'Hint provided', 'feedback'),
        progress: this.createPattern('feedback-progress', 'Progress', [80], 'Progress update', 'feedback'),
        completion: this.createPattern('feedback-completion', 'Completion', [150, 75, 150], 'Task completion', 'feedback')
      },
      notification: {
        message: this.createPattern('notification-message', 'Message', [100, 100, 100], 'New message', 'notification'),
        reminder: this.createPattern('notification-reminder', 'Reminder', [200, 100, 200], 'Reminder alert', 'notification'),
        alert: this.createPattern('notification-alert', 'Alert', [300, 100, 300], 'Important alert', 'notification'),
        system: this.createPattern('notification-system', 'System', [150], 'System notification', 'notification')
      },
      error: {
        validation: this.createPattern('error-validation', 'Validation Error', [100, 50, 100, 50, 100], 'Form validation error', 'error'),
        network: this.createPattern('error-network', 'Network Error', [200, 100, 200], 'Network issue', 'error'),
        system: this.createPattern('error-system', 'System Error', [250, 100, 250], 'System error', 'error'),
        critical: this.createPattern('error-critical', 'Critical Error', [400, 100, 400], 'Critical system error', 'error')
      },
      success: {
        save: this.createPattern('success-save', 'Save Success', [80, 40, 80], 'Data saved', 'success'),
        submit: this.createPattern('success-submit', 'Submit Success', [120, 60, 120], 'Form submitted', 'success'),
        complete: this.createPattern('success-complete', 'Task Complete', [150, 75, 150], 'Task completed', 'success'),
        celebration: this.createPattern('success-celebration', 'Celebration', [200, 100, 200, 100, 300], 'Success celebration', 'success')
      }
    };

    // Register all patterns
    Object.values(patterns).forEach(category => {
      Object.values(category).forEach(pattern => {
        this.patterns.set(pattern.id, pattern);
      });
    });
  }

  /**
   * Create a haptic pattern
   */
  private createPattern(
    id: string,
    name: string,
    pattern: number[],
    description: string,
    category: HapticCategory
  ): HapticPattern {
    return { id, name, pattern, description, category };
  }

  /**
   * Get device capabilities
   */
  getCapabilities(): HapticCapabilities {
    return { ...this.capabilities };
  }

  /**
   * Check if haptics are supported
   */
  isSupported(): boolean {
    return this.capabilities.isSupported;
  }

  /**
   * Get a haptic pattern by ID
   */
  getPattern(patternId: string): HapticPattern | undefined {
    return this.patterns.get(patternId);
  }

  /**
   * Get all patterns by category
   */
  getPatternsByCategory(category: HapticCategory): HapticPattern[] {
    return Array.from(this.patterns.values()).filter(pattern => pattern.category === category);
  }

  /**
   * Trigger haptic feedback
   */
  async triggerHaptic(patternId: string, options: HapticOptions = {}): Promise<boolean> {
    if (!this.capabilities.isSupported) {
      return false;
    }

    const pattern = this.patterns.get(patternId);
    if (!pattern) {
      console.warn(`Haptic pattern not found: ${patternId}`);
      return false;
    }

    // Apply delay if specified
    if (options.delay && options.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }

    return this.executeHapticPattern(pattern, options);
  }

  /**
   * Trigger haptic feedback with custom pattern
   */
  async triggerCustomHaptic(pattern: number[], options: HapticOptions = {}): Promise<boolean> {
    if (!this.capabilities.isSupported) {
      return false;
    }

    const customPattern: HapticPattern = {
      id: 'custom',
      name: 'Custom Pattern',
      pattern,
      description: 'Custom haptic pattern',
      category: 'ui'
    };

    return this.executeHapticPattern(customPattern, options);
  }

  /**
   * Execute haptic pattern with intensity adjustment
   */
  private async executeHapticPattern(pattern: HapticPattern, options: HapticOptions): Promise<boolean> {
    if (this.isActive) {
      // Cancel current haptic if new one is triggered
      this.stopHaptic();
    }

    try {
      this.isActive = true;
      
      // Adjust pattern based on intensity
      const adjustedPattern = this.adjustPatternIntensity(pattern.pattern, options.intensity || 'medium');
      
      // Use Vibration API if available
      if (this.capabilities.hasVibrationAPI && navigator.vibrate) {
        const success = navigator.vibrate(adjustedPattern);
        
        // Set timeout to track when vibration ends
        const totalDuration = adjustedPattern.reduce((sum, duration) => sum + duration, 0);
        this.currentTimeout = window.setTimeout(() => {
          this.isActive = false;
          this.currentTimeout = null;
        }, totalDuration);
        
        return success;
      }

      // Try gamepad haptics as fallback
      if (this.capabilities.hasGamepadHaptics) {
        return this.tryGamepadHaptics(adjustedPattern);
      }

      return false;
    } catch (error) {
      console.error('Haptic feedback error:', error);
      this.isActive = false;
      return false;
    }
  }

  /**
   * Adjust pattern intensity
   */
  private adjustPatternIntensity(pattern: number[], intensity: 'light' | 'medium' | 'heavy'): number[] {
    const multipliers = {
      light: 0.6,
      medium: 1.0,
      heavy: 1.4
    };

    const multiplier = multipliers[intensity];
    return pattern.map(duration => Math.min(Math.round(duration * multiplier), this.capabilities.maxDuration));
  }

  /**
   * Try gamepad haptics (experimental)
   */
  private tryGamepadHaptics(pattern: number[]): boolean {
    try {
      if (!navigator.getGamepads) {
        return false;
      }

      const gamepads = navigator.getGamepads();
      let hapticTriggered = false;

      for (const gamepad of gamepads) {
        if (gamepad && gamepad.hapticActuators && gamepad.hapticActuators.length > 0) {
          // This is experimental and may not work on all devices
          const actuator = gamepad.hapticActuators[0];
          if (actuator.pulse) {
            // Convert pattern to pulse sequence
            pattern.forEach((duration, index) => {
              setTimeout(() => {
                actuator.pulse(0.5, duration);
              }, pattern.slice(0, index).reduce((sum, d) => sum + d, 0));
            });
            hapticTriggered = true;
          }
        }
      }

      return hapticTriggered;
    } catch (error) {
      console.warn('Gamepad haptics not available:', error);
      return false;
    }
  }

  /**
   * Stop current haptic feedback
   */
  stopHaptic(): void {
    if (this.capabilities.hasVibrationAPI && navigator.vibrate) {
      navigator.vibrate(0); // Stop vibration
    }

    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }

    this.isActive = false;
  }

  /**
   * Check if haptic is currently active
   */
  isHapticActive(): boolean {
    return this.isActive;
  }

  /**
   * Get all available patterns
   */
  getAllPatterns(): HapticPattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * Test haptic functionality
   */
  async testHaptic(): Promise<boolean> {
    return this.triggerHaptic('ui-button-tap');
  }
}

export default HapticEngine;