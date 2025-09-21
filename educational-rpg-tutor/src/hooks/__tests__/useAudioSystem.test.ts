import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioSystem } from '../useAudioSystem';

// Mock the audio managers
vi.mock('../utils/audioContext');
vi.mock('../utils/soundLibrary');

const mockAudioContextManager = {
  initialize: vi.fn().mockResolvedValue(true),
  getContext: vi.fn(),
  getMasterGainNode: vi.fn(),
  setMasterVolume: vi.fn(),
  subscribe: vi.fn(() => vi.fn()),
  getInstance: vi.fn()
};

const mockSoundLibraryManager = {
  initializeLibrary: vi.fn().mockResolvedValue(undefined),
  getSound: vi.fn(),
  loadSound: vi.fn().mockResolvedValue(true),
  subscribe: vi.fn(() => vi.fn()),
  getInstance: vi.fn()
};

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('useAudioSystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Setup default mocks
    mockAudioContextManager.getInstance.mockReturnValue(mockAudioContextManager);
    mockSoundLibraryManager.getInstance.mockReturnValue(mockSoundLibraryManager);
    
    // Mock the imports
    vi.doMock('../../utils/audioContext', () => ({
      default: {
        getInstance: () => mockAudioContextManager
      }
    }));
    
    vi.doMock('../../utils/soundLibrary', () => ({
      default: {
        getInstance: () => mockSoundLibraryManager
      }
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAudioSystem());
      
      expect(result.current.contextState.isInitialized).toBe(false);
      expect(result.current.isInitializing).toBe(false);
      expect(result.current.preferences.masterVolume).toBe(0.7);
      expect(result.current.preferences.isMuted).toBe(false);
    });

    it('should initialize audio system', async () => {
      const { result } = renderHook(() => useAudioSystem());
      
      await act(async () => {
        await result.current.initializeAudio();
      });
      
      expect(mockAudioContextManager.initialize).toHaveBeenCalled();
      expect(mockSoundLibraryManager.initializeLibrary).toHaveBeenCalled();
    });

    it('should load preferences from localStorage', async () => {
      const savedPreferences = {
        masterVolume: 0.5,
        isMuted: true
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedPreferences));
      
      const { result } = renderHook(() => useAudioSystem());
      
      await act(async () => {
        await result.current.initializeAudio();
      });
      
      expect(result.current.preferences.masterVolume).toBe(0.5);
      expect(result.current.preferences.isMuted).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      mockAudioContextManager.initialize.mockRejectedValue(new Error('Init failed'));
      
      const { result } = renderHook(() => useAudioSystem());
      
      await act(async () => {
        await result.current.initializeAudio();
      });
      
      expect(result.current.isInitializing).toBe(false);
    });
  });

  describe('Sound Playback', () => {
    beforeEach(() => {
      // Mock audio context and nodes
      const mockGainNode = {
        gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        disconnect: vi.fn()
      };
      
      const mockSource = {
        buffer: null,
        loop: false,
        playbackRate: { value: 1 },
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null
      };
      
      const mockAudioContext = {
        currentTime: 0,
        createBufferSource: vi.fn(() => mockSource),
        createGain: vi.fn(() => mockGainNode)
      };
      
      const mockBuffer = { duration: 1.0 };
      
      mockAudioContextManager.getContext.mockReturnValue(mockAudioContext);
      mockAudioContextManager.getMasterGainNode.mockReturnValue(mockGainNode);
      mockSoundLibraryManager.getSound.mockReturnValue({
        id: 'test-sound',
        buffer: mockBuffer,
        category: 'ui',
        volume: 1.0,
        loop: false
      });
    });

    it('should play sound successfully', async () => {
      const { result } = renderHook(() => useAudioSystem());
      
      // Set initialized state
      act(() => {
        result.current.contextState.isInitialized = true;
      });
      
      const success = await act(async () => {
        return await result.current.playSound('test-sound');
      });
      
      expect(success).toBe(true);
      expect(mockSoundLibraryManager.getSound).toHaveBeenCalledWith('test-sound');
    });

    it('should not play sound when muted', async () => {
      const { result } = renderHook(() => useAudioSystem());
      
      act(() => {
        result.current.updatePreferences({ isMuted: true });
      });
      
      const success = await act(async () => {
        return await result.current.playSound('test-sound');
      });
      
      expect(success).toBe(false);
    });

    it('should load sound if not already loaded', async () => {
      mockSoundLibraryManager.getSound.mockReturnValue({
        id: 'test-sound',
        buffer: null, // Not loaded
        category: 'ui',
        volume: 1.0,
        loop: false
      });
      
      const { result } = renderHook(() => useAudioSystem());
      
      act(() => {
        result.current.contextState.isInitialized = true;
      });
      
      await act(async () => {
        await result.current.playSound('test-sound');
      });
      
      expect(mockSoundLibraryManager.loadSound).toHaveBeenCalledWith('test-sound');
    });

    it('should handle non-existent sounds gracefully', async () => {
      mockSoundLibraryManager.getSound.mockReturnValue(undefined);
      
      const { result } = renderHook(() => useAudioSystem());
      
      act(() => {
        result.current.contextState.isInitialized = true;
      });
      
      const success = await act(async () => {
        return await result.current.playSound('non-existent');
      });
      
      expect(success).toBe(false);
    });
  });

  describe('Volume Control', () => {
    it('should update master volume', () => {
      const { result } = renderHook(() => useAudioSystem());
      
      act(() => {
        result.current.setMasterVolume(0.5);
      });
      
      expect(result.current.preferences.masterVolume).toBe(0.5);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should clamp volume values', () => {
      const { result } = renderHook(() => useAudioSystem());
      
      act(() => {
        result.current.setMasterVolume(-0.5);
      });
      expect(result.current.preferences.masterVolume).toBe(0);
      
      act(() => {
        result.current.setMasterVolume(1.5);
      });
      expect(result.current.preferences.masterVolume).toBe(1);
    });

    it('should toggle mute state', () => {
      const { result } = renderHook(() => useAudioSystem());
      
      expect(result.current.preferences.isMuted).toBe(false);
      
      act(() => {
        result.current.toggleMute();
      });
      
      expect(result.current.preferences.isMuted).toBe(true);
      
      act(() => {
        result.current.toggleMute();
      });
      
      expect(result.current.preferences.isMuted).toBe(false);
    });
  });

  describe('Preferences Management', () => {
    it('should update preferences and save to localStorage', () => {
      const { result } = renderHook(() => useAudioSystem());
      
      const newPreferences = {
        masterVolume: 0.8,
        enableHaptics: false
      };
      
      act(() => {
        result.current.updatePreferences(newPreferences);
      });
      
      expect(result.current.preferences.masterVolume).toBe(0.8);
      expect(result.current.preferences.enableHaptics).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'audioPreferences',
        expect.stringContaining('"masterVolume":0.8')
      );
    });

    it('should update category volumes', () => {
      const { result } = renderHook(() => useAudioSystem());
      
      act(() => {
        result.current.updatePreferences({
          categoryVolumes: {
            ...result.current.preferences.categoryVolumes,
            ui: 0.5
          }
        });
      });
      
      expect(result.current.preferences.categoryVolumes.ui).toBe(0.5);
    });
  });

  describe('State Computed Properties', () => {
    it('should compute isReady correctly', () => {
      const { result } = renderHook(() => useAudioSystem());
      
      expect(result.current.isReady).toBe(false);
      
      // Mock initialized and not loading state
      act(() => {
        result.current.contextState.isInitialized = true;
        result.current.loadingState.isLoading = false;
      });
      
      expect(result.current.isReady).toBe(true);
    });

    it('should compute isSupported from context state', () => {
      const { result } = renderHook(() => useAudioSystem());
      
      act(() => {
        result.current.contextState.isSupported = true;
      });
      
      expect(result.current.isSupported).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should stop all sounds on unmount', () => {
      const { result, unmount } = renderHook(() => useAudioSystem());
      
      const stopAllSounds = vi.spyOn(result.current, 'stopAllSounds');
      
      unmount();
      
      expect(stopAllSounds).toHaveBeenCalled();
    });
  });
});