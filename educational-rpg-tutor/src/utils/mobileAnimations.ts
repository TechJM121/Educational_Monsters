import { Variants, Transition } from 'framer-motion';

// Detect if device is mobile
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
};

// Detect if device supports touch
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Get device performance tier
export const getDevicePerformanceTier = (): 'low' | 'medium' | 'high' => {
  if (typeof window === 'undefined') return 'medium';
  
  const memory = (navigator as any).deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 2;
  const connection = (navigator as any).connection;
  
  // Consider network speed
  const isSlowNetwork = connection && 
    (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
  
  if (isSlowNetwork || memory < 2 || cores < 2) return 'low';
  if (memory >= 8 && cores >= 8) return 'high';
  return 'medium';
};

// Mobile-optimized animation variants
export const mobileAnimationVariants = {
  // Faster, simpler animations for mobile
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: isMobile() ? 0.2 : 0.3 }
    }
  } as Variants,

  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: isMobile() ? 0.25 : 0.4,
        ease: "easeOut"
      }
    }
  } as Variants,

  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: isMobile() ? 0.2 : 0.3,
        ease: "easeOut"
      }
    }
  } as Variants,

  stagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile() ? 0.05 : 0.1,
        delayChildren: 0.1
      }
    }
  } as Variants,

  // Touch-friendly button animations
  button: {
    idle: { scale: 1 },
    pressed: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    },
    hover: isTouchDevice() ? {} : { 
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  } as Variants,

  // Swipe animations
  swipeLeft: {
    initial: { x: 0 },
    exit: { 
      x: -300, 
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  } as Variants,

  swipeRight: {
    initial: { x: 0 },
    exit: { 
      x: 300, 
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  } as Variants
};

// Mobile-optimized transition presets
export const mobileTransitions = {
  quick: {
    duration: 0.15,
    ease: "easeOut"
  } as Transition,

  smooth: {
    duration: 0.25,
    ease: "easeInOut"
  } as Transition,

  bouncy: {
    type: "spring",
    stiffness: 300,
    damping: 25
  } as Transition,

  gentle: {
    type: "spring",
    stiffness: 200,
    damping: 30
  } as Transition
};

// Adaptive animation configuration based on device
export const getAdaptiveAnimationConfig = () => {
  const performanceTier = getDevicePerformanceTier();
  const mobile = isMobile();
  
  return {
    // Reduce animation complexity on low-end devices
    enableParticles: performanceTier !== 'low',
    enableBlur: performanceTier === 'high',
    enableShadows: performanceTier !== 'low',
    
    // Adjust animation durations
    durationMultiplier: mobile ? 0.7 : 1,
    
    // Reduce stagger delays on mobile
    staggerDelay: mobile ? 0.05 : 0.1,
    
    // Simplify easing on low-end devices
    easing: performanceTier === 'low' ? 'linear' : 'easeOut',
    
    // Reduce motion on request
    respectReducedMotion: true
  };
};

// Haptic feedback patterns
export const hapticPatterns = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 50, 10],
  error: [50, 100, 50],
  warning: [20, 50, 20]
};

// Trigger haptic feedback
export const triggerHaptic = (pattern: keyof typeof hapticPatterns = 'light') => {
  if ('vibrate' in navigator && typeof navigator.vibrate === 'function' && isTouchDevice()) {
    navigator.vibrate(hapticPatterns[pattern]);
  }
};

// Mobile-specific gesture animations
export const gestureAnimations = {
  pullToRefresh: {
    initial: { y: -50, opacity: 0 },
    pulling: { y: 0, opacity: 1 },
    released: { 
      y: -50, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  } as Variants,

  swipeToDelete: {
    initial: { x: 0, backgroundColor: 'transparent' },
    swiping: { x: -100, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    deleted: { 
      x: -300, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  } as Variants,

  longPressMenu: {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  } as Variants
};

// Performance monitoring for animations
export const monitorAnimationPerformance = () => {
  if (typeof window === 'undefined') return;
  
  let frameCount = 0;
  let lastTime = performance.now();
  
  const measureFPS = () => {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      
      // Log performance warnings
      if (fps < 30) {
        console.warn('Low FPS detected:', fps, 'Consider reducing animation complexity');
      }
      
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(measureFPS);
  };
  
  requestAnimationFrame(measureFPS);
};