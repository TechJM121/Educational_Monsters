# Animation Guidelines
## Modern UI Design System - Educational RPG Tutor

### Table of Contents
1. [Animation Philosophy](#animation-philosophy)
2. [Performance Standards](#performance-standards)
3. [Animation Types](#animation-types)
4. [Timing and Easing](#timing-and-easing)
5. [Accessibility Considerations](#accessibility-considerations)
6. [Implementation Patterns](#implementation-patterns)
7. [Best Practices](#best-practices)
8. [Common Pitfalls](#common-pitfalls)

---

## Animation Philosophy

### Purpose-Driven Animation
Every animation in the Modern UI Design System serves a specific purpose:

1. **Feedback**: Provide immediate response to user interactions
2. **Guidance**: Direct user attention to important elements
3. **Context**: Show relationships between interface elements
4. **Delight**: Create engaging, memorable experiences
5. **Continuity**: Maintain spatial and temporal consistency

### Design Principles

#### 1. Natural Motion
Animations should feel natural and physics-based:
- Use realistic easing curves that mimic real-world motion
- Implement appropriate acceleration and deceleration
- Consider mass, friction, and bounce effects
- Avoid linear animations except for specific use cases

#### 2. Purposeful Movement
Every animation should have a clear reason:
- **Micro-interactions**: Immediate feedback for user actions
- **Transitions**: Smooth state changes and navigation
- **Loading states**: Indicate progress and maintain engagement
- **Celebrations**: Reward achievements and milestones

#### 3. Respectful Performance
Animations must not compromise usability:
- Maintain 60fps on all target devices
- Respect user preferences for reduced motion
- Degrade gracefully on lower-end devices
- Use GPU acceleration when appropriate

---

## Performance Standards

### Frame Rate Requirements
- **Target**: 60fps (16.67ms per frame)
- **Minimum**: 30fps (33.33ms per frame)
- **Critical**: No dropped frames during user interactions

### Performance Monitoring
```typescript
// Performance monitoring utility
const useAnimationPerformance = () => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 16.67) {
          console.warn('Animation frame drop detected:', {
            name: entry.name,
            duration: entry.duration,
            target: '16.67ms'
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
    return () => observer.disconnect();
  }, []);
};
```

### GPU Acceleration
Use transform and opacity properties for optimal performance:

```css
/* ✅ GPU-accelerated properties */
.optimized-animation {
  transform: translateX(100px) scale(1.1);
  opacity: 0.8;
  will-change: transform, opacity;
}

/* ❌ Avoid animating these properties */
.slow-animation {
  width: 200px;      /* Causes layout */
  height: 100px;     /* Causes layout */
  margin: 20px;      /* Causes layout */
  padding: 10px;     /* Causes layout */
}
```

---

## Animation Types

### 1. Micro-interactions
**Duration**: 150-200ms  
**Purpose**: Immediate feedback for user actions  
**Examples**: Button hover, input focus, checkbox toggle

```typescript
const microInteraction = {
  hover: {
    scale: 1.02,
    transition: { duration: 0.15, ease: 'easeOut' }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1, ease: 'easeOut' }
  }
};

// Implementation
<motion.button
  whileHover="hover"
  whileTap="tap"
  variants={microInteraction}
>
  Click me
</motion.button>
```

### 2. State Transitions
**Duration**: 300ms  
**Purpose**: Smooth changes between component states  
**Examples**: Modal open/close, tab switching, accordion expand

```typescript
const stateTransition = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.3, ease: 'easeInOut' }
};

// Implementation
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={stateTransition}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>
```

### 3. Page Transitions
**Duration**: 400-500ms  
**Purpose**: Navigate between different views or pages  
**Examples**: Route changes, wizard steps, carousel slides

```typescript
const pageTransition = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
  transition: { duration: 0.4, ease: 'easeInOut' }
};

// Implementation with stagger
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};
```

### 4. Loading Animations
**Duration**: 1000-2000ms (looping)  
**Purpose**: Indicate progress and maintain user engagement  
**Examples**: Skeleton screens, progress bars, spinners

```typescript
const loadingAnimation = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Skeleton implementation
const SkeletonLoader = () => (
  <motion.div
    className="bg-gray-200 rounded"
    variants={loadingAnimation}
    animate="animate"
  />
);
```

### 5. Celebration Animations
**Duration**: 1000ms+  
**Purpose**: Reward user achievements and create delight  
**Examples**: Level up effects, task completion, confetti

```typescript
const celebrationAnimation = {
  initial: { scale: 0, rotate: 0 },
  animate: {
    scale: [0, 1.2, 1],
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 1.2,
      ease: 'backOut',
      times: [0, 0.6, 1]
    }
  }
};

// Confetti effect
const ConfettiParticle = () => (
  <motion.div
    className="absolute w-2 h-2 bg-yellow-400"
    initial={{ y: 0, opacity: 1 }}
    animate={{
      y: -200,
      x: Math.random() * 200 - 100,
      opacity: 0,
      rotate: 360
    }}
    transition={{ duration: 2, ease: 'easeOut' }}
  />
);
```

---

## Timing and Easing

### Standard Durations
```typescript
export const ANIMATION_DURATIONS = {
  // Micro-interactions
  instant: 100,
  fast: 150,
  
  // Standard transitions
  normal: 300,
  medium: 400,
  
  // Complex animations
  slow: 500,
  slower: 750,
  
  // Celebrations
  celebration: 1200,
  
  // Loading states
  loading: 1500
} as const;
```

### Easing Functions
```typescript
export const EASING_CURVES = {
  // Standard easing
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Bouncy easing
  backOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  backIn: 'cubic-bezier(0.36, 0, 0.66, -0.56)',
  
  // Elastic easing
  elasticOut: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // Sharp easing
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  
  // Linear (use sparingly)
  linear: 'linear'
} as const;
```

### Usage Guidelines
- **Micro-interactions**: Use `easeOut` for immediate feedback
- **Entrances**: Use `easeOut` for elements appearing
- **Exits**: Use `easeIn` for elements disappearing
- **Bidirectional**: Use `easeInOut` for reversible animations
- **Playful**: Use `backOut` or `elasticOut` for celebrations

---

## Accessibility Considerations

### Reduced Motion Support
Always respect user preferences for reduced motion:

```typescript
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return prefersReducedMotion;
};

// Usage in components
const AccessibleAnimation = ({ children }) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};
```

### CSS Implementation
```css
/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Alternative Feedback
Provide alternative feedback for users with motion sensitivity:

```typescript
const AccessibleButton = ({ children, onClick }) => {
  const prefersReducedMotion = useReducedMotion();
  const [isPressed, setIsPressed] = useState(false);
  
  const handleClick = () => {
    if (prefersReducedMotion) {
      // Provide alternative feedback
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 100);
    }
    onClick();
  };
  
  return (
    <motion.button
      className={`button ${isPressed ? 'button--pressed' : ''}`}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      onClick={handleClick}
    >
      {children}
    </motion.button>
  );
};
```

---

## Implementation Patterns

### 1. Reusable Animation Variants
Create a library of reusable animation patterns:

```typescript
// animations/variants.ts
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
};

export const slideInRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 }
};

// Stagger animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};
```

### 2. Animation Hooks
Create custom hooks for common animation patterns:

```typescript
// hooks/useStaggerAnimation.ts
export const useStaggerAnimation = (itemCount: number, delay = 0.1) => {
  const controls = useAnimation();
  
  const startAnimation = useCallback(async () => {
    await controls.start(i => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * delay }
    }));
  }, [controls, delay]);
  
  return { controls, startAnimation };
};

// hooks/useScrollAnimation.ts
export const useScrollAnimation = (threshold = 0.1) => {
  const [ref, inView] = useInView({ threshold });
  const controls = useAnimation();
  
  useEffect(() => {
    if (inView) {
      controls.start('animate');
    }
  }, [controls, inView]);
  
  return { ref, controls };
};
```

### 3. Performance Optimization
Optimize animations for better performance:

```typescript
// Use layout animations sparingly
const OptimizedList = ({ items }) => (
  <motion.div layout>
    <AnimatePresence mode="popLayout">
      {items.map(item => (
        <motion.div
          key={item.id}
          layout="position" // Only animate position, not size
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {item.content}
        </motion.div>
      ))}
    </AnimatePresence>
  </motion.div>
);

// Optimize with useMemo for expensive calculations
const ParticleSystem = ({ particleCount }) => {
  const particles = useMemo(() => 
    Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      velocity: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }
    }))
  , [particleCount]);
  
  return (
    <div className="particle-container">
      {particles.map(particle => (
        <Particle key={particle.id} {...particle} />
      ))}
    </div>
  );
};
```

---

## Best Practices

### 1. Animation Hierarchy
Establish clear animation priorities:

```typescript
// Priority levels
const ANIMATION_PRIORITY = {
  CRITICAL: 1,    // User feedback (button press, form validation)
  HIGH: 2,        // Navigation transitions
  MEDIUM: 3,      // Content animations
  LOW: 4,         // Decorative animations
  BACKGROUND: 5   // Ambient animations
};

