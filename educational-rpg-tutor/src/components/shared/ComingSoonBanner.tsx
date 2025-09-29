import React from 'react';
import { motion } from 'framer-motion';

interface ComingSoonBannerProps {
  title?: string;
  description?: string;
  expectedDate?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'info' | 'warning' | 'success';
}

export const ComingSoonBanner: React.FC<ComingSoonBannerProps> = ({
  title = 'Coming Soon',
  description = 'This feature is currently in development.',
  expectedDate,
  className = '',
  size = 'md',
  variant = 'info'
}) => {
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg'
  };

  const variantClasses = {
    info: 'bg-blue-900/30 border-blue-500/30 text-blue-100',
    warning: 'bg-yellow-900/30 border-yellow-500/30 text-yellow-100',
    success: 'bg-green-900/30 border-green-500/30 text-green-100'
  };

  const iconMap = {
    info: '🚀',
    warning: '⚠️',
    success: '✨'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        backdrop-blur-sm rounded-lg border
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{iconMap[variant]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{title}</h4>
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium">
              Coming Soon
            </span>
          </div>
          <p className="opacity-90 text-sm leading-relaxed">{description}</p>
          {expectedDate && (
            <div className="mt-2 flex items-center gap-1">
              <span className="text-xs opacity-70">📅</span>
              <span className="text-xs opacity-70">Expected: {expectedDate}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};