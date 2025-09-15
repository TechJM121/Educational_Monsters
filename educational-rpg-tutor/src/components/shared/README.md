# Animation and UX Components

This directory contains enhanced animation, visual effects, and user experience components for the Educational RPG Tutor.

## Components Overview

### Animation Components

#### `LevelUpCelebration`
Displays a full-screen celebration animation when a student levels up.
- **Features**: Particle effects, rotating icons, celebration text
- **Accessibility**: Screen reader announcements, reduced motion support
- **Usage**: Triggered automatically by the notification system

#### `XPGainNotification`
Shows a floating notification when XP is gained.
- **Features**: Configurable positioning, reason display, smooth animations
- **Accessibility**: ARIA live regions for screen readers
- **Usage**: Can be positioned center, top-right, or bottom-center

#### `StatImprovementNotification`
Displays stat increases with animated progress indicators.
- **Features**: Color-coded stats, animated counters, staggered reveals
- **Accessibility**: Descriptive text for each stat improvement
- **Usage**: Shows after XP gains that result in stat increases

#### `ParticleSystem`
Reusable particle effect system for celebrations.
- **Features**: Configurable particle count, colors, types, and duration
- **Performance**: Optimized animation loop with cleanup
- **Usage**: Used by celebration components, can be used standalone

### Loading and Skeleton Components

#### `LoadingSpinner`
Standard loading spinner with RPG theming.
- **Variants**: Standard spinner, magical spinner with effects
- **Sizes**: sm, md, lg, xl
- **Usage**: For loading states throughout the application

#### `SkeletonLoader`
Animated skeleton placeholders for loading content.
- **Components**: Basic skeleton, character card, stats card, home page
- **Features**: Configurable dimensions, rounded variants, animation toggle
- **Usage**: Improves perceived performance during data loading

### Accessibility Components

#### `AccessibleButton`
Enhanced button component with full accessibility support.
- **Features**: ARIA attributes, keyboard navigation, focus management
- **Variants**: All standard button variants plus ghost
- **Usage**: Replaces standard buttons throughout the application

#### `FocusManager`
Manages focus behavior for modals and complex interactions.
- **Features**: Focus trapping, auto-focus, focus restoration
- **Usage**: Wrap around modals, dialogs, and complex forms

#### `ScreenReaderAnnouncements`
Provides screen reader announcements for dynamic content.
- **Features**: Polite and assertive announcements, automatic cleanup
- **Usage**: Integrated into notification system, available as hooks

### Utility Components

#### `ErrorBoundary`
Catches and displays user-friendly error messages.
- **Variants**: General, character-specific, learning-specific
- **Features**: Retry functionality, RPG-themed error messages
- **Usage**: Wrap around major application sections

#### `PageTransition`
Smooth transitions between different views.
- **Variants**: Horizontal, vertical, fade, scale, world-specific
- **Features**: Configurable duration and easing
- **Usage**: Route transitions and view changes

#### `NotificationManager`
Centralized notification system with context provider.
- **Features**: Queued notifications, automatic cleanup, accessibility
- **Usage**: Wrap around app root, use hooks in components

## Animation System

### Core Principles

1. **Performance First**: All animations use transform properties for optimal performance
2. **Accessibility**: Respects `prefers-reduced-motion` and provides screen reader support
3. **Consistency**: Unified timing and easing across all animations
4. **Modularity**: Reusable animation variants and utilities

### Animation Utilities (`utils/animations.ts`)

#### Predefined Variants
- `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`
- `scaleIn`, `slideInFromBottom`
- `levelUpAnimation`, `xpGainAnimation`, `achievementUnlockAnimation`
- `cardHoverAnimation`, `buttonPressAnimation`
- `floatingAnimation`, `glowAnimation`

#### Stagger Animations
- `staggerContainer` and `staggerItem` for list animations
- `getStaggerDelay()` utility for custom timing

