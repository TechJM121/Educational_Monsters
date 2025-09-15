// Parent/Teacher dashboard types for the Educational RPG Tutor

export interface ParentTeacher {
  id: string;
  email: string;
  name: string;
  role: 'parent' | 'teacher';
  linkedStudents: string[]; // Array of student user IDs
  createdAt: string;
  updatedAt: string;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  characterName: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  lastActive: string;
  stats: {
    intelligence: number;
    vitality: number;
    wisdom: number;
    charisma: number;
    dexterity: number;
    creativity: number;
  };
  achievements: Achievement[];
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  studentId: string;
  activityType: 'lesson_completed' | 'question_answered' | 'achievement_earned' | 'level_up' | 'login' | 'logout';
  subject?: string;
  xpEarned?: number;
  timeSpent?: number; // in minutes
  accuracy?: number; // percentage
  details: string;
  timestamp: string;
}

export interface ProgressReport {
  id: string;
  studentId: string;
  generatedBy: string; // parent/teacher ID
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalTimeSpent: number; // in minutes
    totalXPEarned: number;
    levelsGained: number;
    achievementsEarned: number;
    averageAccuracy: number;
    subjectsStudied: string[];
    strongestSubjects: string[];
    strugglingSubjects: string[];
  };
  recommendations: string[];
  generatedAt: string;
}

export interface StudentAlert {
  id: string;
  studentId: string;
  alertType: 'low_accuracy' | 'inactive' | 'struggling_subject' | 'excessive_screen_time';
  severity: 'low' | 'medium' | 'high';
  message: string;
  subject?: string;
  data: Record<string, any>;
  acknowledged: boolean;
  createdAt: string;
}

export interface ParentalControls {
  id: string;
  studentId: string;
  parentId: string;
  settings: {
    socialFeaturesEnabled: boolean;
    tradingEnabled: boolean;
    leaderboardVisible: boolean;
    friendRequestsEnabled: boolean;
    maxDailyScreenTime: number; // in minutes
    allowedPlayTimes: {
      start: string; // HH:MM format
      end: string; // HH:MM format
    }[];
    contentFilters: {
      maxDifficultyLevel: number;
      blockedSubjects: string[];
    };
  };
  updatedAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeToday: number;
  averageLevel: number;
  totalXPEarned: number;
  achievementsEarned: number;
  alertsCount: number;
  weeklyProgress: {
    date: string;
    activeStudents: number;
    xpEarned: number;
    timeSpent: number;
  }[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  badgeIcon: string;
  earnedAt: string;
}