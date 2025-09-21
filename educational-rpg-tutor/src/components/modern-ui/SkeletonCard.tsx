import React from 'react';
import { motion } from 'framer-motion';

export interface SkeletonCardProps {
  animation?: 'pulse' | 'wave' | 'shimmer';
  className?: string;
  width?: string | number;
  height?: string | number;
  hasImage?: boolean;
  hasButton?: boolean;
  textLines?: number;
  responsive?: boolean;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  animation = 'pulse',
  className = '',
  width,
  height,
  hasImage = true,
  hasButton = true,
  textLines = 3,
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

  const getBaseClasses = () => {
    return `bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 ${getAnimationClasses()} rounded-lg`;
  };

  const getResponsiveClasses = () => {
    if (!responsive) return '';
    return 'w-full max-w-full';
  };

  return (
    <motion.div
      className={`${getBaseClasses()} ${getResponsiveClasses()} ${className} overflow-hidden`}
      style={{ 
        width: width || '100%',
        height: height || 'auto'
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="p-6 space-y-4">
        {/* Image placeholder */}
        {hasImage && (
          <motion.div
            className={`${getBaseClasses()} h-32 w-full rounded-md`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
        )}
        
        {/* Title placeholder */}
        <motion.div
          className={`${getBaseClasses()} h-6 w-3/4`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        />
        
        {/* Text content placeholders */}
        <div className="space-y-2">
          {Array.from({ length: textLines }, (_, i) => (
            <motion.div
              key={i}
              className={`${getBaseClasses()} h-4`}
              style={{ 
                width: i === textLines - 1 
                  ? `${Math.random() * 30 + 50}%` 
                  : `${Math.random() * 20 + 80}%` 
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: 0.3 + (i * 0.1), 
                duration: 0.3 
              }}
            />
          ))}
        </div>
        
        {/* Button placeholder */}
        {hasButton && (
          <motion.div
            className={`${getBaseClasses()} h-10 w-32 rounded-full`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: 0.5, 
              duration: 0.3,
              type: "spring",
              stiffness: 200
            }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default SkeletonCard;