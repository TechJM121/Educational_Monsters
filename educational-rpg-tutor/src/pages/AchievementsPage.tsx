import React from 'react';
import { PageTransition } from '../components/navigation/PageTransition';

export const AchievementsPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-rpg text-yellow-400 mb-6 flex items-center gap-3">
            🏆 Achievement Hall
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sample achievements */}
            {[
              { name: 'First Steps', description: 'Complete your first lesson', icon: '👶', unlocked: true },
              { name: 'Math Wizard', description: 'Solve 100 math problems', icon: '🧙‍♂️', unlocked: true },
              { name: 'Speed Reader', description: 'Read 10 books', icon: '📚', unlocked: false },
              { name: 'Science Explorer', description: 'Complete 50 science experiments', icon: '🔬', unlocked: false },
              { name: 'Streak Master', description: 'Study for 30 days in a row', icon: '🔥', unlocked: false },
              { name: 'Social Butterfly', description: 'Help 10 classmates', icon: '🦋', unlocked: false }
            ].map((achievement) => (
              <div 
                key={achievement.name}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30' 
                    : 'bg-slate-800/30 border-slate-600/30 opacity-60'
                }`}
              >
                <div className="text-center">
                  <div className={`text-4xl mb-2 ${achievement.unlocked ? '' : 'grayscale'}`}>
                    {achievement.icon}
                  </div>
                  <h3 className={`font-rpg text-lg mb-1 ${
                    achievement.unlocked ? 'text-yellow-400' : 'text-slate-400'
                  }`}>
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-slate-300">
                    {achievement.description}
                  </p>
                  {achievement.unlocked && (
                    <div className="mt-2 text-xs text-green-400 font-rpg">
                      ✓ Unlocked
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};