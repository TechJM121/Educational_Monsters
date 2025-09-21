import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import SoundLibraryManager from '../soundLibrary';
import AudioContextManager from '../audioContext';

// Mock AudioContextManager
vi.mock('../audioContext');

const mockAudioContext = {
  sampleRate: 44100,
  createBuffer: vi.fn(() => ({
    getChannelData: vi.fn(() => new Float32Array(1024))
  }))
};

const mockAudioContextManager = {
  getContext: vi.fn(() => mockAudioContext),
  getInstance: vi.fn()
};

// Properly mock the module
vi.mock('../audioContext', () => ({
  default: mockAudioContextManager
}));

// Remove this line as we're now properly mocking the module

describe('SoundLibraryManager', () => {
  let soundLibrary: SoundLibraryManager;

  beforeEach(() => {
    // Reset singleton instance
    (SoundLibraryManager as any).instance = undefined;
    soundLibrary = SoundLibraryManager.getInstance();
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SoundLibraryManager.getInstance();
      const instance2 = SoundLibraryManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Library Initialization', () => {
    it('should initialize sound library with all categories', async () => {
      await soundLibrary.initializeLibrary();
      
      // Check that sounds from each category are registered
      expect(soundLibrary.getSound('ui-button-click')).toBeDefined();
      expect(soundLibrary.getSound('achievement-level-up')).toBeDefined();
      expect(soundLibrary.getSound('ambient-magical-sparkle')).toBeDefined();
      expect(soundLibrary.getSound('feedback-correct-answer')).toBeDefined();
      expect(soundLibrary.getSound('celebration-confetti')).toBeDefined();
      expect(soundLibrary.getSound('notification-system')).toBeDefined();
    });

    it('should mark UI and feedback sounds for preloading', async () => {
      await soundLibrary.initializeLibrary();
      
      const uiSound = soundLibrary.getSound('ui-button-click');
      const feedbackSound = soundLibrary.getSound('feedback-correct-answer');
      const ambientSound = soundLibrary.getSound('ambient-magical-sparkle');
      
      expect(uiSound?.preload).toBe(true);
      expect(feedbackSound?.preload).toBe(true);
      expect(ambientSound?.preload).toBe(false);
    });
  });

  describe('Sound Loading', () => {
    beforeEach(async () => {
      await soundLibrary.initializeLibrary();
    });

    it('should load a sound successfully', async () => {
      const result = await soundLibrary.loadSound('ui-button-click');
      
      expect(result).toBe(true);
      expect(mockAudioContext.createBuffer).toHaveBeenCalled();
      
      const sound = soundLibrary.getSound('ui-button-click');
      expect(sound?.buffer).toBeTruthy();
    });

    it('should return false for non-existent sound', async () => {
      const result = await soundLibrary.loadSound('non-existent-sound');
      expect(result).toBe(false);
    });

    it('should return true if sound is already loaded', async () => {
      await soundLibrary.loadSound('ui-button-click');
      const result = await soundLibrary.loadSound('ui-button-click');
      
      expect(result).toBe(true);
    });

    it('should handle loading errors gracefully', async () => {
      mockAudioContextManager.getContext.mockReturnValue(null);
      
      const result = await soundLibrary.loadSound('ui-button-click');
      expect(result).toBe(false);
    });
  });

  describe('Sound Retrieval', () => {
    beforeEach(async () => {
      await soundLibrary.initializeLibrary();
    });

    it('should retrieve sound by ID', () => {
      const sound = soundLibrary.getSound('ui-button-click');
      
      expect(sound).toBeDefined();
      expect(sound?.id).toBe('ui-button-click');
      expect(sound?.category).toBe('ui');
    });

    it('should return undefined for non-existent sound', () => {
      const sound = soundLibrary.getSound('non-existent');
      expect(sound).toBeUndefined();
    });

    it('should retrieve sounds by category', () => {
      const uiSounds = soundLibrary.getSoundsByCategory('ui');
      const achievementSounds = soundLibrary.getSoundsByCategory('achievement');
      
      expect(uiSounds.length).toBeGreaterThan(0);
      expect(achievementSounds.length).toBeGreaterThan(0);
      
      uiSounds.forEach(sound => {
        expect(sound.category).toBe('ui');
      });
    });
  });

  describe('Loading State Management', () => {
    it('should track loading state during initialization', async () => {
      const states: any[] = [];
      const unsubscribe = soundLibrary.subscribe((state) => {
        states.push({ ...state });
      });
      
      await soundLibrary.initializeLibrary();
      
      expect(states.length).toBeGreaterThan(0);
      expect(states[0].isLoading).toBe(true);
      expect(states[states.length - 1].isLoading).toBe(false);
      
      unsubscribe();
    });

    it('should provide accurate loading progress', async () => {
      let finalState: any;
      const unsubscribe = soundLibrary.subscribe((state) => {
        finalState = state;
      });
      
      await soundLibrary.initializeLibrary();
      
      expect(finalState.loadedCount).toBeGreaterThan(0);
      expect(finalState.totalCount).toBeGreaterThan(0);
      expect(finalState.loadedCount).toBeLessThanOrEqual(finalState.totalCount);
      
      unsubscribe();
    });
  });

  describe('Synthetic Sound Generation', () => {
    beforeEach(async () => {
      await soundLibrary.initializeLibrary();
    });

    it('should generate different waveforms for different categories', async () => {
      const uiSound = soundLibrary.getSound('ui-button-click');
      const achievementSound = soundLibrary.getSound('achievement-level-up');
      
      await soundLibrary.loadSound('ui-button-click');
      await soundLibrary.loadSound('achievement-level-up');
      
      expect(uiSound?.buffer).toBeTruthy();
      expect(achievementSound?.buffer).toBeTruthy();
      
      // Different categories should have different durations
      expect(uiSound?.buffer?.duration).not.toBe(achievementSound?.buffer?.duration);
    });

    it('should create appropriate durations for different categories', async () => {
      await soundLibrary.loadSound('ui-button-click');
      await soundLibrary.loadSound('achievement-level-up');
      await soundLibrary.loadSound('ambient-magical-sparkle');
      
      const uiSound = soundLibrary.getSound('ui-button-click');
      const achievementSound = soundLibrary.getSound('achievement-level-up');
      const ambientSound = soundLibrary.getSound('ambient-magical-sparkle');
      
      // UI sounds should be shorter than achievement sounds
      expect(uiSound?.buffer?.duration).toBeLessThan(achievementSound?.buffer?.duration || 0);
      
      // Ambient sounds should be longer
      expect(ambientSound?.buffer?.duration).toBeGreaterThan(uiSound?.buffer?.duration || 0);
    });
  });

  describe('Event Subscription', () => {
    it('should notify subscribers of loading state changes', async () => {
      const listener = vi.fn();
      const unsubscribe = soundLibrary.subscribe(listener);
      
      await soundLibrary.initializeLibrary();
      
      expect(listener).toHaveBeenCalled();
      
      unsubscribe();
    });

    it('should remove subscribers when unsubscribed', async () => {
      const listener = vi.fn();
      const unsubscribe = soundLibrary.subscribe(listener);
      
      unsubscribe();
      await soundLibrary.initializeLibrary();
      
      expect(listener).not.toHaveBeenCalled();
    });
  });
});