// Disable lower priority animations under performance constraints
const useAdaptiveAnimations = () => {
  const [performanceLevel, setPerformanceLevel] = useState('high');
  
  useEffect(() => {
    const checkPerformance = () => {
      const fps = measureFPS();
      if (fps < 30) setPerformanceLevel('low');
      else if (fps < 50) setPerformanceLevel('medium');
      else setPerformanceLevel('high');
    };
    
    const interval = setInterval(checkPerformance, 5000);
    return () => clearInterval(interval);
  }, []);
  
  return performanceLevel;
};
```

### 2. Consistent Timing
Use consistent timing across related animations:

```typescript
// Animation timing system
const TIMING_SYSTEM = {
  // Base unit: 100ms
  unit: 100,
  
  // Multipliers for different animation types
  micro: 1.5,      // 150ms
  normal: 3,       // 300ms
  complex: 5,      // 500ms
  celebration: 12  // 1200ms
};

// Usage
const buttonAnimation = {
  duration: TIMING_SYSTEM.unit * TIMING_SYSTEM.micro,
  ease: EASING_CURVES.easeOut
};
```

### 3. Animation States
Manage animation states properly:

```typescript
const useAnimationState = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationQueue, setAnimationQueue] = useState([]);
  
  const queueAnimation = useCallback((animation) => {
    setAnimationQueue(prev => [...prev, animation]);
  }, []);
  
  const processQueue = useCallback(async () => {
    if (animationQueue.length === 0 || isAnimating) return;
    
    setIsAnimating(true);
    const nextAnimation = animationQueue[0];
    
    try {
      await nextAnimation();
      setAnimationQueue(prev => prev.slice(1));
    } finally {
      setIsAnimating(false);
    }
  }, [animationQueue, isAnimating]);
  
  useEffect(() => {
    processQueue();
  }, [processQueue]);
  
  return { queueAnimation, isAnimating };
};
```

---

## Common Pitfalls

### 1. Over-Animation
**Problem**: Too many animations competing for attention  
**Solution**: Use animation hierarchy and selective enhancement

```typescript
// ❌ Bad: Everything animates
const OverAnimated = () => (
  <motion.div animate={{ rotate: 360 }}>
    <motion.h1 animate={{ scale: [1, 1.1, 1] }}>
      <motion.span animate={{ color: ['red', 'blue', 'green'] }}>
        Title
      </motion.span>
    </motion.h1>
    <motion.p animate={{ y: [0, 10, 0] }}>
      Content that's hard to read
    </motion.p>
  </motion.div>
);

