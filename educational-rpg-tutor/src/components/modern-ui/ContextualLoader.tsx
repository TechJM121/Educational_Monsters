import React from 'react';
import { motion } from 'framer-motion';
import type { LoadingType } from '../../contexts/LoadingContext';

export interface ContextualLoaderProps {
  type: LoadingType;
  message?: string;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showMessage?: boolean;
  showProgress?: boolean;
  variant?: 'default' | 'minimal' | 'detailed';
}

const ContextualLoader: React.FC<ContextualLoaderProps> = ({
  type,
  message,
  progress,
  size = 'md',
  className = '',
  showMessage = true,
  showProgress = false,
  variant = 'default'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-6 h-6';
      case 'lg':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'data':
        return (
          <motion.svg
            className={getSizeClasses()}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </motion.svg>
        );
      
      case 'images':
        return (
          <motion.svg
            className={getSizeClasses()}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </motion.svg>
        );
      
      case 'forms':
        return (
          <motion.svg
            className={getSizeClasses()}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </motion.svg>
        );
      
      case 'navigation':
        return (
          <motion.svg
            className={getSizeClasses()}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ x: [-2, 2, -2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </motion.svg>
        );
      
      case 'content':
        return (
          <motion.svg
            className={getSizeClasses()}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </motion.svg>
        );
      
      default:
        return (
          <motion.div
            className={`${getSizeClasses()} border-2 border-current border-t-transparent rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        );
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'data':
        return 'Loading data...';
      case 'images':
        return 'Loading images...';
      case 'forms':
        return 'Processing form...';
      case 'navigation':
        return 'Navigating...';
      case 'content':
        return 'Loading content...';
      default:
        return 'Loading...';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'data':
        return 'text-blue-500';
      case 'images':
        return 'text-green-500';
      case 'forms':
        return 'text-purple-500';
      case 'navigation':
        return 'text-orange-500';
      case 'content':
        return 'text-indigo-500';
      default:
        return 'text-gray-500';
    }
  };

  if (variant === 'minimal') {
    return (
      <motion.div
        className={`inline-flex items-center ${getTypeColor()} ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {getTypeIcon()}
      </motion.div>
    );
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        className={`flex flex-col items-center space-y-3 p-4 ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`${getTypeColor()}`}>
          {getTypeIcon()}
        </div>
        
        {showMessage && (
          <motion.p
            className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {message || getDefaultMessage()}
          </motion.p>
        )}
        
        {showProgress && progress !== undefined && (
          <motion.div
            className="w-full max-w-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      className={`inline-flex items-center space-x-2 ${className}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.3 }}
    >
      <div className={getTypeColor()}>
        {getTypeIcon()}
      </div>
      
      {showMessage && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {message || getDefaultMessage()}
        </span>
      )}
      
      {showProgress && progress !== undefined && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {Math.round(progress)}%
        </span>
      )}
    </motion.div>
  );
};

export default ContextualLoader;