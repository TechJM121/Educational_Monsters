import React from 'react';
import { motion } from 'framer-motion';

export interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animation?: 'pulse' | 'wave' | 'shimmer';
  className?: string;
  shape?: 'circle' | 'square' | 'rounded';
  withName?: boolean;
  withStatus?: boolean;
}

const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 'md',
  animation = 'pulse',
  className = '',
  shape = 'circle',
  withName = false,
  withStatus = false
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

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'md':
        return 'w-12 h-12';
      case 'lg':
        return 'w-16 h-16';
      case 'xl':
        return 'w-20 h-20';
      case '2xl':
        return 'w-24 h-24';
      default:
        return 'w-12 h-12';
    }
  };

  const getShapeClasses = () => {
    switch (shape) {
      case 'circle':
        return 'rounded-full';
      case 'square':
        return 'rounded-none';
      case 'rounded':
        return 'rounded-lg';
      default:
        return 'rounded-full';
    }
  };

  const getNameWidth = () => {
    switch (size) {
      case 'sm':
        return 'w-16';
      case 'md':
        return 'w-20';
      case 'lg':
        return 'w-24';
      case 'xl':
        return 'w-28';
      case '2xl':
        return 'w-32';
      default:
        return 'w-20';
    }
  };

  const getBaseClasses = () => {
    return `bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 ${getAnimationClasses()}`;
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Avatar skeleton */}
      <div className="relative">
        <motion.div
          className={`${getBaseClasses()} ${getSizeClasses()} ${getShapeClasses()}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        
        {/* Status indicator skeleton */}
        {withStatus && (
          <motion.div
            className={`${getBaseClasses()} absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          />
        )}
      </div>
      
      {/* Name skeleton */}
      {withName && (
        <div className="space-y-1">
          <motion.div
            className={`${getBaseClasses()} h-4 ${getNameWidth()} rounded-md`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
          <motion.div
            className={`${getBaseClasses()} h-3 w-16 rounded-md`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          />
        </div>
      )}
    </div>
  );
};

export default SkeletonAvatar;