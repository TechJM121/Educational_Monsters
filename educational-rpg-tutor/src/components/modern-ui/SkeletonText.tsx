import React from 'react';
import { motion } from 'framer-motion';

export interface SkeletonTextProps {
  lines?: number;
  animation?: 'pulse' | 'wave' | 'shimmer';
  className?: string;
  lineHeight?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
}

const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  animation = 'pulse',
  className = '',
  lineHeight = 'md',
  responsive = true
}) => {
  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'wave':
        return 'animate-wave';
      case 'shimmer':
        return 'animate-shimmer';
      default:
        return 'animate-pulse';
    }
  };

  const getLineHeightClasses = () => {
    switch (lineHeight) {
      case 'sm':
        return 'h-3';
      case 'md':
        return 'h-4';
      case 'lg':
        return 'h-5';
      default:
        return 'h-4';
    }
  };

  const getBaseClasses = () => {
    return `bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 ${getAnimationClasses()} rounded-md`;
  };

  const getResponsiveClasses = () => {
    if (!responsive) return '';
    return 'w-full max-w-full';
  };

  // Generate varied line widths for more realistic skeleton
  const getLineWidth = (index: number, total: number) => {
    if (index === total - 1) {
      // Last line is typically shorter
      return `${Math.random() * 30 + 50}%`;
    }
    return `${Math.random() * 20 + 80}%`;
  };

  return (
    <div className={`space-y-3 ${getResponsiveClasses()} ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <motion.div
          key={i}
          className={`${getBaseClasses()} ${getLineHeightClasses()}`}
          style={{ width: getLineWidth(i, lines) }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            delay: i * 0.1, 
            duration: 0.3,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

export default SkeletonText;