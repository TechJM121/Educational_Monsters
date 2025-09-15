// Alerts Panel - Student alert monitoring and management
import React, { useState } from 'react';
import type { StudentAlert } from '../../types/parent';

interface AlertsPanelProps {
  alerts: StudentAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onRefresh: () => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onAcknowledgeAlert,
  onRefresh
}) => {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'severity'>('date');

  const getAlertIcon = (alertType: string) => {
    const icons = {
      low_accuracy: '📉',
      inactive: '😴',
      struggling_subject: '📚',
      excessive_screen_time: '⏰'
    };
    return icons[alertType as keyof typeof icons] || '⚠️';
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-900/20 text-red-100';
      case 'medium': return 'border-yellow-500 bg-yellow-900/20 text-yellow-100';
      case 'low': return 'border-blue-500 bg-blue-900/20 text-blue-100';
      default: return 'border-gray-500 bg-gray-900/20 text-gray-100';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-blue-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const filteredAlerts = alerts
    .filter(alert => filter === 'all' || alert.severity === filter)
    .sort((a, b) => {
      if (sortBy === 'severity') {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity as keyof typeof severityOrder] - 
               severityOrder[a.severity as keyof typeof severityOrder];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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

  const getRecommendation = (alert: StudentAlert) => {
    const recommendations = {
      low_accuracy: 'Consider reviewing fundamental concepts or reducing difficulty level.',
      inactive: 'Send a gentle reminder or check if the student needs help staying motivated.',
      struggling_subject: 'Provide additional practice materials or consider one-on-one help.',
      excessive_screen_time: 'Encourage breaks and set daily time limits for healthy learning habits.'
    };
    return recommendations[alert.alertType as keyof typeof recommendations] || 
           'Monitor the situation and provide support as needed.';
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Student Alerts</h2>
          <p className="text-blue-200">Monitor and respond to student learning challenges</p>
        </div>
        <button
          onClick={onRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh Alerts
        </button>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex items-center space-x-2">
            <label className="text-white font-medium">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-black/20 text-white border border-white/20 rounded px-3 py-1"
            >
              <option value="all">All Alerts</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-white font-medium">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/20 text-white border border-white/20 rounded px-3 py-1"
            >
              <option value="date">Date Created</option>
              <option value="severity">Severity Level</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-white mb-2">No Active Alerts</h3>
          <p className="text-blue-200">
            {filter === 'all' 
              ? 'All students are performing well!' 
              : `No ${filter} priority alerts at this time.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 rounded-lg p-6 ${getAlertSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-3xl">{getAlertIcon(alert.alertType)}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold">{alert.message}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityBadgeColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    
                    {alert.subject && (
                      <p className="text-sm opacity-75 mb-2">
                        Subject: <span className="font-medium">{alert.subject}</span>
                      </p>
                    )}
                    
                    <p className="text-sm opacity-90 mb-3">
                      {getRecommendation(alert)}
                    </p>
                    
                    {/* Alert Data */}
                    {Object.keys(alert.data).length > 0 && (
                      <div className="bg-black/20 rounded p-3 mb-3">
                        <h4 className="text-sm font-medium mb-2">Details:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {Object.entries(alert.data).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="opacity-75 capitalize">{key.replace('_', ' ')}:</span>
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs opacity-60">
                      Created {formatDate(alert.createdAt)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => onAcknowledgeAlert(alert.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ml-4"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert Summary */}
      {alerts.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3">Alert Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{alerts.length}</div>
              <div className="text-sm text-blue-200">Total Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {alerts.filter(a => a.severity === 'high').length}
              </div>
              <div className="text-sm text-blue-200">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {alerts.filter(a => a.severity === 'medium').length}
              </div>
              <div className="text-sm text-blue-200">Medium Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {alerts.filter(a => a.severity === 'low').length}
              </div>
              <div className="text-sm text-blue-200">Low Priority</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};