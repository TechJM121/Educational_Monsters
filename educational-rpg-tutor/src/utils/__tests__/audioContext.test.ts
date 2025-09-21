import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import AudioContextManager from '../audioContext';

// Mock Web Audio API
const mockAudioContext = {
  state: 'running',
  sampleRate: 44100,
  currentTime: 0,
  destination: {},
  createGain: vi.fn(() => ({
    gain: { value: 1, setValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn()
  })),
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  createBuffer: vi.fn(),
  createBufferSource: vi.fn()
};

const mockWebkitAudioContext = vi.fn(() => mockAudioContext);

// Mock global AudioContext
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: vi.fn(() => mockAudioContext)
});

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: mockWebkitAudioContext
});

describe('AudioContextManager', () => {
  let audioManager: AudioContextManager;

  beforeEach(() => {
    // Reset singleton instance
    (AudioContextManager as any).instance = undefined;
    audioManager = AudioContextManager.getInstance();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await audioManager.dispose();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AudioContextManager.getInstance();
      const instance2 = AudioContextManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Browser Support Detection', () => {
    it('should detect Web Audio API support', () => {
      expect(audioManager.isSupported()).toBe(true);
    });

    it('should detect lack of support when AudioContext is not available', () => {
      const originalAudioContext = window.AudioContext;
      const originalWebkitAudioContext = (window as any).webkitAudioContext;
      
      // Use Object.defineProperty to properly remove properties
      Object.defineProperty(window, 'AudioContext', { value: undefined, configurable: true });
      Object.defineProperty(window, 'webkitAudioContext', { value: undefined, configurable: true });
      
      // Reset singleton to test with new window state
      (AudioContextManager as any).instance = undefined;
      const unsupportedManager = AudioContextManager.getInstance();
      expect(unsupportedManager.isSupported()).toBe(false);
      
      // Restore
      Object.defineProperty(window, 'AudioContext', { value: originalAudioContext, configurable: true });
      Object.defineProperty(window, 'webkitAudioContext', { value: originalWebkitAudioContext, configurable: true });
    });
  });

  describe('Initialization', () => {
    it('should initialize audio context successfully', async () => {
      const result = await audioManager.initialize();
      
      expect(result).toBe(true);
      expect(window.AudioContext).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });

    it('should handle suspended audio context', async () => {
      mockAudioContext.state = 'suspended';
      
      const result = await audioManager.initialize();
      
      expect(result).toBe(true);
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('should return true if already initialized', async () => {
      await audioManager.initialize();
      const result = await audioManager.initialize();
      
      expect(result).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      vi.mocked(window.AudioContext).mockImplementation(() => {
        throw new Error('AudioContext creation failed');
      });
      
      const result = await audioManager.initialize();
      
      expect(result).toBe(false);
    });
  });

  describe('Volume Control', () => {
    beforeEach(async () => {
      // Reset mocks before each test
      vi.clearAllMocks();
      await audioManager.initialize();
    });

    it('should set master volume', () => {
      audioManager.setMasterVolume(0.5);
      
      // Verify the gain node's setValueAtTime was called
      expect(mockAudioContext.createGain().gain.setValueAtTime).toHaveBeenCalledWith(0.5, 0);
    });

    it('should clamp volume values', () => {
      audioManager.setMasterVolume(-0.5);
      expect(mockAudioContext.createGain().gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
      
      vi.clearAllMocks(); // Clear between calls
      audioManager.setMasterVolume(1.5);
      expect(mockAudioContext.createGain().gain.setValueAtTime).toHaveBeenCalledWith(1, 0);
    });
  });

  describe('State Management', () => {
    it('should return correct initial state', () => {
      const state = audioManager.getState();
      
      expect(state).toEqual({
        context: null,
        isInitialized: false,
        isSupported: true,
        masterVolume: 1,
        isMuted: false
      });
    });

    it('should return correct state after initialization', async () => {
      const result = await audioManager.initialize();
      expect(result).toBe(true);
      
      const state = audioManager.getState();
      expect(state.isInitialized).toBe(true);
      expect(state.context).toBeTruthy();
    });
  });

  describe('Event Subscription', () => {
    it('should notify subscribers of state changes', async () => {
      const listener = vi.fn();
      const unsubscribe = audioManager.subscribe(listener);
      
      await audioManager.initialize();
      
      expect(listener).toHaveBeenCalled();
      
      unsubscribe();
    });

    it('should remove subscribers when unsubscribed', async () => {
      const listener = vi.fn();
      const unsubscribe = audioManager.subscribe(listener);
      
      unsubscribe();
      await audioManager.initialize();
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should dispose resources properly', async () => {
      await audioManager.initialize();
      
      // Verify context was created
      expect(audioManager.getContext()).toBeTruthy();
      
      await audioManager.dispose();
      
      expect(mockAudioContext.close).toHaveBeenCalled();
      
      const state = audioManager.getState();
      expect(state.isInitialized).toBe(false);
      expect(state.context).toBe(null);
    });
  });
});