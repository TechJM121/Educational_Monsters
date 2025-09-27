import type { CharacterStats } from './character';

export interface Question {
  id: string;
  subject_id: string;
  question_text: string;
  answer_options: string[];
  correct_answer: string;
  difficulty_level: number;
  xp_reward: number;
  age_range: string;
  created_at?: Date | string;
  updated_at?: Date | string;
  hint?: string;
  explanation?: string;
  subjects?: {
    id?: string;
    name: string;
    description?: string;
    primary_stat: string;
    secondary_stat: string;
  };
}

export interface QuestionResponse {
  id: string;
  question_id: string;
  user_id: string;
  selected_answer: string;
  is_correct: boolean;
  xp_earned: number;
  response_time_seconds?: number;
  created_at: Date | string;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  statMapping: {
    primary: keyof CharacterStats;
    secondary: keyof CharacterStats;
  };
}

export interface LearningSessionConfig {
  questionsPerSession: number;
  timeLimit?: number; // in seconds
  adaptiveDifficulty: boolean;
  showProgress: boolean;
  enableHints: boolean;
}

export interface SessionAnalytics {
  sessionId: string;
  userId: string;
  subjectId?: string;
  startTime: Date;
  endTime?: Date;
  totalQuestions: number;
  correctAnswers: number;
  totalXPEarned: number;
  averageResponseTime: number;
  accuracy: number;
  difficultyProgression: number[];
  timeSpentPerQuestion: number[];
  streakBonuses: number;
}

export interface AdaptiveDifficultyState {
  currentDifficulty: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  performanceHistory: boolean[];
  adjustmentThreshold: number;
}