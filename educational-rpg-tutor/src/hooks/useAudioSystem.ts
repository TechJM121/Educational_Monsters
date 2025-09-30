import { useState, useEffect, useCallback, useRef } from 'react';
import type { AudioContextState, AudioPreferences, PlaySoundOptions, AudioLoadingState } from '../types/audio';
import AudioContextManager from '../utils/audioContext';
import SoundLibraryManager from '../utils/soundLibrary';

const DEFAULT_PREFERENCES: AudioPreferences = {
  masterVolume: 0.7,
  categoryVolumes: {
    ui: 0.8,
    achievement: 1.0,
    ambient: 0.4,
    feedback: 0.9,
    celebration: 1.0,
    notification: 0.8
  },
  isMuted: false,
  enableHaptics: true,
  audioQuality: 'medium'
};

export const useAudioSystem = () => {
  const [contextState, setContextState] = useState<AudioContextState>({
    context: null,
    isInitialized: false,
    isSupported: false,
    masterVolume: 1,
    isMuted: false
  });
  
  const [loadingState, setLoadingState] = useState<AudioLoadingState>({
    isLoading: false,
    loadedCount: 0,
    totalCount: 0,
    failedSounds: []
  });
  
  const [preferences, setPreferences] = useState<AudioPreferences>(DEFAULT_PREFERENCES);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const audioContextManager = useRef(AudioContextManager.getInstance());
  const soundLibraryManager = useRef(SoundLibraryManager.getInstance());
  const activeSources = useRef<Set<AudioBufferSourceNode>>(new Set());

  /**
   * Initialize the audio system
   */
  const initializeAudio = useCallback(async () => {
    if (isInitializing || contextState.isInitialized) return;
    
    setIsInitializing(true);
    
    try {
      // Initialize audio context
      const success = await audioContextManager.current.initialize();
      if (!success) {
        console.warn('Failed to initialize audio context');
        return;
      }

      // Initialize sound library
      await soundLibraryManager.current.initializeLibrary();
      
      // Load preferences from localStorage
      const savedPreferences = localStorage.getItem('audioPreferences');
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
      
    } catch (error) {
      console.error('Failed to initialize audio system:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, contextState.isInitialized]);

  /**
   * Play a sound by ID
   */
  const playSound = useCallback(async (
    soundId: string, 
    options: PlaySoundOptions = {}
  ): Promise<boolean> => {
    if (!contextState.isInitialized || preferences.isMuted) {
      return false;
    }

    const sound = soundLibraryManager.current.getSound(soundId);
    if (!sound) {
      console.warn(`Sound not found: ${soundId}`);
      return false;
    }

    // Load sound if not already loaded
    if (!sound.buffer) {
      const loaded = await soundLibraryManager.current.loadSound(soundId);
      if (!loaded) return false;
    }

    const audioContext = audioContextManager.current.getContext();
    const masterGainNode = audioContextManager.current.getMasterGainNode();
    
    if (!audioContext || !masterGainNode || !sound.buffer) {
      return false;
    }

    try {
      // Create audio nodes
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      // Configure source
      source.buffer = sound.buffer;
      source.loop = options.loop ?? sound.loop;
      source.playbackRate.value = options.playbackRate ?? 1;
      
      // Calculate volume
      const categoryVolume = preferences.categoryVolumes[sound.category];
      const soundVolume = options.volume ?? sound.volume;
      const finalVolume = preferences.masterVolume * categoryVolume * soundVolume;
      
      // Configure gain
      gainNode.gain.value = finalVolume;
      
      // Handle fade in
      if (options.fadeIn && options.fadeIn > 0) {
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(finalVolume, audioContext.currentTime + options.fadeIn);
      }
      
      // Handle fade out
      if (options.fadeOut && options.fadeOut > 0 && !source.loop) {
        const fadeStartTime = audioContext.currentTime + (sound.buffer.duration - options.fadeOut);
        gainNode.gain.setValueAtTime(finalVolume, fadeStartTime);
        gainNode.gain.linearRampToValueAtTime(0, fadeStartTime + options.fadeOut);
      }
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(masterGainNode);
      
      // Track active source
      activeSources.current.add(source);
      
      // Cleanup when sound ends
      source.onended = () => {
        activeSources.current.delete(source);
        source.disconnect();
        gainNode.disconnect();
      };
      
      // Start playback
      const startTime = audioContext.currentTime + (options.delay ?? 0);
      source.start(startTime);
      
      return true;
    } catch (error) {
      console.error(`Failed to play sound ${soundId}:`, error);
      return false;
    }
  }, [contextState.isInitialized, preferences]);

  /**
   * Stop all currently playing sounds
   */
  const stopAllSounds = useCallback(() => {
    activeSources.current.forEach(source => {
      try {
        source.stop();
      } catch (error) {
        // Source might already be stopped
      }
    });
    activeSources.current.clear();
  }, []);

  /**
   * Update audio preferences
   */
  const updatePreferences = useCallback((newPreferences: Partial<AudioPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    
    // Update master volume
    if (newPreferences.masterVolume !== undefined || newPreferences.isMuted !== undefined) {
      const volume = updated.isMuted ? 0 : updated.masterVolume;
      audioContextManager.current.setMasterVolume(volume);
    }
    
    // Save to localStorage
    localStorage.setItem('audioPreferences', JSON.stringify(updated));
  }, [preferences]);

  /**
   * Quick volume controls
   */
  const setMasterVolume = useCallback((volume: number) => {
    updatePreferences({ masterVolume: Math.max(0, Math.min(1, volume)) });
  }, [updatePreferences]);

  const toggleMute = useCallback(() => {
    updatePreferences({ isMuted: !preferences.isMuted });
  }, [preferences.isMuted, updatePreferences]);

  // Set up listeners
  useEffect(() => {
    const unsubscribeContext = audioContextManager.current.subscribe(setContextState);
    const unsubscribeLoading = soundLibraryManager.current.subscribe(setLoadingState);
    
    return () => {
      unsubscribeContext();
      unsubscribeLoading();
    };
  }, []);

  // Apply preferences when context is ready
  useEffect(() => {
    if (contextState.isInitialized) {
      const volume = preferences.isMuted ? 0 : preferences.masterVolume;
      audioContextManager.current.setMasterVolume(volume);
    }
  }, [contextState.isInitialized, preferences.masterVolume, preferences.isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllSounds();
    };
  }, [stopAllSounds]);

  return {
    // State
    contextState,
    loadingState,
    preferences,
    isInitializing,
    
    // Actions
    initializeAudio,
    playSound,
    stopAllSounds,
    updatePreferences,
    setMasterVolume,
    toggleMute,
    
    // Computed
    isReady: contextState.isInitialized && !loadingState.isLoading,
    isSupported: contextState.isSupported
  };
};