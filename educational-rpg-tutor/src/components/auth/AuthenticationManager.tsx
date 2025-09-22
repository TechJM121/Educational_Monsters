import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { PasswordResetRequestForm } from './PasswordResetRequestForm';

type AuthView = 'login' | 'signup' | 'reset-password';

interface AuthenticationManagerProps {
  initialView?: AuthView;
  onAuthSuccess?: () => void;
  onClose?: () => void;
}

export const AuthenticationManager: React.FC<AuthenticationManagerProps> = ({
  initialView = 'login',
  onAuthSuccess,
  onClose
}) => {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);

  const handleAuthSuccess = () => {
    onAuthSuccess?.();
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleSwitchToSignUp = () => {
    setCurrentView('signup');
  };

  const handleSwitchToResetPassword = () => {
    setCurrentView('reset-password');
  };

  const handleResetSent = () => {
    // Could show a success message or redirect
    console.log('Password reset email sent');
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {currentView === 'login' && (
            <motion.div
              key="login"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <LoginForm
                onLoginSuccess={handleAuthSuccess}
                onSwitchToRegister={handleSwitchToSignUp}
                onForgotPassword={handleSwitchToResetPassword}
              />
            </motion.div>
          )}

          {currentView === 'signup' && (
            <motion.div
              key="signup"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <SignUpForm
                onSignUpSuccess={handleAuthSuccess}
                onSwitchToLogin={handleSwitchToLogin}
              />
            </motion.div>
          )}

          {currentView === 'reset-password' && (
            <motion.div
              key="reset-password"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <PasswordResetRequestForm
                onBackToLogin={handleSwitchToLogin}
                onResetSent={handleResetSent}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Close button (if provided) */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2"
          aria-label="Close authentication"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};