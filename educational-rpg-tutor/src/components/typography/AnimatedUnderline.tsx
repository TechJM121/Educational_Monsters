import React, { forwardRef, useState } from 'react';
import { motion, MotionProps } from 'framer-motion';

export interface AnimatedUnderlineProps extends Omit<MotionProps, 'children'> {
  children: React.ReactNode;
  underlineType?: 'solid' | 'gradient' | 'dashed' | 'dotted' | 'wavy';
  color?: string;
  gradient?: string;
  thickness?: number;
  animationType?: 'expand' | 'slide' | 'fade' | 'draw' | 'bounce';
  trigger?: 'hover' | 'focus' | 'always' | 'manual';
  duration?: number;
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  active?: boolean;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
}

/**
 * Animated underline component with various effects
 */
export const AnimatedUnderline = forwardRef<HTMLElement, AnimatedUnderlineProps>(({
  children,
  underlineType = 'solid',
  color = 'currentColor',
  gradient,
  thickness = 2,
  animationType = 'expand',
  trigger = 'hover',
  duration = 0.3,
  delay = 0,
  className = '',
  as: Component = 'span',
  active = false,
  onAnimationStart,
  onAnimationComplete,
  ...motionProps
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Determine if underline should be visible
  const shouldShowUnderline = () => {
    switch (trigger) {
      case 'hover':
        return isHovered;
      case 'focus':
        return isFocused;
      case 'always':
        return true;
      case 'manual':
        return active;
      default:
        return false;
    }
  };

  // Get underline background style
  const getUnderlineBackground = () => {
    if (gradient) return gradient;
    return color;
  };

  // Animation variants for different types
  const getUnderlineVariants = () => {
    const baseTransition = {
      duration,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94],
    };

    switch (animationType) {
      case 'expand':
        return {
          hidden: { scaleX: 0, opacity: 1 },
          visible: { 
            scaleX: 1, 
            opacity: 1,
            transition: { ...baseTransition, onStart: onAnimationStart, onComplete: onAnimationComplete }
          },
        };
      case 'slide':
        return {
          hidden: { x: '-100%', opacity: 1 },
          visible: { 
            x: '0%', 
            opacity: 1,
            transition: { ...baseTransition, onStart: onAnimationStart, onComplete: onAnimationComplete }
          },
        };
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { ...baseTransition, onStart: onAnimationStart, onComplete: onAnimationComplete }
          },
        };
      case 'draw':
        return {
          hidden: { pathLength: 0, opacity: 1 },
          visible: { 
            pathLength: 1, 
            opacity: 1,
            transition: { ...baseTransition, onStart: onAnimationStart, onComplete: onAnimationComplete }
          },
        };
      case 'bounce':
        return {
          hidden: { scaleX: 0, opacity: 1 },
          visible: { 
            scaleX: 1, 
            opacity: 1,
            transition: { 
              ...baseTransition, 
              type: 'spring',
              stiffness: 300,
              damping: 20,
              onStart: onAnimationStart, 
              onComplete: onAnimationComplete 
            }
          },
        };
      default:
        return {
          hidden: { scaleX: 0, opacity: 1 },
          visible: { 
            scaleX: 1, 
            opacity: 1,
            transition: { ...baseTransition, onStart: onAnimationStart, onComplete: onAnimationComplete }
          },
        };
    }
  };

  const underlineVariants = getUnderlineVariants();

  // Get underline style based on type
  const getUnderlineStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      right: 0,
      height: `${thickness}px`,
      background: getUnderlineBackground(),
      transformOrigin: 'left',
    };

    switch (underlineType) {
      case 'dashed':
        return {
          ...baseStyle,
          backgroundImage: `repeating-linear-gradient(90deg, ${color} 0, ${color} 4px, transparent 4px, transparent 8px)`,
          background: 'none',
        };
      case 'dotted':
        return {
          ...baseStyle,
          backgroundImage: `repeating-linear-gradient(90deg, ${color} 0, ${color} 2px, transparent 2px, transparent 6px)`,
          background: 'none',
        };
      case 'wavy':
        return {
          ...baseStyle,
          background: 'none',
          borderBottom: 'none',
        };
      case 'gradient':
        return {
          ...baseStyle,
          background: gradient || `linear-gradient(90deg, ${color}, transparent)`,
        };
      default:
        return baseStyle;
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <motion.span
      ref={ref}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      as={Component}
      {...motionProps}
    >
      {children}
      
      {/* Regular underlines */}
      {underlineType !== 'wavy' && (
        <motion.span
          style={getUnderlineStyle()}
          variants={underlineVariants}
          initial="hidden"
          animate={shouldShowUnderline() ? 'visible' : 'hidden'}
        />
      )}
      
      {/* Wavy underline using SVG */}
      {underlineType === 'wavy' && (
        <motion.svg
          className="absolute bottom-0 left-0 w-full overflow-visible"
          height={thickness * 2}
          viewBox="0 0 100 4"
          preserveAspectRatio="none"
          variants={underlineVariants}
          initial="hidden"
          animate={shouldShowUnderline() ? 'visible' : 'hidden'}
        >
          <motion.path
            d="M0,2 Q25,0 50,2 T100,2"
            stroke={color}
            strokeWidth={thickness}
            fill="none"
            variants={animationType === 'draw' ? {
              hidden: { pathLength: 0 },
              visible: { pathLength: 1 }
            } : undefined}
          />
        </motion.svg>
      )}
    </motion.span>
  );
});

AnimatedUnderline.displayName = 'AnimatedUnderline';