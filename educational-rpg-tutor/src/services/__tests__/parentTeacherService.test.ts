// Tests for ParentTeacherService
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ParentTeacherService } from '../parentTeacherService';
import { supabase } from '../supabaseClient';

// Mock Supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          in: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn()
            }))
          })),
          gte: vi.fn(() => ({
            lte: vi.fn()
          })),
          filter: vi.fn()
        })),
        in: vi.fn(() => ({
          eq: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn()
      })),
      upsert: vi.fn()
    }))
  }
}));

describe('ParentTeacherService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createParentTeacherAccount', () => {
    it('should create a new parent account successfully', async () => {
      const mockParentData = {
        id: 'parent-123',
        email: 'parent@example.com',
        name: 'John Parent',
        role: 'parent',
        linked_students: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const mockSupabaseChain = {
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: mockParentData, error: null })
        }))
      };

      (supabase.from as any).mockReturnValue({
        insert: vi.fn(() => mockSupabaseChain)
      });

      const result = await ParentTeacherService.createParentTeacherAccount(
        'parent@example.com',
        'John Parent',
        'parent'
      );

      expect(result).toEqual({
        id: 'parent-123',
        email: 'parent@example.com',
        name: 'John Parent',
        role: 'parent',
        linkedStudents: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      });

      expect(supabase.from).toHaveBeenCalledWith('parent_teachers');
    });

    it('should create a new teacher account successfully', async () => {
      const mockTeacherData = {
        id: 'teacher-123',
        email: 'teacher@example.com',
        name: 'Jane Teacher',
        role: 'teacher',
        linked_students: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const mockSupabaseChain = {
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: mockTeacherData, error: null })
        }))
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn(() => mockSupabaseChain)
      });

      const result = await ParentTeacherService.createParentTeacherAccount(
        'teacher@example.com',
        'Jane Teacher',
        'teacher'
      );

      expect(result.role).toBe('teacher');
      expect(result.name).toBe('Jane Teacher');
    });

    it('should handle database errors', async () => {
      const mockSupabaseChain = {
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ 
            data: null, 
            error: { message: 'Database error' } 
          })
        }))
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn(() => mockSupabaseChain)
      });

      await expect(
        ParentTeacherService.createParentTeacherAccount(
          'parent@example.com',
          'John Parent',
          'parent'
        )
      ).rejects.toThrow();
    });
  });

  describe('linkStudent', () => {
    it('should link a student to parent/teacher successfully', async () => {
      const mockParentTeacher = {
        linked_students: ['student-1']
      };

      const mockSelectChain = {
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ 
            data: mockParentTeacher, 
            error: null 
          })
        }))
      };

      const mockUpdateChain = {
        eq: jest.fn().mockResolvedValue({ error: null })
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn(() => mockSelectChain)
        })
        .mockReturnValueOnce({
          update: jest.fn(() => mockUpdateChain)
        })
        .mockReturnValueOnce({
          update: jest.fn(() => mockUpdateChain)
        });

      await ParentTeacherService.linkStudent('parent-123', 'student-2');

      expect(supabase.from).toHaveBeenCalledWith('parent_teachers');
      expect(supabase.from).toHaveBeenCalledWith('users');
    });

    it('should not duplicate existing student links', async () => {
      const mockParentTeacher = {
        linked_students: ['student-1', 'student-2']
      };

      const mockSelectChain = {
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ 
            data: mockParentTeacher, 
            error: null 
          })
        }))
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => mockSelectChain)
      });

      await ParentTeacherService.linkStudent('parent-123', 'student-2');

      // Should not call update if student is already linked
      expect(supabase.from).toHaveBeenCalledTimes(1);
    });
  });

  describe('logActivity', () => {
    it('should log student activity successfully', async () => {
      const mockInsertChain = {
        error: null
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue(mockInsertChain)
      });

      const activityData = {
        studentId: 'student-123',
        activityType: 'lesson_completed' as const,
        subject: 'Mathematics',
        xpEarned: 50,
        timeSpent: 15,
        accuracy: 85,
        details: 'Completed algebra lesson'
      };

      await ParentTeacherService.logActivity(activityData);

      expect(supabase.from).toHaveBeenCalledWith('activity_logs');
    });

    it('should handle activity logging errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({ 
          error: { message: 'Insert failed' } 
        })
      });

      const activityData = {
        studentId: 'student-123',
        activityType: 'lesson_completed' as const,
        details: 'Test activity'
      };

      await expect(
        ParentTeacherService.logActivity(activityData)
      ).rejects.toThrow();
    });
  });

  describe('generateProgressReport', () => {
    it('should generate a comprehensive progress report', async () => {
      const mockActivities = [
        {
          id: 'activity-1',
          student_id: 'student-123',
          activity_type: 'lesson_completed',
          subject: 'Mathematics',
          xp_earned: 50,
          time_spent: 15,
          accuracy: 85,
          details: 'Completed algebra lesson',
          timestamp: '2024-01-01T10:00:00Z'
        },
        {
          id: 'activity-2',
          student_id: 'student-123',
          activity_type: 'achievement_earned',
          subject: 'Mathematics',
          xp_earned: 25,
          time_spent: 0,
          accuracy: null,
          details: 'Earned Math Wizard badge',
          timestamp: '2024-01-01T10:15:00Z'
        }
      ];

      const mockSelectChain = {
        eq: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn().mockResolvedValue({ 
              data: mockActivities, 
              error: null 
            })
          }))
        }))
      };

      const mockInsertChain = {
        error: null
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn(() => mockSelectChain)
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue(mockInsertChain)
        });

      const report = await ParentTeacherService.generateProgressReport(
        'student-123',
        'parent-123',
        '2024-01-01',
        '2024-01-07'
      );

      expect(report).toMatchObject({
        studentId: 'student-123',
        generatedBy: 'parent-123',
        reportPeriod: {
          startDate: '2024-01-01',
          endDate: '2024-01-07'
        },
        summary: {
          totalTimeSpent: 15,
          totalXPEarned: 75,
          levelsGained: 0,
          achievementsEarned: 1,
          averageAccuracy: 85,
          subjectsStudied: ['Mathematics']
        }
      });

      expect(report.recommendations).toBeInstanceOf(Array);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle empty activity data', async () => {
      const mockSelectChain = {
        eq: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn().mockResolvedValue({ 
              data: [], 
              error: null 
            })
          }))
        }))
      };

      const mockInsertChain = {
        error: null
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn(() => mockSelectChain)
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue(mockInsertChain)
        });

      const report = await ParentTeacherService.generateProgressReport(
        'student-123',
        'parent-123',
        '2024-01-01',
        '2024-01-07'
      );

      expect(report.summary).toMatchObject({
        totalTimeSpent: 0,
        totalXPEarned: 0,
        levelsGained: 0,
        achievementsEarned: 0,
        averageAccuracy: 0,
        subjectsStudied: []
      });
    });
  });

  describe('createAlert', () => {
    it('should create student alert successfully', async () => {
      const mockInsertChain = {
        error: null
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue(mockInsertChain)
      });

      const alertData = {
        studentId: 'student-123',
        alertType: 'low_accuracy' as const,
        severity: 'medium' as const,
        message: 'Student accuracy below 60%',
        subject: 'Mathematics',
        data: { accuracy: 45 }
      };

      await ParentTeacherService.createAlert(alertData);

      expect(supabase.from).toHaveBeenCalledWith('student_alerts');
    });
  });

  describe('updateParentalControls', () => {
    it('should update parental controls successfully', async () => {
      const mockUpsertChain = {
        error: null
      };

      (supabase.from as jest.Mock).mockReturnValue({
        upsert: jest.fn().mockResolvedValue(mockUpsertChain)
      });

      const settings = {
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
      };

      await ParentTeacherService.updateParentalControls(
        'student-123',
        'parent-123',
        settings
      );

      expect(supabase.from).toHaveBeenCalledWith('parental_controls');
    });
  });

  describe('getDashboardStats', () => {
    it('should calculate dashboard statistics correctly', async () => {
      const mockParentTeacher = {
        linked_students: ['student-1', 'student-2']
      };

      const mockCharacters = [
        { level: 5, total_xp: 500 },
        { level: 3, total_xp: 300 }
      ];

      const mockTodayActivity = [
        { student_id: 'student-1' },
        { student_id: 'student-2' }
      ];

      const mockAchievements = [
        { id: 'achievement-1' },
        { id: 'achievement-2' },
        { id: 'achievement-3' }
      ];

      const mockAlerts = [
        { id: 'alert-1' }
      ];

      // Mock multiple database calls
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ 
                data: mockParentTeacher, 
                error: null 
              })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            in: jest.fn().mockResolvedValue({ 
              data: mockCharacters, 
              error: null 
            })
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            in: jest.fn(() => ({
              gte: jest.fn().mockResolvedValue({ 
                data: mockTodayActivity, 
                error: null 
              })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            in: jest.fn().mockResolvedValue({ 
              data: mockAchievements, 
              error: null 
            })
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            in: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({ 
                data: mockAlerts, 
                error: null 
              })
            }))
          }))
        });

      // Mock weekly progress calls
      for (let i = 0; i < 7; i++) {
        (supabase.from as jest.Mock).mockReturnValueOnce({
          select: jest.fn(() => ({
            in: jest.fn(() => ({
              gte: jest.fn(() => ({
                lt: jest.fn().mockResolvedValue({ 
                  data: [], 
                  error: null 
                })
              }))
            }))
          }))
        });
      }

      const stats = await ParentTeacherService.getDashboardStats('parent-123');

      expect(stats).toMatchObject({
        totalStudents: 2,
        activeToday: 2,
        averageLevel: 4,
        totalXPEarned: 800,
        achievementsEarned: 3,
        alertsCount: 1
      });

      expect(stats.weeklyProgress).toHaveLength(7);
    });

    it('should handle empty student list', async () => {
      const mockParentTeacher = {
        linked_students: []
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ 
              data: mockParentTeacher, 
              error: null 
            })
          }))
        }))
      });

      const stats = await ParentTeacherService.getDashboardStats('parent-123');

      expect(stats).toMatchObject({
        totalStudents: 0,
        activeToday: 0,
        averageLevel: 0,
        totalXPEarned: 0,
        achievementsEarned: 0,
        alertsCount: 0,
        weeklyProgress: []
      });
    });
  });
});