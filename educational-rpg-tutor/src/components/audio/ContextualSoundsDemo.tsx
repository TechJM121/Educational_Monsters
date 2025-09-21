import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SoundButton } from './SoundButton';
import { SoundInput } from './SoundInput';
import { SoundModal } from './SoundModal';
import { AchievementNotification, Achievement } from './AchievementNotification';
import { useContextualSounds } from '../../hooks/useContextualSounds';

export const ContextualSoundsDemo: React.FC = () => {
  const {
    buttonSounds,
    achievementSounds,
    feedbackSounds,
    navigationSounds,
    formSounds,
    notificationSounds,
    celebrationSounds,
    playAchievementCelebration,
    isReady
  } = useContextualSounds();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [inputSuccess, setInputSuccess] = useState('');
  const [selectedTab, setSelectedTab] = useState('buttons');

  const sampleAchievements: Achievement[] = [
    {
      id: '1',
      title: 'Level Up!',
      description: 'You reached level 5 in Mathematics',
      type: 'levelUp',
      rarity: 'common',
      xpReward: 100
    },
    {
      id: '2',
      title: 'Quest Master',
      description: 'Completed your first learning quest',
      type: 'questComplete',
      rarity: 'rare',
      xpReward: 250
    },
    {
      id: '3',
      title: 'Legendary Scholar',
      description: 'Mastered advanced calculus concepts',
      type: 'skillUnlock',
      rarity: 'legendary',
      xpReward: 1000
    }
  ];

  const handleInputValidation = (value: string) => {
    setInputValue(value);
    setInputError('');
    setInputSuccess('');
    
    if (value.length < 3 && value.length > 0) {
      setInputError('Must be at least 3 characters');
    } else if (value.length >= 3) {
      setInputSuccess('Looks good!');
    }
  };

  const showAchievement = (achievement: Achievement) => {
    setCurrentAchievement(achievement);
  };

  const tabs = [
    { id: 'buttons', label: 'Button Sounds', icon: '🔘' },
    { id: 'forms', label: 'Form Interactions', icon: '📝' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'feedback', label: 'Learning Feedback', icon: '✅' },
    { id: 'navigation', label: 'Navigation', icon: '🧭' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId);
    navigationSounds.tabSwitch();
  };

  if (!isReady) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">Audio System Loading</h2>
          <p className="text-yellow-600">
            Please wait while the audio system initializes...
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
          Contextual Sound Effects Demo
        </h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Experience interactive sound design with contextual audio feedback, 
          synchronized animations, and RPG-themed sound effects.
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
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
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Button Sounds */}
        {selectedTab === 'buttons' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Button Sound Effects</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SoundButton variant="primary" onClick={() => {}}>
                Primary Button
              </SoundButton>
              
              <SoundButton variant="secondary" onClick={() => {}}>
                Secondary Button
              </SoundButton>
              
              <SoundButton variant="success" onClick={() => {}}>
                Success Button
              </SoundButton>
              
              <SoundButton variant="warning" onClick={() => {}}>
                Warning Button
              </SoundButton>
              
              <SoundButton variant="danger" onClick={() => {}}>
                Danger Button
              </SoundButton>
              
              <SoundButton 
                variant="primary" 
                size="lg"
                customClickSound="achievement-level-up"
                onClick={() => {}}
              >
                Custom Sound
              </SoundButton>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Manual Sound Triggers</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => buttonSounds.click()}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-200 hover:bg-blue-500/30 transition-colors"
                >
                  Click Sound
                </button>
                <button
                  onClick={() => buttonSounds.hover()}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 hover:bg-green-500/30 transition-colors"
                >
                  Hover Sound
                </button>
                <button
                  onClick={() => buttonSounds.focus()}
                  className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-200 hover:bg-purple-500/30 transition-colors"
                >
                  Focus Sound
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Interactions */}
        {selectedTab === 'forms' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Form Sound Effects</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SoundInput
                label="Username"
                placeholder="Enter your username"
                value={inputValue}
                onChange={(e) => handleInputValidation(e.target.value)}
                error={inputError}
                success={inputSuccess}
              />
              
              <SoundInput
                label="Email"
                type="email"
                placeholder="Enter your email"
                variant="glass"
              />
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Manual Form Sounds</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => formSounds.inputFocus()}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-200 hover:bg-blue-500/30 transition-colors"
                >
                  Input Focus
                </button>
                <button
                  onClick={() => formSounds.inputError()}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 hover:bg-red-500/30 transition-colors"
                >
                  Input Error
                </button>
                <button
                  onClick={() => formSounds.inputSuccess()}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 hover:bg-green-500/30 transition-colors"
                >
                  Input Success
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        {selectedTab === 'achievements' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Achievement Sounds</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleAchievements.map((achievement) => (
                <motion.button
                  key={achievement.id}
                  onClick={() => showAchievement(achievement)}
                  className="p-4 bg-white/5 border border-white/20 rounded-lg text-left hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 className="font-semibold text-white mb-2">{achievement.title}</h3>
                  <p className="text-white/70 text-sm mb-2">{achievement.description}</p>
                  <span className={`
                    inline-block px-2 py-1 text-xs font-medium rounded-full
                    ${achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-300' :
                      achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-300'
                    }
                  `}>
                    {achievement.rarity}
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Achievement Sound Types</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => achievementSounds.levelUp()}
                  className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-200 hover:bg-yellow-500/30 transition-colors"
                >
                  Level Up
                </button>
                <button
                  onClick={() => achievementSounds.questComplete()}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 hover:bg-green-500/30 transition-colors"
                >
                  Quest Complete
                </button>
                <button
                  onClick={() => achievementSounds.skillUnlock()}
                  className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-200 hover:bg-purple-500/30 transition-colors"
                >
                  Skill Unlock
                </button>
                <button
                  onClick={() => playAchievementCelebration('majorAchievement')}
                  className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-200 hover:bg-orange-500/30 transition-colors"
                >
                  Major Celebration
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Learning Feedback */}
        {selectedTab === 'feedback' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Learning Feedback Sounds</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-green-200 mb-4">Correct Answer</h3>
                <p className="text-green-200/70 mb-4">
                  Play this sound when students answer correctly to provide positive reinforcement.
                </p>
                <button
                  onClick={() => feedbackSounds.correct()}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 hover:bg-green-500/30 transition-colors"
                >
                  Play Correct Sound
                </button>
              </div>
              
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-red-200 mb-4">Incorrect Answer</h3>
                <p className="text-red-200/70 mb-4">
                  Gentle sound for incorrect answers that encourages rather than discourages.
                </p>
                <button
                  onClick={() => feedbackSounds.incorrect()}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 hover:bg-red-500/30 transition-colors"
                >
                  Play Incorrect Sound
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => feedbackSounds.hint()}
                className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-200 hover:bg-blue-500/30 transition-colors"
              >
                Hint Reveal
              </button>
              <button
                onClick={() => feedbackSounds.save()}
                className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-200 hover:bg-purple-500/30 transition-colors"
              >
                Progress Save
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {selectedTab === 'navigation' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Navigation Sounds</h2>
            
            <div className="space-y-4">
              <SoundButton onClick={() => setIsModalOpen(true)}>
                Open Modal (with sound)
              </SoundButton>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigationSounds.modalOpen()}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-200 hover:bg-blue-500/30 transition-colors"
                >
                  Modal Open Sound
                </button>
                <button
                  onClick={() => navigationSounds.modalClose()}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 hover:bg-red-500/30 transition-colors"
                >
                  Modal Close Sound
                </button>
                <button
                  onClick={() => navigationSounds.tabSwitch()}
                  className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-200 hover:bg-purple-500/30 transition-colors"
                >
                  Tab Switch Sound
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {selectedTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Notification Sounds</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => notificationSounds.message()}
                className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-200 hover:bg-blue-500/30 transition-colors"
              >
                <div className="text-2xl mb-2">💬</div>
                <div className="font-semibold">Message</div>
                <div className="text-sm opacity-70">New message received</div>
              </button>
              
              <button
                onClick={() => notificationSounds.reminder()}
                className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-200 hover:bg-yellow-500/30 transition-colors"
              >
                <div className="text-2xl mb-2">⏰</div>
                <div className="font-semibold">Reminder</div>
                <div className="text-sm opacity-70">Study reminder alert</div>
              </button>
              
              <button
                onClick={() => notificationSounds.system()}
                className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-200 hover:bg-purple-500/30 transition-colors"
              >
                <div className="text-2xl mb-2">🔔</div>
                <div className="font-semibold">System</div>
                <div className="text-sm opacity-70">System notification</div>
              </button>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Celebration Sounds</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => celebrationSounds.confetti()}
                  className="px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-lg text-pink-200 hover:bg-pink-500/30 transition-colors"
                >
                  🎊 Confetti
                </button>
                <button
                  onClick={() => celebrationSounds.fanfare()}
                  className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-200 hover:bg-yellow-500/30 transition-colors"
                >
                  🎺 Fanfare
                </button>
                <button
                  onClick={() => celebrationSounds.chime()}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-200 hover:bg-blue-500/30 transition-colors"
                >
                  🔔 Chime
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <SoundModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Sound Modal Example"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-white/80">
            This modal demonstrates contextual sound effects for opening and closing.
            Notice how the sounds provide audio feedback for the modal state changes.
          </p>
          
          <div className="flex gap-3">
            <SoundButton variant="primary" onClick={() => setIsModalOpen(false)}>
              Close Modal
            </SoundButton>
            <SoundButton variant="secondary" onClick={() => {}}>
              Another Action
            </SoundButton>
          </div>
        </div>
      </SoundModal>

      {/* Achievement Notification */}
      <AchievementNotification
        achievement={currentAchievement}
        onComplete={() => setCurrentAchievement(null)}
      />
    </div>
  );
};