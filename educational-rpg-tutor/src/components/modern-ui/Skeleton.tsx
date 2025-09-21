import React from 'react';
import { motion } from 'framer-motion';

export interface SkeletonProps {
  variant: 'text' | 'card' | 'avatar' | 'chart';
  animation: 'pulse' | 'wave' | 'shimmer';
  lines?: number;
  width?: string | number;
  height?: string | number;
  className?: string;
  responsive?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant,
  animation,
  lines = 3,
  width,
  height,
  className = '',
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

  const renderTextSkeleton = () => (
    <div className={`space-y-3 ${getResponsiveClasses()} ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <motion.div
          key={i}
          className={`${getBaseClasses()} h-4`}
          style={{ 
            width: width || `${Math.random() * 40 + 60}%`,
            height: height || '1rem'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
        />
      ))}
    </div>
  );

  const renderCardSkeleton = () => (
    <motion.div
      className={`${getBaseClasses()} ${getResponsiveClasses()} ${className}`}
      style={{ 
        width: width || '100%',
        height: height || '12rem'
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6 space-y-4">
        <div className={`${getBaseClasses()} h-6 w-3/4`} />
        <div className="space-y-2">
          <div className={`${getBaseClasses()} h-4 w-full`} />
          <div className={`${getBaseClasses()} h-4 w-5/6`} />
          <div className={`${getBaseClasses()} h-4 w-4/6`} />
        </div>
        <div className={`${getBaseClasses()} h-10 w-32 rounded-full`} />
      </div>
    </motion.div>
  );

  const renderAvatarSkeleton = () => (
    <motion.div
      className={`${getBaseClasses()} rounded-full ${className}`}
      style={{ 
        width: width || '3rem',
        height: height || '3rem'
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    />
  );

  const renderChartSkeleton = () => (
    <motion.div
      className={`${getResponsiveClasses()} ${className}`}
      style={{ 
        width: width || '100%',
        height: height || '16rem'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-4">
        {/* Chart title */}
        <div className={`${getBaseClasses()} h-6 w-1/3`} />
        
        {/* Chart area */}
        <div className={`${getBaseClasses()} h-48 w-full relative overflow-hidden`}>
          {/* Simulated chart bars */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4 space-x-2">
            {Array.from({ length: 6 }, (_, i) => (
              <motion.div
                key={i}
                className={`${getBaseClasses()} w-8`}
                style={{ height: `${Math.random() * 60 + 20}%` }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.random() * 60 + 20}%` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              />
            ))}
          </div>
        </div>
        
        {/* Chart legend */}
        <div className="flex space-x-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className={`${getBaseClasses()} w-4 h-4 rounded-full`} />
              <div className={`${getBaseClasses()} h-4 w-16`} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  switch (variant) {
    case 'text':
      return renderTextSkeleton();
    case 'card':
      return renderCardSkeleton();
    case 'avatar':
      return renderAvatarSkeleton();
    case 'chart':
      return renderChartSkeleton();
    default:
      return renderTextSkeleton();
  }
};

export default Skeleton;