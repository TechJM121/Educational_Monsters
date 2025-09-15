// Hook for managing parent/teacher dashboard state and operations
import { useState, useEffect, useCallback } from 'react';
import { ParentTeacherService } from '../services/parentTeacherService';
import type { 
  StudentProgress, 
  DashboardStats, 
  StudentAlert, 
  ParentalControls 
} from '../types/parent';

interface UseParentTeacherDashboardProps {
  parentTeacherId: string;
  autoRefreshInterval?: number; // in milliseconds
}

export const useParentTeacherDashboard = ({
  parentTeacherId,
  autoRefreshInterval = 300000 // 5 minutes default
}: UseParentTeacherDashboardProps) => {
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<StudentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Load all dashboard data
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
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [parentTeacherId]);

  // Load only student progress data
  const refreshStudents = useCallback(async () => {
    try {
      const studentsData = await ParentTeacherService.getLinkedStudents(parentTeacherId);
      setStudents(studentsData);
    } catch (err) {
      console.error('Failed to refresh students:', err);
    }
  }, [parentTeacherId]);

  // Load only alerts data
  const refreshAlerts = useCallback(async () => {
    try {
      const alertsData = await ParentTeacherService.getStudentAlerts(parentTeacherId);
      setAlerts(alertsData);
    } catch (err) {
      console.error('Failed to refresh alerts:', err);
    }
  }, [parentTeacherId]);

  // Acknowledge an alert
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await ParentTeacherService.acknowledgeAlert(alertId);
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
      throw err;
    }
  }, []);

  // Link a new student
  const linkStudent = useCallback(async (studentId: string) => {
    try {
      await ParentTeacherService.linkStudent(parentTeacherId, studentId);
      await refreshStudents();
    } catch (err) {
      console.error('Failed to link student:', err);
      throw err;
    }
  }, [parentTeacherId, refreshStudents]);

  // Generate progress report
  const generateProgressReport = useCallback(async (
    studentId: string,
    startDate: string,
    endDate: string
  ) => {
    try {
      return await ParentTeacherService.generateProgressReport(
        studentId,
        parentTeacherId,
        startDate,
        endDate
      );
    } catch (err) {
      console.error('Failed to generate progress report:', err);
      throw err;
    }
  }, [parentTeacherId]);

  // Update parental controls
  const updateParentalControls = useCallback(async (
    studentId: string,
    settings: ParentalControls['settings']
  ) => {
    try {
      await ParentTeacherService.updateParentalControls(
        studentId,
        parentTeacherId,
        settings
      );
    } catch (err) {
      console.error('Failed to update parental controls:', err);
      throw err;
    }
  }, [parentTeacherId]);

  // Get parental controls for a student
  const getParentalControls = useCallback(async (studentId: string) => {
    try {
      return await ParentTeacherService.getParentalControls(studentId);
    } catch (err) {
      console.error('Failed to get parental controls:', err);
      throw err;
    }
  }, []);

  // Create alert for struggling student
  const createAlert = useCallback(async (
    studentId: string,
    alertType: StudentAlert['alertType'],
    severity: StudentAlert['severity'],
    message: string,
    subject?: string,
    data?: Record<string, any>
  ) => {
    try {
      await ParentTeacherService.createAlert({
        studentId,
        alertType,
        severity,
        message,
        subject,
        data: data || {}
      });
      await refreshAlerts();
    } catch (err) {
      console.error('Failed to create alert:', err);
      throw err;
    }
  }, [refreshAlerts]);

  // Auto-refresh data at specified intervals
  useEffect(() => {
    if (!autoRefreshInterval) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [loadDashboardData, autoRefreshInterval]);

  // Initial data load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived state
  const highPriorityAlerts = alerts.filter(alert => alert.severity === 'high');
  const activeStudentsToday = dashboardStats?.activeToday || 0;
  const totalStudents = students.length;
  const averageLevel = students.length > 0 
    ? students.reduce((sum, student) => sum + student.level, 0) / students.length 
    : 0;

  return {
    // Data
    students,
    dashboardStats,
    alerts,
    highPriorityAlerts,
    
    // State
    loading,
    error,
    lastRefresh,
    
    // Derived state
    activeStudentsToday,
    totalStudents,
    averageLevel,
    
    // Actions
    loadDashboardData,
    refreshStudents,
    refreshAlerts,
    acknowledgeAlert,
    linkStudent,
    generateProgressReport,
    updateParentalControls,
    getParentalControls,
    createAlert,
    
    // Utilities
    clearError: () => setError(null)
  };
};