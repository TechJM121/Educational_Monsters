import React from 'react';
import { motion } from 'framer-motion';
import { useAudioSystem } from '../../hooks/useAudioSystem';
import { SoundCategory } from '../../types/audio';

interface AudioControlsProps {
  className?: string;
  showCategoryControls?: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  className = '',
  showCategoryControls = false
}) => {
  const {
    preferences,
    isReady,
    isSupported,
    updatePreferences,
    setMasterVolume,
    toggleMute,
    playSound
  } = useAudioSystem();

  if (!isSupported) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <p className="text-yellow-800 text-sm">
          Audio is not supported in this browser.
        </p>
      </div>
    );
  }

  const handleCategoryVolumeChange = (category: SoundCategory, volume: number) => {
    updatePreferences({
      categoryVolumes: {
        ...preferences.categoryVolumes,
        [category]: volume
      }
    });
  };

  const testSound = async (category: SoundCategory) => {
    const testSounds: Record<SoundCategory, string> = {
      ui: 'ui-button-click',
      achievement: 'achievement-level-up',
      ambient: 'ambient-magical-sparkle',
      feedback: 'feedback-correct-answer',
      celebration: 'celebration-chime',
      notification: 'notification-system'
    };
    
    await playSound(testSounds[category]);
  };

  return (
    <motion.div
      className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Audio Settings</h3>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-400' : 'bg-yellow-400'}`} />
          <span className="text-sm text-white/70">
            {isReady ? 'Ready' : 'Loading...'}
          </span>
        </div>
      </div>

      {/* Master Volume Control */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-white/90">Master Volume</label>
          <button
            onClick={toggleMute}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              preferences.isMuted
                ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
            }`}
          >
            {preferences.isMuted ? 'Unmute' : 'Mute'}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={preferences.masterVolume}
            onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
            disabled={preferences.isMuted}
            className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-sm text-white/70 w-8">
            {Math.round(preferences.masterVolume * 100)}%
          </span>
        </div>
      </div>

      {/* Category Controls */}
      {showCategoryControls && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white/90 mb-3">Category Volumes</h4>
          {Object.entries(preferences.categoryVolumes).map(([category, volume]) => (
            <div key={category} className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-24">
                <span className="text-sm text-white/80 capitalize">{category}</span>
                <button
                  onClick={() => testSound(category as SoundCategory)}
                  disabled={!isReady || preferences.isMuted}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs text-white/70 transition-colors"
                  title="Test sound"
                >
                  ♪
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleCategoryVolumeChange(category as SoundCategory, parseFloat(e.target.value))}
                disabled={preferences.isMuted}
                className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-white/70 w-8">
                {Math.round(volume * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Audio Quality Setting */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <label className="block text-sm font-medium text-white/90 mb-2">
          Audio Quality
        </label>
        <select
          value={preferences.audioQuality}
          onChange={(e) => updatePreferences({ audioQuality: e.target.value as 'low' | 'medium' | 'high' })}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="low">Low (Better Performance)</option>
          <option value="medium">Medium (Balanced)</option>
          <option value="high">High (Best Quality)</option>
        </select>
      </div>

      {/* Haptic Feedback Toggle */}
      <div className="mt-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={preferences.enableHaptics}
            onChange={(e) => updatePreferences({ enableHaptics: e.target.checked })}
            className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500/50"
          />
          <span className="text-sm text-white/90">Enable Haptic Feedback</span>
        </label>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider:disabled::-webkit-slider-thumb {
          background: #6b7280;
          cursor: not-allowed;
        }
        
        .slider:disabled::-moz-range-thumb {
          background: #6b7280;
          cursor: not-allowed;
        }
      `}</style>
    </motion.div>
  );
};