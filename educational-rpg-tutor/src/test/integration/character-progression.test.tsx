import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockCharacter, createMockQuestion } from '../utils';
import { App } from '../../App';

// Mock services
vi.mock('../../services/supabaseClient');
vi.mock('../../services/characterService');
vi.mock('../../services/questionService');

describe('Character Progression Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock authenticated user
    vi.mocked(require('../../services/supabaseClient').supabase.auth.getUser)
      .mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      });
  });

  it('completes full learning journey: question → XP → level up', async () => {
    const mockCharacter = createMockCharacter({ currentXP: 90, level: 1 });
    const mockQuestion = createMockQuestion({ xpReward: 15 });
    
    // Mock character service responses
    vi.mocked(require('../../services/characterService').getCharacter)
      .mockResolvedValue(mockCharacter);
    
    vi.mocked(require('../../services/questionService').getRandomQuestion)
      .mockResolvedValue(mockQuestion);
    
    renderWithProviders(<App />);
    
    // Wait for character to load
    await waitFor(() => {
      expect(screen.getByText('Test Hero')).toBeInTheDocument();
    });
    
    // Start a learning session
    const startLearningButton = screen.getByText('Start Learning');
    fireEvent.click(startLearningButton);
    
    // Answer question correctly
    await waitFor(() => {
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });
    
    const correctAnswer = screen.getByText('4');
    fireEvent.click(correctAnswer);
    
    // Verify XP award animation
    await waitFor(() => {
      expect(screen.getByText('+15 XP')).toBeInTheDocument();
    });
    
    // Verify level up occurs
    await waitFor(() => {
      expect(screen.getByText('Level Up!')).toBeInTheDocument();
      expect(screen.getByText('Level 2')).toBeInTheDocument();
    });
  });

  it('handles stat allocation after level up', async () => {
    const mockCharacter = createMockCharacter({ 
      level: 2, 
      stats: { ...createMockCharacter().stats, availablePoints: 3 }
    });
    
    vi.mocked(require('../../services/characterService').getCharacter)
      .mockResolvedValue(mockCharacter);
    
    renderWithProviders(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Available Points: 3')).toBeInTheDocument();
    });
    
    // Allocate points to intelligence
    const intelligenceButton = screen.getByTestId('allocate-intelligence');
    fireEvent.click(intelligenceButton);
    fireEvent.click(intelligenceButton);
    
    // Verify stat increase
    await waitFor(() => {
      expect(screen.getByText('Intelligence: 12')).toBeInTheDocument();
      expect(screen.getByText('Available Points: 1')).toBeInTheDocument();
    });
  });

  it('tracks achievement progress across multiple questions', async () => {
    const mockCharacter = createMockCharacter();
    const mathQuestions = [
      createMockQuestion({ subjectId: 'mathematics', questionText: 'What is 1+1?' }),
      createMockQuestion({ subjectId: 'mathematics', questionText: 'What is 2+2?' }),
      createMockQuestion({ subjectId: 'mathematics', questionText: 'What is 3+3?' }),
    ];
    
    vi.mocked(require('../../services/characterService').getCharacter)
      .mockResolvedValue(mockCharacter);
    
    vi.mocked(require('../../services/questionService').getRandomQuestion)
      .mockResolvedValueOnce(mathQuestions[0])
      .mockResolvedValueOnce(mathQuestions[1])
      .mockResolvedValueOnce(mathQuestions[2]);
    
    renderWithProviders(<App />);
    
    // Answer three math questions
    for (let i = 0; i < 3; i++) {
      const startButton = screen.getByText('Start Learning');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^[0-9]/ })).toBeInTheDocument();
      });
      
      // Click first answer option (assuming it's correct for test)
      const firstAnswer = screen.getAllByRole('button')[0];
      fireEvent.click(firstAnswer);
      
      await waitFor(() => {
        expect(screen.getByText(/XP/)).toBeInTheDocument();
      });
    }
    
    // Check for math achievement
    await waitFor(() => {
      expect(screen.getByText('Math Novice')).toBeInTheDocument();
    });
  });

  it('syncs data with Supabase in real-time', async () => {
    const mockCharacter = createMockCharacter();
    
    vi.mocked(require('../../services/characterService').getCharacter)
      .mockResolvedValue(mockCharacter);
    
    // Mock real-time subscription
    const mockSubscription = {
      unsubscribe: vi.fn(),
    };
    
    vi.mocked(require('../../services/supabaseClient').supabase.channel)
      .mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue(mockSubscription),
        unsubscribe: vi.fn(),
      });
    
    renderWithProviders(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Hero')).toBeInTheDocument();
    });
    
    // Verify real-time subscription was set up
    expect(require('../../services/supabaseClient').supabase.channel)
      .toHaveBeenCalledWith('character-updates');
  });
});