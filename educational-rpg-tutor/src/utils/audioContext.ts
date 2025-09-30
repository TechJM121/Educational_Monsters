import type { AudioContextState } from '../types/audio';

class AudioContextManager {
  private static instance: AudioContextManager;
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private masterGainNode: GainNode | null = null;
  private listeners: Set<(state: AudioContextState) => void> = new Set();

  private constructor() {}

  static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  /**
   * Initialize the audio context (requires user interaction)
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized && this.audioContext?.state === 'running') {
        return true;
      }

      // Check for Web Audio API support
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        console.warn('Web Audio API not supported');
        this.notifyListeners();
        return false;
      }

      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      // Create master gain node for volume control
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.connect(this.audioContext.destination);

      // Resume context if suspended (required by browser autoplay policies)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isInitialized = true;
      this.notifyListeners();
      
      console.log('Audio context initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      this.notifyListeners();
      return false;
    }
  }

  /**
   * Get the current audio context
   */
  getContext(): AudioContext | null {
    return this.audioContext;
  }

  /**
   * Get the master gain node for volume control
   */
  getMasterGainNode(): GainNode | null {
    return this.masterGainNode;
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  setMasterVolume(volume: number): void {
    if (this.masterGainNode) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.masterGainNode.gain.setValueAtTime(clampedVolume, this.audioContext!.currentTime);
    }
  }

  /**
   * Get current state
   */
  getState(): AudioContextState {
    return {
      context: this.audioContext,
      isInitialized: this.isInitialized,
      isSupported: this.isSupported(),
      masterVolume: this.masterGainNode?.gain.value || 1,
      isMuted: this.masterGainNode?.gain.value === 0 || false
    };
  }

  /**
   * Check if Web Audio API is supported
   */
  isSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: AudioContextState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
      this.masterGainNode = null;
      this.isInitialized = false;
      this.notifyListeners();
    }
  }
}

export default AudioContextManager;