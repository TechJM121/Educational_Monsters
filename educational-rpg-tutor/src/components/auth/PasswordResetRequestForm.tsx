import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from './AuthLayout';
import { AnimatedButton } from '../shared/AnimatedButton';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface PasswordResetRequestFormProps {
  onBackToLogin?: () => void;
  onResetSent?: () => void;
}

export const PasswordResetRequestForm: React.FC<PasswordResetRequestFormProps> = ({
  onBackToLogin,
  onResetSent
}) => {
  const { resetPassword, loading, error, clearError, validateEmail } = useAuth();
  
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Clear errors when email changes
  useEffect(() => {
    if (error) clearError();
    setFormErrors({});
  }, [email, error, clearError]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      await resetPassword(email);
      setIsSuccess(true);
      onResetSent?.();
    } catch (err) {
      // Error is handled by the auth context
      console.error('Password reset error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout 
        title="Check Your Email"
        subtitle="Password reset instructions have been sent"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-2xl font-rpg text-primary-300 mb-4">
            Reset Link Sent!
          </h2>
          <p className="text-slate-300 mb-6">
            We've sent a password reset link to <strong>{email}</strong>.
            Check your inbox and follow the instructions to reset your password.
          </p>
          
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="text-blue-300 font-semibold mb-2">What's Next?</h3>
            <ul className="text-blue-200 text-sm space-y-1 text-left">
              <li>• Check your email inbox (and spam folder)</li>
              <li>• Click the reset link in the email</li>
              <li>• Create a new password</li>
              <li>• Sign in with your new password</li>
            </ul>
          </div>

          <div className="space-y-3">
            <AnimatedButton
              onClick={onBackToLogin}
              className="w-full"
            >
              Back to Sign In
            </AnimatedButton>
            
            <button
              onClick={() => {
                setIsSuccess(false);
                setEmail('');
              }}
              className="w-full text-primary-400 hover:text-primary-300 text-sm transition-colors"
            >
              Send to a different email
            </button>
          </div>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Reset Your Password"
      subtitle="Enter your email to receive reset instructions"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              formErrors.email ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder="Enter your email address"
            disabled={loading || isSubmitting}
            autoComplete="email"
            autoFocus
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
              <span className="ml-2">Sending Reset Link...</span>
            </div>
          ) : (
            'Send Reset Link'
          )}
        </AnimatedButton>
      </form>

      {/* Back to Login */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
          disabled={loading || isSubmitting}
        >
          ← Back to Sign In
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-xs text-slate-400 text-center">
        <p>
          Remember your password? You can sign in normally.
          If you don't receive the email, check your spam folder or try again.
        </p>
      </div>
    </AuthLayout>
  );
};