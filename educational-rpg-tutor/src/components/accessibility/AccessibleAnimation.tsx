/**
 * AccessibleAnimation Component
 * Wrapper component that makes animations screen reader friendly
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimationControls, useAnimation } from 'framer-motion';
import { useScreenReader, useFocusManagement } from '../../hooks/useScreenReader';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface AccessibleAnimationProps {
  children: React.ReactNode;
  animationType: 'micro' | 'transition' | 'loading' | 'celebration';
  description?: string;
  announceStart?: boolean;
  announceComplete?: boolean;
  maintainFocus?: boolean;
  trapFocus?: boolean;
  className?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
  [key: string]: any; // Allow other motion props
}

export const AccessibleAnimation: React.FC<AccessibleAnimationProps> = ({
  children,
  animationType,
  description,
  announceStart = false,
  announceComplete = false,
  maintainFocus = false,
  trapFocus = false,
  className = '',
  ariaLabel,
  ariaDescribedBy,
  role,
  onAnimationStart,
  onAnimationComplete,
  ...motionProps
}) => {
  const { announceAnimationState, isScreenReaderActive, createAnnouncers } = useScreenReader();
  const { preferences } = useReducedMotion();
  const { saveFocus, restoreFocus, trapFocus: enableFocusTrap, releaseFocusTrap } = useFocusManagement();
  const controls = useAnimation();
  const elementRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle animation lifecycle
  useEffect(() => {
    const handleAnimationStart = () => {
      setIsAnimating(true);
      
      if (maintainFocus) {
        saveFocus();
      }
      
      if (trapFocus && elementRef.current) {
        enableFocusTrap(elementRef.current);
      }
      
      if (announceStart && isScreenReaderActive) {
        announceAnimationState(animationType, 'started', description);
      }
      
      onAnimationStart?.();
    };

    const handleAnimationComplete = () => {
      setIsAnimating(false);
      
      if (maintainFocus) {
        restoreFocus();
      }
      
      if (trapFocus) {
        releaseFocusTrap();
      }
      
      if (announceComplete && isScreenReaderActive) {
        announceAnimationState(animationType, 'completed', description);
      }
      
      onAnimationComplete?.();
    };

    // Set up animation event listeners
    const element = elementRef.current;
    if (element) {
      element.addEventListener('animationstart', handleAnimationStart);
      element.addEventListener('animationend', handleAnimationComplete);
      element.addEventListener('transitionstart', handleAnimationStart);
      element.addEventListener('transitionend', handleAnimationComplete);
    }

    return () => {
      if (element) {
        element.removeEventListener('animationstart', handleAnimationStart);
        element.removeEventListener('animationend', handleAnimationComplete);
        element.removeEventListener('transitionstart', handleAnimationStart);
        element.removeEventListener('transitionend', handleAnimationComplete);
      }
    };
  }, [
    announceStart,
    announceComplete,
    maintainFocus,
    trapFocus,
    animationType,
    description,
    isScreenReaderActive,
    announceAnimationState,
    saveFocus,
    restoreFocus,
    enableFocusTrap,
    releaseFocusTrap,
    onAnimationStart,
    onAnimationComplete,
  ]);

  // Generate accessibility attributes
  const accessibilityProps = {
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-live': isAnimating ? 'polite' : undefined,
    'aria-busy': isAnimating,
    role: role || (isAnimating ? 'status' : undefined),
  };

  // Filter out our custom props from motion props
  const {
    animationType: _,
    description: __,
    announceStart: ___,
    announceComplete: ____,
    maintainFocus: _____,
    trapFocus: ______,
    ariaLabel: _______,
    ariaDescribedBy: ________,
    role: _________,
    onAnimationStart: __________,
    onAnimationComplete: ___________,
    ...cleanMotionProps
  } = motionProps;

  return (
    <>
      <motion.div
        ref={elementRef}
        className={className}
        animate={controls}
        {...accessibilityProps}
        {...cleanMotionProps}
      >
        {children}
      </motion.div>
      {isScreenReaderActive && createAnnouncers()}
    </>
  );
};

// Higher-order component for making existing components accessible
export const withAccessibleAnimation = <P extends object>(
  Component: React.ComponentType<P>,
  defaultAnimationType: AccessibleAnimationProps['animationType'] = 'micro'
) => {
  return React.forwardRef<HTMLDivElement, P & Partial<AccessibleAnimationProps>>((props, ref) => {
    const {
      animationType = defaultAnimationType,
      description,
      announceStart,
      announceComplete,
      maintainFocus,
      trapFocus,
      ariaLabel,
      ariaDescribedBy,
      role,
      onAnimationStart,
      onAnimationComplete,
      ...componentProps
    } = props;

    return (
      <AccessibleAnimation
        ref={ref}
        animationType={animationType}
        description={description}
        announceStart={announceStart}
        announceComplete={announceComplete}
        maintainFocus={maintainFocus}
        trapFocus={trapFocus}
        ariaLabel={ariaLabel}
        ariaDescribedBy={ariaDescribedBy}
        role={role}
        onAnimationStart={onAnimationStart}
        onAnimationComplete={onAnimationComplete}
      >
        <Component {...(componentProps as P)} />
      </AccessibleAnimation>
    );
  });
};

// Accessible button component with built-in animation
export const AccessibleAnimatedButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
}> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  ariaLabel,
  ariaDescribedBy,
  className = '',
}) => {
  const { preferences } = useReducedMotion();
  const { announce } = useScreenReader();

  const handleClick = () => {
    if (!disabled) {
      announce('Button activated', 'polite');
      onClick?.();
    }
  };

  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <AccessibleAnimation
      animationType="micro"
      announceStart={false}
      announceComplete={false}
      whileHover={preferences.enableMicroAnimations ? { scale: 1.02 } : {}}
      whileTap={preferences.enableMicroAnimations ? { scale: 0.98 } : {}}
      transition={{ duration: 0.1 * preferences.animationDuration }}
    >
      <button
        onClick={handleClick}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${disabled ? disabledClasses : ''}
          ${className}
        `}
      >
        {children}
      </button>
    </AccessibleAnimation>
  );
};

// Accessible modal component with focus management
export const AccessibleAnimatedModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ isOpen, onClose, title, children, className = '' }) => {
  const { preferences } = useReducedMotion();
  const { announce } = useScreenReader();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      announce(`Modal opened: ${title}`, 'polite');
    }
  }, [isOpen, title, announce]);

  const handleClose = () => {
    announce('Modal closed', 'polite');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AccessibleAnimation
      animationType="transition"
      announceStart={false}
      announceComplete={false}
      maintainFocus={true}
      trapFocus={true}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 * preferences.animationDuration }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <AccessibleAnimation
        animationType="transition"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 * preferences.animationDuration }}
        className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 ${className}`}
        ref={modalRef}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </AccessibleAnimation>
    </AccessibleAnimation>
  );
};