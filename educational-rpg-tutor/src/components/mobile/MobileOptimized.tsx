import React from 'react';
import { motion } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';

interface MobileOptimizedProps {
  children: React.ReactNode;
  className?: string;
  enableTouchFeedback?: boolean;
  preventZoom?: boolean;
}

export const MobileOptimized: React.FC<MobileOptimizedProps> = ({
  children,
  className = '',
  enableTouchFeedback = true,
  preventZoom = true,
}) => {
  const { isMobile, isTouch } = useResponsive();

  const touchProps = enableTouchFeedback && isTouch ? {
    whileTap: { scale: 0.98 },
    transition: { duration: 0.1 }
  } : {};

  const mobileClasses = [
    className,
    isMobile ? 'mobile-optimized' : '',
    isTouch ? 'touch-enabled' : '',
    preventZoom ? 'prevent-zoom' : '',
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className={mobileClasses}
      {...touchProps}
    >
      {children}
    </motion.div>
  );
};

// Mobile-specific button component
interface MobileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
}) => {
  const { isMobile } = useResponsive();

  const baseClasses = 'touch-target font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:from-blue-500 hover:to-cyan-500',
    secondary: 'border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10',
    ghost: 'text-slate-300 hover:bg-slate-700/50',
  };

  const sizeClasses = {
    sm: isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-sm',
    md: isMobile ? 'px-4 py-3 text-base' : 'px-6 py-3 text-base',
    lg: isMobile ? 'px-6 py-4 text-lg' : 'px-8 py-4 text-lg',
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className,
  ].filter(Boolean).join(' ');

  return (
    <motion.button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.95 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  );
};

// Mobile-friendly card component
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className = '',
  padding = 'md',
  interactive = false,
  onClick,
}) => {
  const { isMobile } = useResponsive();

  const paddingClasses = {
    sm: isMobile ? 'p-3' : 'p-4',
    md: isMobile ? 'p-4' : 'p-6',
    lg: isMobile ? 'p-6' : 'p-8',
  };

  const baseClasses = 'backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 transition-all duration-300';
  const interactiveClasses = interactive ? 'cursor-pointer hover:border-blue-400/30' : '';

  const classes = [
    baseClasses,
    paddingClasses[padding],
    interactiveClasses,
    className,
  ].filter(Boolean).join(' ');

  const cardContent = (
    <div className={classes}>
      {children}
    </div>
  );

  if (interactive) {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};

// Mobile navigation helper
interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  const { isMobile } = useResponsive();

  if (!isMobile) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Navigation */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 z-50 w-80 bg-slate-900/95 backdrop-blur-xl border-r border-blue-500/20 safe-area-inset"
      >
        {children}
      </motion.div>
    </>
  );
};