import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthLayout } from './AuthLayout';
import { AnimatedButton } from '../shared/AnimatedButton';
import { supabase } from '../../services/supabaseClient';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface PasswordResetFormProps {
  onBackToSignIn: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onBackToSignIn
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('rate limit')) {
          setError('Too many reset requests. Please wait a few minutes before trying again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout 
        title="Check Your Email"
        subtitle="Password reset instructions sent"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-8"
        >
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-2xl font-rpg text-primary-300 mb-4">
            Reset Link Sent!
          </h2>
          <p className="text-slate-300 mb-6">
            We've sent a password reset link to <strong>{email}</strong>.
            Check your email and follow the instructions to reset your password.
          </p>
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="text-blue-300 font-semibold mb-2">What's Next?</h3>
            <ul className="text-blue-200 text-sm space-y-1 text-left">
              <li>• Check your email inbox (and spam folder)</li>
              <li>• Click the "Reset Password" link in the email</li>
              <li>• Create a new secure password</li>
              <li>• Sign in with your new password</li>
            </ul>
          </div>
          <AnimatedButton
            onClick={onBackToSignIn}
            className="w-full"
          >
            Back to Sign In
          </AnimatedButton>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Reset Password"
      subtitle="Enter your email to receive reset instructions"
    >
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🔐</div>
        <p className="text-slate-300 text-sm">
          Don't worry! It happens to the best of heroes. 
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="your.email@example.com"
            required
            disabled={loading}
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-3"
          >
            {error}
          </motion.div>
        )}

        <AnimatedButton
          type="submit"
          className="w-full"
          disabled={loading || !email}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2">Sending Reset Link...</span>
            </div>
          ) : (
            'Send Reset Link'
          )}
        </AnimatedButton>
      </form>

      <div className="mt-8 text-center">
        <p className="text-slate-400 text-sm mb-4">
          Remember your password?
        </p>
        <AnimatedButton
          type="button"
          onClick={onBackToSignIn}
          variant="secondary"
          className="w-full"
          disabled={loading}
        >
          Back to Sign In
        </AnimatedButton>
      </div>

      <div className="mt-6 text-xs text-slate-400 text-center">
        <p>
          If you don't receive an email within a few minutes, check your spam folder
          or try again with a different email address.
        </p>
      </div>
    </AuthLayout>
  );
};