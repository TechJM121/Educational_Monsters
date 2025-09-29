import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimpleAuth } from '../hooks/useSimpleAuth';
import { useNavigate } from 'react-router-dom';

interface SimpleGameMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  duration: string;
  players: string;
  status: 'available' | 'coming_soon' | 'locked';
  minLevel: number;
}

type PageView = 'selector' | 'game';

export const GameModesPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<PageView>('selector');
  const [selectedGameMode, setSelectedGameMode] = useState<SimpleGameMode | null>(null);
  const { user } = useSimpleAuth();
  const navigate = useNavigate();

  const gameModes: SimpleGameMode[] = [
    {
      id: 'lightning-round',
      name: 'Lightning Round',
      description: 'Answer as many questions as possible in 60 seconds!',
      icon: '⚡',
      difficulty: 2,
      duration: '1 min',
      players: '1 player',
      status: 'available',
      minLevel: 1
    },
    {
      id: 'math-duel',
      name: 'Math Duel',
      description: 'Face off in a mathematical battle!',
      icon: '⚔️',
      difficulty: 3,
      duration: '10 min',
      players: '2 players',
      status: 'coming_soon',
      minLevel: 3
    },
    {
      id: 'knowledge-gauntlet',
      name: 'Knowledge Gauntlet',
      description: 'Survive waves of increasingly difficult questions!',
      icon: '🛡️',
      difficulty: 4,
      duration: '20 min',
      players: '1 player',
      status: 'coming_soon',
      minLevel: 5
    },
    {
      id: 'team-quest',
      name: 'Team Quest',
      description: 'Work together to solve complex problems!',
      icon: '🤝',
      difficulty: 3,
      duration: '25 min',
      players: '4 players',
      status: 'coming_soon',
      minLevel: 4
    },
    {
      id: 'speed-demon',
      name: 'Speed Demon',
      description: 'Race to answer questions the fastest!',
      icon: '🏃‍♂️',
      difficulty: 2,
      duration: '5 min',
      players: '8 players',
      status: 'coming_soon',
      minLevel: 2
    },
    {
      id: 'mystery-box',
      name: 'Mystery Box Challenge',
      description: 'Open mystery boxes by answering correctly!',
      icon: '📦',
      difficulty: 2,
      duration: '15 min',
      players: '1 player',
      status: 'available',
      minLevel: 1
    }
  ];

  const handleGameModeSelect = (gameMode: SimpleGameMode) => {
    if (gameMode.status === 'coming_soon') {
      navigate('/app/multiplayer');
      return;
    }
    
    if (gameMode.status === 'locked') {
      return;
    }

    setSelectedGameMode(gameMode);
    setCurrentView('game');
  };

  const handleBackToSelector = () => {
    setSelectedGameMode(null);
    setCurrentView('selector');
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = {
      1: 'text-green-400',
      2: 'text-blue-400', 
      3: 'text-yellow-400',
      4: 'text-orange-400',
      5: 'text-red-400'
    };
    return colors[difficulty as keyof typeof colors] || 'text-gray-400';
  };

  const getDifficultyLabel = (difficulty: number) => {
    const labels = {
      1: 'Beginner',
      2: 'Easy',
      3: 'Medium', 
      4: 'Hard',
      5: 'Expert'
    };
    return labels[difficulty as keyof typeof labels] || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'coming_soon': return 'bg-yellow-500';
      case 'locked': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'coming_soon': return 'Coming Soon';
      case 'locked': return 'Locked';
      default: return 'Unknown';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400">Please log in to access game modes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* Navigation Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">🎮 Game Modes</h1>
              {currentView !== 'selector' && selectedGameMode && (
                <div className="flex items-center space-x-2 text-slate-400">
                  <span>→</span>
                  <span className="text-white">{selectedGameMode.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {currentView !== 'selector' && (
                <button
                  onClick={handleBackToSelector}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  <span>←</span>
                  <span>Back to Games</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentView === 'selector' && (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Choose Your Challenge</h2>
                <p className="text-slate-300">Test your knowledge in exciting game modes!</p>
              </div>

              {/* Game Modes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gameModes.map((gameMode, index) => {
                  const isLocked = gameMode.minLevel > (user?.age || 1);
                  const canPlay = gameMode.status === 'available' && !isLocked;
                  
                  return (
                    <motion.button
                      key={gameMode.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={canPlay ? { scale: 1.02, y: -5 } : {}}
                      whileTap={canPlay ? { scale: 0.98 } : {}}
                      onClick={() => handleGameModeSelect(gameMode)}
                      disabled={!canPlay}
                      className={`
                        bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 text-left
                        ${canPlay 
                          ? 'border-slate-700 hover:border-slate-600 cursor-pointer' 
                          : 'border-slate-800 opacity-60 cursor-not-allowed'
                        }
                      `}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl">{gameMode.icon}</div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(gameMode.status)}`}>
                            {getStatusText(gameMode.status)}
                          </span>
                          {isLocked && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium text-red-300 bg-red-900/30">
                              Level {gameMode.minLevel}+
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-bold text-white mb-2">{gameMode.name}</h3>
                      <p className="text-sm text-slate-300 mb-4 leading-relaxed">{gameMode.description}</p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-slate-400">Difficulty</div>
                          <div className={`text-sm font-medium ${getDifficultyColor(gameMode.difficulty)}`}>
                            {getDifficultyLabel(gameMode.difficulty)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Duration</div>
                          <div className="text-sm font-medium text-white">{gameMode.duration}</div>
                        </div>
                      </div>

                      {/* Players */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 text-sm">👥</span>
                          <span className="text-xs text-slate-400">{gameMode.players}</span>
                        </div>
                        {canPlay && (
                          <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                            Play Now →
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Coming Soon Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-8 text-center"
              >
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                  <h3 className="text-lg font-bold text-white mb-2">More Game Modes Coming Soon!</h3>
                  <p className="text-slate-300 mb-4">
                    We're working on multiplayer battles, team challenges, and special events. 
                    Click on "Coming Soon" modes to learn more!
                  </p>
                  <button
                    onClick={() => navigate('/app/coming-soon')}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all duration-300"
                  >
                    🚀 View All Upcoming Features
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {currentView === 'game' && selectedGameMode && (
            <motion.div
              key="game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center py-20">
                <div className="text-6xl mb-6">{selectedGameMode.icon}</div>
                <h2 className="text-3xl font-bold text-white mb-4">{selectedGameMode.name}</h2>
                <p className="text-slate-400 mb-8">{selectedGameMode.description}</p>
                
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 max-w-md mx-auto border border-slate-700 mb-8">
                  <div className="space-y-4">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-slate-600 rounded w-3/4 mx-auto"></div>
                      <div className="h-4 bg-slate-600 rounded w-1/2 mx-auto"></div>
                      <div className="h-8 bg-blue-600 rounded w-full"></div>
                    </div>
                    <p className="text-slate-400 text-sm mt-4">
                      Game interface will be implemented here
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleBackToSelector}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    ← Back to Game Modes
                  </button>
                  <button
                    onClick={() => navigate('/app/learning')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-medium transition-all duration-300"
                  >
                    🎯 Start Learning Instead
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Particles Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};