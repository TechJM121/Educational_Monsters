import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface AnimatedProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  animated?: boolean;
  tooltip?: string;
  className?: string;
}

const colorClasses = {
  primary: 'from-blue-500 to-blue-600',
  secondary: 'from-purple-500 to-purple-600',
  success: 'from-green-500 to-green-600',
  warning: 'from-yellow-500 to-yellow-600',
  error: 'from-red-500 to-red-600',
};

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  value,
  max,
  label,
  color = 'primary',
  size = 'md',
  showValue = true,
  animated = true,
  tooltip,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const percentage = Math.min((value / max) * 100, 100);
  
  // Smooth progress animation
  const progress = useSpring(0, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Animated number counter
  const animatedValue = useTransform(progress, [0, 100], [0, value]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value);
      progress.set(percentage);
    } else {
      progress.set(percentage);
      
      // Animate the display value
      const unsubscribe = animatedValue.on('change', (latest) => {
        setDisplayValue(Math.round(latest));
      });

      return unsubscribe;
    }
  }, [value, percentage, progress, animatedValue, prefersReducedMotion]);

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          {showValue && (
            <motion.span 
              className="text-sm font-semibold text-gray-900 dark:text-gray-100"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {displayValue} / {max}
            </motion.span>
          )}
        </div>
      )}
      
      <div className={`relative bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full relative overflow-hidden`}
          style={{ width: useTransform(progress, (v) => `${v}%`) }}
          animate={{
            boxShadow: isHovered 
              ? '0 0 20px rgba(59, 130, 246, 0.5)' 
              : '0 0 0px rgba(59, 130, 246, 0)',
          }}
          transition={{ duration: 0.3 }}
        >
          {animated && !prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}
        </motion.div>
      </div>

      {/* Tooltip */}
      {tooltip && isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-lg z-10"
        >
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
        </motion.div>
      )}
    </div>
  );
};