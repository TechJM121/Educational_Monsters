import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Subject } from '../../types/question';

interface SubjectSelectorProps {
  subjects: Subject[];
  selectedSubject?: Subject;
  onSubjectSelect: (subject: Subject | null) => void;
  onStartSession: () => void;
  isLoading?: boolean;
  userLevel?: number;
}

// World themes for different subjects
const WORLD_THEMES = {
  'Mathematics': {
    name: 'Numerical Kingdom',
    description: 'A realm of numbers, equations, and logical puzzles',
    color: 'from-blue-500 to-purple-600',
    icon: '🔢',
    background: 'bg-gradient-to-br from-blue-50 to-purple-50',
    unlockLevel: 1
  },
  'Science': {
    name: 'Laboratory Realm',
    description: 'Explore experiments, discoveries, and scientific wonders',
    color: 'from-green-500 to-teal-600',
    icon: '🧪',
    background: 'bg-gradient-to-br from-green-50 to-teal-50',
    unlockLevel: 3
  },
  'History': {
    name: 'Chronicle Citadel',
    description: 'Journey through time and ancient civilizations',
    color: 'from-amber-500 to-orange-600',
    icon: '🏛️',
    background: 'bg-gradient-to-br from-amber-50 to-orange-50',
    unlockLevel: 5
  },
  'Language Arts': {
    name: 'Literary Lands',
    description: 'Master the art of words, stories, and communication',
    color: 'from-pink-500 to-rose-600',
    icon: '📚',
    background: 'bg-gradient-to-br from-pink-50 to-rose-50',
    unlockLevel: 2
  },
  'Art': {
    name: 'Creative Canvas',
    description: 'Express yourself through colors, shapes, and imagination',
    color: 'from-purple-500 to-indigo-600',
    icon: '🎨',
    background: 'bg-gradient-to-br from-purple-50 to-indigo-50',
    unlockLevel: 4
  },
  'Biology': {
    name: 'Living Laboratory',
    description: 'Discover the mysteries of life and living organisms',
    color: 'from-emerald-500 to-green-600',
    icon: '🧬',
    background: 'bg-gradient-to-br from-emerald-50 to-green-50',
    unlockLevel: 6
  }
};

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  subjects,
  selectedSubject,
  onSubjectSelect,
  onStartSession,
  isLoading = false,
  userLevel = 1
}) => {
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);

  const isSubjectUnlocked = (subjectName: string): boolean => {
    const theme = WORLD_THEMES[subjectName as keyof typeof WORLD_THEMES];
    return !theme || userLevel >= theme.unlockLevel;
  };

  const getSubjectTheme = (subjectName: string) => {
    return WORLD_THEMES[subjectName as keyof typeof WORLD_THEMES] || {
      name: subjectName,
      description: 'Explore this subject area',
      color: 'from-gray-500 to-gray-600',
      icon: '📖',
      background: 'bg-gradient-to-br from-gray-50 to-gray-100',
      unlockLevel: 1
    };
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-800 mb-4"
        >
          Choose Your Learning World
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 text-lg"
        >
          Select a subject to begin your educational adventure
        </motion.p>
      </div>

      {/* Mixed Subjects Option */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <motion.button
          onClick={() => onSubjectSelect(null)}
          className={`w-full p-6 rounded-xl border-2 transition-all duration-300 ${
            selectedSubject === null
              ? 'border-rainbow bg-gradient-to-r from-red-100 via-yellow-100 via-green-100 via-blue-100 to-purple-100 shadow-lg'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center space-x-4">
            <div className="text-4xl">🌈</div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-800">Mixed Adventure</h3>
              <p className="text-gray-600">Questions from all unlocked worlds</p>
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* Subject Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {subjects.map((subject, index) => {
          const theme = getSubjectTheme(subject.name);
          const isUnlocked = isSubjectUnlocked(subject.name);
          const isSelected = selectedSubject?.id === subject.id;

          return (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <motion.button
                onClick={() => isUnlocked ? onSubjectSelect(subject) : null}
                onHoverStart={() => setHoveredSubject(subject.id)}
                onHoverEnd={() => setHoveredSubject(null)}
                disabled={!isUnlocked}
                className={`w-full h-48 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? `border-transparent bg-gradient-to-br ${theme.color} text-white shadow-xl`
                    : isUnlocked
                    ? `border-gray-200 ${theme.background} hover:border-gray-300 hover:shadow-lg text-gray-800`
                    : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                whileHover={isUnlocked ? { scale: 1.05 } : {}}
                whileTap={isUnlocked ? { scale: 0.95 } : {}}
              >
                <div className="p-6 h-full flex flex-col justify-between">
                  <div className="text-center">
                    <div className={`text-4xl mb-3 ${!isUnlocked ? 'grayscale' : ''}`}>
                      {isUnlocked ? theme.icon : '🔒'}
                    </div>
                    <h3 className="text-lg font-bold mb-2">
                      {isUnlocked ? theme.name : 'Locked'}
                    </h3>
                    <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                      {isUnlocked ? theme.description : `Unlock at level ${theme.unlockLevel}`}
                    </p>
                  </div>

                  {!isUnlocked && (
                    <div className="text-xs text-gray-500 mt-2">
                      Level {theme.unlockLevel} required
                    </div>
                  )}
                </div>

                {/* Hover Effect */}
                <AnimatePresence>
                  {hoveredSubject === subject.id && isUnlocked && !isSelected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute inset-0 bg-gradient-to-br ${theme.color} opacity-10 rounded-xl`}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Start Session Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <motion.button
          onClick={onStartSession}
          disabled={isLoading}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : selectedSubject
              ? `bg-gradient-to-r ${getSubjectTheme(selectedSubject.name).color} text-white shadow-lg hover:shadow-xl`
              : 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl'
          }`}
          whileHover={!isLoading ? { scale: 1.05 } : {}}
          whileTap={!isLoading ? { scale: 0.95 } : {}}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Starting Adventure...</span>
            </div>
          ) : (
            `Begin ${selectedSubject ? getSubjectTheme(selectedSubject.name).name : 'Mixed'} Adventure`
          )}
        </motion.button>
      </motion.div>

      {/* World Preview */}
      <AnimatePresence>
        {selectedSubject && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8 p-6 rounded-xl bg-white border border-gray-200 shadow-lg"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Welcome to {getSubjectTheme(selectedSubject.name).name}
              </h3>
              <p className="text-gray-600 mb-4">
                {getSubjectTheme(selectedSubject.name).description}
              </p>
              <div className="flex justify-center space-x-6 text-sm text-gray-500">
                <div>📊 Adaptive Difficulty</div>
                <div>⚡ Real-time XP</div>
                <div>🎯 Skill Tracking</div>
                <div>🏆 Achievements</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};