import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from './AuthLayout';
import { AnimatedButton } from '../shared/AnimatedButton';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import GoogleSignInButton from './GoogleSignInButton';

interface SignUpFormProps {
  onSignUpSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSignUpSuccess,
  onSwitchToLogin
}) => {
  const { signUp, loading, error, clearError, validateEmail, validatePassword, checkEmailExists } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    parentEmail: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({ isValid: false, errors: [] });

  // Clear errors when form data changes
  useEffect(() => {
    if (error) clearError();
    setFormErrors({});
  }, [formData, error, clearError]);

  // Validate password in real-time
  useEffect(() => {
    if (formData.password) {
      setPasswordValidation(validatePassword(formData.password));
    }
  }, [formData.password, validatePassword]);

  const validateForm = async (): Promise<boolean> => {
    const errors: { [key: string]: string } = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    } else {
      // Check if email already exists
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        errors.email = 'An account with this email already exists';
      }
    }

    // Age validation
    const age = parseInt(formData.age);
    if (!formData.age) {
      errors.age = 'Age is required';
    } else if (isNaN(age) || age < 3 || age > 18) {
      errors.age = 'Age must be between 3 and 18 years old';
    }

    // Parent email validation for users under 13
    if (age < 13) {
      if (!formData.parentEmail) {
        errors.parentEmail = 'Parent email is required for users under 13';
      } else if (!validateEmail(formData.parentEmail)) {
        errors.parentEmail = 'Please enter a valid parent email address';
      } else if (formData.parentEmail.toLowerCase() === formData.email.toLowerCase()) {
        errors.parentEmail = 'Parent email must be different from your email';
      }
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0] || 'Password does not meet requirements';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
    
    const isValid = await validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    
    try {
      await signUp({
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
        age: parseInt(formData.age),
        parentEmail: formData.parentEmail || undefined
      });
      onSignUpSuccess?.();
    } catch (err) {
      // Error is handled by the auth context
      console.error('Sign up error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = (errorMessage: string) => {
    console.error('Google sign up error:', errorMessage);
  };

  const age = parseInt(formData.age);
  const needsParentEmail = !isNaN(age) && age < 13;

  return (
    <AuthLayout 
      title="Join the Adventure!"
      subtitle="Create your account to start your learning journey"
    >
      {/* Google OAuth Option */}
      <div className="mb-6">
        <GoogleSignInButton 
          onError={handleGoogleError}
          redirectTo="/auth/complete-setup"
        />
        
        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800 text-slate-400">Or create account manually</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name and Age Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                formErrors.name ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Enter your full name"
              disabled={loading || isSubmitting}
              autoComplete="name"
            />
            {formErrors.name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-1"
              >
                {formErrors.name}
              </motion.p>
            )}
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-slate-300 mb-2">
              Your Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              min="3"
              max="18"
              value={formData.age}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                formErrors.age ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Enter your age"
              disabled={loading || isSubmitting}
            />
            {formErrors.age && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-1"
              >
                {formErrors.age}
              </motion.p>
            )}
          </div>
        </div>

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

        {/* Parent Email Field (conditional) */}
        {needsParentEmail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label htmlFor="parentEmail" className="block text-sm font-medium text-slate-300 mb-2">
              Parent's Email Address *
            </label>
            <input
              type="email"
              id="parentEmail"
              name="parentEmail"
              value={formData.parentEmail}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                formErrors.parentEmail ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="parent@example.com"
              disabled={loading || isSubmitting}
              autoComplete="email"
            />
            <p className="text-xs text-slate-400 mt-1">
              We'll send a consent request to your parent or guardian.
            </p>
            {formErrors.parentEmail && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-1"
              >
                {formErrors.parentEmail}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Password Fields */}
        <div className="space-y-4">
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
                placeholder="Create a strong password"
                disabled={loading || isSubmitting}
                autoComplete="new-password"
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12 transition-colors ${
                  formErrors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="Confirm your password"
                disabled={loading || isSubmitting}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 disabled:opacity-50 transition-colors"
                disabled={loading || isSubmitting}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-1"
              >
                {formErrors.confirmPassword}
              </motion.p>
            )}
          </div>

          {/* Password Requirements */}
          {formData.password && (
            <div className="text-xs bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-slate-400 mb-2 font-medium">Password requirements:</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                {passwordValidation.errors.map((error, index) => (
                  <div key={index} className="text-red-400 flex items-center">
                    <span className="mr-1 text-xs">•</span>
                    <span className="text-xs">{error}</span>
                  </div>
                ))}
                {passwordValidation.isValid && (
                  <div className="text-green-400 flex items-center col-span-full">
                    <span className="mr-1">✓</span>
                    <span className="text-xs font-medium">Password meets all requirements</span>
                  </div>
                )}
              </div>
            </div>
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
          disabled={loading || isSubmitting || !passwordValidation.isValid}
        >
          {loading || isSubmitting ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2">Creating Account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </AnimatedButton>
      </form>

      {/* Switch to Login */}
      <div className="mt-8 text-center">
        <p className="text-slate-400 text-sm mb-4">
          Already have an account?
        </p>
        <AnimatedButton
          type="button"
          onClick={onSwitchToLogin}
          variant="secondary"
          className="w-full"
          disabled={loading || isSubmitting}
        >
          Sign In Instead
        </AnimatedButton>
      </div>

      {/* Terms and Privacy */}
      <div className="mt-6 text-xs text-slate-400 text-center">
        <p>
          By creating an account, you agree to our Terms of Service and Privacy Policy.
          Users under 13 require parental consent as required by COPPA.
        </p>
      </div>
    </AuthLayout>
  );
};