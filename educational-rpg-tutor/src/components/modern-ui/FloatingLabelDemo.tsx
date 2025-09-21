/**
 * Floating Label Form Components Demo
 * Demonstrates the floating label input, textarea, and select components
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FloatingLabelInput } from './FloatingLabelInput';
import { FloatingLabelTextarea } from './FloatingLabelTextarea';
import { FloatingLabelSelect, type SelectOption } from './FloatingLabelSelect';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  bio: string;
  country: string;
  age: string;
  website: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  bio?: string;
  country?: string;
  age?: string;
  website?: string;
}

const countryOptions: SelectOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'au', label: 'Australia' },
  { value: 'br', label: 'Brazil' },
  { value: 'in', label: 'India' },
  { value: 'other', label: 'Other' },
];

export const FloatingLabelDemo: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    country: '',
    age: '',
    website: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Simple validation function
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    if (!formData.country) {
      newErrors.country = 'Please select your country';
    }

    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 13 || Number(formData.age) > 120)) {
      newErrors.age = 'Please enter a valid age between 13 and 120';
    }

    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL (including http:// or https://)';
    }

    return newErrors;
  };

  const handleInputChange = (field: keyof FormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          bio: '',
          country: '',
          age: '',
          website: '',
        });
        setShowSuccess(false);
      }, 3000);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      bio: '',
      country: '',
      age: '',
      website: '',
    });
    setErrors({});
    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Floating Label Form Components
          </h1>
          <p className="text-xl text-white/80">
            Modern form inputs with glassmorphic design and smooth animations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">
                User Registration Form
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FloatingLabelInput
                    label="Full Name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    error={errors.name}
                    success={!errors.name && formData.name.length >= 2}
                    required
                    autoComplete="name"
                  />

                  <FloatingLabelInput
                    label="Age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange('age')}
                    error={errors.age}
                    success={!errors.age && formData.age && !isNaN(Number(formData.age))}
                    placeholder="Optional"
                  />
                </div>

                <FloatingLabelInput
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={errors.email}
                  success={!errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)}
                  required
                  autoComplete="email"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FloatingLabelInput
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    error={errors.password}
                    success={!errors.password && formData.password.length >= 8}
                    required
                    autoComplete="new-password"
                  />

                  <FloatingLabelInput
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    error={errors.confirmPassword}
                    success={!errors.confirmPassword && formData.confirmPassword === formData.password && formData.password.length >= 8}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <FloatingLabelSelect
                  label="Country"
                  value={formData.country}
                  onChange={handleInputChange('country')}
                  options={countryOptions}
                  error={errors.country}
                  success={!errors.country && formData.country.length > 0}
                  required
                />

                <FloatingLabelInput
                  label="Website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange('website')}
                  error={errors.website}
                  success={!errors.website && formData.website && /^https?:\/\/.+\..+/.test(formData.website)}
                  placeholder="https://example.com (optional)"
                  autoComplete="url"
                />

                <FloatingLabelTextarea
                  label="Bio"
                  value={formData.bio}
                  onChange={handleInputChange('bio')}
                  error={errors.bio}
                  success={!errors.bio && formData.bio.length > 0 && formData.bio.length <= 500}
                  placeholder="Tell us about yourself (optional)"
                  rows={4}
                  maxLength={500}
                />

                <div className="flex gap-4 pt-4">
                  <GlassButton
                    type="submit"
                    variant="primary"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </GlassButton>

                  <GlassButton
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                    disabled={isSubmitting}
                  >
                    Reset
                  </GlassButton>
                </div>
              </form>

              {/* Success Message */}
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                    <div>
                      <h3 className="text-green-400 font-semibold">Success!</h3>
                      <p className="text-green-300 text-sm">
                        Account created successfully. Form will reset in a moment.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                ✨ Features
              </h3>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Smooth floating label animations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Real-time validation with gentle error animations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Glassmorphic design with backdrop blur</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Accessibility-first with ARIA support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Password visibility toggle</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Character count for textarea</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Custom select with keyboard navigation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Success indicators and error states</span>
                </li>
              </ul>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                🎯 Form States
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-white/80">Focus state with primary color</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-white/80">Success state with validation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-white/80">Error state with helpful messages</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-white/80">Disabled state</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                ⚡ Performance
              </h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>• Respects prefers-reduced-motion</li>
                <li>• GPU-accelerated animations</li>
                <li>• Optimized re-renders</li>
                <li>• Lightweight bundle impact</li>
              </ul>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Icon component
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);