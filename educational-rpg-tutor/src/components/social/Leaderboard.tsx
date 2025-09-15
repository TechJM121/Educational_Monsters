// Leaderboard component for weekly XP rankings

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaderboardEntry } from '../../types/social';
import { socialService } from '../../services/socialService';
import { ProgressBar } from '../shared/ProgressBar';
import { Tooltip } from '../shared/Tooltip';

interface LeaderboardProps {
  classroomId?: string;
  currentUserId: string;
  limit?: number;
  className?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  classroomId,
  currentUserId,
  limit = 10,
  className = ''
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all_time'>('weekly');

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await socialService.getWeeklyLeaderboard(classroomId, limit);
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [classroomId, limit]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard, timeframe]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 2: return 'text-gray-600 bg-gray-50 border-gray-200';
      case 3: return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getSpecializationIcon = (specialization?: string) => {
    const icons = {
      scholar: '📚',
      explorer: '🗺️',
      guardian: '🛡️',
      artist: '🎨',
      diplomat: '🤝',
      inventor: '⚙️'
    };
    return specialization ? icons[specialization as keyof typeof icons] || '⭐' : '⭐';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
              <div className="flex-1 h-4 bg-slate-200 rounded"></div>
              <div className="w-16 h-4 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p className="mb-2">Failed to load leaderboard</p>
          <button
            onClick={loadLeaderboard}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const maxWeeklyXP = entries.length > 0 ? entries[0].weeklyXP : 1;
  const currentUserEntry = entries.find(entry => entry.userId === currentUserId);

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">🏆 Leaderboard</h3>
            <p className="text-purple-100 text-sm">Weekly XP Rankings</p>
          </div>
          <div className="flex space-x-1">
            {(['weekly', 'monthly', 'all_time'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  timeframe === period
                    ? 'bg-white text-purple-600'
                    : 'bg-purple-500 text-white hover:bg-purple-400'
                }`}
              >
                {period.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current User Highlight */}
      {currentUserEntry && currentUserEntry.rank > 3 && (
        <div className="bg-blue-50 border-b border-blue-100 p-3">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${getRankColor(currentUserEntry.rank)}`}>
              #{currentUserEntry.rank}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-blue-900">You</span>
                <span className="text-xs text-blue-600">
                  {getSpecializationIcon(currentUserEntry.specialization)} Lv.{currentUserEntry.level}
                </span>
              </div>
              <div className="text-sm text-blue-700">
                {currentUserEntry.weeklyXP.toLocaleString()} XP this week
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Entries */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {entries.map((entry, index) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                entry.userId === currentUserId ? 'bg-blue-50 border-blue-100' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Rank */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${getRankColor(entry.rank)}`}>
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold">
                  {entry.characterName.charAt(0).toUpperCase()}
                </div>

                {/* Character Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium truncate ${
                      entry.userId === currentUserId ? 'text-blue-900' : 'text-slate-900'
                    }`}>
                      {entry.characterName}
                      {entry.userId === currentUserId && (
                        <span className="text-xs text-blue-600 ml-1">(You)</span>
                      )}
                    </span>
                    <Tooltip content={`${entry.specialization || 'No specialization'} - Level ${entry.level}`}>
                      <span className="text-xs text-slate-500">
                        {getSpecializationIcon(entry.specialization)} Lv.{entry.level}
                      </span>
                    </Tooltip>
                  </div>
                  
                  {/* XP Progress Bar */}
                  <div className="mt-1">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                      <span>{entry.weeklyXP.toLocaleString()} XP</span>
                      <span>{((entry.weeklyXP / maxWeeklyXP) * 100).toFixed(0)}%</span>
                    </div>
                    <ProgressBar
                      current={entry.weeklyXP}
                      max={maxWeeklyXP}
                      color={entry.rank <= 3 ? 'warning' : 'primary'}
                      size="sm"
                      showLabel={false}
                    />
                  </div>
                </div>

                {/* Weekly XP */}
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    entry.userId === currentUserId ? 'text-blue-600' : 'text-slate-900'
                  }`}>
                    {entry.weeklyXP.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">XP</div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {entries.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm">No leaderboard data available</p>
          <p className="text-xs text-slate-400 mt-1">
            Complete some lessons to appear on the leaderboard!
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="bg-slate-50 px-4 py-3 text-center">
        <p className="text-xs text-slate-500">
          Rankings update every hour • {entries.length} of {limit} shown
        </p>
      </div>
    </div>
  );
};