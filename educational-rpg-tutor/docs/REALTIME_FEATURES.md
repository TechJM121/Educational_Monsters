# Real-time Features and Data Synchronization

This document describes the implementation of Task 11: Real-time features and data synchronization for the Educational RPG Tutor.

## Overview

The real-time features provide seamless synchronization of character progression, quest updates, leaderboards, and social interactions across devices, with robust offline support and conflict resolution.

## Key Features Implemented

### 1. Real-time Subscriptions (Supabase)

**File:** `src/services/realtimeService.ts`

- **Character Updates**: Live synchronization of character level, XP, and stats
- **Leaderboard Updates**: Real-time leaderboard changes for classrooms
- **Quest Progress**: Live quest completion and progress updates
- **Social Notifications**: Friend requests, achievements, trade requests
- **Friend Activity**: Real-time updates from friends' activities

**Key Methods:**
```typescript
subscribeToCharacterUpdates(userId, onUpdate)
subscribeToLeaderboardUpdates(classroomId, onUpdate)
subscribeToQuestProgress(userId, onUpdate)
subscribeToNotifications(userId, onNotification)
subscribeToFriendActivity(userId, friendIds, onActivity)
```

### 2. Offline Support with Local Caching

**File:** `src/services/offlineService.ts`

- **Local Data Caching**: Character and quest data stored in localStorage
- **Offline Action Queue**: Actions queued when offline, synced when online
- **Automatic Sync**: Pending actions sync automatically when connection restored
- **Retry Logic**: Failed actions retry with exponential backoff
- **Conflict Resolution**: Smart merging of local and server data

**Supported Offline Actions:**
- Character updates (level, XP, stats)
- XP awards from learning activities
- Quest progress updates
- Stat point allocations

### 3. Notification System

**File:** `src/components/shared/NotificationSystem.tsx`

- **Real-time Notifications**: Achievement unlocks, level-ups, social interactions
- **Visual Feedback**: Animated notifications with auto-dismiss
- **Categorized Icons**: Different icons and colors for notification types
- **Dismissible**: Users can manually dismiss notifications

### 4. Connection Status Monitoring

**File:** `src/components/shared/ConnectionStatus.tsx`

- **Online/Offline Status**: Visual indicator of connection state
- **Pending Actions Counter**: Shows number of queued offline actions
- **Sync Progress**: Indicates when synchronization is in progress
- **Real-time Updates**: Status updates automatically

### 5. Unified Real-time Hook

**File:** `src/hooks/useRealtimeSync.ts`

Combines real-time and offline functionality into a single, easy-to-use hook:

```typescript
const {
  isOnline,
  isConnected,
  pendingActionCount,
  notifications,
  syncCharacter,
  onCharacterUpdate,
  queueOfflineAction,
  syncNow
} = useRealtimeSync({ userId, classroomId, friendIds });
```

## Technical Implementation

### Real-time Architecture

```
Client App
    ↓
useRealtimeSync Hook
    ↓
┌─────────────────┬─────────────────┐
│  RealtimeService │  OfflineService │
│  (Online sync)   │  (Offline cache)│
└─────────────────┴─────────────────┘
    ↓                       ↓
Supabase Real-time      localStorage
    ↓
PostgreSQL Database
```

### Data Flow

1. **Online Mode**: 
   - Actions execute immediately against Supabase
   - Real-time subscriptions provide live updates
   - Data cached locally for offline access

2. **Offline Mode**:
   - Actions queued in localStorage
   - Local cache provides immediate feedback
   - UI remains responsive with cached data

3. **Reconnection**:
   - Queued actions sync automatically
   - Conflicts resolved using smart merging
   - Real-time subscriptions re-established

### Conflict Resolution Strategy

**Character Data Conflicts:**
- Preserve higher XP values (local vs server)
- Merge stat improvements from both sources
- Use server data for other fields

**Quest Progress Conflicts:**
- Compare total progress across objectives
- Preserve the version with more progress
- Maintain completion status accuracy

