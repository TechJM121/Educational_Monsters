import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthLayout } from './AuthLayout';
import { AnimatedButton } from '../shared/AnimatedButton';
import { supabase } from '../../services/supabaseClient';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface EmailVerificationPromptProps {
  email: string;
  onBackToSignIn: () => void;
}

export const EmailVerificationPrompt: React.FC<EmailVerificationPromptProps> = ({
  email,
  onBackToSignIn
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) throw error;

      setResendSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('rate limit')) {
          setError('Too many requests. Please wait a few minutes before trying again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to resend verification email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Check Your Email"
      subtitle="Verify your email address to continue"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="text-6xl mb-4">📧</div>
        <h2 className="text-2xl font-rpg text-primary-300 mb-4">
          Verification Email Sent!
        </h2>
        <p className="text-slate-300 mb-6">
          We've sent a verification link to <strong>{email}</strong>.
          Please check your email and click the verification link to activate your account.
        </p>

        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="text-blue-300 font-semibold mb-2">What's Next?</h3>
          <ul className="text-blue-200 text-sm space-y-1 text-left">
            <li>• Check your email inbox (and spam folder)</li>
            <li>• Click the "Confirm Email" link in the email</li>
            <li>• Return here and sign in with your credentials</li>
            <li>• Start creating your character and begin learning!</li>
          </ul>
        </div>

        {resendSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-400 text-sm text-center bg-green-900/20 border border-green-800 rounded-lg p-3 mb-4"
          >
            Verification email sent successfully! Check your inbox.
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-3 mb-4"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-3">
          <AnimatedButton
            onClick={handleResendVerification}
            variant="secondary"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Sending...</span>
              </div>
            ) : (
              'Resend Verification Email'
            )}
          </AnimatedButton>

          <AnimatedButton
            onClick={onBackToSignIn}
            className="w-full"
          >
            Back to Sign In
          </AnimatedButton>
        </div>

        <div className="mt-6 text-xs text-slate-400 text-center">
          <p>
            Didn't receive the email? Check your spam folder or try resending.
            If you continue having issues, please contact support.
          </p>
        </div>
      </motion.div>
    </AuthLayout>
  );
};