import React from 'react';
import { AnimatedButton } from '../shared/AnimatedButton';

interface QuickActionsProps {
  onStartLearning?: () => void;
  onViewInventory?: () => void;
  onViewAchievements?: () => void;
  onCustomizeCharacter?: () => void;
  onViewLeaderboard?: () => void;
  className?: string;
}

const learningWorlds = [
  {
    id: 'numerical-kingdom',
    name: 'Numerical Kingdom',
    subject: 'Mathematics',
    icon: '🏰',
    color: 'from-blue-600 to-blue-500',
    description: 'Master numbers and equations'
  },
  {
    id: 'laboratory-realm',
    name: 'Laboratory Realm',
    subject: 'Science',
    icon: '🧪',
    color: 'from-green-600 to-green-500',
    description: 'Explore scientific discoveries'
  },
  {
    id: 'wisdom-library',
    name: 'Wisdom Library',
    subject: 'History',
    icon: '📚',
    color: 'from-purple-600 to-purple-500',
    description: 'Journey through time and cultures'
  },
  {
    id: 'creative-studio',
    name: 'Creative Studio',
    subject: 'Arts',
    icon: '🎨',
    color: 'from-pink-600 to-pink-500',
    description: 'Express your artistic talents'
  },
  {
    id: 'language-gardens',
    name: 'Language Gardens',
    subject: 'Language Arts',
    icon: '🌸',
    color: 'from-yellow-600 to-yellow-500',
    description: 'Cultivate communication skills'
  },
];

export function QuickActions({
  onStartLearning,
  onViewInventory,
  onViewAchievements,
  onCustomizeCharacter,
  onViewLeaderboard,
  className = ''
}: QuickActionsProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Learning Worlds */}
      <div className="rpg-card">
        <h3 className="text-xl font-rpg text-slate-200 mb-4 flex items-center gap-2">
          <span>🌍</span>
          Learning Worlds
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {learningWorlds.map((world) => (
            <button
              key={world.id}
              onClick={onStartLearning}
              className={`
                p-4 rounded-lg border-2 border-transparent
                bg-gradient-to-br ${world.color}
                hover:border-white/20 hover:scale-105
                transition-all duration-200 text-left
                group
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {world.icon}
                </span>
                <div>
                  <div className="font-medium text-white text-sm">
                    {world.name}
                  </div>
                  <div className="text-xs text-white/80">
                    {world.subject}
                  </div>
                </div>
              </div>
              <div className="text-xs text-white/70">
                {world.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="rpg-card">
        <h3 className="text-xl font-rpg text-slate-200 mb-4 flex items-center gap-2">
          <span>⚡</span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <AnimatedButton
            onClick={onViewInventory}
            variant="secondary"
            size="sm"
            icon="🎒"
            className="flex-col h-16 text-xs"
          >
            Inventory
          </AnimatedButton>

          <AnimatedButton
            onClick={onViewAchievements}
            variant="warning"
            size="sm"
            icon="🏆"
            className="flex-col h-16 text-xs"
          >
            Achievements
          </AnimatedButton>

          <AnimatedButton
            onClick={onCustomizeCharacter}
            variant="primary"
            size="sm"
            icon="👤"
            className="flex-col h-16 text-xs"
          >
            Customize
          </AnimatedButton>

          <AnimatedButton
            onClick={onViewLeaderboard}
            variant="success"
            size="sm"
            icon="📊"
            className="flex-col h-16 text-xs"
          >
            Leaderboard
          </AnimatedButton>
        </div>
      </div>

      {/* Daily Challenges */}
      <div className="rpg-card">
        <h3 className="text-xl font-rpg text-slate-200 mb-4 flex items-center gap-2">
          <span>🎯</span>
          Today's Challenges
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-lg">📐</span>
              <div>
                <div className="text-sm font-medium text-slate-200">
                  Geometry Master
                </div>
                <div className="text-xs text-slate-400">
                  Complete 5 geometry problems
                </div>
              </div>
            </div>
            <div className="text-xs text-yellow-400">+50 XP</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-lg">🔬</span>
              <div>
                <div className="text-sm font-medium text-slate-200">
                  Science Explorer
                </div>
                <div className="text-xs text-slate-400">
                  Learn about the solar system
                </div>
              </div>
            </div>
            <div className="text-xs text-yellow-400">+75 XP</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-lg">📚</span>
              <div>
                <div className="text-sm font-medium text-slate-200">
                  Reading Champion
                </div>
                <div className="text-xs text-slate-400">
                  Read for 15 minutes
                </div>
              </div>
            </div>
            <div className="text-xs text-yellow-400">+30 XP</div>
          </div>
        </div>
      </div>
    </div>
  );
}