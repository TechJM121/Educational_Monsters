// Tests for ParentTeacherDashboard component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ParentTeacherDashboard } from '../ParentTeacherDashboard';
import { ParentTeacherService } from '../../../services/parentTeacherService';

// Mock the service
jest.mock('../../../services/parentTeacherService');

// Mock child components
jest.mock('../DashboardOverview', () => ({
  DashboardOverview: ({ stats, recentAlerts, onViewAllAlerts }: any) => (
    <div data-testid="dashboard-overview">
      <div>Total Students: {stats.totalStudents}</div>
      <div>Active Today: {stats.activeToday}</div>
      <div>Alerts: {recentAlerts.length}</div>
      <button onClick={onViewAllAlerts}>View All Alerts</button>
    </div>
  )
}));

jest.mock('../StudentProgressCard', () => ({
  StudentProgressCard: ({ student, onGenerateReport }: any) => (
    <div data-testid={`student-card-${student.studentId}`}>
      <div>{student.studentName}</div>
      <div>Level: {student.level}</div>
      <button onClick={onGenerateReport}>Generate Report</button>
    </div>
  )
}));

jest.mock('../AlertsPanel', () => ({
  AlertsPanel: ({ alerts, onAcknowledgeAlert, onRefresh }: any) => (
    <div data-testid="alerts-panel">
      <div>Alerts Count: {alerts.length}</div>
      {alerts.map((alert: any) => (
        <div key={alert.id}>
          <span>{alert.message}</span>
          <button onClick={() => onAcknowledgeAlert(alert.id)}>Acknowledge</button>
        </div>
      ))}
      <button onClick={onRefresh}>Refresh</button>
    </div>
  )
}));

jest.mock('../ProgressReportGenerator', () => ({
  ProgressReportGenerator: ({ students, parentTeacherId }: any) => (
    <div data-testid="progress-reports">
      <div>Students: {students.length}</div>
      <div>Parent ID: {parentTeacherId}</div>
    </div>
  )
}));

jest.mock('../ParentalControlsPanel', () => ({
  ParentalControlsPanel: ({ students, parentTeacherId, role }: any) => (
    <div data-testid="parental-controls">
      <div>Students: {students.length}</div>
      <div>Role: {role}</div>
    </div>
  )
}));

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
  },
  {
    studentId: 'student-2',
    studentName: 'Bob Smith',
    characterName: 'Knight Bob',
    level: 3,
    totalXP: 300,
    currentStreak: 1,
    lastActive: '2024-01-01T09:00:00Z',
    stats: {
      intelligence: 8,
      vitality: 15,
      wisdom: 7,
      charisma: 12,
      dexterity: 10,
      creativity: 6
    },
    achievements: [],
    recentActivity: []
  }
];

const mockDashboardStats = {
  totalStudents: 2,
  activeToday: 1,
  averageLevel: 4,
  totalXPEarned: 800,
  achievementsEarned: 5,
  alertsCount: 2,
  weeklyProgress: [
    { date: '2024-01-01', activeStudents: 2, xpEarned: 100, timeSpent: 60 },
    { date: '2024-01-02', activeStudents: 1, xpEarned: 50, timeSpent: 30 }
  ]
};

const mockAlerts = [
  {
    id: 'alert-1',
    studentId: 'student-1',
    alertType: 'low_accuracy' as const,
    severity: 'medium' as const,
    message: 'Alice has low accuracy in Mathematics',
    subject: 'Mathematics',
    data: { accuracy: 45 },
    acknowledged: false,
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'alert-2',
    studentId: 'student-2',
    alertType: 'inactive' as const,
    severity: 'low' as const,
    message: 'Bob has been inactive for 3 days',
    data: { daysSinceLastActivity: 3 },
    acknowledged: false,
    createdAt: '2024-01-01T09:00:00Z'
  }
];

