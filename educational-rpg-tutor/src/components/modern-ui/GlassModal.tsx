/**
 * Glass Modal Component
 * Modal component with glassmorphic backdrop and content area
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useThemeStyles, useDeviceAdaptation } from '../../design-system';

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  blur = 'lg',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
}) => {
  const { getGlassStyles } = useThemeStyles();
  const { adaptiveConfig, shouldReduceMotion } = useDeviceAdaptation();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Get glass styles for the modal
  const glassStyles = getGlassStyles('medium');

  // Size classes mapping
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Blur classes mapping
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  // Backdrop animation variants
  const backdropVariants: Variants = {
    hidden: {
      opacity: 0,
      backdropFilter: 'blur(0px)',
    },
    visible: {
      opacity: 1,
      backdropFilter: adaptiveConfig?.effects.blur 
        ? `blur(${blur === 'sm' ? '4px' : blur === 'md' ? '8px' : blur === 'lg' ? '12px' : '16px'})` 
        : 'blur(0px)',
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      opacity: 0,
      backdropFilter: 'blur(0px)',
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // Modal content animation variants
  const modalVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.3,
        ease: [0.4, 0, 0.2, 1],
        delay: shouldReduceMotion ? 0 : 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -20,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // Handle escape key press
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && closeOnEscape) {
      onClose();
    }
  }, [closeOnEscape, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  }, [closeOnBackdropClick, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      // Add escape key listener
      if (closeOnEscape) {
        document.addEventListener('keydown', handleEscapeKey);
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      
      // Remove escape key listener
      document.removeEventListener('keydown', handleEscapeKey);
      
      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeOnEscape, handleEscapeKey]);

  // Focus trap implementation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }, []);

  const modalClassName = `
    ${sizeClasses[size]}
    w-full
    max-h-[90vh]
    overflow-y-auto
    rounded-2xl
    border border-white/30
    relative
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const modalStyle = {
    backgroundColor: glassStyles.backgroundColor,
    borderColor: glassStyles.borderColor,
    backdropFilter: adaptiveConfig?.effects.blur ? glassStyles.backdropFilter : 'none',
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
          data-testid="modal-backdrop"
        >
          <motion.div
            ref={modalRef}
            className={modalClassName}
            style={modalStyle}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            data-testid="modal-content"
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                {title && (
                  <h2 
                    id="modal-title" 
                    className="text-xl font-semibold text-white"
                  >
                    {title}
                  </h2>
                )}
                
                {showCloseButton && (
                  <motion.button
                    className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close modal"
                    data-testid="modal-close-button"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};