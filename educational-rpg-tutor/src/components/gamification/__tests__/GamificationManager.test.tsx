import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { GamificationManager, useGamification } from '../GamificationManager';
import { useAchievements } from '../../../hooks/useAchievements';
import type { Achievement, CollectibleItem } from '../../../types/achievement';

// Mock the useAchievements hook
vi.mock('../../../hooks/useAchievements', () => ({
  useAchievements: vi.fn()
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
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

const mockItem: CollectibleItem = {
  id: '1',
  name: 'Health Potion',
  description: 'Restores health',
  icon: '🧪',
  rarity: 'common',
  category: 'potion',
  tradeable: true
};

const mockUseAchievements = {
  achievements: [],
  userAchievements: [],
  inventory: [],
  loading: false,
  error: null,
  checkAchievements: vi.fn(),
  awardRandomItem: vi.fn(),
  refreshData: vi.fn(),
  getAchievementProgress: vi.fn()
};

// Test component that uses the gamification context
function TestComponent() {
  const { checkAchievements, awardRandomItem, triggerAchievementCheck, triggerItemDrop } = useGamification();

  return (
    <div>
      <button onClick={() => checkAchievements()}>Check Achievements</button>
      <button onClick={() => awardRandomItem()}>Award Item</button>
      <button onClick={triggerAchievementCheck}>Trigger Achievement Check</button>
      <button onClick={triggerItemDrop}>Trigger Item Drop</button>
    </div>
  );
}

describe('GamificationManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAchievements).mockReturnValue(mockUseAchievements);
  });

  it('should render children correctly', () => {
    render(
      <GamificationManager userId="user-1">
        <div>Test Content</div>
      </GamificationManager>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should provide gamification context to children', () => {
    render(
      <GamificationManager userId="user-1">
        <TestComponent />
      </GamificationManager>
    );

    expect(screen.getByText('Check Achievements')).toBeInTheDocument();
    expect(screen.getByText('Award Item')).toBeInTheDocument();
    expect(screen.getByText('Trigger Achievement Check')).toBeInTheDocument();
    expect(screen.getByText('Trigger Item Drop')).toBeInTheDocument();
  });

  it('should handle achievement checking', async () => {
    mockUseAchievements.checkAchievements.mockResolvedValue([mockAchievement]);

    render(
      <GamificationManager userId="user-1">
        <TestComponent />
      </GamificationManager>
    );

    const checkButton = screen.getByText('Check Achievements');
    
    await act(async () => {
      checkButton.click();
    });

    expect(mockUseAchievements.checkAchievements).toHaveBeenCalledTimes(1);
    expect(mockUseAchievements.refreshData).toHaveBeenCalledTimes(1);
  });

  it('should handle item awarding', async () => {
    mockUseAchievements.awardRandomItem.mockResolvedValue(mockItem);

    render(
      <GamificationManager userId="user-1">
        <TestComponent />
      </GamificationManager>
    );

    const awardButton = screen.getByText('Award Item');
    
    await act(async () => {
      awardButton.click();
    });

    expect(mockUseAchievements.awardRandomItem).toHaveBeenCalledTimes(1);
    expect(mockUseAchievements.refreshData).toHaveBeenCalledTimes(1);
  });

  it('should show achievement celebration when new achievement is earned', async () => {
    mockUseAchievements.checkAchievements.mockResolvedValue([mockAchievement]);

    render(
      <GamificationManager userId="user-1">
        <TestComponent />
      </GamificationManager>
    );

    const triggerButton = screen.getByText('Trigger Achievement Check');
    
    await act(async () => {
      triggerButton.click();
    });

    await waitFor(() => {
      expect(screen.getByText('First Steps')).toBeInTheDocument();
    });
  });

  it('should show item drop notification when item is awarded', async () => {
    mockUseAchievements.awardRandomItem.mockResolvedValue(mockItem);

    render(
      <GamificationManager userId="user-1">
        <TestComponent />
      </GamificationManager>
    );

    const awardButton = screen.getByText('Award Item');
    
    await act(async () => {
      awardButton.click();
    });

    await waitFor(() => {
      expect(screen.getByText('Health Potion')).toBeInTheDocument();
    });
  });

  it('should handle random item drops with probability', async () => {
    // Mock Math.random to return a value that triggers item drop (< 0.2)
    const originalRandom = Math.random;
    Math.random = vi.fn(() => 0.1);

    mockUseAchievements.awardRandomItem.mockResolvedValue(mockItem);

    render(
      <GamificationManager userId="user-1">
        <TestComponent />
      </GamificationManager>
    );

    const triggerButton = screen.getByText('Trigger Item Drop');
    
    await act(async () => {
      triggerButton.click();
    });

    expect(mockUseAchievements.awardRandomItem).toHaveBeenCalledTimes(1);

    // Restore original Math.random
    Math.random = originalRandom;
  });

  it('should not trigger item drop when probability is not met', async () => {
    // Mock Math.random to return a value that doesn't trigger item drop (>= 0.2)
    const originalRandom = Math.random;
    Math.random = vi.fn(() => 0.5);

    render(
      <GamificationManager userId="user-1">
        <TestComponent />
      </GamificationManager>
    );

    const triggerButton = screen.getByText('Trigger Item Drop');
    
    await act(async () => {
      triggerButton.click();
    });

    expect(mockUseAchievements.awardRandomItem).not.toHaveBeenCalled();

    // Restore original Math.random
    Math.random = originalRandom;
  });

  it('should handle errors gracefully', async () => {
    mockUseAchievements.checkAchievements.mockRejectedValue(new Error('Check failed'));

    render(
      <GamificationManager userId="user-1">
        <TestComponent />
      </GamificationManager>
    );

    const checkButton = screen.getByText('Check Achievements');
    
    await act(async () => {
      checkButton.click();
    });

    // Should not crash and should still call the function
    expect(mockUseAchievements.checkAchievements).toHaveBeenCalledTimes(1);
  });

  it('should handle null userId', () => {
    render(
      <GamificationManager userId={null}>
        <TestComponent />
      </GamificationManager>
    );

    // Should render without errors
    expect(screen.getByText('Check Achievements')).toBeInTheDocument();
  });

  it('should queue multiple achievements for celebration', async () => {
    const achievement2: Achievement = {
      ...mockAchievement,
      id: '2',
      name: 'Math Wizard'
    };

    mockUseAchievements.checkAchievements.mockResolvedValue([mockAchievement, achievement2]);

    render(
      <GamificationManager userId="user-1">
        <TestComponent />
      </GamificationManager>
    );

    const triggerButton = screen.getByText('Trigger Achievement Check');
    
    await act(async () => {
      triggerButton.click();
    });

    // Should show first achievement
    await waitFor(() => {
      expect(screen.getByText('First Steps')).toBeInTheDocument();
    });

    // Close first achievement celebration
    const closeButton = screen.getByText('Awesome!');
    await act(async () => {
      closeButton.click();
    });

    // Should show second achievement
    await waitFor(() => {
      expect(screen.getByText('Math Wizard')).toBeInTheDocument();
    });
  });
});

describe('useGamification', () => {
  it('should throw error when used outside GamificationManager', () => {
    function TestComponentOutsideProvider() {
      useGamification();
      return <div>Test</div>;
    }

    expect(() => {
      render(<TestComponentOutsideProvider />);
    }).toThrow('useGamification must be used within a GamificationManager');
  });
});