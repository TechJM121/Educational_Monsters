import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContextualLoader from './ContextualLoader';
import type { LoadingType } from '../../contexts/LoadingContext';

export interface LoadingTransitionProps {
  loading: boolean;
  type?: LoadingType;
  message?: string;
  progress?: number;
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  loaderSize?: 'sm' | 'md' | 'lg';
  transition?: 'fade' | 'slide' | 'scale' | 'blur';
  duration?: number;
  stagger?: boolean;
  preserveHeight?: boolean;
}

const LoadingTransition: React.FC<LoadingTransitionProps> = ({
  loading,
  type = 'content',
  message,
  progress,
  children,
  fallback,
  className = '',
  loaderSize = 'md',
  transition = 'fade',
  duration = 0.3,
  stagger = false,
  preserveHeight = false
}) => {
  const getTransitionVariants = () => {
    switch (transition) {
      case 'slide':
        return {
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 20 }
        };
      
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 }
        };
      
      case 'blur':
        return {
          initial: { opacity: 0, filter: 'blur(4px)' },
          animate: { opacity: 1, filter: 'blur(0px)' },
          exit: { opacity: 0, filter: 'blur(4px)' }
        };
      
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  const variants = getTransitionVariants();

  const containerVariants = stagger ? {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  } : {};

  const LoadingComponent = fallback || (
    <div className="flex items-center justify-center p-8">
      <ContextualLoader
        type={type}
        message={message}
        progress={progress}
        size={loaderSize}
        variant="detailed"
        showMessage={true}
        showProgress={progress !== undefined}
      />
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            className={preserveHeight ? 'absolute inset-0' : ''}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration }}
          >
            {LoadingComponent}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className={preserveHeight ? 'relative' : ''}
            variants={stagger ? containerVariants : variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoadingTransition;