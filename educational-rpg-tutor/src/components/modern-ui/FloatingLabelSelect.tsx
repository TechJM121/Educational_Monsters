/**
 * Floating Label Select Component
 * Modern select dropdown with animated floating labels and glassmorphic styling
 */

import React, { useState, useRef, useId } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { useThemeStyles, useDeviceAdaptation } from '../../design-system';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FloatingLabelSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  success?: boolean;
  className?: string;
  'aria-describedby'?: string;
}

export const FloatingLabelSelect: React.FC<FloatingLabelSelectProps> = ({
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  options,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  error,
  success = false,
  className = '',
  'aria-describedby': ariaDescribedBy,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectId = useId();
  const errorId = useId();
  const listboxId = useId();
  
  const { getGlassStyles, theme } = useThemeStyles();
  const { shouldReduceMotion } = useDeviceAdaptation();

  const glassStyles = getGlassStyles('light');
  const hasValue = value.length > 0;
  const isFloating = isFocused || hasValue || isOpen;

  const selectedOption = options.find(option => option.value === value);

  // Label animation variants
  const labelVariants: Variants = {
    floating: {
      y: -24,
      scale: 0.85,
      color: error 
        ? theme.colors.error[500] 
        : success 
          ? theme.colors.success[500] 
          : isFocused || isOpen
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

  // Dropdown animation variants
  const dropdownVariants: Variants = {
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    closed: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.15,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // Option animation variants
  const optionVariants: Variants = {
    hover: {
      backgroundColor: theme.colors.primary[50],
      transition: {
        duration: 0.1,
      },
    },
    rest: {
      backgroundColor: 'transparent',
      transition: {
        duration: 0.1,
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

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      handleFocus();
    }
  };

  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    handleBlur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleToggle();
        break;
      case 'Escape':
        setIsOpen(false);
        handleBlur();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          handleFocus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setIsOpen(false);
          handleBlur();
        }
        break;
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        handleBlur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const combinedClassName = `
    relative
    w-full
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={combinedClassName} ref={selectRef}>
      {/* Select Container */}
      <motion.div
        className="relative rounded-xl border-2 overflow-visible"
        style={{
          backgroundColor: disabled 
            ? 'rgba(0, 0, 0, 0.05)' 
            : glassStyles.backgroundColor,
          backdropFilter: glassStyles.backdropFilter,
        }}
        variants={containerVariants}
        animate={isFocused || isOpen ? 'focused' : 'unfocused'}
        initial="unfocused"
      >
        {/* Background gradient overlay */}
        <div 
          className="absolute inset-0 opacity-5 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.secondary[500]})`,
          }}
        />

        {/* Select trigger */}
        <div
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={selectId}
          aria-describedby={error ? errorId : ariaDescribedBy}
          aria-invalid={!!error}
          tabIndex={disabled ? -1 : 0}
          className={`
            w-full px-4 pt-6 pb-2 text-base bg-transparent cursor-pointer
            flex items-center justify-between
            ${disabled ? 'cursor-not-allowed text-neutral-400' : 'text-neutral-900 dark:text-white'}
          `}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
        >
          <span className={hasValue ? '' : 'text-neutral-400'}>
            {selectedOption?.label || placeholder}
          </span>
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.2 }}
          >
            <ChevronDownIcon className="w-5 h-5 text-neutral-500" />
          </motion.div>
        </div>

        {/* Floating Label */}
        <motion.label
          id={selectId}
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

        {/* Success indicator */}
        {success && !error && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
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

      {/* Dropdown Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border-2 overflow-hidden shadow-lg"
            style={{
              backgroundColor: glassStyles.backgroundColor,
              backdropFilter: glassStyles.backdropFilter,
              borderColor: theme.colors.neutral[300],
            }}
            variants={dropdownVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div
              role="listbox"
              id={listboxId}
              className="max-h-60 overflow-y-auto"
            >
              {options.map((option, index) => (
                <motion.div
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  className={`
                    px-4 py-3 cursor-pointer text-base
                    ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${option.value === value ? 'bg-primary-50 text-primary-700' : 'text-neutral-900 dark:text-white'}
                  `}
                  variants={optionVariants}
                  initial="rest"
                  whileHover={!option.disabled ? "hover" : "rest"}
                  onClick={() => !option.disabled && handleOptionSelect(option.value)}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.05 }
                  }}
                >
                  {option.label}
                  {option.value === value && (
                    <CheckIcon className="w-4 h-4 text-primary-600 ml-auto inline" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <motion.div
        variants={{
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
        }}
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
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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