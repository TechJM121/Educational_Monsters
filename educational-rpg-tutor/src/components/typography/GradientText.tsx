import React, { forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';

export interface GradientTextProps extends Omit<MotionProps, 'children'> {
  children: React.ReactNode;
  gradient?: 'rainbow' | 'sunset' | 'ocean' | 'forest' | 'fire' | 'cosmic' | 'custom';
  customGradient?: string;
  animated?: boolean;
  animationType?: 'shimmer' | 'wave' | 'pulse' | 'flow';
  animationDuration?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Gradient text component with animated effects
 */
export const GradientText = forwardRef<HTMLElement, GradientTextProps>(({
  children,
  gradient = 'rainbow',
  customGradient,
  animated = false,
  animationType = 'shimmer',
  animationDuration = 3,
  className = '',
  as: Component = 'span',
  ...motionProps
}, ref) => {
  // Predefined gradient styles
  const gradients = {
    rainbow: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
    sunset: 'linear-gradient(45deg, #ff6b6b, #ffa726, #ffcc02, #ff7043)',
    ocean: 'linear-gradient(45deg, #667eea, #764ba2, #667eea)',
    forest: 'linear-gradient(45deg, #11998e, #38ef7d)',
    fire: 'linear-gradient(45deg, #ff416c, #ff4b2b)',
    cosmic: 'linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c)',
    custom: customGradient || 'linear-gradient(45deg, #667eea, #764ba2)',
  };

  const selectedGradient = gradients[gradient];

  // Animation styles
  const getAnimationStyles = () => {
    const baseStyles = {
      background: selectedGradient,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
      display: 'inline-block',
    };

    if (!animated) return baseStyles;

    switch (animationType) {
      case 'shimmer':
        return {
          ...baseStyles,
          backgroundSize: '200% 100%',
          animation: `shimmer ${animationDuration}s ease-in-out infinite`,
        };
      case 'wave':
        return {
          ...baseStyles,
          backgroundSize: '400% 100%',
          animation: `wave ${animationDuration}s ease-in-out infinite`,
        };
      case 'pulse':
        return {
          ...baseStyles,
          animation: `pulse ${animationDuration}s ease-in-out infinite`,
        };
      case 'flow':
        return {
          ...baseStyles,
          backgroundSize: '300% 100%',
          animation: `flow ${animationDuration}s linear infinite`,
        };
      default:
        return baseStyles;
    }
  };

  const animationStyles = getAnimationStyles();

  return (
    <>
      {/* CSS animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes wave {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes flow {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
      `}</style>
      
      <motion.span
        ref={ref}
        className={className}
        style={animationStyles}
        as={Component}
        {...motionProps}
      >
        {children}
      </motion.span>
    </>
  );
});

GradientText.displayName = 'GradientText';