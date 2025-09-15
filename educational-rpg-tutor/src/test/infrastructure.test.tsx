import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMockCharacter, createMockQuestion, createMockAchievement } from './utils';

describe('Testing Infrastructure', () => {
  it('should have vitest working correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have mock factories working', () => {
    const character = createMockCharacter();
    expect(character.id).toBe('test-character-id');
    expect(character.name).toBe('Test Hero');
    expect(character.level).toBe(1);

    const question = createMockQuestion();
    expect(question.id).toBe('test-question-id');
    expect(question.questionText).toBe('What is 2 + 2?');

    const achievement = createMockAchievement();
    expect(achievement.id).toBe('test-achievement-id');
    expect(achievement.name).toBe('First Steps');
  });

  it('should have vi mocking working', () => {
    const mockFn = vi.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('should have React Testing Library working', () => {
    const TestComponent = () => <div>Hello Testing</div>;
    render(<TestComponent />);
    expect(screen.getByText('Hello Testing')).toBeInTheDocument();
  });

  it('should have environment variables mocked', () => {
    expect(process.env.VITE_SUPABASE_URL).toBe('https://test.supabase.co');
    expect(process.env.VITE_SUPABASE_ANON_KEY).toBe('test-anon-key');
  });
});