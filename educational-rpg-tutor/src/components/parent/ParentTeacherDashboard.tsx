// Parent/Teacher Dashboard - Main monitoring interface
import React, { useState, useEffect, useCallback } from 'react';
import { ParentTeacherService } from '../../services/parentTeacherService';
import type { StudentProgress, DashboardStats, StudentAlert } from '../../types/parent';
import { StudentProgressCard } from './StudentProgressCard';
import { DashboardOverview } from './DashboardOverview';
import { AlertsPanel } from './AlertsPanel';
import { ProgressReportGenerator } from './ProgressReportGenerator';
import { ParentalControlsPanel } from './ParentalControlsPanel';

interface ParentTeacherDashboardProps {
  parentTeacherId: string;
  role: 'parent' | 'teacher';
}

export const ParentTeacherDashboard: React.FC<ParentTeacherDashboardProps> = ({
  parentTeacherId,
  role
}) => {
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<StudentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'alerts' | 'reports' | 'controls'>('overview');

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [studentsData, statsData, alertsData] = await Promise.all([
        ParentTeacherService.getLinkedStudents(parentTeacherId),
        ParentTeacherService.getDashboardStats(parentTeacherId),
        ParentTeacherService.getStudentAlerts(parentTeacherId)
      ]);

      setStudents(studentsData);
      setDashboardStats(statsData);
      setAlerts(alertsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [parentTeacherId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await ParentTeacherService.acknowledgeAlert(alertId);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            <span className="ml-4 text-white text-lg">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-600 text-white p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
            <button
              onClick={loadDashboardData}
              className="mt-4 bg-red-700 hover:bg-red-800 px-4 py-2 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {role === 'parent' ? 'Parent' : 'Teacher'} Dashboard
          </h1>
          <p className="text-blue-200">
            Monitor student progress and manage learning activities
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-black/20 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'students', label: 'Students', icon: '👥' },
              { id: 'alerts', label: `Alerts ${alerts.length > 0 ? `(${alerts.length})` : ''}`, icon: '🚨' },
              { id: 'reports', label: 'Reports', icon: '📈' },
              { id: 'controls', label: 'Controls', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-yellow-500 text-black'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && dashboardStats && (
            <DashboardOverview 
              stats={dashboardStats} 
              recentAlerts={alerts.slice(0, 3)}
              onViewAllAlerts={() => setActiveTab('alerts')}
            />
          )}

          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Student Progress</h2>
                <button
                  onClick={loadDashboardData}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Refresh Data
                </button>
              </div>
              
              {students.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
                  <p className="text-white text-lg">No students linked to your account yet.</p>
                  <p className="text-blue-200 mt-2">
                    Students can link their accounts using your {role} ID: {parentTeacherId}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {students.map((student) => (
                    <StudentProgressCard
                      key={student.studentId}
                      student={student}
                      onGenerateReport={() => setActiveTab('reports')}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
            <AlertsPanel
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onRefresh={loadDashboardData}
            />
          )}

          {activeTab === 'reports' && (
            <ProgressReportGenerator
              students={students}
              parentTeacherId={parentTeacherId}
            />
          )}

          {activeTab === 'controls' && (
            <ParentalControlsPanel
              students={students}
              parentTeacherId={parentTeacherId}
              role={role}
            />
          )}
        </div>
      </div>
    </div>
  );
};