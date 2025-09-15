// Tests for useParentTeacherDashboard hook
import { renderHook, act, waitFor } from '@testing-library/react';
import { useParentTeacherDashboard } from '../useParentTeacherDashboard';
import { ParentTeacherService } from '../../services/parentTeacherService';

// Mock the service
jest.mock('../../services/parentTeacherService');

const mockStudents = [
  {
    studentId: 'student-1',
    studentName: 'Alice Johnson',
    characterName: 'Wizard Alice',
    level: 5,
    totalXP: 500,
    currentStreak: 3,
    lastActive: '2024-01-01T10:00:00Z',
    stats: {
      intelligence: 15,
      vitality: 12,
      wisdom: 10,
      charisma: 8,
      dexterity: 11,
      creativity: 9
    },
    achievements: [],
    recentActivity: []
  }
];

const mockDashboardStats = {
  totalStudents: 1,
  activeToday: 1,
  averageLevel: 5,
  totalXPEarned: 500,
  achievementsEarned: 3,
  alertsCount: 1,
  weeklyProgress: []
};

const mockAlerts = [
  {
    id: 'alert-1',
    studentId: 'student-1',
    alertType: 'low_accuracy' as const,
    severity: 'high' as const,
    message: 'Student struggling with mathematics',
    subject: 'Mathematics',
    data: { accuracy: 45 },
    acknowledged: false,
    createdAt: '2024-01-01T10:00:00Z'
  }
];

const mockProgressReport = {
  id: 'report-1',
  studentId: 'student-1',
  generatedBy: 'parent-123',
  reportPeriod: {
    startDate: '2024-01-01',
    endDate: '2024-01-07'
  },
  summary: {
    totalTimeSpent: 120,
    totalXPEarned: 500,
    levelsGained: 2,
    achievementsEarned: 3,
    averageAccuracy: 85,
    subjectsStudied: ['Mathematics', 'Science'],
    strongestSubjects: ['Science'],
    strugglingSubjects: ['Mathematics']
  },
  recommendations: ['Focus on math fundamentals'],
  generatedAt: '2024-01-08T10:00:00Z'
};

const mockParentalControls = {
  id: 'controls-1',
  studentId: 'student-1',
  parentId: 'parent-123',
  settings: {
    socialFeaturesEnabled: true,
    tradingEnabled: false,
    leaderboardVisible: true,
    friendRequestsEnabled: true,
    maxDailyScreenTime: 120,
    allowedPlayTimes: [{ start: '16:00', end: '19:00' }],
    contentFilters: {
      maxDifficultyLevel: 5,
      blockedSubjects: []
    }
  },
  updatedAt: '2024-01-01T10:00:00Z'
};

