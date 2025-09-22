import React from 'react';
import { motion } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
}) => {
  const { isMobile } = useResponsive();

  const baseClasses = 'font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 touch-target';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:from-blue-500 hover:to-cyan-500 border-2 border-blue-400',
    secondary: 'border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 backdrop-blur-sm',
    ghost: 'text-slate-300 hover:bg-slate-700/50 backdrop-blur-sm',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg hover:from-red-500 hover:to-red-400 border-2 border-red-400',
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
    disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className,
  ].filter(Boolean).join(' ');

  return (
    <motion.button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={disabled || loading ? {} : { scale: 0.95 }}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      transition={{ duration: 0.1 }}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </motion.button>
  );
};

// Icon button variant for mobile-friendly touch targets
interface ResponsiveIconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  'aria-label': string;
}

export const ResponsiveIconButton: React.FC<ResponsiveIconButtonProps> = ({
  children,
  onClick,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const { isMobile } = useResponsive();

  const baseClasses = 'rounded-xl transition-all duration-200 flex items-center justify-center touch-target';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:from-blue-500 hover:to-cyan-500',
    secondary: 'border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 backdrop-blur-sm',
    ghost: 'text-slate-300 hover:bg-slate-700/50 backdrop-blur-sm',
  };

  const sizeClasses = {
    sm: isMobile ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base',
    md: isMobile ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg',
    lg: isMobile ? 'w-12 h-12 text-lg' : 'w-14 h-14 text-xl',
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className,
  ].filter(Boolean).join(' ');

  return (
    <motion.button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileTap={disabled ? {} : { scale: 0.95 }}
      whileHover={disabled ? {} : { scale: 1.05 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  );
};