## Usage Examples

### Basic Setup

```typescript
import { useRealtimeSync } from '../hooks/useRealtimeSync';

const MyComponent = ({ userId }) => {
  const {
    isOnline,
    notifications,
    syncCharacter,
    onCharacterUpdate
  } = useRealtimeSync({ userId });

  // Handle character updates
  useEffect(() => {
    onCharacterUpdate((update) => {
      console.log('Character updated:', update);
    });
  }, [onCharacterUpdate]);

  return (
    <div>
      <ConnectionStatus isOnline={isOnline} />
      <NotificationSystem notifications={notifications} />
    </div>
  );
};
```

### Offline Action Queuing

```typescript
// Award XP (works offline)
queueOfflineAction({
  type: 'xp_award',
  payload: {
    characterId: 'char-123',
    xpAmount: 100,
    source: 'question_correct'
  }
});

// Update character stats (works offline)
queueOfflineAction({
  type: 'stat_allocation',
  payload: {
    characterId: 'char-123',
    statAllocations: { intelligence: 2, vitality: 1 }
  }
});
```

## Testing

### Unit Tests
- **RealtimeService**: Subscription management, event handling
- **OfflineService**: Caching, sync logic, conflict resolution
- **useRealtimeSync**: Hook behavior, callback management

### Integration Tests
- **Complete sync flow**: Online → Offline → Online scenarios
- **Conflict resolution**: Concurrent updates from multiple sources
- **Notification system**: Real-time notification delivery

### Test Files
- `src/services/__tests__/realtimeService.test.ts`
- `src/services/__tests__/offlineService.test.ts`
- `src/hooks/__tests__/useRealtimeSync.test.tsx`
- `src/test/integration/realtimeSync.integration.test.tsx`

## Demo Component

**File:** `src/examples/RealtimeSyncDemo.tsx`

Interactive demo showing all real-time features:
- Character creation and updates
- XP earning and level progression
- Offline/online simulation
- Connection status monitoring
- Activity logging

## Performance Considerations

### Optimization Strategies
- **Debounced Updates**: Prevent excessive real-time events
- **Selective Subscriptions**: Only subscribe to relevant data
- **Efficient Caching**: Minimize localStorage operations
- **Connection Pooling**: Reuse Supabase connections

### Memory Management
- **Subscription Cleanup**: Automatic unsubscribe on unmount
- **Cache Limits**: Prevent unlimited localStorage growth
- **Event Throttling**: Limit notification frequency

## Security Features

### Data Protection
- **User Isolation**: RLS policies prevent cross-user data access
- **Input Validation**: All offline actions validated before sync
- **Rate Limiting**: Prevent abuse of real-time features

### Privacy Controls
- **Parental Oversight**: Social features respect parental controls
- **Selective Sharing**: Users control what data is shared
- **Secure Channels**: All real-time data encrypted in transit

## Requirements Fulfilled

✅ **20.1**: Real-time character progression updates via Supabase subscriptions
✅ **20.2**: Live leaderboard updates and social activity notifications  
✅ **20.3**: Real-time quest progress synchronization across devices
✅ **20.4**: Notification system for achievements, level-ups, and social interactions
✅ **20.5**: Offline support with local caching and sync on reconnection
✅ **Conflict Resolution**: Smart merging for concurrent character updates
✅ **Comprehensive Testing**: Unit, integration, and end-to-end tests

## Future Enhancements

### Potential Improvements
- **WebRTC Integration**: Peer-to-peer real-time features
- **Push Notifications**: Native mobile notifications
- **Advanced Caching**: Service worker for better offline experience
- **Real-time Collaboration**: Shared learning activities
- **Analytics Integration**: Real-time learning analytics

### Scalability Considerations
- **Connection Limits**: Handle large classroom sizes
- **Data Partitioning**: Efficient data distribution
- **Load Balancing**: Distribute real-time connections
- **Caching Layers**: Redis for high-frequency data