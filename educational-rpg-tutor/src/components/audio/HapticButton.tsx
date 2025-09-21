import React, { forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useContextualSounds } from '../../hooks/useContextualSounds';
import { HapticOptions } from '../../types/haptics';

interface HapticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  enableHoverSound?: boolean;
  enableClickSound?: boolean;
  enableHoverHaptic?: boolean;
  enableClickHaptic?: boolean;
  customClickSound?: string;
  customHoverSound?: string;
  customClickHaptic?: string;
  customHoverHaptic?: string;
  hapticOptions?: HapticOptions;
  motionProps?: MotionProps;
}

export const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  enableHoverSound = true,
  enableClickSound = true,
  enableHoverHaptic = true,
  enableClickHaptic = true,
  customClickSound,
  customHoverSound,
  customClickHaptic,
  customHoverHaptic,
  hapticOptions,
  motionProps,
  className = '',
  onMouseEnter,
  onMouseDown,
  onClick,
  ...props
}, ref) => {
  const { buttonSounds, playContextualSound } = useContextualSounds();
  const { uiHaptics, triggerHaptic, isSupported: hapticSupported } = useHapticFeedback();

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger hover sound
    if (enableHoverSound) {
      if (customHoverSound) {
        playContextualSound(customHoverSound, { volume: 0.3 });
      } else {
        buttonSounds.hover();
      }
    }

    // Trigger hover haptic
    if (enableHoverHaptic && hapticSupported) {
      if (customHoverHaptic) {
        triggerHaptic(customHoverHaptic, hapticOptions);
      } else {
        uiHaptics.hover(hapticOptions);
      }
    }

    onMouseEnter?.(e);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger press haptic on mouse down for immediate feedback
    if (enableClickHaptic && hapticSupported) {
      if (customClickHaptic) {
        triggerHaptic(customClickHaptic, { ...hapticOptions, intensity: 'medium' });
      } else {
        uiHaptics.buttonPress({ ...hapticOptions, intensity: 'medium' });
      }
    }

    onMouseDown?.(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger click sound
    if (enableClickSound) {
      if (customClickSound) {
        playContextualSound(customClickSound, { volume: 0.6 });
      } else {
        buttonSounds.click();
      }
    }

    // Additional tap haptic for click completion
    if (enableClickHaptic && hapticSupported) {
      setTimeout(() => {
        uiHaptics.buttonTap({ ...hapticOptions, intensity: 'light' });
      }, 50); // Small delay after press haptic
    }

    onClick?.(e);
  };

  const variantClasses = {
    primary: 'bg-blue-500/20 border-blue-500/30 text-blue-200 hover:bg-blue-500/30 hover:border-blue-400/50',
    secondary: 'bg-gray-500/20 border-gray-500/30 text-gray-200 hover:bg-gray-500/30 hover:border-gray-400/50',
    success: 'bg-green-500/20 border-green-500/30 text-green-200 hover:bg-green-500/30 hover:border-green-400/50',
    warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200 hover:bg-yellow-500/30 hover:border-yellow-400/50',
    danger: 'bg-red-500/20 border-red-500/30 text-red-200 hover:bg-red-500/30 hover:border-red-400/50'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const baseClasses = `
    backdrop-blur-md border rounded-lg font-medium
    transition-all duration-200 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-blue-500/50
    active:scale-95 active:brightness-90
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;

  const defaultMotionProps: MotionProps = {
    whileHover: { 
      scale: 1.02, 
      y: -1,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    whileTap: { 
      scale: 0.98,
      transition: { type: "spring", stiffness: 600, damping: 30 }
    },
    ...motionProps
  };

  return (
    <motion.button
      ref={ref}
      className={baseClasses}
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      {...defaultMotionProps}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {children}
        {hapticSupported && (enableHoverHaptic || enableClickHaptic) && (
          <span className="text-xs opacity-50" title="Haptic feedback enabled">
            📳
          </span>
        )}
      </div>
    </motion.button>
  );
});