describe('ParentTeacherDashboard', () => {
  const mockParentTeacherService = ParentTeacherService as jest.Mocked<typeof ParentTeacherService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockParentTeacherService.getLinkedStudents.mockResolvedValue(mockStudents);
    mockParentTeacherService.getDashboardStats.mockResolvedValue(mockDashboardStats);
    mockParentTeacherService.getStudentAlerts.mockResolvedValue(mockAlerts);
    mockParentTeacherService.acknowledgeAlert.mockResolvedValue();
  });

  it('should render loading state initially', () => {
    render(<ParentTeacherDashboard parentTeacherId="parent-123" role="parent" />);
    
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('should load and display dashboard data for parent', async () => {
    render(<ParentTeacherDashboard parentTeacherId="parent-123" role="parent" />);
    
    await waitFor(() => {
      expect(screen.getByText('Parent Dashboard')).toBeInTheDocument();
    });

    expect(mockParentTeacherService.getLinkedStudents).toHaveBeenCalledWith('parent-123');
    expect(mockParentTeacherService.getDashboardStats).toHaveBeenCalledWith('parent-123');
    expect(mockParentTeacherService.getStudentAlerts).toHaveBeenCalledWith('parent-123');
  });

  it('should load and display dashboard data for teacher', async () => {
    render(<ParentTeacherDashboard parentTeacherId="teacher-123" role="teacher" />);
    
    await waitFor(() => {
      expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument();
    });
  });

  it('should display overview tab by default', async () => {
    render(<ParentTeacherDashboard parentTeacherId="parent-123" role="parent" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-overview')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Students: 2')).toBeInTheDocument();
    expect(screen.getByText('Active Today: 1')).toBeInTheDocument();
  });

  it('should switch to students tab when clicked', async () => {
    render(<ParentTeacherDashboard parentTeacherId="parent-123" role="parent" />);
    
    await waitFor(() => {
      expect(screen.getByText('Parent Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Students'));

    expect(screen.getByTestId('student-card-student-1')).toBeInTheDocument();
    expect(screen.getByTestId('student-card-student-2')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
  });

  it('should switch to alerts tab and show alert count', async () => {
    render(<ParentTeacherDashboard parentTeacherId="parent-123" role="parent" />);
    
    await waitFor(() => {
      expect(screen.getByText('Parent Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Alerts (2)')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Alerts (2)'));

    expect(screen.getByTestId('alerts-panel')).toBeInTheDocument();
    expect(screen.getByText('Alerts Count: 2')).toBeInTheDocument();
  });

  it('should handle alert acknowledgment', async () => {
    render(<ParentTeacherDashboard parentTeacherId="parent-123" role="parent" />);
    
    await waitFor(() => {
      expect(screen.getByText('Parent Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Alerts (2)'));

    const acknowledgeButtons = screen.getAllByText('Acknowledge');
    fireEvent.click(acknowledgeButtons[0]);

    await waitFor(() => {
      expect(mockParentTeacherService.acknowledgeAlert).toHaveBeenCalledWith('alert-1');
    });
  });

  it('should switch to reports tab', async () => {
    render(<ParentTeacherDashboard parentTeacherId="parent-123" role="parent" />);
    
    await waitFor(() => {
      expect(screen.getByText('Parent Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Reports'));

    expect(screen.getByTestId('progress-reports')).toBeInTheDocument();
    expect(screen.getByText('Students: 2')).toBeInTheDocument();
    expect(screen.getByText('Parent ID: parent-123')).toBeInTheDocument();
  });

  it('should switch to controls tab', async () => {
    render(<ParentTeacherDashboard parentTeacherId="parent-123" role="parent" />);
    
    await waitFor(() => {
      expect(screen.getByText('Parent Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Controls'));

    expect(screen.getByTestId('parental-controls')).toBeInTheDocument();
    expect(screen.getByText('Students: 2')).toBeInTheDocument();
    expect(screen.getByText('Role: parent')).toBeInTheDocument();
  });

  it('should handle refresh data', async () => {
    render(<ParentTeacherDashboard parentTeacherId="parent-123" role="parent" />);
    
    await waitFor(() => {
      expect(screen.getByText('Parent Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Students'));
    fireEvent.click(screen.getByText('Refresh Data'));

    await waitFor(() => {
      expect(mockParentTeacherService.getLinkedStudents).toHaveBeenCalledTimes(2);
      expect(mockParentTeacherService.getDashboardStats).toHaveBeenCalledTimes(2);
      expect(mockParentTeacherService.getStudentAlerts).toHaveBeenCalledTimes(2);
    });
  });

  it('should display error state when data loading fails', async () => {
    mockParentTeacherService.getLinkedStudents.mockRejectedValue(new Error('Network error'));

    render(<ParentTeacherDashboard parentTeacherId="parent-123" role="parent" />);
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load dashboard data. Please try again.')).toBeInTheDocument();
    });

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should handle retry after error', async () => {
    mockParentTeacherService.getLinkedStudents
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockStudents);

    render(<ParentTeacherDashboard parentTeacherId="parent-123" role="parent" />);
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Try Again'));

    await waitFor(() => {
      expect(screen.getByText('Parent Dashboard')).toBeInTheDocument();
    });
  });

  it('should display message when no students are linked', async () => {
    mockParentTeacherService.getLinkedStudents.mockResolvedValue([]);
    mockParentTeacherService.getDashboardStats.mockResolvedValue({
      ...mockDashboardStats,
      totalStudents: 0
    });

    render(<ParentTeacherDashboard parentTeacherId="parent-123" role="parent" />);
    
    await waitFor(() => {
      expect(screen.getByText('Parent Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Students'));

    expect(screen.getByText('No students linked to your account yet.')).toBeInTheDocument();
    expect(screen.getByText(/Students can link their accounts using your parent ID: parent-123/)).toBeInTheDocument();
  });

  it('should navigate from overview to alerts when clicking view all alerts', async () => {
    render(<ParentTeacherDashboard parentTeacherId="parent-123" role="parent" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-overview')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View All Alerts'));

    expect(screen.getByTestId('alerts-panel')).toBeInTheDocument();
  });
});