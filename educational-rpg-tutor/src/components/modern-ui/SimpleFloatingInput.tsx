/**
 * Simple Floating Label Input Component
 * Simplified version for testing without complex theme dependencies
 */

import React, { useState, useRef, useId } from 'react';
import { motion, type Variants } from 'framer-motion';

export interface SimpleFloatingInputProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
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
  autoComplete?: string;
  maxLength?: number;
  pattern?: string;
  'aria-describedby'?: string;
}

export const SimpleFloatingInput: React.FC<SimpleFloatingInputProps> = ({
  label,
  type = 'text',
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
  autoComplete,
  maxLength,
  pattern,
  'aria-describedby': ariaDescribedBy,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const errorId = useId();

  const hasValue = value.length > 0;
  const isFloating = isFocused || hasValue;

  // Simple color scheme
  const colors = {
    primary: '#3b82f6',
    error: '#ef4444',
    success: '#10b981',
    neutral: '#6b7280',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
  };

  // Label animation variants
  const labelVariants: Variants = {
    floating: {
      y: -24,
      scale: 0.85,
      color: error 
        ? colors.error
        : success 
          ? colors.success 
          : isFocused 
            ? colors.primary
            : colors.neutral,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    resting: {
      y: 0,
      scale: 1,
      color: colors.neutral,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // Input container animation variants
  const containerVariants: Variants = {
    focused: {
      borderColor: error 
        ? colors.error
        : success 
          ? colors.success 
          : colors.primary,
      boxShadow: error
        ? `0 0 0 3px ${colors.error}20`
        : success
          ? `0 0 0 3px ${colors.success}20`
          : `0 0 0 3px ${colors.primary}20`,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    unfocused: {
      borderColor: error 
        ? colors.error
        : colors.border,
      boxShadow: '0 0 0 0px transparent',
      transition: {
        duration: 0.2,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

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
    ${disabled ? 'cursor-not-allowed text-gray-400' : 'text-gray-900 dark:text-white'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="relative w-full">
      {/* Input Container */}
      <motion.div
        className="relative rounded-xl border-2 overflow-hidden backdrop-blur-md"
        style={{
          backgroundColor: disabled 
            ? 'rgba(0, 0, 0, 0.05)' 
            : colors.background,
        }}
        variants={containerVariants}
        animate={isFocused ? 'focused' : 'unfocused'}
        initial="unfocused"
      >
        {/* Input field */}
        <input
          ref={inputRef}
          id={inputId}
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          pattern={pattern}
          placeholder={placeholder}
          className={combinedClassName}
          aria-describedby={error ? errorId : ariaDescribedBy}
          aria-invalid={!!error}
        />

        {/* Floating Label */}
        <motion.label
          htmlFor={inputId}
          className="absolute left-4 pointer-events-none select-none font-medium origin-left"
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

        {/* Password toggle button */}
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              {showPassword ? (
                <EyeOffIcon className="w-5 h-5 text-gray-500" />
              ) : (
                <EyeIcon className="w-5 h-5 text-gray-500" />
              )}
            </motion.div>
          </button>
        )}

        {/* Success indicator */}
        {success && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
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
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-2"
        >
          <div
            id={errorId}
            className="flex items-center gap-2 px-1"
            role="alert"
            aria-live="polite"
          >
            <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-600 dark:text-red-400">
              {error}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Simple icon components
const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

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