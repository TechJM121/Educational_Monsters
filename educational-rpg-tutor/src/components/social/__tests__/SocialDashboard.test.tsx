// Tests for SocialDashboard component

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SocialDashboard } from '../SocialDashboard';
import { useSocialFeatures } from '../../../hooks/useSocialFeatures';
import { CollectibleItem, Achievement } from '../../../types';

// Mock the social features hook
vi.mock('../../../hooks/useSocialFeatures', () => ({
  useSocialFeatures: vi.fn()
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

// Mock all social components
vi.mock('../Leaderboard', () => ({
  Leaderboard: ({ currentUserId }: any) => <div data-testid="leaderboard">Leaderboard for {currentUserId}</div>
}));

vi.mock('../LearningChallenges', () => ({
  LearningChallenges: ({ userId }: any) => <div data-testid="challenges">Challenges for {userId}</div>
}));

vi.mock('../FriendsSystem', () => ({
  FriendsSystem: ({ userId }: any) => <div data-testid="friends">Friends for {userId}</div>
}));

vi.mock('../TradingSystem', () => ({
  TradingSystem: ({ userId }: any) => <div data-testid="trading">Trading for {userId}</div>
}));

vi.mock('../SocialAchievements', () => ({
  SocialAchievements: ({ userId }: any) => <div data-testid="achievements">Achievements for {userId}</div>
}));

vi.mock('../ParentalControls', () => ({
  ParentalControls: ({ userId }: any) => <div data-testid="controls">Controls for {userId}</div>
}));

describe('SocialDashboard', () => {
  const mockUserInventory: CollectibleItem[] = [
    {
      id: 'item-1',
      name: 'Magic Sword',
      description: 'A powerful weapon',
      rarity: 'rare',
      category: 'equipment',
      tradeable: true
    },
    {
      id: 'item-2',
      name: 'Health Potion',
      description: 'Restores health',
      rarity: 'common',
      category: 'potion',
      tradeable: false
    }
  ];

  const mockEarnedAchievements: Achievement[] = [
    {
      id: 'achievement-1',
      name: 'Social Butterfly',
      description: 'Made 10 friends',
      badgeIcon: '🦋',
      category: 'social',
      unlockCriteria: 'Make 10 friends',
      xpReward: 100,
      rarity: 'uncommon',
      unlockedAt: new Date()
    }
  ];

  const mockSocialFeatures = {
    friends: [
      { id: 'friend-1', name: 'Friend 1', isOnline: true, level: 10, totalXP: 1000, avatarConfig: {}, specialization: 'scholar', lastActive: new Date() },
      { id: 'friend-2', name: 'Friend 2', isOnline: false, level: 8, totalXP: 800, avatarConfig: {}, specialization: 'explorer', lastActive: new Date() }
    ],
    leaderboard: [],
    challenges: [
      { id: 'challenge-1', title: 'Math Challenge', description: 'Solve problems', subjectId: 'math', startDate: new Date(), endDate: new Date(), currentParticipants: 5, xpReward: 100, status: 'active' as const, createdBy: 'teacher-1' }
    ],
    activities: [
      { id: 'activity-1', userId: 'user-1', activityType: 'friend_request' as const, description: 'New friend request', createdAt: new Date(), isRead: false }
    ],
    loadingFriends: false,
    loadingLeaderboard: false,
    loadingChallenges: false,
    loadingTrades: false,
    loadingActivities: false,
    loadingControls: false,
    error: null,
    clearError: vi.fn(),
    refreshAll: vi.fn(),
    sendFriendRequest: vi.fn(),
    acceptFriendRequest: vi.fn(),
    refreshLeaderboard: vi.fn(),
    joinChallenge: vi.fn(),
    tradeRequests: [],
    createTradeRequest: vi.fn(),
    acceptTradeRequest: vi.fn(),
    markActivityAsRead: vi.fn(),
    parentalControls: null,
    updateParentalControls: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSocialFeatures as any).mockReturnValue(mockSocialFeatures);
  });

  it('renders dashboard with overview tab by default', () => {
    render(
      <SocialDashboard
        userId="user-1"
        userInventory={mockUserInventory}
        earnedAchievements={mockEarnedAchievements}
      />
    );

    expect(screen.getByText('🌟 Social Hub')).toBeInTheDocument();
    expect(screen.getByText('Connect, compete, and learn together!')).toBeInTheDocument();
    
    // Check that overview tab is active
    const overviewTab = screen.getByText('Overview');
    expect(overviewTab.closest('button')).toHaveClass('text-indigo-600');
  });

  it('displays correct stats in overview', () => {
    render(
      <SocialDashboard
        userId="user-1"
        userInventory={mockUserInventory}
        earnedAchievements={mockEarnedAchievements}
      />
    );

    // Check stats cards
    expect(screen.getByText('2')).toBeInTheDocument(); // Friends count
    expect(screen.getByText('1')).toBeInTheDocument(); // Active challenges
    expect(screen.getByText('1')).toBeInTheDocument(); // Tradeable items (only one is tradeable)
    expect(screen.getByText('1')).toBeInTheDocument(); // Social badges
  });

  it('shows active friends count in header', () => {
    render(
      <SocialDashboard
        userId="user-1"
        userInventory={mockUserInventory}
        earnedAchievements={mockEarnedAchievements}
      />
    );

    expect(screen.getByText('Active Friends')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Only one friend is online
  });

  it('switches tabs correctly', async () => {
    render(
      <SocialDashboard
        userId="user-1"
        userInventory={mockUserInventory}
        earnedAchievements={mockEarnedAchievements}
      />
    );

    // Click friends tab
    fireEvent.click(screen.getByText('Friends'));
    await waitFor(() => {
      expect(screen.getByTestId('friends')).toBeInTheDocument();
    });

    // Click challenges tab
    fireEvent.click(screen.getByText('Challenges'));
    await waitFor(() => {
      expect(screen.getByTestId('challenges')).toBeInTheDocument();
    });

    // Click trading tab
    fireEvent.click(screen.getByText('Trading'));
    await waitFor(() => {
      expect(screen.getByTestId('trading')).toBeInTheDocument();
    });

    // Click achievements tab
    fireEvent.click(screen.getByText('Social Badges'));
    await waitFor(() => {
      expect(screen.getByTestId('achievements')).toBeInTheDocument();
    });
  });

  it('shows parental controls tab for parents', () => {
    render(
      <SocialDashboard
        userId="user-1"
        userInventory={mockUserInventory}
        earnedAchievements={mockEarnedAchievements}
        isParent={true}
      />
    );

    expect(screen.getByText('Parental Controls')).toBeInTheDocument();
  });

  it('hides parental controls tab for non-parents', () => {
    render(
      <SocialDashboard
        userId="user-1"
        userInventory={mockUserInventory}
        earnedAchievements={mockEarnedAchievements}
        isParent={false}
      />
    );

    expect(screen.queryByText('Parental Controls')).not.toBeInTheDocument();
  });

  it('displays error banner when there is an error', () => {
    (useSocialFeatures as any).mockReturnValue({
      ...mockSocialFeatures,
      error: 'Network connection failed'
    });

    render(
      <SocialDashboard
        userId="user-1"
        userInventory={mockUserInventory}
        earnedAchievements={mockEarnedAchievements}
      />
    );

    expect(screen.getByText('Network connection failed')).toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('clears error when dismiss button is clicked', () => {
    const mockClearError = vi.fn();
    (useSocialFeatures as any).mockReturnValue({
      ...mockSocialFeatures,
      error: 'Network connection failed',
      clearError: mockClearError
    });

    render(
      <SocialDashboard
        userId="user-1"
        userInventory={mockUserInventory}
        earnedAchievements={mockEarnedAchievements}
      />
    );

    fireEvent.click(screen.getByText('Dismiss'));
    expect(mockClearError).toHaveBeenCalled();
  });

  it('calls refreshAll when refresh button is clicked', async () => {
    const mockRefreshAll = vi.fn();
    (useSocialFeatures as any).mockReturnValue({
      ...mockSocialFeatures,
      refreshAll: mockRefreshAll
    });

    render(
      <SocialDashboard
        userId="user-1"
        userInventory={mockUserInventory}
        earnedAchievements={mockEarnedAchievements}
      />
    );

    fireEvent.click(screen.getByText('🔄 Refresh'));
    expect(mockRefreshAll).toHaveBeenCalled();
  });

  it('displays recent activities in overview', () => {
    render(
      <SocialDashboard
        userId="user-1"
        userInventory={mockUserInventory}
        earnedAchievements={mockEarnedAchievements}
      />
    );

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('New friend request')).toBeInTheDocument();
  });

  it('shows no recent activity message when activities are empty', () => {
    (useSocialFeatures as any).mockReturnValue({
      ...mockSocialFeatures,
      activities: []
    });

    render(
      <SocialDashboard
        userId="user-1"
        userInventory={mockUserInventory}
        earnedAchievements={mockEarnedAchievements}
      />
    );

    expect(screen.getByText('No recent activity')).toBeInTheDocument();
  });

  it('passes correct props to child components', async () => {
    render(
      <SocialDashboard
        userId="user-1"
        classroomId="classroom-1"
        userInventory={mockUserInventory}
        earnedAchievements={mockEarnedAchievements}
      />
    );

    // Check that leaderboard and challenges are rendered in overview
    expect(screen.getByTestId('leaderboard')).toBeInTheDocument();
    expect(screen.getByTestId('challenges')).toBeInTheDocument();

    // Switch to friends tab and check props
    fireEvent.click(screen.getByText('Friends'));
    await waitFor(() => {
      expect(screen.getByText('Friends for user-1')).toBeInTheDocument();
    });

    // Switch to trading tab and check props
    fireEvent.click(screen.getByText('Trading'));
    await waitFor(() => {
      expect(screen.getByText('Trading for user-1')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <SocialDashboard
        userId="user-1"
        userInventory={mockUserInventory}
        earnedAchievements={mockEarnedAchievements}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});