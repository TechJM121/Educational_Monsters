import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SessionAnalytics } from '../../types/question';

interface SessionCompletionProps {
  analytics: SessionAnalytics;
  onNewSession: () => void;
  onReturnHome: () => void;
  levelUp?: boolean;
  achievements?: string[];
  subjectName?: string;
}

interface PerformanceLevel {
  name: string;
  icon: string;
  color: string;
  message: string;
  minAccuracy: number;
}

const PERFORMANCE_LEVELS: PerformanceLevel[] = [
  {
    name: 'Legendary',
    icon: '👑',
    color: 'from-yellow-400 to-orange-500',
    message: 'Outstanding mastery! You are a true champion!',
    minAccuracy: 95
  },
  {
    name: 'Excellent',
    icon: '⭐',
    color: 'from-blue-400 to-purple-500',
    message: 'Fantastic work! You really know your stuff!',
    minAccuracy: 85
  },
  {
    name: 'Great',
    icon: '🎯',
    color: 'from-green-400 to-blue-500',
    message: 'Well done! You are making great progress!',
    minAccuracy: 75
  },
  {
    name: 'Good',
    icon: '👍',
    color: 'from-teal-400 to-green-500',
    message: 'Nice job! Keep up the good work!',
    minAccuracy: 65
  },
  {
    name: 'Keep Trying',
    icon: '💪',
    color: 'from-orange-400 to-red-500',
    message: 'Every expert was once a beginner. Keep practicing!',
    minAccuracy: 0
  }
];

export const SessionCompletion: React.FC<SessionCompletionProps> = ({
  analytics,
  onNewSession,
  onReturnHome,
  levelUp = false,
  achievements = [],
  subjectName = 'Mixed Subjects'
}) => {
  const [showCelebration, setShowCelebration] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const getPerformanceLevel = (): PerformanceLevel => {
    return PERFORMANCE_LEVELS.find(level => analytics.accuracy >= level.minAccuracy) || PERFORMANCE_LEVELS[PERFORMANCE_LEVELS.length - 1];
  };

  const performance = getPerformanceLevel();

  const getSpeedRating = (): { name: string; icon: string; color: string } => {
    if (analytics.averageResponseTime <= 5) {
      return { name: 'Lightning Fast', icon: '⚡', color: 'text-yellow-500' };
    } else if (analytics.averageResponseTime <= 10) {
      return { name: 'Quick Thinker', icon: '🚀', color: 'text-blue-500' };
    } else if (analytics.averageResponseTime <= 15) {
      return { name: 'Steady Pace', icon: '🐢', color: 'text-green-500' };
    } else {
      return { name: 'Thoughtful', icon: '🤔', color: 'text-purple-500' };
    }
  };

  const speedRating = getSpeedRating();

  const celebrationSteps = [
    'initial',
    ...(levelUp ? ['levelUp'] : []),
    ...(achievements.length > 0 ? ['achievements'] : []),
    'results'
  ];

  useEffect(() => {
    if (showCelebration && currentStep < celebrationSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, showCelebration, celebrationSteps.length]);

  const skipCelebration = () => {
    setShowCelebration(false);
    setCurrentStep(celebrationSteps.length - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          {showCelebration && currentStep < celebrationSteps.length - 1 ? (
            <motion.div
              key={celebrationSteps[currentStep]}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              {celebrationSteps[currentStep] === 'initial' && (
                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="text-8xl mb-6"
                  >
                    🎉
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl font-bold text-gray-800 mb-4"
                  >
                    Session Complete!
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-gray-600 text-lg"
                  >
                    Great job completing your {subjectName} adventure!
                  </motion.p>
                </div>
              )}

              {celebrationSteps[currentStep] === 'levelUp' && (
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 shadow-2xl text-white">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="text-8xl mb-6"
                  >
                    🆙
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl font-bold mb-4"
                  >
                    Level Up!
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-lg opacity-90"
                  >
                    Your character has grown stronger!
                  </motion.p>
                </div>
              )}

              {celebrationSteps[currentStep] === 'achievements' && (
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 shadow-2xl text-white">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="text-8xl mb-6"
                  >
                    🏆
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl font-bold mb-4"
                  >
                    New Achievement{achievements.length > 1 ? 's' : ''}!
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-2"
                  >
                    {achievements.map((achievement, index) => (
                      <div key={index} className="text-lg opacity-90">
                        🎖️ {achievement}
                      </div>
                    ))}
                  </motion.div>
                </div>
              )}

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={skipCelebration}
                className="mt-6 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-gray-600 transition-colors"
              >
                Skip Celebration
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${performance.color} p-6 text-white text-center`}>
                <div className="text-6xl mb-4">{performance.icon}</div>
                <h1 className="text-2xl font-bold mb-2">{performance.name} Performance!</h1>
                <p className="opacity-90">{performance.message}</p>
              </div>

              {/* Stats Grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.correctAnswers}/{analytics.totalQuestions}
                    </div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.accuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>

                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      +{analytics.totalXPEarned}
                    </div>
                    <div className="text-sm text-gray-600">XP Earned</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className={`text-2xl font-bold ${speedRating.color}`}>
                      {speedRating.icon}
                    </div>
                    <div className="text-sm text-gray-600">{speedRating.name}</div>
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Average Response Time</span>
                    <span className="font-semibold">{analytics.averageResponseTime.toFixed(1)}s</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Session Duration</span>
                    <span className="font-semibold">
                      {analytics.endTime && analytics.startTime
                        ? Math.round((analytics.endTime.getTime() - analytics.startTime.getTime()) / 60000)
                        : 0} minutes
                    </span>
                  </div>

                  {analytics.streakBonuses > 0 && (
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-gray-700">Streak Bonuses</span>
                      <span className="font-semibold text-orange-600">+{analytics.streakBonuses} XP</span>
                    </div>
                  )}
                </div>

                {/* Difficulty Progression */}
                {analytics.difficultyProgression.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Difficulty Progression</h3>
                    <div className="flex space-x-1">
                      {analytics.difficultyProgression.map((difficulty, index) => (
                        <div
                          key={index}
                          className={`h-6 flex-1 rounded ${
                            difficulty === 1 ? 'bg-green-300' :
                            difficulty === 2 ? 'bg-yellow-300' :
                            difficulty === 3 ? 'bg-orange-300' :
                            difficulty === 4 ? 'bg-red-300' :
                            'bg-purple-300'
                          }`}
                          title={`Question ${index + 1}: Difficulty ${difficulty}`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Easy</span>
                      <span>Hard</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    onClick={onNewSession}
                    className={`flex-1 py-3 px-6 bg-gradient-to-r ${performance.color} text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start New Session
                  </motion.button>

                  <motion.button
                    onClick={onReturnHome}
                    className="flex-1 py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Return Home
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};