import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedButton } from '../shared/AnimatedButton';

interface AgeVerificationStepProps {
  onAgeVerified: (age: number) => void;
  onBack: () => void;
}

export const AgeVerificationStep: React.FC<AgeVerificationStepProps> = ({
  onAgeVerified,
  onBack
}) => {
  const [age, setAge] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const ageNum = parseInt(age);
    
    if (!age || isNaN(ageNum)) {
      setError('Please enter a valid age');
      return;
    }

    if (ageNum < 3 || ageNum > 18) {
      setError('Age must be between 3 and 18 years old');
      return;
    }

    onAgeVerified(ageNum);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🎂</div>
        <h2 className="text-2xl font-rpg text-primary-300 mb-2">Age Verification</h2>
        <p className="text-slate-300 text-sm">
          We need to know your age to provide age-appropriate content and ensure compliance with safety regulations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-slate-300 mb-2">
            How old are you?
          </label>
          <input
            type="number"
            id="age"
            min="3"
            max="18"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your age"
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
            Continue
          </AnimatedButton>
        </div>
      </form>

      <div className="mt-6 text-xs text-slate-400 text-center">
        <p>
          Users under 13 will require parental consent to create an account.
          This is required by COPPA (Children's Online Privacy Protection Act).
        </p>
      </div>
    </motion.div>
  );
};