import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  pageKey: string;
  direction?: 'horizontal' | 'vertical' | 'fade' | 'scale';
  duration?: number;
  className?: string;
}

const transitionVariants = {
  horizontal: {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 }
  },
  vertical: {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 }
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 }
  }
};

export function PageTransition({
  children,
  pageKey,
  direction = 'horizontal',
  duration = 0.3,
  className = ''
}: PageTransitionProps) {
  const variants = transitionVariants[direction];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{
          duration,
          ease: "easeInOut"
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// World Transition Component for themed learning worlds
export function WorldTransition({
  children,
  worldKey,
  worldTheme,
  className = ''
}: {
  children: React.ReactNode;
  worldKey: string;
  worldTheme?: 'mathematics' | 'science' | 'history' | 'language' | 'art';
  className?: string;
}) {
  const getWorldColors = () => {
    switch (worldTheme) {
      case 'mathematics':
        return 'from-blue-600 to-indigo-600';
      case 'science':
        return 'from-green-600 to-emerald-600';
      case 'history':
        return 'from-amber-600 to-orange-600';
      case 'language':
        return 'from-purple-600 to-violet-600';
      case 'art':
        return 'from-pink-600 to-rose-600';
      default:
        return 'from-slate-600 to-slate-700';
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={worldKey}
        initial={{ 
          opacity: 0,
          scale: 0.8,
          rotateY: -90
        }}
        animate={{ 
          opacity: 1,
          scale: 1,
          rotateY: 0
        }}
        exit={{ 
          opacity: 0,
          scale: 1.2,
          rotateY: 90
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut"
        }}
        className={`relative ${className}`}
      >
        {/* World entrance effect */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className={`absolute inset-0 bg-gradient-to-br ${getWorldColors()} opacity-10 rounded-lg`}
        />
        
        {children}
      </motion.div>
    </AnimatePresence>
  );
}