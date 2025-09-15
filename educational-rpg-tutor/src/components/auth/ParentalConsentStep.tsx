import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedButton } from '../shared/AnimatedButton';

interface ParentalConsentStepProps {
  childAge: number;
  onParentEmailProvided: (parentEmail: string) => void;
  onBack: () => void;
}

export const ParentalConsentStep: React.FC<ParentalConsentStepProps> = ({
  childAge,
  onParentEmailProvided,
  onBack
}) => {
  const [parentEmail, setParentEmail] = useState<string>('');
  const [confirmEmail, setConfirmEmail] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!parentEmail || !confirmEmail) {
      setError('Please fill in all fields');
      return;
    }

    if (parentEmail !== confirmEmail) {
      setError('Email addresses do not match');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parentEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    onParentEmailProvided(parentEmail);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
        <h2 className="text-2xl font-rpg text-primary-300 mb-2">Parental Consent Required</h2>
        <p className="text-slate-300 text-sm">
          Since you're {childAge} years old, we need your parent or guardian's permission to create your account.
        </p>
      </div>

      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="text-blue-300 font-semibold mb-2">What happens next?</h3>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• We'll send a consent request to your parent/guardian</li>
          <li>• They'll receive an email with a secure consent form</li>
          <li>• Once they approve, your account will be activated</li>
          <li>• You'll be able to start your learning adventure!</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="parentEmail" className="block text-sm font-medium text-slate-300 mb-2">
            Parent/Guardian Email Address
          </label>
          <input
            type="email"
            id="parentEmail"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="parent@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmEmail" className="block text-sm font-medium text-slate-300 mb-2">
            Confirm Email Address
          </label>
          <input
            type="email"
            id="confirmEmail"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="parent@example.com"
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
            Send Consent Request
          </AnimatedButton>
        </div>
      </form>

      <div className="mt-6 text-xs text-slate-400 text-center">
        <p>
          This is required by COPPA to protect children's privacy online.
          Your parent/guardian will need to approve your account before you can start learning.
        </p>
      </div>
    </motion.div>
  );
};