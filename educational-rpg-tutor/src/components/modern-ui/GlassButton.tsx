/**
 * Glass Button Component
 * Button component with glassmorphic styling and micro-interactions
 */

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { useThemeStyles, useDeviceAdaptation } from '../../design-system';

export interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  blur = 'md',
  className = '',
  type = 'button',
}) => {
  const { getGlassStyles, theme } = useThemeStyles();
  const { adaptiveConfig, shouldReduceMotion } = useDeviceAdaptation();

  // Get glass styles for the button
  const glassStyles = getGlassStyles('medium');

  // Size classes mapping
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // Blur classes mapping
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  // Variant color mapping
  const variantColors = {
    primary: {
      background: theme.colors.primary[500],
      hover: theme.colors.primary[400],
      active: theme.colors.primary[600],
    },
    secondary: {
      background: theme.colors.secondary[500],
      hover: theme.colors.secondary[400],
      active: theme.colors.secondary[600],
    },
    accent: {
      background: theme.colors.accent[500],
      hover: theme.colors.accent[400],
      active: theme.colors.accent[600],
    },
  };

  // Animation variants with micro-interactions
  const buttonVariants: Variants = {
    initial: {
      scale: 1,
      boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.25)',
    },
    hover: !disabled && !loading ? {
      scale: 1.05,
      y: -2,
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.4)',
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    } : {},
    tap: !disabled && !loading ? {
      scale: 0.95,
      y: 0,
      boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.3)',
      transition: {
        duration: 0.1,
        ease: [0.4, 0, 0.2, 1],
      },
    } : {},
    disabled: {
      scale: 1,
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  };

  // Loading spinner animation
  const spinnerVariants: Variants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  const combinedClassName = `
    ${blurClasses[blur]}
    ${sizeClasses[size]}
    rounded-xl
    font-medium
    border border-white/30
    relative
    overflow-hidden
    transition-colors duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-white/50
    focus:ring-offset-2
    focus:ring-offset-transparent
    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const buttonStyle = {
    backgroundColor: disabled 
      ? 'rgba(255, 255, 255, 0.05)' 
      : glassStyles.backgroundColor,
    borderColor: glassStyles.borderColor,
    backdropFilter: adaptiveConfig?.effects.blur ? glassStyles.backdropFilter : 'none',
    color: disabled ? 'rgba(255, 255, 255, 0.5)' : 'white',
  };

  return (
    <motion.button
      className={combinedClassName}
      style={buttonStyle}
      variants={buttonVariants}
      initial="initial"
      animate={disabled ? "disabled" : "initial"}
      whileHover={!disabled && !loading && !shouldReduceMotion ? "hover" : undefined}
      whileTap={!disabled && !loading && !shouldReduceMotion ? "tap" : undefined}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      type={type}
    >
      {/* Background gradient overlay */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-20"
        style={{
          background: `linear-gradient(135deg, ${variantColors[variant].background}, ${variantColors[variant].hover})`,
        }}
        initial={{ opacity: 0.2 }}
        whileHover={!disabled && !loading ? { opacity: 0.3 } : {}}
        transition={{ duration: 0.2 }}
      />

      {/* Content container */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            variants={spinnerVariants}
            animate="animate"
          />
        )}
        
        <motion.span
          initial={{ opacity: 1 }}
          animate={{ opacity: loading ? 0.7 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>
      </div>

      {/* Ripple effect overlay */}
      {!disabled && !loading && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(circle at center, ${variantColors[variant].active}40 0%, transparent 70%)`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
};