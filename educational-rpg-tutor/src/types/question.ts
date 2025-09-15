export interface Question {
  id: string;
  subjectId: string;
  questionText: string;
  answerOptions: string[];
  correctAnswer: string;
  difficultyLevel: number;
  xpReward: number;
  ageRange: string;
  createdAt: Date;
}

export interface QuestionResponse {
  id: string;
  questionId: string;
  userId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  xpEarned: number;
  timeSpent: number;
  answeredAt: Date;
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

import type { CharacterStats } from './character';