import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameModeSelector } from '../components/gamification/GameModeSelector';
import { GameLobby } from '../components/gamification/GameLobby';
import { GameModeLeaderboard } from '../components/gamification/GameModeLeaderboard';
import type { GameMode } from '../types/gameMode';
import { useAuth } from '../hooks/useAuth';

type PageView = 'selector' | 'lobby' | 'leaderboard' | 'game';

export const GameModesPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<PageView>('selector');
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { user } = useAuth();

  const handleGameModeSelect = (gameMode: GameMode) => {
    setSelectedGameMode(gameMode);
    setCurrentView('lobby');
  };

  const handleGameStart = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setCurrentView('game');
  };

  const handleBackToSelector = () => {
    setSelectedGameMode(null);
    setCurrentSessionId(null);
    setCurrentView('selector');
  };

  const handleShowLeaderboard = (gameMode: GameMode) => {
    setSelectedGameMode(gameMode);
    setCurrentView('leaderboard');
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation Header */}
      <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">Game Modes</h1>
              {currentView !== 'selector' && (
                <div className="flex items-center space-x-2 text-gray-400">
                  <span>→</span>
                  <span className="capitalize">
                    {currentView === 'lobby' && 'Lobby'}
                    {currentView === 'leaderboard' && 'Leaderboard'}
                    {currentView === 'game' && 'Playing'}
                  </span>
                  {selectedGameMode && (
                    <>
                      <span>→</span>
                      <span className="text-white">{selectedGameMode.name}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {currentView === 'selector' && (
                <button
                  onClick={() => setCurrentView('leaderboard')}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  <span>🏆</span>
                  <span>Leaderboards</span>
                </button>
              )}

              {currentView !== 'selector' && (
                <button
                  onClick={handleBackToSelector}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
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
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <GameModeSelector
                onGameModeSelect={handleGameModeSelect}
                className="max-w-6xl mx-auto"
              />
            </motion.div>
          )}

          {currentView === 'lobby' && selectedGameMode && (
            <motion.div
              key="lobby"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <GameLobby
                gameMode={selectedGameMode}
                onGameStart={handleGameStart}
                onBack={handleBackToSelector}
                className="max-w-6xl mx-auto"
              />
            </motion.div>
          )}

          {currentView === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <div className="space-y-8">
                {/* Leaderboard Selection */}
                {!selectedGameMode && (
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Game Mode Leaderboards</h2>
                    <p className="text-gray-400 mb-8">Choose a game mode to view its leaderboard</p>
                    
                    <GameModeSelector
                      onGameModeSelect={handleShowLeaderboard}
                      className="max-w-4xl mx-auto"
                    />
                  </div>
                )}

                {/* Selected Game Mode Leaderboard */}
                {selectedGameMode && (
                  <GameModeLeaderboard
                    gameMode={selectedGameMode}
                    className="max-w-4xl mx-auto"
                  />
                )}
              </div>
            </motion.div>
          )}

          {currentView === 'game' && selectedGameMode && currentSessionId && (
            <motion.div
              key="game"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <div className="text-center py-20">
                <div className="text-6xl mb-6">🎮</div>
                <h2 className="text-3xl font-bold text-white mb-4">Game In Progress</h2>
                <p className="text-gray-400 mb-8">
                  Playing: {selectedGameMode.name}
                </p>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 max-w-md mx-auto border border-gray-700">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-600 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-600 rounded w-1/2 mx-auto"></div>
                    <div className="h-8 bg-blue-600 rounded w-full"></div>
                  </div>
                  <p className="text-gray-400 mt-4 text-sm">
                    Game interface would be implemented here
                  </p>
                </div>
                <button
                  onClick={handleBackToSelector}
                  className="mt-8 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  End Game
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button for Quick Play */}
      {currentView === 'selector' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-8 right-8 z-20"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full shadow-lg flex items-center justify-center text-white text-2xl hover:shadow-xl transition-shadow"
            onClick={() => {
              // Quick play - select a random available game mode
              // This could be enhanced to select based on user preferences
              console.log('Quick play feature - would select random game mode');
            }}
          >
            ⚡
          </motion.button>
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
            Quick Play
          </div>
        </motion.div>
      )}

      {/* Background Particles Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
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