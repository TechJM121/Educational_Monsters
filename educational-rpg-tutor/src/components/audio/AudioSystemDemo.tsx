import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAudioSystem } from '../../hooks/useAudioSystem';
import { AudioControls } from './AudioControls';
import { SoundCategory } from '../../types/audio';

export const AudioSystemDemo: React.FC = () => {
  const {
    contextState,
    loadingState,
    preferences,
    isReady,
    isSupported,
    isInitializing,
    initializeAudio,
    playSound,
    stopAllSounds
  } = useAudioSystem();

  const [lastPlayedSound, setLastPlayedSound] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Auto-initialize on mount (in a real app, this would be triggered by user interaction)
    const timer = setTimeout(() => {
      initializeAudio();
    }, 1000);

    return () => clearTimeout(timer);
  }, [initializeAudio]);

  const handlePlaySound = async (soundId: string, category: SoundCategory) => {
    setIsPlaying(true);
    setLastPlayedSound(soundId);
    
    const success = await playSound(soundId);
    
    if (success) {
      // Visual feedback duration based on category
      const duration = category === 'ui' ? 200 : category === 'achievement' ? 1000 : 500;
      setTimeout(() => setIsPlaying(false), duration);
    } else {
      setIsPlaying(false);
    }
  };

  const soundCategories: Array<{
    category: SoundCategory;
    title: string;
    description: string;
    sounds: Array<{ id: string; name: string; description: string }>;
    color: string;
  }> = [
    {
      category: 'ui',
      title: 'UI Sounds',
      description: 'Interactive interface feedback',
      color: 'bg-blue-500/20 border-blue-500/30',
      sounds: [
        { id: 'ui-button-click', name: 'Button Click', description: 'Standard button press' },
        { id: 'ui-button-hover', name: 'Button Hover', description: 'Hover state feedback' },
        { id: 'ui-modal-open', name: 'Modal Open', description: 'Dialog appearance' },
        { id: 'ui-modal-close', name: 'Modal Close', description: 'Dialog dismissal' }
      ]
    },
    {
      category: 'achievement',
      title: 'Achievements',
      description: 'Celebration and progress sounds',
      color: 'bg-yellow-500/20 border-yellow-500/30',
      sounds: [
        { id: 'achievement-level-up', name: 'Level Up', description: 'Character progression' },
        { id: 'achievement-quest-complete', name: 'Quest Complete', description: 'Mission accomplished' },
        { id: 'achievement-skill-unlock', name: 'Skill Unlock', description: 'New ability gained' },
        { id: 'achievement-badge-earned', name: 'Badge Earned', description: 'Achievement unlocked' }
      ]
    },
    {
      category: 'feedback',
      title: 'Learning Feedback',
      description: 'Educational interaction responses',
      color: 'bg-green-500/20 border-green-500/30',
      sounds: [
        { id: 'feedback-correct-answer', name: 'Correct Answer', description: 'Success confirmation' },
        { id: 'feedback-wrong-answer', name: 'Wrong Answer', description: 'Gentle correction' },
        { id: 'feedback-hint-reveal', name: 'Hint Reveal', description: 'Help provided' },
        { id: 'feedback-progress-save', name: 'Progress Save', description: 'Data saved' }
      ]
    },
    {
      category: 'ambient',
      title: 'Ambient Sounds',
      description: 'Background atmosphere (looping)',
      color: 'bg-purple-500/20 border-purple-500/30',
      sounds: [
        { id: 'ambient-magical-sparkle', name: 'Magical Sparkle', description: 'Fantasy atmosphere' },
        { id: 'ambient-tech-hum', name: 'Tech Hum', description: 'Futuristic ambience' },
        { id: 'ambient-nature-wind', name: 'Nature Wind', description: 'Natural environment' },
        { id: 'ambient-cosmic-resonance', name: 'Cosmic Resonance', description: 'Space theme' }
      ]
    }
  ];

  if (!isSupported) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Audio Not Supported</h2>
          <p className="text-red-600">
            Your browser doesn't support the Web Audio API. Please use a modern browser to experience audio features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-4">
          Web Audio API Integration Demo
        </h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Experience the RPG-themed sound system with contextual audio feedback, 
          volume controls, and performance optimization.
        </p>
      </motion.div>

      {/* Status Panel */}
      <motion.div
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              contextState.isInitialized ? 'bg-green-400' : 'bg-yellow-400'
            }`} />
            <h3 className="font-semibold text-white">Audio Context</h3>
            <p className="text-sm text-white/70">
              {contextState.isInitialized ? 'Ready' : isInitializing ? 'Initializing...' : 'Not Ready'}
            </p>
          </div>
          
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              loadingState.isLoading ? 'bg-yellow-400' : 'bg-green-400'
            }`} />
            <h3 className="font-semibold text-white">Sound Library</h3>
            <p className="text-sm text-white/70">
              {loadingState.isLoading 
                ? `Loading ${loadingState.loadedCount}/${loadingState.totalCount}` 
                : `${loadingState.loadedCount} sounds loaded`
              }
            </p>
          </div>
          
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              preferences.isMuted ? 'bg-red-400' : 'bg-green-400'
            }`} />
            <h3 className="font-semibold text-white">Audio State</h3>
            <p className="text-sm text-white/70">
              {preferences.isMuted ? 'Muted' : `Volume ${Math.round(preferences.masterVolume * 100)}%`}
            </p>
          </div>
        </div>

        {lastPlayedSound && (
          <motion.div
            className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <p className="text-blue-200 text-sm">
              Last played: <span className="font-semibold">{lastPlayedSound}</span>
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Audio Controls */}
      <AudioControls showCategoryControls={true} />

      {/* Sound Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {soundCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.category}
            className={`border rounded-xl p-6 ${category.color}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + categoryIndex * 0.1 }}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-1">
                {category.title}
              </h3>
              <p className="text-sm text-white/70">
                {category.description}
              </p>
            </div>

            <div className="space-y-3">
              {category.sounds.map((sound, soundIndex) => (
                <motion.button
                  key={sound.id}
                  onClick={() => handlePlaySound(sound.id, category.category)}
                  disabled={!isReady || isPlaying}
                  className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                    lastPlayedSound === sound.id && isPlaying
                      ? 'bg-white/20 border-white/40 scale-105'
                      : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  whileHover={{ scale: isReady && !isPlaying ? 1.02 : 1 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + soundIndex * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white text-sm">
                        {sound.name}
                      </h4>
                      <p className="text-xs text-white/60">
                        {sound.description}
                      </p>
                    </div>
                    <div className="text-white/40">
                      {lastPlayedSound === sound.id && isPlaying ? '♪' : '▶'}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Global Controls */}
      <motion.div
        className="flex justify-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <button
          onClick={initializeAudio}
          disabled={contextState.isInitialized || isInitializing}
          className="px-6 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-200 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isInitializing ? 'Initializing...' : contextState.isInitialized ? 'Audio Ready' : 'Initialize Audio'}
        </button>
        
        <button
          onClick={stopAllSounds}
          disabled={!isReady}
          className="px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Stop All Sounds
        </button>
      </motion.div>

      {/* Performance Info */}
      {loadingState.failedSounds.length > 0 && (
        <motion.div
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h4 className="font-semibold text-yellow-200 mb-2">Loading Issues</h4>
          <p className="text-sm text-yellow-200/70">
            Some sounds failed to load: {loadingState.failedSounds.join(', ')}
          </p>
          <p className="text-xs text-yellow-200/50 mt-1">
            This is expected in the demo as we're using synthetic sounds.
          </p>
        </motion.div>
      )}
    </div>
  );
};