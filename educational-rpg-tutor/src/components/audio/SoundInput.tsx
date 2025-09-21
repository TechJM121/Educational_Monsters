import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useContextualSounds } from '../../hooks/useContextualSounds';

interface SoundInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  enableFocusSound?: boolean;
  enableErrorSound?: boolean;
  enableSuccessSound?: boolean;
  variant?: 'default' | 'glass';
}

export const SoundInput = forwardRef<HTMLInputElement, SoundInputProps>(({
  label,
  error,
  success,
  enableFocusSound = true,
  enableErrorSound = true,
  enableSuccessSound = true,
  variant = 'glass',
  className = '',
  onFocus,
  onChange,
  ...props
}, ref) => {
  const { formSounds } = useContextualSounds();
  const [isFocused, setIsFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (enableFocusSound) {
      formSounds.inputFocus();
    }
    onFocus?.(e);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    onChange?.(e);
  };

  // Play error/success sounds when status changes
  React.useEffect(() => {
    if (!hasInteracted) return;
    
    if (error && enableErrorSound) {
      formSounds.inputError();
    } else if (success && enableSuccessSound) {
      formSounds.inputSuccess();
    }
  }, [error, success, hasInteracted, enableErrorSound, enableSuccessSound, formSounds]);

  const variantClasses = {
    default: 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20',
    glass: 'bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/50 focus:border-white/40 focus:ring-white/20'
  };

  const inputClasses = `
    w-full px-4 py-3 rounded-lg border transition-all duration-200
    focus:outline-none focus:ring-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantClasses[variant]}
    ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}
    ${success ? 'border-green-400 focus:border-green-400 focus:ring-green-400/20' : ''}
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <motion.label
          className={`block text-sm font-medium ${
            variant === 'glass' ? 'text-white/90' : 'text-gray-700'
          }`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        <motion.input
          ref={ref}
          className={inputClasses}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          animate={{
            scale: isFocused ? 1.01 : 1,
            y: isFocused ? -1 : 0
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          {...props}
        />
        
        {/* Success indicator */}
        {success && (
          <motion.div
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.div>
        )}
        
        {/* Error indicator */}
        {error && (
          <motion.div
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <motion.p
          className="text-sm text-red-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
      
      {/* Success message */}
      {success && (
        <motion.p
          className="text-sm text-green-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {success}
        </motion.p>
      )}
    </div>
  );
});