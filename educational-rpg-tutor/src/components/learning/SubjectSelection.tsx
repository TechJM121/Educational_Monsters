import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveText, ResponsiveCard } from '../shared/ResponsiveContainer';
import { useResponsive } from '../../hooks/useResponsive';

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  difficulty: string;
  questionCount: number;
  unlockLevel: number;
}

interface SubjectSelectionProps {
  userAge: number;
  userLevel?: number;
  onSubjectSelect: (subject: Subject | null) => void;
  onStartSession: () => void;
}

export const SubjectSelection: React.FC<SubjectSelectionProps> = ({
  userAge,
  userLevel = 1,
  onSubjectSelect,
  onStartSession
}) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);
  const { isMobile, isTablet } = useResponsive();

  // Define subjects with age-appropriate content
  const subjects: Subject[] = [
    {
      id: 'mathematics',
      name: 'Mathematics',
      description: 'Numbers, calculations, and problem-solving adventures',
      icon: '🔢',
      color: 'from-blue-500 to-cyan-400',
      difficulty: userAge <= 6 ? 'Counting & Basic Math' : userAge <= 10 ? 'Elementary Math' : userAge <= 14 ? 'Middle School Math' : 'Advanced Math',
      questionCount: userAge <= 6 ? 8 : userAge <= 10 ? 12 : userAge <= 14 ? 15 : 20,
      unlockLevel: 1
    },
    {
      id: 'science',
      name: 'Science',
      description: 'Explore the wonders of the natural world',
      icon: '🧪',
      color: 'from-green-500 to-emerald-400',
      difficulty: userAge <= 6 ? 'Nature Basics' : userAge <= 10 ? 'Elementary Science' : userAge <= 14 ? 'Physical Science' : 'Advanced Science',
      questionCount: userAge <= 6 ? 6 : userAge <= 10 ? 10 : userAge <= 14 ? 12 : 15,
      unlockLevel: 2
    },
    {
      id: 'language-arts',
      name: 'Language Arts',
      description: 'Reading, writing, and communication skills',
      icon: '📚',
      color: 'from-purple-500 to-pink-400',
      difficulty: userAge <= 6 ? 'Letters & Words' : userAge <= 10 ? 'Reading & Writing' : userAge <= 14 ? 'Literature' : 'Advanced Literature',
      questionCount: userAge <= 6 ? 5 : userAge <= 10 ? 8 : userAge <= 14 ? 10 : 12,
      unlockLevel: 1
    },
    {
      id: 'history',
      name: 'History',
      description: 'Journey through time and ancient civilizations',
      icon: '🏛️',
      color: 'from-yellow-500 to-orange-400',
      difficulty: userAge <= 6 ? 'Simple Stories' : userAge <= 10 ? 'World History' : userAge <= 14 ? 'Historical Events' : 'Advanced History',
      questionCount: userAge <= 6 ? 4 : userAge <= 10 ? 6 : userAge <= 14 ? 8 : 10,
      unlockLevel: 3
    },
    {
      id: 'art',
      name: 'Art & Creativity',
      description: 'Express yourself through colors, shapes, and imagination',
      icon: '🎨',
      color: 'from-pink-500 to-rose-400',
      difficulty: userAge <= 6 ? 'Colors & Shapes' : userAge <= 10 ? 'Art Basics' : userAge <= 14 ? 'Art History' : 'Advanced Art',
      questionCount: userAge <= 6 ? 4 : userAge <= 10 ? 6 : userAge <= 14 ? 8 : 10,
      unlockLevel: 2
    },
    {
      id: 'mixed',
      name: 'Mixed Adventure',
      description: 'Questions from all subjects for a varied experience',
      icon: '🌈',
      color: 'from-indigo-500 to-purple-500',
      difficulty: 'All Levels',
      questionCount: 15,
      unlockLevel: 1
    }
  ];

  const isSubjectUnlocked = (subject: Subject): boolean => {
    return userLevel >= subject.unlockLevel;
  };

  const handleSubjectClick = (subject: Subject) => {
    if (!isSubjectUnlocked(subject)) return;
    
    setSelectedSubject(subject);
    onSubjectSelect(subject);
  };

  const handleStartLearning = () => {
    onStartSession();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-950">
      <ResponsiveContainer maxWidth="6xl" padding="md" animate>
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ResponsiveText 
              as="h1" 
              size="4xl" 
              weight="bold" 
              className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent mb-4"
            >
              🌟 Choose Your Learning World
            </ResponsiveText>
            <ResponsiveText size="xl" className="text-slate-300 mb-2">
              Welcome, {userLevel > 1 ? 'Experienced' : 'New'} Adventurer!
            </ResponsiveText>
            <ResponsiveText size="lg" className="text-slate-400">
              Select a subject to begin your educational quest
            </ResponsiveText>
          </motion.div>
        </div>

        {/* Age and Level Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-6 bg-slate-800/50 backdrop-blur-sm rounded-xl px-6 py-3 border border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">👤</span>
              <span className="text-slate-300">Age: {userAge}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">⭐</span>
              <span className="text-slate-300">Level: {userLevel}</span>
            </div>
          </div>
        </motion.div>

        {/* Subject Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <ResponsiveGrid columns={isMobile ? 1 : isTablet ? 2 : 3} gap="lg">
            {subjects.map((subject, index) => {
              const isUnlocked = isSubjectUnlocked(subject);
              const isSelected = selectedSubject?.id === subject.id;
              const isHovered = hoveredSubject === subject.id;

              return (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="relative"
                >
                  <motion.button
                    onClick={() => handleSubjectClick(subject)}
                    onHoverStart={() => setHoveredSubject(subject.id)}
                    onHoverEnd={() => setHoveredSubject(null)}
                    disabled={!isUnlocked}
                    className={`w-full h-64 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                      isSelected
                        ? `border-transparent bg-gradient-to-br ${subject.color} text-white shadow-2xl`
                        : isUnlocked
                        ? `border-slate-600 bg-slate-800/50 backdrop-blur-sm hover:border-slate-500 hover:shadow-xl text-white`
                        : 'border-slate-700 bg-slate-900/50 text-slate-500 cursor-not-allowed'
                    }`}
                    whileHover={isUnlocked ? { scale: 1.02, y: -5 } : {}}
                    whileTap={isUnlocked ? { scale: 0.98 } : {}}
                  >
                    <div className="p-6 h-full flex flex-col justify-between">
                      <div className="text-center">
                        <div className={`text-5xl mb-4 ${!isUnlocked ? 'grayscale opacity-50' : ''}`}>
                          {isUnlocked ? subject.icon : '🔒'}
                        </div>
                        <ResponsiveText 
                          as="h3" 
                          size="xl" 
                          weight="bold" 
                          className={`mb-3 ${isSelected ? 'text-white' : isUnlocked ? 'text-white' : 'text-slate-500'}`}
                        >
                          {isUnlocked ? subject.name : 'Locked'}
                        </ResponsiveText>
                        <ResponsiveText 
                          size="sm" 
                          className={`mb-4 ${isSelected ? 'text-white/90' : isUnlocked ? 'text-slate-300' : 'text-slate-500'}`}
                        >
                          {isUnlocked ? subject.description : `Unlock at level ${subject.unlockLevel}`}
                        </ResponsiveText>
                      </div>

                      {isUnlocked && (
                        <div className="space-y-2">
                          <div className={`text-xs px-3 py-1 rounded-full ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {subject.difficulty}
                          </div>
                          <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                            {subject.questionCount} questions available
                          </div>
                        </div>
                      )}

                      {!isUnlocked && (
                        <div className="text-xs text-slate-500">
                          Level {subject.unlockLevel} required
                        </div>
                      )}
                    </div>

                    {/* Selection indicator */}
                    {isSelected && (
                      <motion.div
                        layoutId="selectedIndicator"
                        className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                      >
                        <span className="text-green-600 text-sm">✓</span>
                      </motion.div>
                    )}

                    {/* Hover effect */}
                    {isHovered && isUnlocked && !isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-10 rounded-2xl`}
                      />
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </ResponsiveGrid>
        </motion.div>

        {/* Selected Subject Preview */}
        {selectedSubject && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <ResponsiveCard padding="lg" className="bg-slate-800/50 backdrop-blur-sm border border-slate-600">
              <div className="text-center">
                <div className="text-4xl mb-4">{selectedSubject.icon}</div>
                <ResponsiveText 
                  as="h3" 
                  size="2xl" 
                  weight="bold" 
                  className="text-white mb-2"
                >
                  {selectedSubject.name} Adventure
                </ResponsiveText>
                <ResponsiveText size="lg" className="text-slate-300 mb-4">
                  {selectedSubject.description}
                </ResponsiveText>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-blue-400 font-semibold text-sm">📊 Difficulty</div>
                    <div className="text-slate-300 text-xs">{selectedSubject.difficulty}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-green-400 font-semibold text-sm">❓ Questions</div>
                    <div className="text-slate-300 text-xs">{selectedSubject.questionCount} available</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-purple-400 font-semibold text-sm">⚡ XP Rewards</div>
                    <div className="text-slate-300 text-xs">10-40 per question</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-yellow-400 font-semibold text-sm">🎯 Adaptive</div>
                    <div className="text-slate-300 text-xs">Adjusts to your level</div>
                  </div>
                </div>
              </div>
            </ResponsiveCard>
          </motion.div>
        )}

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <motion.button
            onClick={handleStartLearning}
            disabled={!selectedSubject}
            className={`px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-300 ${
              selectedSubject
                ? `bg-gradient-to-r ${selectedSubject.color} text-white shadow-2xl hover:shadow-3xl`
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
            whileHover={selectedSubject ? { scale: 1.05, y: -2 } : {}}
            whileTap={selectedSubject ? { scale: 0.95 } : {}}
          >
            {selectedSubject ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedSubject.icon}</span>
                <span>Begin {selectedSubject.name} Adventure</span>
                <span className="text-2xl">🚀</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl">👆</span>
                <span>Select a Subject Above</span>
              </div>
            )}
          </motion.button>

          {!selectedSubject && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-slate-400 text-sm mt-4"
            >
              Choose any unlocked subject to start your learning journey
            </motion.p>
          )}
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => window.location.href = '/app/home'}
            className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
          >
            ← Back to Dashboard
          </button>
        </motion.div>
      </ResponsiveContainer>
    </div>
  );
};