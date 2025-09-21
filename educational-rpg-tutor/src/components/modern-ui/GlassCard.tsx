/**
 * Glass Card Component
 * Reusable glassmorphic card component with configurable blur, opacity, and border effects
 */

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { useThemeStyles, useDeviceAdaptation } from '../../design-system';

export interface GlassCardProps {
  children: React.ReactNode;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  border?: 'subtle' | 'prominent' | 'glow';
  shadow?: 'soft' | 'medium' | 'dramatic';
  interactive?: boolean;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  blur = 'md',
  opacity = 0.1,
  border = 'subtle',
  shadow = 'soft',
  interactive = false,
  className = '',
}) => {
  const { getGlassStyles } = useThemeStyles();
  const { adaptiveConfig, shouldReduceMotion } = useDeviceAdaptation();

  // Get glass styles based on opacity level
  const glassVariant = opacity <= 0.05 ? 'light' : opacity <= 0.15 ? 'medium' : 'strong';
  const glassStyles = getGlassStyles(glassVariant);

  // Blur classes mapping
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  // Border classes mapping
  const borderClasses = {
    subtle: 'border border-white/20',
    prominent: 'border-2 border-white/30',
    glow: 'border border-white/20 shadow-glow-sm',
  };

  // Shadow classes mapping
  const shadowClasses = {
    soft: 'shadow-glass-sm',
    medium: 'shadow-glass',
    dramatic: 'shadow-glass-lg',
  };

  // Animation variants with proper typing
  const animationVariants: Variants = {
    initial: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95 
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : (adaptiveConfig?.animations?.duration || 0.3),
        ease: [0.4, 0, 0.2, 1], // cubic-bezier as array
      },
    },
    hover: interactive ? {
      y: -4,
      scale: 1.02,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    } : {},
    tap: interactive ? {
      scale: 0.98,
      transition: {
        duration: 0.1,
        ease: [0.4, 0, 0.2, 1],
      },
    } : {},
  };

  const combinedClassName = `
    ${blurClasses[blur]}
    ${borderClasses[border]}
    ${shadowClasses[shadow]}
    rounded-2xl
    p-6
    ${interactive ? 'cursor-pointer select-none' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <motion.div
      className={combinedClassName}
      style={{
        backgroundColor: glassStyles.backgroundColor,
        borderColor: glassStyles.borderColor,
        backdropFilter: adaptiveConfig?.effects?.blur ? glassStyles.backdropFilter : 'none',
      }}
      variants={animationVariants}
      initial="initial"
      animate="animate"
      whileHover={interactive && !shouldReduceMotion ? "hover" : undefined}
      whileTap={interactive && !shouldReduceMotion ? "tap" : undefined}
    >
      {children}
    </motion.div>
  );
};