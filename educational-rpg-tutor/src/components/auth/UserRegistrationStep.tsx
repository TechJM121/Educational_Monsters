import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedButton } from '../shared/AnimatedButton';

interface UserRegistrationStepProps {
  age: number;
  parentEmail?: string;
  onRegistrationComplete: (data: {
    name: string;
    email: string;
    password: string;
  }) => void;
  onBack: () => void;
}

export const UserRegistrationStep: React.FC<UserRegistrationStepProps> = ({
  age,
  parentEmail,
  onRegistrationComplete,
  onBack
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'Please enter your name';
    }

    if (formData.name.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    onRegistrationComplete({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password
    });
  };

  const needsParentalConsent = age < 13;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🎮</div>
        <h2 className="text-2xl font-rpg text-primary-300 mb-2">Create Your Account</h2>
        <p className="text-slate-300 text-sm">
          {needsParentalConsent 
            ? `Almost there! Just a few more details and we'll send the consent request to ${parentEmail}`
            : 'Just a few details and you can start your learning adventure!'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your name"
            required
          />
        </div>

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
              placeholder="Create a strong password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Must be at least 8 characters with uppercase, lowercase, and number
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
            Confirm Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Confirm your password"
            required
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

        <div className="flex gap-3">
          <AnimatedButton
            type="button"
            onClick={onBack}
            variant="secondary"
            className="flex-1"
          >
            Back
          </AnimatedButton>
          <AnimatedButton
            type="submit"
            className="flex-1"
          >
            {needsParentalConsent ? 'Request Consent' : 'Create Account'}
          </AnimatedButton>
        </div>
      </form>

      <div className="mt-6 text-xs text-slate-400 text-center">
        <p>
          By creating an account, you agree to our Terms of Service and Privacy Policy.
          {needsParentalConsent && ' Your account will be activated once parental consent is granted.'}
        </p>
      </div>
    </motion.div>
  );
};