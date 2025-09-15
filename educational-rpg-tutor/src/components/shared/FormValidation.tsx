import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormValidationError } from '../../types/error';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationRules {
  [field: string]: ValidationRule;
}

interface UseFormValidationProps {
  rules: ValidationRules;
  onValidationChange?: (isValid: boolean, errors: FormValidationError[]) => void;
}

export function useFormValidation({ rules, onValidationChange }: UseFormValidationProps) {
  const [errors, setErrors] = useState<FormValidationError[]>([]);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validateField = useCallback((field: string, value: any): FormValidationError | null => {
    const rule = rules[field];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return {
        field,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
        type: 'required'
      };
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // Length validations
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return {
        field,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rule.minLength} characters`,
        type: 'length'
      };
    }

    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return {
        field,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${rule.maxLength} characters`,
        type: 'length'
      };
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return {
        field,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} format is invalid`,
        type: 'format'
      };
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return {
          field,
          message: customError,
          type: 'custom'
        };
      }
    }

    return null;
  }, [rules]);

  const validateForm = useCallback((formData: Record<string, any>): FormValidationError[] => {
    const newErrors: FormValidationError[] = [];

    Object.keys(rules).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors.push(error);
      }
    });

    setErrors(newErrors);
    onValidationChange?.(newErrors.length === 0, newErrors);
    return newErrors;
  }, [rules, validateField, onValidationChange]);

  const validateSingleField = useCallback((field: string, value: any) => {
    const error = validateField(field, value);
    
    setErrors(prev => {
      const filtered = prev.filter(e => e.field !== field);
      return error ? [...filtered, error] : filtered;
    });

    setTouched(prev => new Set(prev).add(field));
    
    const updatedErrors = errors.filter(e => e.field !== field);
    if (error) updatedErrors.push(error);
    
    onValidationChange?.(updatedErrors.length === 0, updatedErrors);
    return error;
  }, [validateField, errors, onValidationChange]);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => prev.filter(e => e.field !== field));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
    setTouched(new Set());
  }, []);

  const getFieldError = useCallback((field: string): FormValidationError | undefined => {
    return errors.find(e => e.field === field);
  }, [errors]);

  const isFieldTouched = useCallback((field: string): boolean => {
    return touched.has(field);
  }, [touched]);

  const isValid = errors.length === 0;

  return {
    errors,
    isValid,
    validateForm,
    validateSingleField,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    isFieldTouched,
    setFieldTouched: (field: string) => setTouched(prev => new Set(prev).add(field))
  };
}

interface ValidatedInputProps {
  label: string;
  field: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value: string;
  onChange: (value: string) => void;
  validation: ReturnType<typeof useFormValidation>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  helpText?: string;
}

export function ValidatedInput({
  label,
  field,
  type = 'text',
  value,
  onChange,
  validation,
  placeholder,
  disabled = false,
  className = '',
  helpText
}: ValidatedInputProps) {
  const error = validation.getFieldError(field);
  const isTouched = validation.isFieldTouched(field);
  const showError = error && isTouched;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    validation.validateSingleField(field, newValue);
  };

  const handleBlur = () => {
    validation.setFieldTouched(field);
    validation.validateSingleField(field, value);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={field}
        className="block text-sm font-medium text-slate-200"
      >
        {label}
      </label>
      
      <div className="relative">
        <input
          id={field}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            ${showError 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-600 hover:border-slate-500'
            }
          `}
          aria-invalid={showError}
          aria-describedby={showError ? `${field}-error` : helpText ? `${field}-help` : undefined}
        />
        
        {showError && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-red-500 text-sm">⚠️</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            id={`${field}-error`}
            className="text-red-400 text-sm flex items-center space-x-1"
            role="alert"
          >
            <span>❌</span>
            <span>{error.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {helpText && !showError && (
        <p id={`${field}-help`} className="text-slate-400 text-sm">
          {helpText}
        </p>
      )}
    </div>
  );
}

interface ValidatedTextareaProps {
  label: string;
  field: string;
  value: string;
  onChange: (value: string) => void;
  validation: ReturnType<typeof useFormValidation>;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
  helpText?: string;
}

export function ValidatedTextarea({
  label,
  field,
  value,
  onChange,
  validation,
  placeholder,
  disabled = false,
  rows = 3,
  className = '',
  helpText
}: ValidatedTextareaProps) {
  const error = validation.getFieldError(field);
  const isTouched = validation.isFieldTouched(field);
  const showError = error && isTouched;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    validation.validateSingleField(field, newValue);
  };

  const handleBlur = () => {
    validation.setFieldTouched(field);
    validation.validateSingleField(field, value);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={field}
        className="block text-sm font-medium text-slate-200"
      >
        {label}
      </label>
      
      <div className="relative">
        <textarea
          id={field}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`
            w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200 resize-vertical
            ${showError 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-600 hover:border-slate-500'
            }
          `}
          aria-invalid={showError}
          aria-describedby={showError ? `${field}-error` : helpText ? `${field}-help` : undefined}
        />
      </div>

      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            id={`${field}-error`}
            className="text-red-400 text-sm flex items-center space-x-1"
            role="alert"
          >
            <span>❌</span>
            <span>{error.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {helpText && !showError && (
        <p id={`${field}-help`} className="text-slate-400 text-sm">
          {helpText}
        </p>
      )}
    </div>
  );
}