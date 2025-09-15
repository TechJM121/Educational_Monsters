// Student Progress Card - Individual student monitoring component
import React, { useState } from 'react';
import type { StudentProgress } from '../../types/parent';

interface StudentProgressCardProps {
  student: StudentProgress;
  onGenerateReport: () => void;
}

export const StudentProgressCard: React.FC<StudentProgressCardProps> = ({
  student,
  onGenerateReport
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatColor = (statName: string) => {
    const colors = {
      intelligence: 'text-blue-400',
      vitality: 'text-green-400',
      wisdom: 'text-purple-400',
      charisma: 'text-pink-400',
      dexterity: 'text-yellow-400',
      creativity: 'text-orange-400'
    };
    return colors[statName as keyof typeof colors] || 'text-gray-400';
  };

  const getStatIcon = (statName: string) => {
    const icons = {
      intelligence: '🧠',
      vitality: '💚',
      wisdom: '📚',
      charisma: '💬',
      dexterity: '⚡',
      creativity: '🎨'
    };
    return icons[statName as keyof typeof icons] || '📊';
  };

  const formatLastActive = (timestamp: string) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getActivityTypeIcon = (activityType: string) => {
    const icons = {
      lesson_completed: '📖',
      question_answered: '❓',
      achievement_earned: '🏆',
      level_up: '⭐',
      login: '🔑',
      logout: '👋'
    };
    return icons[activityType as keyof typeof icons] || '📝';
  };

  const calculateXPProgress = () => {
    // Simplified XP calculation - in real app this would match the character service
    const xpForNextLevel = (student.level + 1) * 100;
    const xpForCurrentLevel = student.level * 100;
    const currentLevelXP = student.totalXP - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    return {
      current: currentLevelXP,
      needed: xpNeeded,
      percentage: (currentLevelXP / xpNeeded) * 100
    };
  };

  const xpProgress = calculateXPProgress();

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {student.characterName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{student.studentName}</h3>
            <p className="text-blue-200 text-sm">{student.characterName}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-400">Lv.{student.level}</div>
          <div className="text-sm text-blue-200">
            {student.currentStreak > 0 ? `🔥 ${student.currentStreak} day streak` : 'No streak'}
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-blue-200 mb-1">
          <span>Experience Points</span>
          <span>{xpProgress.current}/{xpProgress.needed} XP</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(xpProgress.percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{student.totalXP.toLocaleString()}</div>
          <div className="text-xs text-blue-200">Total XP</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{student.achievements.length}</div>
          <div className="text-xs text-blue-200">Achievements</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{formatLastActive(student.lastActive)}</div>
          <div className="text-xs text-blue-200">Last Active</div>
        </div>
      </div>

      {/* Character Stats */}
      <div className="mb-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full text-left text-white hover:text-yellow-400 transition-colors"
        >
          <span className="font-medium">Character Stats</span>
          <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {showDetails && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {Object.entries(student.stats).map(([statName, value]) => (
              <div key={statName} className="flex items-center space-x-2">
                <span className="text-lg">{getStatIcon(statName)}</span>
                <span className="text-sm text-blue-200 capitalize">{statName}:</span>
                <span className={`font-bold ${getStatColor(statName)}`}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Achievements */}
      {student.achievements.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-white mb-2">Recent Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {student.achievements.slice(0, 3).map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs"
                title={achievement.description}
              >
                <span>{achievement.badgeIcon}</span>
                <span>{achievement.name}</span>
              </div>
            ))}
            {student.achievements.length > 3 && (
              <div className="text-xs text-blue-200 px-2 py-1">
                +{student.achievements.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {student.recentActivity.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-white mb-2">Recent Activity</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {student.recentActivity.slice(0, 3).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-2 text-sm">
                <span>{getActivityTypeIcon(activity.activityType)}</span>
                <span className="text-blue-200 flex-1">{activity.details}</span>
                {activity.xpEarned && (
                  <span className="text-yellow-400 font-medium">+{activity.xpEarned} XP</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={onGenerateReport}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          Generate Report
        </button>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          {showDetails ? 'Less' : 'More'} Details
        </button>
      </div>
    </div>
  );
};