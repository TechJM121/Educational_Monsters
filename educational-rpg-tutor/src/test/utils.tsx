import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { Character, CharacterStats } from '../types/character';
import { Question } from '../types/question';
import { Achievement } from '../types/achievement';

// Mock data factories
export const createMockCharacter = (overrides: Partial<Character> = {}): Character => ({
  id: 'test-character-id',
  userId: 'test-user-id',
  name: 'Test Hero',
  level: 1,
  totalXP: 0,
  currentXP: 0,
  avatarConfig: {
    hairColor: '#8B4513',
    skinColor: '#FDBCB4',
    outfit: 'casual',
    accessories: [],
  },
  stats: {
    intelligence: 10,
    vitality: 10,
    wisdom: 10,
    charisma: 10,
    dexterity: 10,
    creativity: 10,
    availablePoints: 0,
  },
  specialization: undefined,
  equippedItems: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: 'test-question-id',
  subjectId: 'mathematics',
  questionText: 'What is 2 + 2?',
  answerOptions: ['3', '4', '5', '6'],
  correctAnswer: '4',
  difficultyLevel: 1,
  xpReward: 10,
  ageRange: '6-8',
  createdAt: new Date(),
  ...overrides,
});

export const createMockAchievement = (overrides: Partial<Achievement> = {}): Achievement => ({
  id: 'test-achievement-id',
  name: 'First Steps',
  description: 'Complete your first lesson',
  badgeIcon: '🏆',
  unlockCriteria: 'complete_lesson',
  rarityLevel: 1,
  category: 'learning',
  createdAt: new Date(),
  ...overrides,
});

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialCharacter?: Character;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialCharacter, ...renderOptions } = options;

  // Mock context providers if needed
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="test-wrapper">{children}</div>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Accessibility testing helper
export const axeConfig = {
  rules: {
    // Disable color-contrast rule for tests (can be flaky)
    'color-contrast': { enabled: false },
  },
};

// Performance testing helpers
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

// Mock user interactions
export const createMockUser = () => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  age: 10,
  createdAt: new Date(),
});

// Database operation mocks
export const mockSupabaseResponse = <T,>(data: T, error: any = null) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK',
});

// Animation testing helpers
export const waitForAnimations = () => new Promise(resolve => setTimeout(resolve, 100));

// Local storage mock
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

// Network request mocks
export const mockFetch = (response: any, ok = true) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response)),
  });
};