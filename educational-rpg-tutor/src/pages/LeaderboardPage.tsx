import React from 'react';
import { motion } from 'framer-motion';

export const LeaderboardPage: React.FC = () => {
  const leaderboard = [
    { rank: 1, name: 'Alex the Great', level: 25, xp: 12500, streak: 15, avatar: '👑' },
    { rank: 2, name: 'Sarah Smarty', level: 23, xp: 11800, streak: 12, avatar: '🧠' },
    { rank: 3, name: 'Mike Mastermind', level: 22, xp: 11200, streak: 10, avatar: '🎯' },
    { rank: 4, name: 'Emma Einstein', level: 21, xp: 10900, streak: 8, avatar: '⚡' },
    { rank: 5, name: 'You (Guest)', level: 1, xp: 0, streak: 0, avatar: '👤' },
    { rank: 6, name: 'Tom Thinker', level: 20, xp: 10200, streak: 7, avatar: '🤔' },
    { rank: 7, name: 'Lisa Learner', level: 19, xp: 9800, streak: 6, avatar: '📚' },
    { rank: 8, name: 'Ben Brainy', level: 18, xp: 9400, streak: 5, avatar: '🧙‍♂️' }
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-500 to-orange-400';
      case 2: return 'from-gray-400 to-gray-300';
      case 3: return 'from-orange-600 to-yellow-600';
      default: return 'from-blue-500 to-purple-500';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent mb-4">
            👑 Leaderboard
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl">
            See how you rank among fellow learners
          </p>
        </div>

        <div className="space-y-4">
          {leaderboard.map((player, index) => (
            <motion.div
              key={player.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`backdrop-blur-xl rounded-2xl p-4 sm:p-6 border transition-all duration-300 ${player.name.includes('You')
                ? 'bg-white/15 border-cyan-400/30 shadow-lg shadow-cyan-400/20'
                : 'bg-white/10 border-white/20'
                }`}
            >
              <div className="flex items-center gap-3 sm:gap-6">
                {/* Rank */}
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${getRankColor(player.rank)} rounded-xl flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0`}>
                  {player.rank <= 3 ? (
                    <span className="text-lg sm:text-2xl">{getRankIcon(player.rank)}</span>
                  ) : (
                    <span className="text-sm sm:text-lg">#{player.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-slate-600 to-slate-500 rounded-full flex items-center justify-center text-lg sm:text-2xl flex-shrink-0">
                  {player.avatar}
                </div>

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg sm:text-xl font-bold truncate ${player.name.includes('You') ? 'text-cyan-300' : 'text-white'
                    }`}>
                    {player.name}
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base">Level {player.level}</p>
                </div>

                {/* Stats */}
                <div className="text-right space-y-1 flex-shrink-0">
                  <div className="text-white font-bold text-sm sm:text-base">{player.xp.toLocaleString()} XP</div>
                  <div className="text-slate-400 text-xs sm:text-sm flex items-center gap-1 justify-end">
                    🔥 {player.streak} day streak
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Your Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">5th</div>
              <div className="text-slate-300">Current Rank</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">+2</div>
              <div className="text-slate-300">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">0</div>
              <div className="text-slate-300">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">0</div>
              <div className="text-slate-300">Best Streak</div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-8 text-center"
        >
          <p className="text-slate-400 mb-4">Start learning to climb the leaderboard!</p>
          <button className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white font-bold hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 shadow-lg">
            Start Learning Quest
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};