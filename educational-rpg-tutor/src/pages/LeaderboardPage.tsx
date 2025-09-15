import React from 'react';
import { PageTransition } from '../components/navigation/PageTransition';

export const LeaderboardPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-rpg text-yellow-400 mb-6 flex items-center gap-3">
            👑 Leaderboard
          </h1>
          
          <div className="space-y-6">
            {/* Top 3 podium */}
            <div className="flex justify-center items-end gap-4 mb-8">
              {/* 2nd place */}
              <div className="text-center">
                <div className="w-16 h-20 bg-gradient-to-t from-slate-600 to-slate-500 rounded-t-lg 
                               flex items-end justify-center pb-2">
                  <span className="text-2xl">🥈</span>
                </div>
                <div className="bg-slate-700 p-3 rounded-b-lg">
                  <div className="text-2xl mb-1">🧙‍♀️</div>
                  <div className="text-sm font-rpg text-slate-300">Sarah</div>
                  <div className="text-xs text-yellow-400">2,450 XP</div>
                </div>
              </div>
              
              {/* 1st place */}
              <div className="text-center">
                <div className="w-16 h-24 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg 
                               flex items-end justify-center pb-2">
                  <span className="text-3xl">👑</span>
                </div>
                <div className="bg-yellow-500/20 p-3 rounded-b-lg border border-yellow-500/30">
                  <div className="text-2xl mb-1">🧙‍♂️</div>
                  <div className="text-sm font-rpg text-yellow-400">Alex</div>
                  <div className="text-xs text-yellow-300">3,120 XP</div>
                </div>
              </div>
              
              {/* 3rd place */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-t from-orange-700 to-orange-600 rounded-t-lg 
                               flex items-end justify-center pb-2">
                  <span className="text-xl">🥉</span>
                </div>
                <div className="bg-slate-700 p-3 rounded-b-lg">
                  <div className="text-2xl mb-1">🧝‍♂️</div>
                  <div className="text-sm font-rpg text-slate-300">Mike</div>
                  <div className="text-xs text-yellow-400">2,180 XP</div>
                </div>
              </div>
            </div>
            
            {/* Full leaderboard */}
            <div className="bg-slate-800/50 rounded-lg border border-yellow-500/20">
              <div className="p-4 border-b border-slate-600">
                <h2 className="text-xl font-rpg text-yellow-400">Weekly Rankings</h2>
              </div>
              <div className="divide-y divide-slate-600">
                {[
                  { rank: 4, name: 'Emma', avatar: '🧚‍♀️', xp: 1950, level: 12 },
                  { rank: 5, name: 'You', avatar: '🧙‍♂️', xp: 1820, level: 11, isCurrentUser: true },
                  { rank: 6, name: 'Jake', avatar: '🧝‍♂️', xp: 1650, level: 10 },
                  { rank: 7, name: 'Lily', avatar: '🧚‍♀️', xp: 1480, level: 9 },
                  { rank: 8, name: 'Tom', avatar: '🧙‍♂️', xp: 1320, level: 9 }
                ].map((player) => (
                  <div 
                    key={player.rank}
                    className={`flex items-center justify-between p-4 ${
                      player.isCurrentUser ? 'bg-yellow-500/10 border-l-4 border-yellow-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        player.isCurrentUser ? 'bg-yellow-500 text-slate-900' : 'bg-slate-600 text-slate-300'
                      }`}>
                        {player.rank}
                      </div>
                      <div className="text-2xl">{player.avatar}</div>
                      <div>
                        <div className={`font-rpg ${
                          player.isCurrentUser ? 'text-yellow-400' : 'text-slate-300'
                        }`}>
                          {player.name}
                        </div>
                        <div className="text-sm text-slate-400">Level {player.level}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">{player.xp.toLocaleString()} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};