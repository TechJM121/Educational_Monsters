import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface AnimatedProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  label?: string;
  animated?: boolean;
  tooltip?: string;
  className?: string;
}

const colorMap = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

export const AnimatedProgressRing: React.FC<AnimatedProgressRingProps> = ({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  color = 'primary',
  showValue = true,
  label,
  animated = true,
  tooltip,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / max) * 100, 100);

  // Smooth progress animation
  const progress = useSpring(0, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Animated number counter
  const animatedValue = useTransform(progress, [0, 100], [0, value]);
  const strokeDashoffset = useTransform(
    progress,
    [0, 100],
    [circumference, circumference - (circumference * percentage) / 100]
  );

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
      className={`relative inline-flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.svg
        width={size}
        height={size}
        className="transform -rotate-90"
        animate={{ scale: isHovered ? 1.05 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          className="transition-all duration-300"
          animate={{
            filter: isHovered 
              ? `drop-shadow(0 0 8px ${colorMap[color]}40)` 
              : 'drop-shadow(0 0 0px transparent)',
          }}
        />

        {/* Animated gradient overlay */}
        {animated && !prefersReducedMotion && (
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorMap[color]} stopOpacity="1" />
              <stop offset="100%" stopColor={colorMap[color]} stopOpacity="0.6" />
            </linearGradient>
          </defs>
        )}
      </motion.svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <motion.div
            className="text-2xl font-bold text-gray-900 dark:text-gray-100"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {displayValue}
          </motion.div>
        )}
        {label && (
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {label}
          </div>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-500">
          {Math.round(percentage)}%
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-lg z-10 whitespace-nowrap"
        >
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
        </motion.div>
      )}
    </div>
  );
};