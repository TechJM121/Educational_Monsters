import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AchievementCelebration } from '../AchievementCelebration';
import type { Achievement } from '../../../types/achievement';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, ...props }: any) => (
      <div onClick={onClick} {...props}>
        {children}
      </div>
    ),
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    )
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

const mockAchievement: Achievement = {
  id: '1',
  name: 'First Steps',
  description: 'Complete your first lesson',
  badgeIcon: '🏆',
  unlockCriteria: { type: 'lessons_completed', count: 1 },
  rarityLevel: 1,
  category: 'learning',
  createdAt: new Date('2024-01-01')
};

describe('AchievementCelebration', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not render when achievement is null', () => {
    render(
      <AchievementCelebration
        achievement={null}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Achievement Unlocked!')).not.toBeInTheDocument();
  });

  it('should render achievement celebration when achievement is provided', () => {
    render(
      <AchievementCelebration
        achievement={mockAchievement}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('🎉 Achievement Unlocked! 🎉')).toBeInTheDocument();
    expect(screen.getByText('First Steps')).toBeInTheDocument();
    expect(screen.getByText('Complete your first lesson')).toBeInTheDocument();
    expect(screen.getByText('Common Achievement')).toBeInTheDocument();
    expect(screen.getByText('Awesome!')).toBeInTheDocument();
  });

  it('should display correct rarity for different achievement levels', () => {
    const legendaryAchievement: Achievement = {
      ...mockAchievement,
      rarityLevel: 5
    };

    render(
      <AchievementCelebration
        achievement={legendaryAchievement}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Legendary Achievement')).toBeInTheDocument();
  });

  it('should call onClose when clicking the backdrop', () => {
    render(
      <AchievementCelebration
        achievement={mockAchievement}
        onClose={mockOnClose}
      />
    );

    const backdrop = screen.getByText('🎉 Achievement Unlocked! 🎉').closest('[class*="fixed"]');
    fireEvent.click(backdrop!);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking the close button', () => {
    render(
      <AchievementCelebration
        achievement={mockAchievement}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByText('Awesome!');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should auto-close after specified delay', () => {
    render(
      <AchievementCelebration
        achievement={mockAchievement}
        onClose={mockOnClose}
        autoCloseDelay={1000}
      />
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    // Fast-forward time
    vi.advanceTimersByTime(1000);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose if modal is closed before auto-close timer', () => {
    const { unmount } = render(
      <AchievementCelebration
        achievement={mockAchievement}
        onClose={mockOnClose}
        autoCloseDelay={1000}
      />
    );

    // Manually close before timer
    const closeButton = screen.getByText('Awesome!');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // Unmount to clean up timers
    unmount();

    // Clear the mock and advance time
    mockOnClose.mockClear();
    vi.advanceTimersByTime(1000);

    // Should not be called again
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should prevent event propagation when clicking modal content', () => {
    const mockBackdropClick = vi.fn();
    
    render(
      <div onClick={mockBackdropClick}>
        <AchievementCelebration
          achievement={mockAchievement}
          onClose={mockOnClose}
        />
      </div>
    );

    const modalContent = screen.getByText('First Steps').closest('[class*="bg-white"]');
    fireEvent.click(modalContent!);

    expect(mockBackdropClick).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should render sparkle effects', () => {
    render(
      <AchievementCelebration
        achievement={mockAchievement}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('✨')).toBeInTheDocument();
    expect(screen.getByText('⭐')).toBeInTheDocument();
  });

  it('should handle different rarity colors correctly', () => {
    const rarityTestCases = [
      { level: 1, expected: 'Common' },
      { level: 2, expected: 'Uncommon' },
      { level: 3, expected: 'Rare' },
      { level: 4, expected: 'Epic' },
      { level: 5, expected: 'Legendary' }
    ];

    rarityTestCases.forEach(({ level, expected }) => {
      const { unmount } = render(
        <AchievementCelebration
          achievement={{ ...mockAchievement, rarityLevel: level }}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(`${expected} Achievement`)).toBeInTheDocument();
      unmount();
    });
  });
});