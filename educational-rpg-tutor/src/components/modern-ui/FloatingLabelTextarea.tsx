/**
 * Floating Label Textarea Component
 * Modern textarea with animated floating labels and glassmorphic styling
 */

import React, { useState, useRef, useId } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useThemeStyles, useDeviceAdaptation } from '../../design-system';

export interface FloatingLabelTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  success?: boolean;
  className?: string;
  rows?: number;
  maxLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  'aria-describedby'?: string;
}

export const FloatingLabelTextarea: React.FC<FloatingLabelTextareaProps> = ({
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  disabled = false,
  required = false,
  error,
  success = false,
  className = '',
  rows = 4,
  maxLength,
  resize = 'vertical',
  'aria-describedby': ariaDescribedBy,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaId = useId();
  const errorId = useId();
  
  const { getGlassStyles, theme } = useThemeStyles();
  const { shouldReduceMotion } = useDeviceAdaptation();

  const glassStyles = getGlassStyles('light');
  const hasValue = value.length > 0;
  const isFloating = isFocused || hasValue;

  // Label animation variants
  const labelVariants: Variants = {
    floating: {
      y: -24,
      scale: 0.85,
      color: error 
        ? theme.colors.error[500] 
        : success 
          ? theme.colors.success[500] 
          : isFocused 
            ? theme.colors.primary[400] 
            : theme.colors.neutral[400],
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    resting: {
      y: 0,
      scale: 1,
      color: theme.colors.neutral[500],
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // Container animation variants
  const containerVariants: Variants = {
    focused: {
      borderColor: error 
        ? theme.colors.error[500] 
        : success 
          ? theme.colors.success[500] 
          : theme.colors.primary[400],
      boxShadow: error
        ? `0 0 0 3px ${theme.colors.error[500]}20`
        : success
          ? `0 0 0 3px ${theme.colors.success[500]}20`
          : `0 0 0 3px ${theme.colors.primary[400]}20`,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    unfocused: {
      borderColor: error 
        ? theme.colors.error[500] 
        : theme.colors.neutral[300],
      boxShadow: '0 0 0 0px transparent',
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // Error message animation variants
  const errorVariants: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      height: 'auto',
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    hidden: {
      opacity: 0,
      y: -10,
      height: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  const combinedClassName = `
    w-full
    px-4
    pt-6
    pb-2
    text-base
    bg-transparent
    border-0
    outline-none
    placeholder-transparent
    peer
    ${resizeClasses[resize]}
    ${disabled ? 'cursor-not-allowed text-neutral-400' : 'text-neutral-900 dark:text-white'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="relative w-full">
      {/* Textarea Container */}
      <motion.div
        className="relative rounded-xl border-2 overflow-hidden"
        style={{
          backgroundColor: disabled 
            ? 'rgba(0, 0, 0, 0.05)' 
            : glassStyles.backgroundColor,
          backdropFilter: glassStyles.backdropFilter,
        }}
        variants={containerVariants}
        animate={isFocused ? 'focused' : 'unfocused'}
        initial="unfocused"
      >
        {/* Background gradient overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.secondary[500]})`,
          }}
        />

        {/* Textarea field */}
        <textarea
          ref={textareaRef}
          id={textareaId}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          rows={rows}
          placeholder={placeholder}
          className={combinedClassName}
          aria-describedby={error ? errorId : ariaDescribedBy}
          aria-invalid={!!error}
        />

        {/* Floating Label */}
        <motion.label
          htmlFor={textareaId}
          className="absolute left-4 top-4 pointer-events-none select-none font-medium origin-left"
          variants={labelVariants}
          animate={isFloating ? 'floating' : 'resting'}
          initial="resting"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </motion.label>

        {/* Character count */}
        {maxLength && (
          <div className="absolute bottom-2 right-3 text-xs text-neutral-400">
            {value.length}/{maxLength}
          </div>
        )}

        {/* Success indicator */}
        {success && !error && (
          <div className="absolute top-4 right-3">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <CheckIcon className="w-5 h-5 text-green-500" />
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Error Message */}
      <motion.div
        variants={errorVariants}
        animate={error ? 'visible' : 'hidden'}
        initial="hidden"
        className="overflow-hidden"
      >
        {error && (
          <div
            id={errorId}
            className="flex items-center gap-2 mt-2 px-1"
            role="alert"
            aria-live="polite"
          >
            <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-600 dark:text-red-400">
              {error}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Icon components
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ExclamationTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);