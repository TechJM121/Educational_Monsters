import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import React, { useEffect, useState } from 'react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import { NotificationSystem } from '../../components/shared/NotificationSystem';
import { ConnectionStatus } from '../../components/shared/ConnectionStatus';
import type { Character } from '../../types/character';

// Mock Supabase client
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
  send: vi.fn().mockResolvedValue(undefined)
};

const mockSupabase = {
  channel: vi.fn().mockReturnValue(mockChannel),
  removeChannel: vi.fn(),
  realtime: {
    connection: {
      readyState: WebSocket.OPEN
    }
  },
  from: vi.fn().mockReturnValue({
    update: vi.fn().mockResolvedValue({ error: null }),
    insert: vi.fn().mockResolvedValue({ error: null }),
    select: vi.fn().mockReturnValue({
      gte: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      })
    })
  }),
  rpc: vi.fn().mockResolvedValue({ data: true, error: null })
};

vi.mock('../../services/supabaseClient', () => ({
  supabase: mockSupabase
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Test component that uses the real-time sync hook
const TestRealtimeSyncComponent: React.FC<{
  userId: string;
  onCharacterUpdate?: (character: Partial<Character>) => void;
  onNotificationReceived?: (notification: any) => void;
}> = ({ userId, onCharacterUpdate, onNotificationReceived }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [receivedNotifications, setReceivedNotifications] = useState<any[]>([]);

  const {
    isOnline,
    isConnected,
    pendingActionCount,
    syncInProgress,
    notifications,
    dismissNotification,
    syncCharacter,
    onCharacterUpdate: setCharacterUpdateCallback,
    queueOfflineAction,
    syncNow,
    getCachedData
  } = useRealtimeSync({
    userId,
    enabled: true
  }, {});

  useEffect(() => {
    if (onCharacterUpdate) {
      setCharacterUpdateCallback(onCharacterUpdate);
    }
  }, [onCharacterUpdate, setCharacterUpdateCallback]);

  useEffect(() => {
    if (notifications.length > 0 && onNotificationReceived) {
      onNotificationReceived(notifications[0]);
    }
  }, [notifications, onNotificationReceived]);

  const handleCreateCharacter = () => {
    const newCharacter: Character = {
      id: 'char-1',
      userId: userId,
      name: 'Test Character',
      level: 1,
      totalXP: 0,
      currentXP: 0,
      avatarConfig: {
        hairStyle: 'short',
        hairColor: 'brown',
        skinTone: 'medium',
        eyeColor: 'blue',
        outfit: 'casual',
        accessories: []
      },
      stats: {
        intelligence: 10,
        vitality: 10,
        wisdom: 10,
        charisma: 10,
        dexterity: 10,
        creativity: 10,
        availablePoints: 0
      },
      equippedItems: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCharacter(newCharacter);
    syncCharacter(newCharacter);
  };

  const handleAwardXP = () => {
    if (character) {
      queueOfflineAction({
        type: 'xp_award',
        payload: {
          characterId: character.id,
          xpAmount: 100,
          source: 'test'
        }
      });
    }
  };

  const handleGoOffline = () => {
    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
    window.dispatchEvent(new Event('offline'));
  };

  const handleGoOnline = () => {
    // Simulate coming back online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
    window.dispatchEvent(new Event('online'));
  };

  return (
    <div>
      <div data-testid="connection-status">
        <ConnectionStatus
          isOnline={isOnline}
          pendingActionCount={pendingActionCount}
          syncInProgress={syncInProgress}
        />
      </div>

      <div data-testid="character-info">
        {character ? (
          <div>
            <span data-testid="character-name">{character.name}</span>
            <span data-testid="character-level">Level {character.level}</span>
            <span data-testid="character-xp">{character.totalXP} XP</span>
          </div>
        ) : (
          <span>No character</span>
        )}
      </div>

      <div data-testid="actions">
        <button onClick={handleCreateCharacter} data-testid="create-character">
          Create Character
        </button>
        <button onClick={handleAwardXP} data-testid="award-xp">
          Award XP
        </button>
        <button onClick={handleGoOffline} data-testid="go-offline">
          Go Offline
        </button>
        <button onClick={handleGoOnline} data-testid="go-online">
          Go Online
        </button>
        <button onClick={syncNow} data-testid="sync-now">
          Sync Now
        </button>
      </div>

      <div data-testid="pending-actions">
        Pending: {pendingActionCount}
      </div>

      <div data-testid="cached-data">
        {JSON.stringify(getCachedData())}
      </div>

      <NotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
};

describe('Real-time Sync Integration', () => {
  const userId = 'test-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should handle complete character creation and sync flow', async () => {
    const onCharacterUpdate = vi.fn();
    
    render(
      <TestRealtimeSyncComponent
        userId={userId}
        onCharacterUpdate={onCharacterUpdate}
      />
    );

    // Initially no character
    expect(screen.getByTestId('character-info')).toHaveTextContent('No character');

    // Create character
    act(() => {
      screen.getByTestId('create-character').click();
    });

    // Character should be created and displayed
    await waitFor(() => {
      expect(screen.getByTestId('character-name')).toHaveTextContent('Test Character');
      expect(screen.getByTestId('character-level')).toHaveTextContent('Level 1');
      expect(screen.getByTestId('character-xp')).toHaveTextContent('0 XP');
    });

    // Should cache character data
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      `educational-rpg-offline-data-${userId}`,
      expect.stringContaining('"character"')
    );
  });

  it('should handle offline XP award and sync when back online', async () => {
    render(<TestRealtimeSyncComponent userId={userId} />);

    // Create character first
    act(() => {
      screen.getByTestId('create-character').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('character-name')).toHaveTextContent('Test Character');
    });

    // Go offline
    act(() => {
      screen.getByTestId('go-offline').click();
    });

    // Award XP while offline
    act(() => {
      screen.getByTestId('award-xp').click();
    });

    // Should show pending action
    await waitFor(() => {
      expect(screen.getByTestId('pending-actions')).toHaveTextContent('Pending: 1');
    });

    // Go back online
    act(() => {
      screen.getByTestId('go-online').click();
    });

    // Should attempt to sync
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('character_xp_logs');
    });
  });

  it('should display connection status correctly', async () => {
    render(<TestRealtimeSyncComponent userId={userId} />);

    const connectionStatus = screen.getByTestId('connection-status');

    // Initially online
    expect(connectionStatus).toHaveTextContent('Online');

    // Go offline
    act(() => {
      screen.getByTestId('go-offline').click();
    });

    await waitFor(() => {
      expect(connectionStatus).toHaveTextContent('Offline');
    });

    // Go back online
    act(() => {
      screen.getByTestId('go-online').click();
    });

    await waitFor(() => {
      expect(connectionStatus).toHaveTextContent('Online');
    });
  });

  it('should handle real-time character updates', async () => {
    const onCharacterUpdate = vi.fn();
    
    render(
      <TestRealtimeSyncComponent
        userId={userId}
        onCharacterUpdate={onCharacterUpdate}
      />
    );

    // Create character
    act(() => {
      screen.getByTestId('create-character').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('character-name')).toHaveTextContent('Test Character');
    });

    // Simulate real-time character update from server
    const characterUpdateCallback = mockChannel.on.mock.calls.find(
      call => call[1].table === 'characters'
    )?.[2];

    if (characterUpdateCallback) {
      act(() => {
        characterUpdateCallback({
          new: {
            id: 'char-1',
            user_id: userId,
            level: 2,
            total_xp: 200,
            current_xp: 50,
            updated_at: new Date().toISOString()
          }
        });
      });

      await waitFor(() => {
        expect(onCharacterUpdate).toHaveBeenCalledWith({
          characterId: 'char-1',
          userId: userId,
          level: 2,
          totalXP: 200,
          currentXP: 50,
          updatedAt: expect.any(String)
        });
      });
    }
  });

  it('should handle notifications', async () => {
    const onNotificationReceived = vi.fn();
    
    render(
      <TestRealtimeSyncComponent
        userId={userId}
        onNotificationReceived={onNotificationReceived}
      />
    );

    // Simulate receiving a notification
    const notificationCallback = mockChannel.on.mock.calls.find(
      call => call[1].table === 'social_activities'
    )?.[2];

    if (notificationCallback) {
      act(() => {
        notificationCallback({
          new: {
            id: 'activity-1',
            user_id: userId,
            activity_type: 'achievement',
            description: 'You earned a new achievement!',
            related_item_id: 'achievement-1',
            created_at: new Date().toISOString()
          }
        });
      });

      await waitFor(() => {
        expect(onNotificationReceived).toHaveBeenCalledWith({
          id: 'activity-1',
          userId: userId,
          type: 'achievement',
          title: '🏆 Achievement Unlocked!',
          message: 'You earned a new achievement!',
          data: { itemId: 'achievement-1' },
          createdAt: expect.any(String)
        });
      });

      // Should display notification
      expect(screen.getByText('🏆 Achievement Unlocked!')).toBeInTheDocument();
      expect(screen.getByText('You earned a new achievement!')).toBeInTheDocument();
    }
  });

  it('should handle manual sync', async () => {
    // Set up pending actions
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      pendingActions: [
        {
          id: 'action-1',
          type: 'xp_award',
          payload: { characterId: 'char-1', xpAmount: 100, source: 'test' },
          userId: userId,
          timestamp: Date.now(),
          retryCount: 0
        }
      ],
      lastSync: Date.now()
    }));

    render(<TestRealtimeSyncComponent userId={userId} />);

    // Manual sync
    act(() => {
      screen.getByTestId('sync-now').click();
    });

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('character_xp_logs');
    });
  });

  it('should persist and restore cached data', async () => {
    const cachedCharacter = {
      id: 'char-1',
      name: 'Cached Character',
      level: 3,
      totalXP: 500
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      character: cachedCharacter,
      quests: [],
      lastSync: Date.now(),
      pendingActions: []
    }));

    render(<TestRealtimeSyncComponent userId={userId} />);

    // Should display cached data
    await waitFor(() => {
      const cachedDataElement = screen.getByTestId('cached-data');
      expect(cachedDataElement).toHaveTextContent('"character"');
      expect(cachedDataElement).toHaveTextContent('Cached Character');
    });
  });
});