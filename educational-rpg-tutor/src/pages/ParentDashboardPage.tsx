import React from 'react';
import { PageTransition } from '../components/navigation/PageTransition';

export const ParentDashboardPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-rpg text-yellow-400 mb-6 flex items-center gap-3">
            👨‍👩‍👧‍👦 Parent Portal
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Overview */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-yellow-500/20">
              <h2 className="text-2xl font-rpg text-yellow-400 mb-4">Progress Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Current Level</span>
                  <span className="text-yellow-400 font-bold">Level 11</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Total XP Earned</span>
                  <span className="text-yellow-400 font-bold">1,820 XP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Learning Streak</span>
                  <span className="text-green-400 font-bold">7 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Achievements Unlocked</span>
                  <span className="text-purple-400 font-bold">12/25</span>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-yellow-500/20">
              <h2 className="text-2xl font-rpg text-yellow-400 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-xl">📚</span>
                  <div className="flex-1">
                    <div className="text-slate-300 font-rpg">Completed Reading Quest</div>
                    <div className="text-xs text-slate-400">2 hours ago</div>
                  </div>
                  <span className="text-green-400">+50 XP</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-xl">🔢</span>
                  <div className="flex-1">
                    <div className="text-slate-300 font-rpg">Math Practice Session</div>
                    <div className="text-xs text-slate-400">Yesterday</div>
                  </div>
                  <span className="text-green-400">+75 XP</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-xl">🏆</span>
                  <div className="flex-1">
                    <div className="text-slate-300 font-rpg">Unlocked "Math Wizard" Badge</div>
                    <div className="text-xs text-slate-400">2 days ago</div>
                  </div>
                  <span className="text-purple-400">Achievement</span>
                </div>
              </div>
            </div>
            
            {/* Subject Progress */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-yellow-500/20 lg:col-span-2">
              <h2 className="text-2xl font-rpg text-yellow-400 mb-4">Subject Progress</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { subject: 'Mathematics', progress: 75, icon: '🔢', color: 'blue' },
                  { subject: 'Reading', progress: 60, icon: '📚', color: 'green' },
                  { subject: 'Science', progress: 45, icon: '🔬', color: 'purple' }
                ].map((subject) => (
                  <div key={subject.subject} className="text-center">
                    <div className="text-3xl mb-2">{subject.icon}</div>
                    <h3 className="font-rpg text-slate-300 mb-2">{subject.subject}</h3>
                    <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${
                          subject.color === 'blue' ? 'from-blue-500 to-blue-400' :
                          subject.color === 'green' ? 'from-green-500 to-green-400' :
                          'from-purple-500 to-purple-400'
                        }`}
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-yellow-400 font-bold">{subject.progress}%</span>
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