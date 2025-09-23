# Guest Account System

The Educational RPG Tutor now includes a comprehensive guest account system that allows users to try the platform without creating a full account. This system provides a seamless trial experience while maintaining security and encouraging conversion to permanent accounts.

## Features

### Core Functionality
- **Temporary Sessions**: 24-hour active sessions with 7-day maximum duration
- **Randomized Characters**: Auto-generated character names and appearances
- **Progress Tracking**: Local storage of XP, achievements, and learning progress
- **Seamless Conversion**: Transfer all progress when upgrading to permanent account
- **Session Management**: Automatic cleanup and expiry handling

### Security & Limitations
- **Social Feature Restrictions**: No friends, trading, or messaging for safety
- **Read-only Leaderboards**: Can view but not interact with rankings
- **No Challenge Participation**: Cannot join group learning challenges
- **Session Expiry Warnings**: Proactive notifications before data loss

## Implementation

### Services

#### GuestAuthService
Main service for managing guest sessions:

```typescript
import { GuestAuthService } from './services/guestAuthService';

// Create new guest session
const guestUser = await GuestAuthService.createGuestSession();

// Load existing session
const existingUser = await GuestAuthService.loadGuestSession();

// Convert to permanent account
const newUser = await GuestAuthService.convertGuestToUser(sessionToken, {
  email: 'user@example.com',
  password: 'password123',
  name: 'User Name',
  age: 15
});
```

#### Session Management
```typescript
import { GuestSessionCleanup } from './utils/guestSessionCleanup';

// Initialize automatic cleanup
GuestSessionCleanup.initialize();

// Check session status
const stats = GuestSessionCleanup.getSessionStats();
```

### React Components

#### GuestLoginButton
Provides "Try as Guest" functionality:

```tsx
import { GuestLoginButton } from './components/auth/GuestLoginButton';

<GuestLoginButton 
  onGuestSessionCreated={() => console.log('Guest session created')}
  className="custom-styles"
/>
```

#### GuestFeatureGate
Controls access to features based on guest status:

```tsx
import { GuestFeatureGate } from './components/auth/GuestFeatureGate';

<GuestFeatureGate 
  feature="friends" 
  onUpgradeClick={() => setShowConversionModal(true)}
>
  <FriendsComponent />
</GuestFeatureGate>
```

#### GuestConversionModal
Handles account upgrade process:

```tsx
import { GuestConversionModal } from './components/auth/GuestConversionModal';

<GuestConversionModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={(user) => console.log('Account created:', user)}
/>
```

#### Session Warnings
Automatic warnings for expiring sessions:

```tsx
import { GuestSessionWarning } from './components/auth/GuestSessionWarning';

<GuestSessionWarning 
  onConvertAccount={() => setShowConversionModal(true)}
/>
```

### React Hook

#### useGuestAuth
Comprehensive hook for guest authentication:

```tsx
import { useGuestAuth } from './hooks/useGuestAuth';

function MyComponent() {
  const {
    guestUser,
    guestCharacter,
    isGuestSession,
    isSessionNearExpiry,
    createGuestSession,
    convertToUser,
    updateGuestCharacter,
    clearSession
  } = useGuestAuth();

  // Component logic here
}
```

## Usage Examples

### Basic Integration

```tsx
import { AuthWrapper } from './components/auth/AuthWrapper';

function App() {
  return (
    <AuthWrapper showGuestOptions={true}>
      <MainAppContent />
    </AuthWrapper>
  );
}
```

### Feature Gating

```tsx
function SocialFeatures() {
  return (
    <div>
      <GuestFeatureGate feature="friends">
        <FriendsList />
      </GuestFeatureGate>
      
      <GuestFeatureGate feature="trading">
        <TradingInterface />
      </GuestFeatureGate>
      
      <GuestFeatureGate feature="leaderboards">
        <Leaderboard />
      </GuestFeatureGate>
    </div>
  );
}
```

### Session Management

```tsx
function HomePage() {
  const { isGuestSession, isSessionNearExpiry } = useGuestAuth();
  const [showConversion, setShowConversion] = useState(false);

  useEffect(() => {
    if (isSessionNearExpiry) {
      setShowConversion(true);
    }
  }, [isSessionNearExpiry]);

  return (
    <div>
      {isGuestSession && (
        <GuestLimitationsBanner 
          onUpgradeClick={() => setShowConversion(true)}
        />
      )}
      
      <GuestConversionModal
        isOpen={showConversion}
        onClose={() => setShowConversion(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
```

## Data Flow

### Guest Session Creation
1. User clicks "Try as Guest"
2. System generates random character and session token
3. Data stored in localStorage with expiry timestamps
4. User can immediately start learning

### Progress Tracking
1. All learning activities update guest character data
2. XP, achievements, and progress stored locally
3. Session automatically extended on activity
4. Warnings shown when approaching expiry

### Account Conversion
1. User decides to create permanent account
2. Conversion modal collects registration details
3. System creates Supabase user account
4. Guest progress transferred to permanent character
5. Local guest data cleared

## Testing

The system includes comprehensive tests:

```bash
# Run guest-specific tests
npm run test:unit -- guestAuth

# Run component tests
npm run test:unit -- "src/components/auth/__tests__/Guest"

# Run integration tests
npm run test:unit -- "guestAccountIntegration"
```

## Configuration

### Session Duration
```typescript
// In GuestAuthService
private static readonly SESSION_DURATION_HOURS = 24;
private static readonly MAX_SESSION_DURATION_DAYS = 7;
```

### Feature Limitations
```typescript
// Customize guest limitations
const limitations = GuestAuthService.getGuestLimitations();
// Returns: { canAddFriends: false, canTrade: false, ... }
```

### Cleanup Schedule
```typescript
// In GuestSessionCleanup
private static readonly CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
```

## Security Considerations

- **No Persistent Server Data**: Guest data only in localStorage
- **Session Tokens**: Cryptographically secure random tokens
- **Social Feature Blocking**: Prevents unsafe interactions
- **Automatic Cleanup**: Expired sessions removed automatically
- **Parental Consent**: Required for under-13 conversions

## Best Practices

1. **Always Show Limitations**: Use GuestLimitationsBanner to inform users
2. **Proactive Conversion**: Show warnings before session expiry
3. **Graceful Degradation**: Provide fallbacks for blocked features
4. **Clear Communication**: Explain benefits of creating full account
5. **Progress Preservation**: Ensure seamless data transfer on conversion

## Troubleshooting

### Common Issues

**Session Not Loading**
- Check localStorage for corrupted data
- Verify session hasn't expired
- Clear guest data and create new session

**Conversion Failures**
- Ensure valid email format
- Check password requirements
- Verify parental consent for under-13 users

**Feature Gate Not Working**
- Confirm useGuestAuth hook is properly initialized
- Check feature name matches supported types
- Verify guest limitations configuration

### Debug Tools

```typescript
// Check session status
const stats = GuestSessionCleanup.getSessionStats();
console.log('Session stats:', stats);

// Force cleanup
GuestSessionCleanup.performCleanup();

// Check limitations
const limitations = GuestAuthService.getGuestLimitations();
console.log('Guest limitations:', limitations);
```

This guest account system provides a complete solution for trial access while maintaining security and encouraging user conversion to permanent accounts.