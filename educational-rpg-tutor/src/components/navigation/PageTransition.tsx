import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionType {
  initial: object;
  animate: object;
  exit: object;
  transition: object;
}

interface PageTransitionProps {
  children: React.ReactNode;
  transition?: PageTransitionType;
  className?: string;
}

// Default RPG-themed page transitions
const defaultTransitions: Record<string, PageTransitionType> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  slideRight: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  slideUp: {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  magical: {
    initial: { 
      scale: 0.8, 
      opacity: 0, 
      rotateY: -90,
      filter: 'blur(10px)'
    },
    animate: { 
      scale: 1, 
      opacity: 1, 
      rotateY: 0,
      filter: 'blur(0px)'
    },
    exit: { 
      scale: 0.8, 
      opacity: 0, 
      rotateY: 90,
      filter: 'blur(10px)'
    },
    transition: { 
      duration: 0.5, 
      ease: 'easeInOut',
      filter: { duration: 0.3 }
    }
  }
};

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  transition = defaultTransitions.magical,
  className = ''
}) => {
  return (
    <motion.div
      initial={transition.initial}
      animate={transition.animate}
      exit={transition.exit}
      transition={transition.transition}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Specialized transitions for different page types
export const HomePageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PageTransition transition={defaultTransitions.magical}>
    {children}
  </PageTransition>
);

export const LearningPageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PageTransition transition={defaultTransitions.slideRight}>
    {children}
  </PageTransition>
);

export const CharacterPageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PageTransition transition={defaultTransitions.scale}>
    {children}
  </PageTransition>
);

export const ModalTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PageTransition transition={defaultTransitions.slideUp}>
    {children}
  </PageTransition>
);