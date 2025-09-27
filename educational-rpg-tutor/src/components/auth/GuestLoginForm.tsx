import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GuestAuthService } from '../../services/guestAuthService';
import { AuthLayout } from './AuthLayout';
import { AnimatedButton } from '../shared/AnimatedButton';

interface GuestLoginFormProps {
  onGuestLoginSuccess?: () => void;
  onBackToAuth?: () => void;
}

export const GuestLoginForm: React.FC<GuestLoginFormProps> = ({
  onGuestLoginSuccess,
  onBackToAuth
}) => {
  const [formData, setFormData] = useState({
    name: '',
    age: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    // Age validation
    const age = parseInt(formData.age);
    if (!formData.age) {
      errors.age = 'Age is required';
    } else if (isNaN(age) || age < 3) {
      errors.age = 'Age must be 3 or above';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Create guest user with consistent localStorage keys
      const guestUser = {
        id: `guest_${Date.now()}`,
        name: formData.name.trim(),
        age: parseInt(formData.age),
        email: `guest_${Date.now()}@example.com`,
        isGuest: true
      };

      // Store in localStorage with consistent keys
      localStorage.setItem('educational_rpg_user', JSON.stringify(guestUser));
      localStorage.setItem('educational_rpg_session', 'active');

      console.log('Guest user created:', guestUser);
      
      // Call success callback
      onGuestLoginSuccess?.();
    } catch (error) {
      console.error('Guest login error:', error);
      setFormErrors({ general: 'Failed to create guest session. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout 
      title="Quick Start as Guest"
      subtitle="Start learning immediately without creating an account"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
            What should we call you?
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
            placeholder="Enter your name"
            disabled={isSubmitting}
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

        {/* Age Field */}
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-slate-300 mb-2">
            How old are you?
          </label>
          <input
            type="number"
            id="age"
            name="age"
            min="3"
            max="999"
            value={formData.age}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              formErrors.age ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder="Enter your age"
            disabled={isSubmitting}
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

        {/* General Error Display */}
        {formErrors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-3"
          >
            {formErrors.general}
          </motion.div>
        )}

        {/* Submit Button */}
        <AnimatedButton
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              <span>Starting Adventure...</span>
            </div>
          ) : (
            'Start Learning Adventure'
          )}
        </AnimatedButton>
      </form>

      {/* Guest Mode Info */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-xl">
        <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
          <span>ℹ️</span>
          Guest Mode Features
        </h3>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• Instant access to all learning content</li>
          <li>• Progress saved locally on this device</li>
          <li>• No email or account required</li>
          <li>• Perfect for trying out the app</li>
        </ul>
      </div>

      {/* Back to Auth */}
      {onBackToAuth && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onBackToAuth}
            className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
            disabled={isSubmitting}
          >
            ← Back to Login Options
          </button>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 text-xs text-slate-400 text-center">
        <p>
          Guest mode data is stored locally and will be lost if you clear your browser data.
          Create an account to save your progress permanently.
        </p>
      </div>
    </AuthLayout>
  );
};