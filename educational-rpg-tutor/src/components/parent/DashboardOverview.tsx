// Dashboard Overview - Summary statistics and quick insights
import React from 'react';
import type { DashboardStats, StudentAlert } from '../../types/parent';

interface DashboardOverviewProps {
  stats: DashboardStats;
  recentAlerts: StudentAlert[];
  onViewAllAlerts: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  recentAlerts,
  onViewAllAlerts
}) => {
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold text-white">{stats.totalStudents}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm font-medium">Active Today</p>
              <p className="text-3xl font-bold text-white">{stats.activeToday}</p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm font-medium">Average Level</p>
              <p className="text-3xl font-bold text-white">{Math.round(stats.averageLevel)}</p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm font-medium">Total XP Earned</p>
              <p className="text-3xl font-bold text-white">{stats.totalXPEarned.toLocaleString()}</p>
            </div>
            <div className="text-4xl">💎</div>
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Weekly Activity</h3>
        <div className="grid grid-cols-7 gap-2">
          {stats.weeklyProgress.map((day, index) => {
            const maxXP = Math.max(...stats.weeklyProgress.map(d => d.xpEarned));
            const height = maxXP > 0 ? (day.xpEarned / maxXP) * 100 : 0;
            const date = new Date(day.date);
            
            return (
              <div key={index} className="text-center">
                <div className="h-32 flex items-end justify-center mb-2">
                  <div
                    className="w-8 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${day.xpEarned} XP earned`}
                  />
                </div>
                <p className="text-xs text-blue-200">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className="text-xs text-white font-medium">{day.activeStudents}</p>
                <p className="text-xs text-yellow-300">{day.xpEarned}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-between text-sm text-blue-200">
          <span>Active Students</span>
          <span>XP Earned</span>
        </div>
      </div>

      {/* Recent Alerts and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Recent Alerts</h3>
            {stats.alertsCount > 0 && (
              <button
                onClick={onViewAllAlerts}
                className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
              >
                View All ({stats.alertsCount})
              </button>
            )}
          </div>
          
          {recentAlerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-green-200">No active alerts</p>
              <p className="text-sm text-blue-200">All students are doing well!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${getAlertSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      {alert.subject && (
                        <p className="text-sm opacity-75">Subject: {alert.subject}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getAlertSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Achievement Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🏆</div>
                <span className="text-white">Total Achievements</span>
              </div>
              <span className="text-2xl font-bold text-yellow-400">
                {stats.achievementsEarned}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📚</div>
                <span className="text-white">Weekly Study Time</span>
              </div>
              <span className="text-2xl font-bold text-blue-400">
                {formatTime(stats.weeklyProgress.reduce((sum, day) => sum + day.timeSpent, 0))}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🔥</div>
                <span className="text-white">Most Active Day</span>
              </div>
              <span className="text-lg font-bold text-orange-400">
                {stats.weeklyProgress.reduce((max, day) => 
                  day.activeStudents > max.activeStudents ? day : max
                ).date.split('-').slice(1).join('/')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};