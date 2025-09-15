import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthLayout } from './AuthLayout';
import { AnimatedButton } from '../shared/AnimatedButton';
import { AuthService } from '../../services/authService';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface SignInFormProps {
  onSignInSuccess: () => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onSignInSuccess,
  onSwitchToRegister,
  onForgotPassword
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await AuthService.signIn(formData);
      onSignInSuccess();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (err.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.');
        } else if (err.message.includes('Too many requests')) {
          setError('Too many sign-in attempts. Please wait a few minutes before trying again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back, Hero!"
      subtitle="Sign in to continue your learning adventure"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="your.email@example.com"
            required
            disabled={loading}
          />
        </div>

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
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 disabled:opacity-50"
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
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
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2">Signing In...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </AnimatedButton>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
          disabled={loading}
        >
          Forgot your password?
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-slate-400 text-sm mb-4">
          New to Educational RPG Tutor?
        </p>
        <AnimatedButton
          type="button"
          onClick={onSwitchToRegister}
          variant="secondary"
          className="w-full"
          disabled={loading}
        >
          Create New Account
        </AnimatedButton>
      </div>

      <div className="mt-6 text-xs text-slate-400 text-center">
        <p>
          Having trouble signing in? Make sure you've confirmed your email address
          and that your account has been approved (if you're under 13).
        </p>
      </div>
    </AuthLayout>
  );
};