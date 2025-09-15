import React from 'react';
import { PageTransition } from '../components/navigation/PageTransition';

export const QuestsPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-rpg text-yellow-400 mb-6 flex items-center gap-3">
            📜 Quest Journal
          </h1>
          
          <div className="space-y-4">
            {/* Daily Quests */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-yellow-500/20">
              <h2 className="text-2xl font-rpg text-yellow-400 mb-4">⭐ Daily Quests</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300 font-rpg">Complete 5 Math Problems</span>
                  <span className="text-green-400">3/5</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300 font-rpg">Read for 15 minutes</span>
                  <span className="text-yellow-400">0/15</span>
                </div>
              </div>
            </div>
            
            {/* Weekly Challenges */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-yellow-500/20">
              <h2 className="text-2xl font-rpg text-yellow-400 mb-4">🏆 Weekly Challenges</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300 font-rpg">Master Multiplication Tables</span>
                  <span className="text-blue-400">In Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};