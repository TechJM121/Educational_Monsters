import React from 'react';
import { motion } from 'framer-motion';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { HapticCategory } from '../../types/haptics';

interface HapticControlsProps {
  className?: string;
  showCategoryControls?: boolean;
}

export const HapticControls: React.FC<HapticControlsProps> = ({
  className = '',
  showCategoryControls = false
}) => {
  const {
    capabilities,
    preferences,
    isSupported,
    isActive,
    toggleHaptics,
    setIntensity,
    toggleCategoryHaptics,
    testHaptic,
    uiHaptics,
    achievementHaptics,
    feedbackHaptics,
    notificationHaptics,
    errorHaptics,
    successHaptics
  } = useHapticFeedback();

  if (!isSupported) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <p className="text-yellow-800 text-sm">
          Haptic feedback is not supported on this device.
        </p>
      </div>
    );
  }

  const handleCategoryToggle = (category: HapticCategory) => {
    toggleCategoryHaptics(category);
    
    // Provide haptic feedback for the toggle action
    if (preferences.enabled && preferences.categorySettings[category]) {
      uiHaptics.buttonTap();
    }
  };

  const testCategoryHaptic = async (category: HapticCategory) => {
    const testHaptics: Record<HapticCategory, () => Promise<boolean>> = {
      ui: () => uiHaptics.buttonTap(),
      achievement: () => achievementHaptics.levelUp(),
      feedback: () => feedbackHaptics.correct(),
      notification: () => notificationHaptics.message(),
      error: () => errorHaptics.validation(),
      success: () => successHaptics.complete()
    };
    
    await testHaptics[category]();
  };

  const categoryInfo = {
    ui: { name: 'UI Interactions', icon: '👆', description: 'Button taps, hovers, swipes' },
    achievement: { name: 'Achievements', icon: '🏆', description: 'Level ups, quest completions' },
    feedback: { name: 'Learning Feedback', icon: '✅', description: 'Correct/incorrect answers' },
    notification: { name: 'Notifications', icon: '🔔', description: 'Messages, reminders, alerts' },
    error: { name: 'Errors', icon: '⚠️', description: 'Validation, network, system errors' },
    success: { name: 'Success', icon: '🎉', description: 'Saves, submissions, completions' }
  };

  return (
    <motion.div
      className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Haptic Feedback Settings</h3>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-400' : 'bg-green-400'}`} />
          <span className="text-sm text-white/70">
            {isActive ? 'Active' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Device Capabilities */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <h4 className="text-sm font-medium text-white/90 mb-2">Device Capabilities</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${capabilities.hasVibrationAPI ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-white/70">Vibration API</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${capabilities.hasGamepadHaptics ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-white/70">Gamepad Haptics</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-white/50">
          Max Duration: {capabilities.maxDuration}ms
        </div>
      </div>

      {/* Master Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-white/90">Enable Haptic Feedback</label>
          <button
            onClick={toggleHaptics}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.enabled
                ? 'bg-blue-500'
                : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Intensity Control */}
      {preferences.enabled && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/90 mb-3">
            Haptic Intensity
          </label>
          <div className="flex gap-2">
            {(['light', 'medium', 'heavy'] as const).map((intensity) => (
              <button
                key={intensity}
                onClick={() => setIntensity(intensity)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  preferences.intensity === intensity
                    ? 'bg-blue-500/30 text-blue-200 border border-blue-400/50'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
                }`}
              >
                {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Test Button */}
      <div className="mb-6">
        <button
          onClick={testHaptic}
          disabled={!preferences.enabled}
          className="w-full px-4 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-200 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Test Haptic Feedback
        </button>
      </div>

      {/* Category Controls */}
      {showCategoryControls && preferences.enabled && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white/90 mb-3">Category Settings</h4>
          {Object.entries(categoryInfo).map(([category, info]) => (
            <div key={category} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg">{info.icon}</span>
                <div>
                  <h5 className="text-sm font-medium text-white">{info.name}</h5>
                  <p className="text-xs text-white/60">{info.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => testCategoryHaptic(category as HapticCategory)}
                  disabled={!preferences.categorySettings[category as HapticCategory]}
                  className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-white/20 text-white/70 transition-colors"
                  title="Test haptic"
                >
                  Test
                </button>
                
                <button
                  onClick={() => handleCategoryToggle(category as HapticCategory)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    preferences.categorySettings[category as HapticCategory]
                      ? 'bg-blue-500'
                      : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      preferences.categorySettings[category as HapticCategory] ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage Tips */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-200 mb-2">💡 Tips</h4>
        <ul className="text-xs text-blue-200/70 space-y-1">
          <li>• Haptic feedback works best on mobile devices</li>
          <li>• Some browsers may require user interaction to enable haptics</li>
          <li>• Adjust intensity based on your device and preferences</li>
          <li>• Disable categories you don't need to save battery</li>
        </ul>
      </div>
    </motion.div>
  );
};