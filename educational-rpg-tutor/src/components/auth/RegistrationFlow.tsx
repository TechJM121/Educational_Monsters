import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthLayout } from './AuthLayout';
import { AgeVerificationStep } from './AgeVerificationStep';
import { ParentalConsentStep } from './ParentalConsentStep';
import { UserRegistrationStep } from './UserRegistrationStep';
import { AuthService } from '../../services/authService';
import { LoadingSpinner } from '../shared/LoadingSpinner';

type RegistrationStep = 'age' | 'consent' | 'registration' | 'complete';

interface RegistrationFlowProps {
  onRegistrationComplete: () => void;
  onBackToLogin: () => void;
}

export const RegistrationFlow: React.FC<RegistrationFlowProps> = ({
  onRegistrationComplete,
  onBackToLogin
}) => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('age');
  const [age, setAge] = useState<number>(0);
  const [parentEmail, setParentEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleAgeVerified = (verifiedAge: number) => {
    setAge(verifiedAge);
    if (verifiedAge < 13) {
      setCurrentStep('consent');
    } else {
      setCurrentStep('registration');
    }
  };

  const handleParentEmailProvided = (email: string) => {
    setParentEmail(email);
    setCurrentStep('registration');
  };

  const handleRegistrationComplete = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    setError('');

    try {
      const signUpData = {
        ...data,
        age,
        parentEmail: age < 13 ? parentEmail : undefined
      };

      const result = await AuthService.signUp(signUpData);
      
      if (result.needsParentalConsent) {
        setCurrentStep('complete');
      } else {
        onRegistrationComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'age':
        onBackToLogin();
        break;
      case 'consent':
        setCurrentStep('age');
        break;
      case 'registration':
        if (age < 13) {
          setCurrentStep('consent');
        } else {
          setCurrentStep('age');
        }
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <AuthLayout title="Creating Account">
        <div className="text-center py-8">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-300">Creating your account...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Join the Adventure"
      subtitle="Create your account to start your learning journey"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-3"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {currentStep === 'age' && (
          <AgeVerificationStep
            key="age"
            onAgeVerified={handleAgeVerified}
            onBack={handleBack}
          />
        )}

        {currentStep === 'consent' && (
          <ParentalConsentStep
            key="consent"
            childAge={age}
            onParentEmailProvided={handleParentEmailProvided}
            onBack={handleBack}
          />
        )}

        {currentStep === 'registration' && (
          <UserRegistrationStep
            key="registration"
            age={age}
            parentEmail={parentEmail}
            onRegistrationComplete={handleRegistrationComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-8"
          >
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-rpg text-primary-300 mb-4">
              Parental Consent Requested
            </h2>
            <p className="text-slate-300 mb-6">
              We've sent a consent request to <strong>{parentEmail}</strong>.
              Your account will be activated once your parent or guardian approves it.
            </p>
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-6">
              <h3 className="text-green-300 font-semibold mb-2">What's Next?</h3>
              <ul className="text-green-200 text-sm space-y-1 text-left">
                <li>• Check your parent's email for the consent request</li>
                <li>• They'll need to click the approval link</li>
                <li>• Once approved, you'll receive an email confirmation</li>
                <li>• Then you can sign in and start your adventure!</li>
              </ul>
            </div>
            <button
              onClick={onBackToLogin}
              className="rpg-button"
            >
              Back to Sign In
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="mt-8 flex justify-center space-x-2">
        {['age', 'consent', 'registration'].map((step, index) => {
          const isActive = currentStep === step;
          const isCompleted = ['age', 'consent', 'registration'].indexOf(currentStep) > index;
          const shouldShow = age >= 13 ? step !== 'consent' : true;
          
          if (!shouldShow) return null;
          
          return (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-colors ${
                isActive
                  ? 'bg-primary-500'
                  : isCompleted
                  ? 'bg-green-500'
                  : 'bg-slate-600'
              }`}
            />
          );
        })}
      </div>
    </AuthLayout>
  );
};