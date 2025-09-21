import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HapticButton } from './HapticButton';
import { HapticControls } from './HapticControls';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useContextualSounds } from '../../hooks/useContextualSounds';
import { AchievementNotification, Achievement } from './AchievementNotification';

export const HapticFeedbackDemo: React.FC = () => {
  const {
    capabilities,
    preferences,
    isSupported,
    uiHaptics,
    achievementHaptics,
    feedbackHaptics,
    notificationHaptics,
    errorHaptics,
    successHaptics,
    triggerCustomHaptic
  } = useHapticFeedback();

  const { playAchievementCelebration } = useContextualSounds();
  
  const [selectedTab, setSelectedTab] = useState('buttons');
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [customPattern, setCustomPattern] = useState('100,50,100,50,200');

  const sampleAchievements: Achievement[] = [
    {
      id: '1',
      title: 'Haptic Master!',
      description: 'You discovered haptic feedback',
      type: 'levelUp',
      rarity: 'common',
      xpReward: 50
    },
    {
      id: '2',
      title: 'Vibration Virtuoso',
      description: 'Mastered all haptic patterns',
      type: 'skillUnlock',
      rarity: 'epic',
      xpReward: 500
    }
  ];

  const showAchievement = async (achievement: Achievement) => {
    setCurrentAchievement(achievement);
    
    // Trigger haptic feedback for achievement
    if (achievement.rarity === 'epic' || achievement.rarity === 'legendary') {
      await achievementHaptics.majorAchievement();
    } else {
      await achievementHaptics.levelUp();
    }
    
    // Also play sound celebration
    playAchievementCelebration(achievement.type === 'levelUp' ? 'levelUp' : 'majorAchievement');
  };

  const parseCustomPattern = (patternStr: string): number[] => {
    try {
      return patternStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    } catch {
      return [100];
    }
  };

  const triggerCustomPattern = () => {
    const pattern = parseCustomPattern(customPattern);
    triggerCustomHaptic(pattern);
  };

  const tabs = [
    { id: 'buttons', label: 'Interactive Buttons', icon: '🔘' },
    { id: 'patterns', label: 'Haptic Patterns', icon: '📳' },
    { id: 'achievements', label: 'Achievement Haptics', icon: '🏆' },
    { id: 'feedback', label: 'Learning Feedback', icon: '✅' },
    { id: 'custom', label: 'Custom Patterns', icon: '⚙️' }
  ];

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId);
    uiHaptics.buttonTap();
  };

  if (!isSupported) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">Haptic Feedback Not Supported</h2>
          <p className="text-yellow-600">
            Your device doesn't support haptic feedback. This feature works best on mobile devices with vibration capabilities.
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
          Haptic Feedback Demo
        </h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Experience tactile feedback with vibration patterns synchronized to audio and visual effects. 
          Perfect for mobile devices and supported desktop browsers.
        </p>
      </motion.div>

      {/* Device Status */}
      <motion.div
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              capabilities.hasVibrationAPI ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <h3 className="font-semibold text-white">Vibration API</h3>
            <p className="text-sm text-white/70">
              {capabilities.hasVibrationAPI ? 'Supported' : 'Not Available'}
            </p>
          </div>
          
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              capabilities.hasGamepadHaptics ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <h3 className="font-semibold text-white">Gamepad Haptics</h3>
            <p className="text-sm text-white/70">
              {capabilities.hasGamepadHaptics ? 'Available' : 'Not Detected'}
            </p>
          </div>
          
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              preferences.enabled ? 'bg-green-400' : 'bg-gray-400'
            }`} />
            <h3 className="font-semibold text-white">User Preference</h3>
            <p className="text-sm text-white/70">
              {preferences.enabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Haptic Controls */}
      <HapticControls showCategoryControls={true} />

      {/* Tab Navigation */}
      <motion.div
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${selectedTab === tab.id
                  ? 'bg-blue-500/30 text-blue-200 border border-blue-400/50'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content Sections */}
      <motion.div
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Interactive Buttons */}
        {selectedTab === 'buttons' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Interactive Buttons with Haptics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <HapticButton variant="primary">
                Primary Button
              </HapticButton>
              
              <HapticButton variant="secondary">
                Secondary Button
              </HapticButton>
              
              <HapticButton variant="success">
                Success Button
              </HapticButton>
              
              <HapticButton variant="warning">
                Warning Button
              </HapticButton>
              
              <HapticButton variant="danger">
                Danger Button
              </HapticButton>
              
              <HapticButton 
                variant="primary" 
                size="lg"
                customClickHaptic="achievement-level-up"
                customClickSound="achievement-level-up"
              >
                Custom Haptic
              </HapticButton>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Haptic Intensity Comparison</h3>
              <div className="flex flex-wrap gap-3">
                <HapticButton 
                  variant="primary"
                  hapticOptions={{ intensity: 'light' }}
                >
                  Light Haptic
                </HapticButton>
                <HapticButton 
                  variant="primary"
                  hapticOptions={{ intensity: 'medium' }}
                >
                  Medium Haptic
                </HapticButton>
                <HapticButton 
                  variant="primary"
                  hapticOptions={{ intensity: 'heavy' }}
                >
                  Heavy Haptic
                </HapticButton>
              </div>
            </div>
          </div>
        )}

        {/* Haptic Patterns */}
        {selectedTab === 'patterns' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Haptic Pattern Library</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">UI Interactions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => uiHaptics.buttonTap()}
                    className="w-full p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-200 hover:bg-blue-500/30 transition-colors text-left"
                  >
                    <div className="font-medium">Button Tap</div>
                    <div className="text-sm opacity-70">Quick tap feedback (50ms)</div>
                  </button>
                  
                  <button
                    onClick={() => uiHaptics.buttonPress()}
                    className="w-full p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-200 hover:bg-blue-500/30 transition-colors text-left"
                  >
                    <div className="font-medium">Button Press</div>
                    <div className="text-sm opacity-70">Firm press feedback (100ms)</div>
                  </button>
                  
                  <button
                    onClick={() => uiHaptics.swipe()}
                    className="w-full p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-200 hover:bg-blue-500/30 transition-colors text-left"
                  >
                    <div className="font-medium">Swipe Gesture</div>
                    <div className="text-sm opacity-70">Swipe pattern (40-20-40ms)</div>
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => notificationHaptics.message()}
                    className="w-full p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 hover:bg-green-500/30 transition-colors text-left"
                  >
                    <div className="font-medium">Message</div>
                    <div className="text-sm opacity-70">Triple pulse pattern</div>
                  </button>
                  
                  <button
                    onClick={() => notificationHaptics.reminder()}
                    className="w-full p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-200 hover:bg-yellow-500/30 transition-colors text-left"
                  >
                    <div className="font-medium">Reminder</div>
                    <div className="text-sm opacity-70">Strong reminder pattern</div>
                  </button>
                  
                  <button
                    onClick={() => notificationHaptics.alert()}
                    className="w-full p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 hover:bg-red-500/30 transition-colors text-left"
                  >
                    <div className="font-medium">Alert</div>
                    <div className="text-sm opacity-70">Urgent alert pattern</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievement Haptics */}
        {selectedTab === 'achievements' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Achievement Haptic Celebrations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sampleAchievements.map((achievement) => (
                <motion.button
                  key={achievement.id}
                  onClick={() => showAchievement(achievement)}
                  className="p-6 bg-white/5 border border-white/20 rounded-lg text-left hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 className="font-semibold text-white mb-2">{achievement.title}</h3>
                  <p className="text-white/70 text-sm mb-3">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`
                      inline-block px-3 py-1 text-xs font-medium rounded-full
                      ${achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-gray-500/20 text-gray-300'
                      }
                    `}>
                      {achievement.rarity}
                    </span>
                    <span className="text-yellow-300 text-sm">+{achievement.xpReward} XP</span>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Achievement Haptic Types</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => achievementHaptics.levelUp()}
                  className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-200 hover:bg-yellow-500/30 transition-colors"
                >
                  Level Up
                </button>
                <button
                  onClick={() => achievementHaptics.questComplete()}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 hover:bg-green-500/30 transition-colors"
                >
                  Quest Complete
                </button>
                <button
                  onClick={() => achievementHaptics.majorAchievement()}
                  className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-200 hover:bg-purple-500/30 transition-colors"
                >
                  Major Achievement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Learning Feedback */}
        {selectedTab === 'feedback' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Learning Feedback Haptics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-green-200 mb-4">Positive Feedback</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => feedbackHaptics.correct()}
                    className="w-full px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 hover:bg-green-500/30 transition-colors"
                  >
                    Correct Answer
                  </button>
                  <button
                    onClick={() => successHaptics.complete()}
                    className="w-full px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 hover:bg-green-500/30 transition-colors"
                  >
                    Task Complete
                  </button>
                  <button
                    onClick={() => successHaptics.celebration()}
                    className="w-full px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 hover:bg-green-500/30 transition-colors"
                  >
                    Celebration
                  </button>
                </div>
              </div>
              
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-red-200 mb-4">Error Feedback</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => feedbackHaptics.incorrect()}
                    className="w-full px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 hover:bg-red-500/30 transition-colors"
                  >
                    Incorrect Answer
                  </button>
                  <button
                    onClick={() => errorHaptics.validation()}
                    className="w-full px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 hover:bg-red-500/30 transition-colors"
                  >
                    Validation Error
                  </button>
                  <button
                    onClick={() => errorHaptics.system()}
                    className="w-full px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 hover:bg-red-500/30 transition-colors"
                  >
                    System Error
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Patterns */}
        {selectedTab === 'custom' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Custom Haptic Patterns</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Custom Pattern (comma-separated milliseconds)
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={customPattern}
                    onChange={(e) => setCustomPattern(e.target.value)}
                    placeholder="100,50,100,50,200"
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <button
                    onClick={triggerCustomPattern}
                    className="px-6 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-200 hover:bg-blue-500/30 transition-colors"
                  >
                    Test Pattern
                  </button>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Example: "100,50,100" creates a pattern with 100ms vibration, 50ms pause, 100ms vibration
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Preset Patterns</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setCustomPattern('50')}
                      className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white/80 text-sm transition-colors text-left"
                    >
                      Quick Tap: 50
                    </button>
                    <button
                      onClick={() => setCustomPattern('100,50,100')}
                      className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white/80 text-sm transition-colors text-left"
                    >
                      Double Tap: 100,50,100
                    </button>
                    <button
                      onClick={() => setCustomPattern('200,100,200,100,300')}
                      className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white/80 text-sm transition-colors text-left"
                    >
                      Celebration: 200,100,200,100,300
                    </button>
                    <button
                      onClick={() => setCustomPattern('50,25,50,25,50,25,50')}
                      className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white/80 text-sm transition-colors text-left"
                    >
                      Rapid Fire: 50,25,50,25,50,25,50
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Pattern Preview</h4>
                  <div className="space-y-2">
                    <div className="text-sm text-white/70">
                      Pattern: {customPattern}
                    </div>
                    <div className="text-sm text-white/70">
                      Duration: {parseCustomPattern(customPattern).reduce((sum, duration) => sum + duration, 0)}ms
                    </div>
                    <div className="text-sm text-white/70">
                      Pulses: {parseCustomPattern(customPattern).length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Achievement Notification */}
      <AchievementNotification
        achievement={currentAchievement}
        onComplete={() => setCurrentAchievement(null)}
        enableSound={true}
        enableCelebration={true}
      />
    </div>
  );
};