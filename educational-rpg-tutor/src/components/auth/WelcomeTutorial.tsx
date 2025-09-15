import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedButton } from '../shared/AnimatedButton';
import { XPBar } from '../gamification/XPBar';
import { CharacterStats } from '../character/CharacterStats';
import type { Character } from '../../types/character';

interface WelcomeTutorialProps {
  character: Character;
  onTutorialComplete: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  content: React.ReactNode;
  icon: string;
}

export const WelcomeTutorial: React.FC<WelcomeTutorialProps> = ({
  character,
  onTutorialComplete
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: `Welcome, ${character.name}!`,
      icon: '🎉',
      content: (
        <div className="text-center">
          <p className="text-slate-300 mb-4">
            Congratulations on creating your character! You're about to embark on an epic learning adventure 
            where knowledge becomes power and education unlocks new worlds.
          </p>
          <div className="bg-primary-900/20 border border-primary-800 rounded-lg p-4">
            <h3 className="text-primary-300 font-semibold mb-2">Your Mission</h3>
            <p className="text-primary-200 text-sm">
              Transform into the ultimate scholar-warrior by mastering subjects, 
              leveling up your character, and unlocking magical learning realms!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'xp-system',
      title: 'Experience Points (XP)',
      icon: '⭐',
      content: (
        <div>
          <p className="text-slate-300 mb-4">
            Every time you complete a lesson, answer questions correctly, or finish challenges, 
            you'll earn Experience Points (XP). XP is the key to growing stronger!
          </p>
          <div className="mb-4">
            <XPBar 
              currentXP={character.currentXP} 
              totalXP={character.totalXP}
              level={character.level}
              showAnimation={true}
            />
          </div>
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
            <h3 className="text-yellow-300 font-semibold mb-2">How to Earn XP</h3>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>• Answer questions correctly: 10-50 XP</li>
              <li>• Complete lessons: 100-200 XP</li>
              <li>• Finish daily quests: 50-100 XP</li>
              <li>• Maintain learning streaks: Bonus XP!</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'character-stats',
      title: 'Character Stats',
      icon: '📊',
      content: (
        <div>
          <p className="text-slate-300 mb-4">
            Your character has six core stats that grow as you study different subjects. 
            Each stat affects your abilities and unlocks special bonuses!
          </p>
          <div className="mb-4">
            <CharacterStats 
              stats={character.stats}
              showTooltips={true}
            />
          </div>
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <h3 className="text-blue-300 font-semibold mb-2">Stat Growth</h3>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• <strong>Intelligence:</strong> Math, Logic, Problem Solving</li>
              <li>• <strong>Wisdom:</strong> History, Social Studies, Philosophy</li>
              <li>• <strong>Creativity:</strong> Art, Music, Creative Writing</li>
              <li>• <strong>Charisma:</strong> Language Arts, Communication</li>
              <li>• <strong>Dexterity:</strong> Science Experiments, Hands-on Learning</li>
              <li>• <strong>Vitality:</strong> Health, Biology, Physical Education</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'learning-worlds',
      title: 'Learning Worlds',
      icon: '🌍',
      content: (
        <div className="text-center">
          <p className="text-slate-300 mb-4">
            As you progress, you'll unlock magical learning worlds, each themed around different subjects. 
            Explore ancient libraries, mystical laboratories, and enchanted kingdoms!
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-3">
              <div className="text-2xl mb-1">📚</div>
              <h4 className="text-purple-300 font-semibold text-sm">Numerical Kingdom</h4>
              <p className="text-purple-200 text-xs">Mathematics & Logic</p>
            </div>
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
              <div className="text-2xl mb-1">🧪</div>
              <h4 className="text-green-300 font-semibold text-sm">Laboratory Realm</h4>
              <p className="text-green-200 text-xs">Science & Experiments</p>
            </div>
            <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-3">
              <div className="text-2xl mb-1">🏛️</div>
              <h4 className="text-orange-300 font-semibold text-sm">History Hall</h4>
              <p className="text-orange-200 text-xs">Social Studies & Culture</p>
            </div>
            <div className="bg-pink-900/20 border border-pink-800 rounded-lg p-3">
              <div className="text-2xl mb-1">🎨</div>
              <h4 className="text-pink-300 font-semibold text-sm">Creative Commons</h4>
              <p className="text-pink-200 text-xs">Arts & Expression</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            Complete lessons in each subject to unlock these magical realms!
          </p>
        </div>
      )
    },
    {
      id: 'achievements',
      title: 'Achievements & Rewards',
      icon: '🏆',
      content: (
        <div>
          <p className="text-slate-300 mb-4">
            Earn badges, collect rare items, and unlock special abilities as you reach learning milestones. 
            Show off your achievements and compete with friends!
          </p>
          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-3 bg-slate-700/50 rounded-lg p-3">
              <div className="text-2xl">🥇</div>
              <div>
                <h4 className="text-yellow-300 font-semibold text-sm">Achievement Badges</h4>
                <p className="text-slate-300 text-xs">Earn themed badges for completing challenges</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-slate-700/50 rounded-lg p-3">
              <div className="text-2xl">🎒</div>
              <div>
                <h4 className="text-blue-300 font-semibold text-sm">Collectible Items</h4>
                <p className="text-slate-300 text-xs">Find rare books, potions, and magical artifacts</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-slate-700/50 rounded-lg p-3">
              <div className="text-2xl">⚡</div>
              <div>
                <h4 className="text-purple-300 font-semibold text-sm">Special Abilities</h4>
                <p className="text-slate-300 text-xs">Unlock powers that help you learn faster</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'daily-quests',
      title: 'Daily Quests & Streaks',
      icon: '📋',
      content: (
        <div>
          <p className="text-slate-300 mb-4">
            Every day brings new quests and challenges! Complete them to earn bonus XP, 
            maintain learning streaks, and unlock special rewards.
          </p>
          <div className="bg-gradient-to-r from-primary-900/20 to-secondary-900/20 border border-primary-800 rounded-lg p-4 mb-4">
            <h3 className="text-primary-300 font-semibold mb-2">Today's Sample Quests</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-500 rounded"></div>
                <span className="text-slate-300 text-sm">Complete 3 math problems</span>
                <span className="text-primary-400 text-xs ml-auto">+50 XP</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-500 rounded"></div>
                <span className="text-slate-300 text-sm">Read for 15 minutes</span>
                <span className="text-primary-400 text-xs ml-auto">+75 XP</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-500 rounded"></div>
                <span className="text-slate-300 text-sm">Answer 5 science questions</span>
                <span className="text-primary-400 text-xs ml-auto">+60 XP</span>
              </li>
            </ul>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🔥</div>
            <p className="text-orange-300 font-semibold">Learning Streak: 0 days</p>
            <p className="text-slate-400 text-sm">Complete daily quests to build your streak!</p>
          </div>
        </div>
      )
    },
    {
      id: 'ready',
      title: 'Ready to Begin!',
      icon: '🚀',
      content: (
        <div className="text-center">
          <p className="text-slate-300 mb-6">
            You now know the basics of your learning adventure! Remember, every question answered 
            and every lesson completed makes you stronger. Your journey to becoming a master scholar begins now!
          </p>
          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-800 rounded-lg p-4 mb-6">
            <h3 className="text-green-300 font-semibold mb-2">Quick Tips for Success</h3>
            <ul className="text-green-200 text-sm space-y-1 text-left">
              <li>• Study a little bit every day to maintain your streak</li>
              <li>• Try different subjects to build balanced stats</li>
              <li>• Don't worry about mistakes - they help you learn!</li>
              <li>• Check your daily quests for bonus XP opportunities</li>
              <li>• Have fun and celebrate your progress!</li>
            </ul>
          </div>
          <div className="text-6xl mb-4">⚔️📚✨</div>
          <p className="text-primary-300 font-rpg text-lg">
            May your quest for knowledge be legendary!
          </p>
        </div>
      )
    }
  ];

  const currentStep = tutorialSteps[currentStepIndex];
  const isLastStep = currentStepIndex === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onTutorialComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (showSkipConfirm) {
      onTutorialComplete();
    } else {
      setShowSkipConfirm(true);
      setTimeout(() => setShowSkipConfirm(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-rpg-pattern flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="rpg-card">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{currentStep.icon}</div>
            <h1 className="text-3xl font-rpg text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mb-2">
              {currentStep.title}
            </h1>
            <div className="flex justify-center items-center space-x-2 mb-4">
              <span className="text-slate-400 text-sm">
                Step {currentStepIndex + 1} of {tutorialSteps.length}
              </span>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              {currentStep.content}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              {currentStepIndex > 0 && (
                <AnimatedButton
                  onClick={handlePrevious}
                  variant="secondary"
                >
                  Previous
                </AnimatedButton>
              )}
            </div>

            <div className="flex space-x-3">
              <AnimatedButton
                onClick={handleSkip}
                variant="secondary"
                className={showSkipConfirm ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {showSkipConfirm ? 'Confirm Skip' : 'Skip Tutorial'}
              </AnimatedButton>
              
              <AnimatedButton
                onClick={handleNext}
              >
                {isLastStep ? 'Start Learning!' : 'Next'}
              </AnimatedButton>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-6 flex justify-center space-x-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStepIndex
                    ? 'bg-primary-500'
                    : index < currentStepIndex
                    ? 'bg-green-500'
                    : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};