describe('useParentTeacherDashboard', () => {
  const mockParentTeacherService = ParentTeacherService as jest.Mocked<typeof ParentTeacherService>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockParentTeacherService.getLinkedStudents.mockResolvedValue(mockStudents);
    mockParentTeacherService.getDashboardStats.mockResolvedValue(mockDashboardStats);
    mockParentTeacherService.getStudentAlerts.mockResolvedValue(mockAlerts);
    mockParentTeacherService.acknowledgeAlert.mockResolvedValue();
    mockParentTeacherService.linkStudent.mockResolvedValue();
    mockParentTeacherService.generateProgressReport.mockResolvedValue(mockProgressReport);
    mockParentTeacherService.updateParentalControls.mockResolvedValue();
    mockParentTeacherService.getParentalControls.mockResolvedValue(mockParentalControls);
    mockParentTeacherService.createAlert.mockResolvedValue();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => 
      useParentTeacherDashboard({ parentTeacherId: 'parent-123' })
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.students).toEqual([]);
    expect(result.current.dashboardStats).toBeNull();
    expect(result.current.alerts).toEqual([]);
  });

  it('should load dashboard data on mount', async () => {
    const { result } = renderHook(() => 
      useParentTeacherDashboard({ parentTeacherId: 'parent-123' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.students).toEqual(mockStudents);
    expect(result.current.dashboardStats).toEqual(mockDashboardStats);
    expect(result.current.alerts).toEqual(mockAlerts);
    expect(result.current.lastRefresh).toBeInstanceOf(Date);

    expect(mockParentTeacherService.getLinkedStudents).toHaveBeenCalledWith('parent-123');
    expect(mockParentTeacherService.getDashboardStats).toHaveBeenCalledWith('parent-123');
    expect(result.current.getStudentAlerts).toHaveBeenCalledWith('parent-123');
  });

  it('should handle loading errors', async () => {
    mockParentTeacherService.getLinkedStudents.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => 
      useParentTeacherDashboard({ parentTeacherId: 'parent-123' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load dashboard data. Please try again.');
    expect(result.current.students).toEqual([]);
  });

  it('should calculate derived state correctly', async () => {
    const { result } = renderHook(() => 
      useParentTeacherDashboard({ parentTeacherId: 'parent-123' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.totalStudents).toBe(1);
    expect(result.current.activeStudentsToday).toBe(1);
    expect(result.current.averageLevel).toBe(5);
    expect(result.current.highPriorityAlerts).toEqual([mockAlerts[0]]);
  });

  it('should acknowledge alerts', async () => {
    const { result } = renderHook(() => 
      useParentTeacherDashboard({ parentTeacherId: 'parent-123' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.acknowledgeAlert('alert-1');
    });

    expect(mockParentTeacherService.acknowledgeAlert).toHaveBeenCalledWith('alert-1');
    expect(result.current.alerts).toEqual([]);
  });

  it('should link new students', async () => {
    const { result } = renderHook(() => 
      useParentTeacherDashboard({ parentTeacherId: 'parent-123' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.linkStudent('student-2');
    });

    expect(mockParentTeacherService.linkStudent).toHaveBeenCalledWith('parent-123', 'student-2');
    expect(mockParentTeacherService.getLinkedStudents).toHaveBeenCalledTimes(2); // Initial load + refresh
  });

  it('should generate progress reports', async () => {
    const { result } = renderHook(() => 
      useParentTeacherDashboard({ parentTeacherId: 'parent-123' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let report;
    await act(async () => {
      report = await result.current.generateProgressReport(
        'student-1',
        '2024-01-01',
        '2024-01-07'
      );
    });

    expect(report).toEqual(mockProgressReport);
    expect(mockParentTeacherService.generateProgressReport).toHaveBeenCalledWith(
      'student-1',
      'parent-123',
      '2024-01-01',
      '2024-01-07'
    );
  });

  it('should update parental controls', async () => {
    const { result } = renderHook(() => 
      useParentTeacherDashboard({ parentTeacherId: 'parent-123' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newSettings = {
      ...mockParentalControls.settings,
      maxDailyScreenTime: 90
    };

    await act(async () => {
      await result.current.updateParentalControls('student-1', newSettings);
    });

    expect(mockParentTeacherService.updateParentalControls).toHaveBeenCalledWith(
      'student-1',
      'parent-123',
      newSettings
    );
  });

  it('should get parental controls', async () => {
    const { result } = renderHook(() => 
      useParentTeacherDashboard({ parentTeacherId: 'parent-123' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let controls;
    await act(async () => {
      controls = await result.current.getParentalControls('student-1');
    });

    expect(controls).toEqual(mockParentalControls);
    expect(mockParentTeacherService.getParentalControls).toHaveBeenCalledWith('student-1');
  });

  it('should create alerts', async () => {
    const { result } = renderHook(() => 
      useParentTeacherDashboard({ parentTeacherId: 'parent-123' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createAlert(
        'student-1',
        'low_accuracy',
        'medium',
        'Student needs help with math',
        'Mathematics',
        { accuracy: 45 }
      );
    });

    expect(mockParentTeacherService.createAlert).toHaveBeenCalledWith({
      studentId: 'student-1',
      alertType: 'low_accuracy',
      severity: 'medium',
      message: 'Student needs help with math',
      subject: 'Mathematics',
      data: { accuracy: 45 }
    });

    expect(mockParentTeacherService.getStudentAlerts).toHaveBeenCalledTimes(2); // Initial load + refresh
  });

  it('should refresh individual data sections', async () => {
    const { result } = renderHook(() => 
      useParentTeacherDashboard({ parentTeacherId: 'parent-123' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refreshStudents();
    });

    expect(mockParentTeacherService.getLinkedStudents).toHaveBeenCalledTimes(2);

    await act(async () => {
      await result.current.refreshAlerts();
    });

    expect(mockParentTeacherService.getStudentAlerts).toHaveBeenCalledTimes(2);
  });

  it('should clear errors', async () => {
    mockParentTeacherService.getLinkedStudents.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => 
      useParentTeacherDashboard({ parentTeacherId: 'parent-123' })
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should auto-refresh data at specified intervals', async () => {
    const { result } = renderHook(() => 
      useParentTeacherDashboard({ 
        parentTeacherId: 'parent-123',
        autoRefreshInterval: 60000 // 1 minute
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Initial load
    expect(mockParentTeacherService.getLinkedStudents).toHaveBeenCalledTimes(1);

    // Fast-forward time by 1 minute
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    await waitFor(() => {
      expect(mockParentTeacherService.getLinkedStudents).toHaveBeenCalledTimes(2);
    });
  });

  it('should not auto-refresh when interval is not provided', async () => {
    const { result } = renderHook(() => 
      useParentTeacherDashboard({ 
        parentTeacherId: 'parent-123',
        autoRefreshInterval: 0
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Initial load
    expect(mockParentTeacherService.getLinkedStudents).toHaveBeenCalledTimes(1);

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(300000);
    });

    // Should not have called again
    expect(mockParentTeacherService.getLinkedStudents).toHaveBeenCalledTimes(1);
  });

  it('should handle empty student list correctly', async () => {
    mockParentTeacherService.getLinkedStudents.mockResolvedValue([]);
    mockParentTeacherService.getDashboardStats.mockResolvedValue({
      ...mockDashboardStats,
      totalStudents: 0,
      activeToday: 0
    });

    const { result } = renderHook(() => 
      useParentTeacherDashboard({ parentTeacherId: 'parent-123' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.totalStudents).toBe(0);
    expect(result.current.activeStudentsToday).toBe(0);
    expect(result.current.averageLevel).toBe(0);
    expect(result.current.students).toEqual([]);
  });
});