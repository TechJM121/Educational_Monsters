import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { loggingService } from '../../services/loggingService';
import { analyticsService } from '../../services/analyticsService';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  guestUsers: number;
  totalQuestions: number;
  totalSessions: number;
  averageSessionTime: number;
  conversionRate: number;
  errorRate: number;
}

interface ContentItem {
  id: string;
  type: 'question' | 'achievement' | 'subject';
  title: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'users' | 'analytics' | 'system'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load stats
      const [statsResponse, healthResponse, contentResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/system-health'),
        fetch('/api/admin/content'),
      ]);

      const statsData = await statsResponse.json();
      const healthData = await healthResponse.json();
      const contentData = await contentResponse.json();

      setStats(statsData);
      setSystemHealth(healthData);
      setContentItems(contentData);

      loggingService.info('Admin dashboard data loaded', {
        component: 'AdminDashboard',
        action: 'loadDashboardData',
      });
    } catch (error) {
      loggingService.error('Failed to load admin dashboard data', error as Error, {
        component: 'AdminDashboard',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentAction = async (action: string, itemId: string) => {
    try {
      await fetch(`/api/admin/content/${itemId}/${action}`, {
        method: 'POST',
      });

      loggingService.logUserAction(`admin_content_${action}`, {
        itemId,
        component: 'AdminDashboard',
      });

      // Reload content
      loadDashboardData();
    } catch (error) {
      loggingService.error(`Failed to ${action} content item`, error as Error, {
        itemId,
        component: 'AdminDashboard',
      });
    }
  };

  const exportLogs = () => {
    const logs = loggingService.exportLogs('csv');
    const blob = new Blob([logs], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    loggingService.logUserAction('admin_export_logs', {
      component: 'AdminDashboard',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-blue-200">Educational RPG Tutor Management Console</p>
        </motion.div>

        {/* System Health Alert */}
        {systemHealth && systemHealth.status !== 'healthy' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-6 p-4 rounded-lg ${
              systemHealth.status === 'warning' 
                ? 'bg-yellow-500/20 border border-yellow-500/50' 
                : 'bg-red-500/20 border border-red-500/50'
            }`}
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">
                {systemHealth.status === 'warning' ? '⚠️' : '🚨'}
              </span>
              <div>
                <h3 className="text-white font-semibold">
                  System Status: {systemHealth.status.toUpperCase()}
                </h3>
                <p className="text-gray-300">
                  Error rate: {systemHealth.errorRate}% | Response time: {systemHealth.responseTime}ms
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'content', label: 'Content', icon: '📝' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'system', label: 'System', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-900 shadow-lg'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab stats={stats} systemHealth={systemHealth} />
          )}
          
          {activeTab === 'content' && (
            <ContentTab 
              contentItems={contentItems} 
              onAction={handleContentAction}
            />
          )}
          
          {activeTab === 'users' && (
            <UsersTab stats={stats} />
          )}
          
          {activeTab === 'analytics' && (
            <AnalyticsTab />
          )}
          
          {activeTab === 'system' && (
            <SystemTab 
              systemHealth={systemHealth} 
              onExportLogs={exportLogs}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ stats, systemHealth }: { stats: AdminStats | null; systemHealth: SystemHealth | null }) {
  if (!stats || !systemHealth) return <div>Loading...</div>;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'blue' },
    { label: 'Active Users', value: stats.activeUsers, icon: '🟢', color: 'green' },
    { label: 'Guest Users', value: stats.guestUsers, icon: '👤', color: 'yellow' },
    { label: 'Total Questions', value: stats.totalQuestions, icon: '❓', color: 'purple' },
    { label: 'Learning Sessions', value: stats.totalSessions, icon: '📚', color: 'indigo' },
    { label: 'Avg Session Time', value: `${Math.round(stats.averageSessionTime / 60)}m`, icon: '⏱️', color: 'pink' },
    { label: 'Conversion Rate', value: `${(stats.conversionRate * 100).toFixed(1)}%`, icon: '📈', color: 'emerald' },
    { label: 'Error Rate', value: `${(stats.errorRate * 100).toFixed(2)}%`, icon: '🚨', color: 'red' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-gradient-to-br from-${card.color}-500/20 to-${card.color}-600/20 backdrop-blur-sm border border-${card.color}-500/30 rounded-xl p-6`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">{card.label}</p>
              <p className="text-white text-2xl font-bold">{card.value}</p>
            </div>
            <span className="text-3xl">{card.icon}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Content Management Tab
function ContentTab({ 
  contentItems, 
  onAction 
}: { 
  contentItems: ContentItem[]; 
  onAction: (action: string, itemId: string) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'question' | 'achievement' | 'subject'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');

  const filteredItems = contentItems.filter(item => {
    const typeMatch = filter === 'all' || item.type === filter;
    const statusMatch = statusFilter === 'all' || item.status === statusFilter;
    return typeMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2"
        >
          <option value="all">All Types</option>
          <option value="question">Questions</option>
          <option value="achievement">Achievements</option>
          <option value="subject">Subjects</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
          + Add New Content
        </button>
      </div>

      {/* Content List */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-white">Title</th>
                <th className="text-left p-4 text-white">Type</th>
                <th className="text-left p-4 text-white">Status</th>
                <th className="text-left p-4 text-white">Updated</th>
                <th className="text-left p-4 text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="p-4 text-white">{item.title}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.type === 'question' ? 'bg-blue-500/20 text-blue-300' :
                      item.type === 'achievement' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.status === 'active' ? 'bg-green-500/20 text-green-300' :
                      item.status === 'draft' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onAction('edit', item.id)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onAction(item.status === 'active' ? 'deactivate' : 'activate', item.id)}
                        className="text-yellow-400 hover:text-yellow-300 text-sm"
                      >
                        {item.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => onAction('delete', item.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Users Tab Component
function UsersTab({ stats }: { stats: AdminStats | null }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">User Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-white">
              <span>Total Users</span>
              <span>{stats?.totalUsers || 0}</span>
            </div>
            <div className="flex justify-between text-green-300">
              <span>Active Users</span>
              <span>{stats?.activeUsers || 0}</span>
            </div>
            <div className="flex justify-between text-yellow-300">
              <span>Guest Users</span>
              <span>{stats?.guestUsers || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Engagement Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-white">
              <span>Avg Session Time</span>
              <span>{Math.round((stats?.averageSessionTime || 0) / 60)}m</span>
            </div>
            <div className="flex justify-between text-blue-300">
              <span>Total Sessions</span>
              <span>{stats?.totalSessions || 0}</span>
            </div>
            <div className="flex justify-between text-purple-300">
              <span>Conversion Rate</span>
              <span>{((stats?.conversionRate || 0) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors">
              Export User Data
            </button>
            <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors">
              Send Notification
            </button>
            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Analytics Dashboard</h3>
        <p className="text-gray-300">
          Detailed analytics and reporting features would be implemented here, including:
        </p>
        <ul className="mt-4 space-y-2 text-gray-300">
          <li>• User engagement metrics</li>
          <li>• Learning progress analytics</li>
          <li>• A/B test results</li>
          <li>• Performance monitoring</li>
          <li>• Conversion funnel analysis</li>
        </ul>
      </div>
    </div>
  );
}

// System Tab Component
function SystemTab({ 
  systemHealth, 
  onExportLogs 
}: { 
  systemHealth: SystemHealth | null; 
  onExportLogs: () => void;
}) {
  if (!systemHealth) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* System Health */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
        <h3 className="text-white text-lg font-semibold mb-4">System Health</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{systemHealth.uptime}h</div>
            <div className="text-gray-300 text-sm">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{systemHealth.responseTime}ms</div>
            <div className="text-gray-300 text-sm">Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{systemHealth.memoryUsage}%</div>
            <div className="text-gray-300 text-sm">Memory Usage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{systemHealth.cpuUsage}%</div>
            <div className="text-gray-300 text-sm">CPU Usage</div>
          </div>
        </div>
      </div>

      {/* System Actions */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
        <h3 className="text-white text-lg font-semibold mb-4">System Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onExportLogs}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors"
          >
            📥 Export Logs
          </button>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg transition-colors">
            🔄 Clear Cache
          </button>
          <button className="bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors">
            🚨 Emergency Stop
          </button>
        </div>
      </div>
    </div>
  );
}