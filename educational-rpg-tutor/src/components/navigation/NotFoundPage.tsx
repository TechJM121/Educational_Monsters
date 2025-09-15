import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageTransition } from './PageTransition';

export const NotFoundPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
                      flex items-center justify-center p-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Animated 404 */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 20,
              delay: 0.2 
            }}
            className="mb-8"
          >
            <h1 className="text-9xl font-bold text-transparent bg-gradient-to-r 
                           from-red-500 via-yellow-500 to-orange-500 bg-clip-text
                           drop-shadow-2xl font-rpg">
              404
            </h1>
          </motion.div>

          {/* RPG-themed message */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-rpg text-yellow-400 mb-4 flex items-center justify-center gap-2">
              🏰 Quest Location Not Found! 🗺️
            </h2>
            <p className="text-xl text-slate-300 mb-6 leading-relaxed">
              Brave adventurer, it seems you've wandered into uncharted territory! 
              The page you seek has been lost to the digital realm.
            </p>
          </motion.div>

          {/* Animated character */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="text-8xl mb-8"
          >
            🧙‍♂️
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center"
          >
            <Link
              to="/home"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r 
                         from-yellow-500 to-orange-500 text-slate-900 font-bold font-rpg
                         rounded-lg hover:from-yellow-400 hover:to-orange-400 
                         transform hover:scale-105 transition-all duration-200
                         shadow-lg hover:shadow-xl"
            >
              🏠 Return to Castle
            </Link>
            
            <Link
              to="/learning"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r 
                         from-blue-600 to-purple-600 text-white font-bold font-rpg
                         rounded-lg hover:from-blue-500 hover:to-purple-500 
                         transform hover:scale-105 transition-all duration-200
                         shadow-lg hover:shadow-xl"
            >
              📚 Start New Quest
            </Link>
          </motion.div>

          {/* Helpful suggestions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-12 p-6 bg-slate-800/50 rounded-lg border border-yellow-500/20"
          >
            <h3 className="text-lg font-rpg text-yellow-400 mb-3">
              🗡️ Suggested Quests:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Link 
                to="/character" 
                className="text-slate-300 hover:text-yellow-400 transition-colors
                           flex items-center gap-2 p-2 rounded hover:bg-slate-700/30"
              >
                ⚔️ Character Sheet
              </Link>
              <Link 
                to="/achievements" 
                className="text-slate-300 hover:text-yellow-400 transition-colors
                           flex items-center gap-2 p-2 rounded hover:bg-slate-700/30"
              >
                🏆 Achievements Hall
              </Link>
              <Link 
                to="/inventory" 
                className="text-slate-300 hover:text-yellow-400 transition-colors
                           flex items-center gap-2 p-2 rounded hover:bg-slate-700/30"
              >
                🎒 Inventory Bag
              </Link>
              <Link 
                to="/leaderboard" 
                className="text-slate-300 hover:text-yellow-400 transition-colors
                           flex items-center gap-2 p-2 rounded hover:bg-slate-700/30"
              >
                👑 Leaderboard
              </Link>
            </div>
          </motion.div>

          {/* Footer message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-8 text-sm text-slate-500 font-rpg"
          >
            "Not all who wander are lost, but this page definitely is!" 🧭
          </motion.p>
        </div>
      </div>
    </PageTransition>
  );
};