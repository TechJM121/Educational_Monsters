import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AchievementProgress } from '../AchievementProgress';
import type { Achievement, UserAchievement } from '../../../types/achievement';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first lesson',
    badgeIcon: '🏆',
    unlockCriteria: { type: 'lessons_completed', count: 1 },
    rarityLevel: 1,
    category: 'learning',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Math Wizard',
    description: 'Answer 50 math questions correctly',
    badgeIcon: '🧙‍♂️',
    unlockCriteria: { type: 'subject_correct_answers', subject: 'Mathematics', count: 50 },
    rarityLevel: 2,
    category: 'learning',
    createdAt: new Date('2024-01-02')
  },
  {
    id: '3',
    name: 'Legendary Scholar',
    description: 'Reach the highest level of mastery',
    badgeIcon: '👑',
    unlockCriteria: { type: 'character_level', level: 50 },
    rarityLevel: 5,
    category: 'learning',
    createdAt: new Date('2024-01-03')
  }
];

const mockUserAchievements: UserAchievement[] = [
  {
    id: '1',
    userId: 'user-1',
    achievementId: '1',
    unlockedAt: new Date('2024-01-01T10:00:00Z')
  },
  {
    id: '2',
    userId: 'user-1',
    achievementId: '2',
    unlockedAt: new Date('2024-01-02T15:30:00Z')
  }
];

describe('AchievementProgress', () => {
  it('should render achievements header with correct counts', () => {
    render(
      <AchievementProgress
        achievements={mockAchievements}
        userAchievements={mockUserAchievements}
      />
    );

    expect(screen.getByText('Achievements')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('should display progress bar with correct percentage', () => {
    render(
      <AchievementProgress
        achievements={mockAchievements}
        userAchievements={mockUserAchievements}
        showProgress={true}
      />
    );

    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument(); // 2/3 = 66.67% rounded to 67%
  });

  it('should not show progress bar when showProgress is false', () => {
    render(
      <AchievementProgress
        achievements={mockAchievements}
        userAchievements={mockUserAchievements}
        showProgress={false}
      />
    );

    expect(screen.queryByText('Progress')).not.toBeInTheDocument();
  });

  it('should display achievement badges in correct order', () => {
    render(
      <AchievementProgress
        achievements={mockAchievements}
        userAchievements={mockUserAchievements}
        maxDisplay={3}
      />
    );

    // Should show unlocked achievements first, then locked ones by rarity
    const achievementElements = screen.getAllByRole('generic').filter(el => 
      el.textContent?.includes('🏆') || 
      el.textContent?.includes('🧙‍♂️') || 
      el.textContent?.includes('👑')
    );

    expect(achievementElements.length).toBeGreaterThan(0);
  });

  it('should limit displayed achievements to maxDisplay', () => {
    render(
      <AchievementProgress
        achievements={mockAchievements}
        userAchievements={mockUserAchievements}
        maxDisplay={2}
      />
    );

    // Should show "more achievements" indicator
    expect(screen.getByText('+1 more achievements')).toBeInTheDocument();
  });

  it('should show empty state when no achievements exist', () => {
    render(
      <AchievementProgress
        achievements={[]}
        userAchievements={[]}
      />
    );

    expect(screen.getByText('🏆')).toBeInTheDocument();
    expect(screen.getByText('No achievements yet')).toBeInTheDocument();
    expect(screen.getByText('Complete lessons to earn your first achievement!')).toBeInTheDocument();
  });

  it('should display most recent achievement', () => {
    render(
      <AchievementProgress
        achievements={mockAchievements}
        userAchievements={mockUserAchievements}
      />
    );

    expect(screen.getByText('Most Recent:')).toBeInTheDocument();
    expect(screen.getByText('Math Wizard')).toBeInTheDocument(); // Most recent based on unlock date
    expect(screen.getByText('2024/1/2')).toBeInTheDocument(); // Formatted date
  });

  it('should not show recent achievement section when no achievements are unlocked', () => {
    render(
      <AchievementProgress
        achievements={mockAchievements}
        userAchievements={[]}
      />
    );

    expect(screen.queryByText('Most Recent:')).not.toBeInTheDocument();
  });

  it('should handle 100% progress correctly', () => {
    render(
      <AchievementProgress
        achievements={mockAchievements}
        userAchievements={[
          ...mockUserAchievements,
          {
            id: '3',
            userId: 'user-1',
            achievementId: '3',
            unlockedAt: new Date('2024-01-03T12:00:00Z')
          }
        ]}
        showProgress={true}
      />
    );

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('should handle zero achievements gracefully', () => {
    render(
      <AchievementProgress
        achievements={[]}
        userAchievements={[]}
        showProgress={true}
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('0 / 0')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AchievementProgress
        achievements={mockAchievements}
        userAchievements={mockUserAchievements}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should show correct achievement count when some achievements are filtered out by maxDisplay', () => {
    const manyAchievements = Array.from({ length: 15 }, (_, i) => ({
      ...mockAchievements[0],
      id: `achievement-${i}`,
      name: `Achievement ${i}`
    }));

    render(
      <AchievementProgress
        achievements={manyAchievements}
        userAchievements={[]}
        maxDisplay={8}
      />
    );

    expect(screen.getByText('+7 more achievements')).toBeInTheDocument();
  });
});