#### Animation Presets
- `gentle`: Subtle, quick animations
- `bouncy`: Spring-based animations
- `smooth`: Standard easing
- `dramatic`: Longer, more pronounced animations

#### Reduced Motion Support
- `respectsReducedMotion()` utility automatically disables animations
- All components check motion preferences

### Responsive Design (`utils/responsive.ts`)

#### Hooks
- `useScreenSize()`: Current screen dimensions and breakpoint
- `useBreakpoint()`: Check if screen meets minimum breakpoint
- `useIsMobile()`, `useIsTablet()`, `useIsDesktop()`: Device type detection
- `useIsTouchDevice()`: Touch capability detection
- `useOrientation()`: Portrait/landscape detection

#### Utilities
- `getResponsiveGridCols()`: Responsive grid classes
- `getResponsiveSpacing()`: Responsive padding/margin
- `getResponsiveTextSize()`: Responsive typography

## Usage Examples

### Basic XP Notification
```tsx
import { useNotifications } from './NotificationManager';

function QuestionComponent() {
  const { showXPGain } = useNotifications();
  
  const handleCorrectAnswer = () => {
    showXPGain(50, 'Correct Answer!');
  };
}
```

### Level Up Sequence
```tsx
import { useGameNotifications } from './NotificationManager';

function LearningActivity() {
  const { celebrateLevelUp } = useGameNotifications();
  
  const handleLevelUp = (newLevel: number) => {
    celebrateLevelUp(newLevel, 100, [
      { stat: 'intelligence', oldValue: 10, newValue: 12 }
    ]);
  };
}
```

### Loading States
```tsx
import { HomePageSkeleton } from './SkeletonLoader';

function HomePage() {
  const { data, loading } = useHomePageData();
  
  if (loading) {
    return <HomePageSkeleton />;
  }
  
  return <ActualHomePage data={data} />;
}
```

### Error Boundaries
```tsx
import { CharacterErrorBoundary } from './ErrorBoundary';

function CharacterSection() {
  return (
    <CharacterErrorBoundary>
      <CharacterDisplay />
      <CharacterStats />
    </CharacterErrorBoundary>
  );
}
```

### Page Transitions
```tsx
import { PageTransition } from './PageTransition';

function AppRouter() {
  return (
    <PageTransition pageKey={currentPage} direction="horizontal">
      {renderCurrentPage()}
    </PageTransition>
  );
}
```

## Testing

### Animation Testing
- Mock framer-motion in tests
- Test animation triggers and completion
- Verify accessibility announcements
- Check reduced motion compliance

### Performance Testing
- Monitor animation frame rates
- Test with many simultaneous animations
- Verify cleanup of timers and listeners
- Check memory usage patterns

### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation
- Focus management
- Color contrast and visibility

## Best Practices

### Animation Guidelines
1. Keep animations under 300ms for micro-interactions
2. Use spring animations for natural feel
3. Provide clear visual hierarchy
4. Always include reduced motion fallbacks

### Performance Guidelines
1. Use `transform` and `opacity` for animations
2. Avoid animating layout properties
3. Implement proper cleanup in useEffect
4. Debounce rapid state changes

### Accessibility Guidelines
1. Provide text alternatives for visual feedback
2. Ensure keyboard navigation works during animations
3. Use appropriate ARIA live regions
4. Test with screen readers

### Responsive Guidelines
1. Test on multiple screen sizes
2. Consider touch vs. mouse interactions
3. Adapt animation timing for mobile
4. Ensure readability at all sizes

## Browser Support

- **Modern Browsers**: Full feature support
- **Older Browsers**: Graceful degradation with CSS fallbacks
- **Mobile**: Optimized for touch interactions
- **Screen Readers**: Full compatibility with NVDA, JAWS, VoiceOver

## Performance Considerations

- Animations use GPU acceleration where possible
- Particle systems are optimized for 60fps
- Memory cleanup prevents leaks
- Reduced motion preferences are respected
- Bundle size is optimized with tree shaking