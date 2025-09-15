import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'slate';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const colorClasses = {
  primary: 'border-primary-500',
  secondary: 'border-secondary-500',
  white: 'border-white',
  slate: 'border-slate-400'
};

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  text,
  className = ''
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status" aria-label="Loading">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
        className={`
          ${sizeClasses[size]}
          ${colorClasses[color]}
          border-4 border-t-transparent rounded-full
        `}
      />
      
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-slate-400 font-medium"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

// RPG-themed loading spinner with magical effects
export function MagicalLoadingSpinner({
  size = 'md',
  text,
  className = ''
}: Omit<LoadingSpinnerProps, 'color'>) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`
            ${sizeClasses[size]}
            border-4 border-transparent border-t-purple-500 border-r-blue-500
            rounded-full
          `}
        />
        
        {/* Inner ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`
            absolute inset-2
            border-2 border-transparent border-b-yellow-400 border-l-orange-500
            rounded-full
          `}
        />
        
        {/* Center sparkle */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 flex items-center justify-center text-yellow-400"
        >
          ✨
        </motion.div>
      </div>
      
      {text && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-sm text-slate-300 font-rpg text-center"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}