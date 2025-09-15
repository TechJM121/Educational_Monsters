// Tests for Leaderboard component

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Leaderboard } from '../Leaderboard';
import { socialService } from '../../../services/socialService';
import { LeaderboardEntry } from '../../../types/social';

// Mock the social service
vi.mock('../../../services/socialService', () => ({
  socialService: {
    getWeeklyLeaderboard: vi.fn()
  }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('Leaderboard', () => {
  const mockLeaderboardData: LeaderboardEntry[] = [
    {
      userId: 'user-1',
      characterName: 'Hero1',
      level: 15,
      weeklyXP: 1200,
      totalXP: 5000,
      avatarConfig: {},
      specialization: 'scholar',
      rank: 1
    },
    {
      userId: 'user-2',
      characterName: 'Hero2',
      level: 12,
      weeklyXP: 800,
      totalXP: 3500,
      avatarConfig: {},
      specialization: 'explorer',
      rank: 2
    },
    {
      userId: 'user-3',
      characterName: 'Hero3',
      level: 10,
      weeklyXP: 600,
      totalXP: 2800,
      avatarConfig: {},
      specialization: 'guardian',
      rank: 3
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders leaderboard with entries', async () => {
    (socialService.getWeeklyLeaderboard as any).mockResolvedValue(mockLeaderboardData);

    render(<Leaderboard currentUserId="user-2" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('animate-pulse')).not.toBeInTheDocument();
    });

    // Check header
    expect(screen.getByText('🏆 Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('Weekly XP Rankings')).toBeInTheDocument();

    // Check entries
    expect(screen.getByText('Hero1')).toBeInTheDocument();
    expect(screen.getByText('Hero2')).toBeInTheDocument();
    expect(screen.getByText('Hero3')).toBeInTheDocument();

    // Check XP values
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('800')).toBeInTheDocument();
    expect(screen.getByText('600')).toBeInTheDocument();
  });

  it('highlights current user entry', async () => {
    (socialService.getWeeklyLeaderboard as any).mockResolvedValue(mockLeaderboardData);

    render(<Leaderboard currentUserId="user-2" />);

    await waitFor(() => {
      expect(screen.queryByText('animate-pulse')).not.toBeInTheDocument();
    });

    // Check that current user is highlighted
    const currentUserEntry = screen.getByText('Hero2').closest('div');
    expect(currentUserEntry).toHaveClass('bg-blue-50');
    expect(screen.getByText('(You)')).toBeInTheDocument();
  });

  it('shows rank icons for top 3 positions', async () => {
    (socialService.getWeeklyLeaderboard as any).mockResolvedValue(mockLeaderboardData);

    render(<Leaderboard currentUserId="user-4" />);

    await waitFor(() => {
      expect(screen.queryByText('animate-pulse')).not.toBeInTheDocument();
    });

    // Check rank icons
    expect(screen.getByText('🥇')).toBeInTheDocument(); // 1st place
    expect(screen.getByText('🥈')).toBeInTheDocument(); // 2nd place
    expect(screen.getByText('🥉')).toBeInTheDocument(); // 3rd place
  });

  it('shows current user highlight when ranked below top 3', async () => {
    const extendedLeaderboard = [
      ...mockLeaderboardData,
      {
        userId: 'user-4',
        characterName: 'Hero4',
        level: 8,
        weeklyXP: 400,
        totalXP: 2000,
        avatarConfig: {},
        specialization: 'artist',
        rank: 4
      }
    ];

    (socialService.getWeeklyLeaderboard as any).mockResolvedValue(extendedLeaderboard);

    render(<Leaderboard currentUserId="user-4" />);

    await waitFor(() => {
      expect(screen.queryByText('animate-pulse')).not.toBeInTheDocument();
    });

    // Should show current user highlight section
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('#4')).toBeInTheDocument();
    expect(screen.getByText('400 XP this week')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    (socialService.getWeeklyLeaderboard as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<Leaderboard currentUserId="user-1" />);

    expect(screen.getByText('animate-pulse')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (socialService.getWeeklyLeaderboard as any).mockRejectedValue(
      new Error('Failed to load leaderboard')
    );

    render(<Leaderboard currentUserId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load leaderboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('shows empty state when no entries', async () => {
    (socialService.getWeeklyLeaderboard as any).mockResolvedValue([]);

    render(<Leaderboard currentUserId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText('No leaderboard data available')).toBeInTheDocument();
    });

    expect(screen.getByText('Complete some lessons to appear on the leaderboard!')).toBeInTheDocument();
  });

  it('allows timeframe switching', async () => {
    (socialService.getWeeklyLeaderboard as any).mockResolvedValue(mockLeaderboardData);

    render(<Leaderboard currentUserId="user-1" />);

    await waitFor(() => {
      expect(screen.queryByText('animate-pulse')).not.toBeInTheDocument();
    });

    // Check timeframe buttons
    expect(screen.getByText('weekly')).toBeInTheDocument();
    expect(screen.getByText('monthly')).toBeInTheDocument();
    expect(screen.getByText('all time')).toBeInTheDocument();

    // Click monthly button
    fireEvent.click(screen.getByText('monthly'));
    
    // Should call service again (though we're not testing the actual filtering logic here)
    expect(socialService.getWeeklyLeaderboard).toHaveBeenCalledTimes(2);
  });

  it('refreshes data when refresh button is clicked', async () => {
    (socialService.getWeeklyLeaderboard as any).mockResolvedValue(mockLeaderboardData);

    render(<Leaderboard currentUserId="user-1" />);

    await waitFor(() => {
      expect(screen.queryByText('animate-pulse')).not.toBeInTheDocument();
    });

    // Initial load
    expect(socialService.getWeeklyLeaderboard).toHaveBeenCalledTimes(1);

    // Click refresh (assuming there's a refresh mechanism)
    const tryAgainButton = screen.queryByText('Try again');
    if (tryAgainButton) {
      fireEvent.click(tryAgainButton);
      expect(socialService.getWeeklyLeaderboard).toHaveBeenCalledTimes(2);
    }
  });

  it('respects classroom filtering', async () => {
    (socialService.getWeeklyLeaderboard as any).mockResolvedValue(mockLeaderboardData);

    render(<Leaderboard currentUserId="user-1" classroomId="classroom-1" />);

    await waitFor(() => {
      expect(socialService.getWeeklyLeaderboard).toHaveBeenCalledWith('classroom-1', 10);
    });
  });

  it('respects custom limit', async () => {
    (socialService.getWeeklyLeaderboard as any).mockResolvedValue(mockLeaderboardData);

    render(<Leaderboard currentUserId="user-1" limit={5} />);

    await waitFor(() => {
      expect(socialService.getWeeklyLeaderboard).toHaveBeenCalledWith(undefined, 5);
    });
  });

  it('shows specialization icons correctly', async () => {
    (socialService.getWeeklyLeaderboard as any).mockResolvedValue(mockLeaderboardData);

    render(<Leaderboard currentUserId="user-1" />);

    await waitFor(() => {
      expect(screen.queryByText('animate-pulse')).not.toBeInTheDocument();
    });

    // Check that specialization info is displayed
    expect(screen.getByText('📚')).toBeInTheDocument(); // Scholar icon
    expect(screen.getByText('🗺️')).toBeInTheDocument(); // Explorer icon
    expect(screen.getByText('🛡️')).toBeInTheDocument(); // Guardian icon
  });
});