import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from './AuthLayout';
import { AnimatedButton } from '../shared/AnimatedButton';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import GoogleSignInButton from './GoogleSignInButton';

interface LoginFormProps {
  onLoginSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onSwitchToRegister,
  onForgotPassword
}) => {
  const { signIn, loading, error, clearError, validateEmail } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear errors when form data changes
  useEffect(() => {
    if (error) clearError();
    setFormErrors({});
  }, [formData, error, clearError]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      await signIn(formData);
      onLoginSuccess?.();
    } catch (err) {
      // Error is handled by the auth context
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = (errorMessage: string) => {
    console.error('Google sign in error:', errorMessage);
  };

  return (
    <AuthLayout 
      title="Welcome Back, Hero!"
      subtitle="Sign in to continue your learning adventure"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              formErrors.email ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder="your.email@example.com"
            disabled={loading || isSubmitting}
            autoComplete="email"
          />
          {formErrors.email && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm mt-1"
            >
              {formErrors.email}
            </motion.p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12 transition-colors ${
                formErrors.password ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Enter your password"
              disabled={loading || isSubmitting}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 disabled:opacity-50 transition-colors"
              disabled={loading || isSubmitting}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {formErrors.password && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm mt-1"
            >
              {formErrors.password}
            </motion.p>
          )}
        </div>

        {/* Global Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-3"
          >
            {error}
          </motion.div>
        )}

        {/* Submit Button */}
        <AnimatedButton
          type="submit"
          className="w-full"
          disabled={loading || isSubmitting}
        >
          {loading || isSubmitting ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2">Signing In...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </AnimatedButton>
      </form>

      {/* OAuth Section */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
          </div>
        </div>
        
        <div className="mt-6">
          <GoogleSignInButton 
            onError={handleGoogleError}
            redirectTo="/dashboard"
          />
        </div>
      </div>

      {/* Forgot Password Link */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
          disabled={loading || isSubmitting}
        >
          Forgot your password?
        </button>
      </div>

      {/* Switch to Register */}
      <div className="mt-8 text-center">
        <p className="text-slate-400 text-sm mb-4">
          New to Educational RPG Tutor?
        </p>
        <AnimatedButton
          type="button"
          onClick={onSwitchToRegister}
          variant="secondary"
          className="w-full"
          disabled={loading || isSubmitting}
        >
          Create New Account
        </AnimatedButton>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-xs text-slate-400 text-center">
        <p>
          Having trouble signing in? Make sure you've confirmed your email address
          and that your account has been approved (if you're under 13).
        </p>
      </div>
    </AuthLayout>
  );
};