// ✅ Good: Selective animation
const WellAnimated = () => (
  <div>
    <motion.h1
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      Title
    </motion.h1>
    <p>Readable content</p>
  </div>
);
```

### 2. Performance Issues
**Problem**: Animating expensive properties  
**Solution**: Use transform and opacity only

```typescript
// ❌ Bad: Causes layout thrashing
const SlowAnimation = () => (
  <motion.div
    animate={{
      width: [100, 200, 100],
      height: [50, 100, 50],
      marginTop: [0, 20, 0]
    }}
  />
);

// ✅ Good: GPU-accelerated
const FastAnimation = () => (
  <motion.div
    animate={{
      scale: [1, 1.5, 1],
      opacity: [1, 0.8, 1],
      y: [0, -10, 0]
    }}
  />
);
```

### 3. Accessibility Violations
**Problem**: Ignoring motion preferences  
**Solution**: Always provide alternatives

```typescript
// ❌ Bad: Forces animation on everyone
const InaccessibleAnimation = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 2, repeat: Infinity }}
  />
);

// ✅ Good: Respects preferences
const AccessibleAnimation = () => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={prefersReducedMotion ? {} : { rotate: 360 }}
      transition={prefersReducedMotion ? {} : { duration: 2, repeat: Infinity }}
    />
  );
};
```

### 4. Memory Leaks
**Problem**: Not cleaning up animations  
**Solution**: Proper cleanup in useEffect

```typescript
// ❌ Bad: Memory leak
const LeakyAnimation = () => {
  useEffect(() => {
    const animation = element.animate(keyframes, options);
    // Missing cleanup
  }, []);
};

// ✅ Good: Proper cleanup
const CleanAnimation = () => {
  useEffect(() => {
    const animation = element.animate(keyframes, options);
    
    return () => {
      animation.cancel();
    };
  }, []);
};
```

---

## Testing Animations

### Performance Testing
```typescript
// Test animation performance
describe('Animation Performance', () => {
  it('maintains 60fps during animation', async () => {
    const { container } = render(<AnimatedComponent />);
    
    const startTime = performance.now();
    let frameCount = 0;
    
    const countFrames = () => {
      frameCount++;
      if (performance.now() - startTime < 1000) {
        requestAnimationFrame(countFrames);
      }
    };
    
    requestAnimationFrame(countFrames);
    
    // Trigger animation
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(frameCount).toBeGreaterThan(55); // Close to 60fps
    });
  });
});
```

### Accessibility Testing
```typescript
// Test reduced motion compliance
describe('Animation Accessibility', () => {
  it('respects prefers-reduced-motion', () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn(() => ({
        matches: true,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      }))
    });
    
    render(<AnimatedComponent />);
    
    // Verify animations are disabled or simplified
    const animatedElement = screen.getByTestId('animated');
    expect(animatedElement).not.toHaveClass('animate-bounce');
  });
});
```

---

These animation guidelines ensure that all animations in the Modern UI Design System are purposeful, performant, and accessible. Regular review and updates keep the guidelines current with best practices and user needs.