import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animated?: boolean;
  glowEffect?: boolean;
  striped?: boolean;
  className?: string;
  ariaLabel?: string;
}

const colorClasses = {
  primary: 'bg-gradient-to-r from-primary-500 to-primary-400',
  secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-400',
  success: 'bg-gradient-to-r from-green-500 to-green-400',
  warning: 'bg-gradient-to-r from-yellow-500 to-yellow-400',
  danger: 'bg-gradient-to-r from-red-500 to-red-400',
};

const glowClasses = {
  primary: 'shadow-lg shadow-primary-500/50',
  secondary: 'shadow-lg shadow-secondary-500/50',
  success: 'shadow-lg shadow-green-500/50',
  warning: 'shadow-lg shadow-yellow-500/50',
  danger: 'shadow-lg shadow-red-500/50',
};

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export function ProgressBar({
  current,
  max,
  label,
  color = 'primary',
  size = 'md',
  showText = true,
  animated = true,
  glowEffect = false,
  striped = false,
  className = '',
  ariaLabel
}: ProgressBarProps) {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const targetPercentage = Math.min((current / max) * 100, 100);

  // Animate percentage changes
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayPercentage(targetPercentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayPercentage(targetPercentage);
    }
  }, [targetPercentage, animated]);

  const stripedPattern = striped ? 'bg-stripes' : '';

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-slate-300">{label}</span>
          {showText && (
            <span className="text-sm text-slate-400">
              {current.toLocaleString()} / {max.toLocaleString()}
            </span>
          )}
        </div>
      )}
      
      <div 
        className={`w-full bg-slate-700 rounded-full overflow-hidden ${sizeClasses[size]} relative`}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel || label || `Progress: ${current} of ${max}`}
      >
        <motion.div
          className={`
            ${colorClasses[color]} 
            ${sizeClasses[size]} 
            rounded-full 
            relative
            ${glowEffect ? glowClasses[color] : ''}
            ${stripedPattern}
          `}
          initial={{ width: 0 }}
          animate={{ width: `${displayPercentage}%` }}
          transition={{ 
            duration: animated ? 0.8 : 0,
            ease: "easeOut"
          }}
        >
          {/* Animated shine effect */}
          {animated && displayPercentage > 0 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            />
          )}
          
          {/* Pulse effect for active progress */}
          {animated && displayPercentage > 0 && displayPercentage < 100 && (
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-1 bg-white/50"
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>
      </div>
      
      {showText && !label && (
        <div className="flex justify-between items-center mt-1">
          <motion.span 
            className="text-xs text-slate-400"
            key={displayPercentage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {displayPercentage.toFixed(1)}%
          </motion.span>
          <span className="text-xs text-slate-400">
            {current.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}