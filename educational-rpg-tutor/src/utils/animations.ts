import { Variants } from 'framer-motion';

// Common animation variants
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
};

export const slideInFromBottom: Variants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 50 }
};

// RPG-specific animations
export const levelUpAnimation: Variants = {
  initial: { scale: 1, rotate: 0 },
  animate: { 
    scale: [1, 1.2, 1.1, 1],
    rotate: [0, 5, -5, 0]
  },
  exit: { scale: 0.8, opacity: 0 }
};

export const xpGainAnimation: Variants = {
  initial: { opacity: 0, y: 0, scale: 0.8 },
  animate: { 
    opacity: [0, 1, 1, 0],
    y: [0, -30, -60, -80],
    scale: [0.8, 1, 1.1, 0.9]
  },
  exit: { opacity: 0 }
};

export const achievementUnlockAnimation: Variants = {
  initial: { scale: 0, rotate: -180, opacity: 0 },
  animate: { 
    scale: [0, 1.2, 1],
    rotate: [-180, 10, 0],
    opacity: 1
  },
  exit: { scale: 0, opacity: 0 }
};

export const statImprovementAnimation: Variants = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.1, 1],
    transition: { duration: 0.3 }
  }
};

export const cardHoverAnimation: Variants = {
  initial: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02,
    y: -2,
    transition: { duration: 0.2 }
  }
};

export const buttonPressAnimation: Variants = {
  initial: { scale: 1 },
  tap: { scale: 0.95 }
};

export const floatingAnimation: Variants = {
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const glowAnimation: Variants = {
  animate: {
    boxShadow: [
      "0 0 5px rgba(59, 130, 246, 0.5)",
      "0 0 20px rgba(59, 130, 246, 0.8)",
      "0 0 5px rgba(59, 130, 246, 0.5)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Stagger animations for lists
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

// Page transition animations
export const pageTransition = {
  initial: { opacity: 0, x: 300 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -300 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

// Modal animations
export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.8, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: 20 }
};

// Notification animations
export const notificationSlideIn: Variants = {
  initial: { opacity: 0, x: 300, scale: 0.8 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 300, scale: 0.8 }
};

// Loading animations
export const pulseAnimation: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Character animations
export const characterIdleAnimation: Variants = {
  animate: {
    y: [0, -2, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const characterCelebrationAnimation: Variants = {
  animate: {
    rotate: [0, 10, -10, 0],
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  }
};

// Utility functions for animation timing
export const getStaggerDelay = (index: number, baseDelay: number = 0.1): number => {
  return index * baseDelay;
};

export const getRandomDelay = (min: number = 0, max: number = 0.5): number => {
  return Math.random() * (max - min) + min;
};

// Animation presets for different contexts
export const animationPresets = {
  gentle: {
    duration: 0.3,
    ease: "easeOut"
  },
  bouncy: {
    type: "spring",
    stiffness: 300,
    damping: 20
  },
  smooth: {
    duration: 0.5,
    ease: "easeInOut"
  },
  quick: {
    duration: 0.15,
    ease: "easeOut"
  },
  dramatic: {
    duration: 0.8,
    ease: "easeInOut"
  }
} as const;

// Reduced motion support
export const respectsReducedMotion = (animation: any) => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return {
      ...animation,
      transition: { duration: 0 }
    };
  }
  return animation;
};