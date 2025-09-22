import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthenticationManager } from '../components/auth/AuthenticationManager';
import { ResponsiveContainer, ResponsiveText, ResponsiveCard } from '../components/shared/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup' | 'reset-password'>('login');

  const handleGuestLogin = async () => {
    setIsLoading(true);
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate('/app/home');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleAuthSuccess = () => {
    navigate('/app/home');
  };

  const handleShowSignIn = () => {
    setAuthView('login');
    setShowAuth(true);
  };

  const handleShowSignUp = () => {
    setAuthView('signup');
    setShowAuth(true);
  };

  if (showAuth) {
    return (
      <AuthenticationManager
        initialView={authView}
        onAuthSuccess={handleAuthSuccess}
        onClose={() => setShowAuth(false)}
      />
    );
  }

  const { isMobile } = useResponsive();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: isMobile ? 10 : 20 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <ResponsiveContainer maxWidth="md" padding="md" className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackToHome}
            className="mb-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors touch-target"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <ResponsiveText size="base">Back to Home</ResponsiveText>
          </motion.button>

          {/* Auth Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ResponsiveCard padding="lg" className="shadow-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <span className="text-2xl lg:text-3xl">🚀</span>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <ResponsiveText 
                    as="h1" 
                    size="2xl" 
                    weight="bold" 
                    className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2"
                  >
                    Welcome to LearnCraft
                  </ResponsiveText>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <ResponsiveText size="base" className="text-slate-300">
                    Your educational adventure awaits
                  </ResponsiveText>
                </motion.div>
              </div>

              {/* Auth Options */}
              <div className="space-y-4 lg:space-y-5">
                {/* Guest Login */}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                  className="w-full px-6 lg:px-8 py-4 lg:py-5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 lg:gap-4 touch-target text-base lg:text-lg"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <ResponsiveText size="base">Entering as Guest...</ResponsiveText>
                    </>
                  ) : (
                    <>
                      <span className="text-lg lg:text-xl">👤</span>
                      <ResponsiveText size="base">Continue as Guest</ResponsiveText>
                    </>
                  )}
                </motion.button>

                {/* Divider */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="flex items-center gap-4 my-6"
                >
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                  <ResponsiveText size="sm" className="text-slate-400">or</ResponsiveText>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                </motion.div>

                {/* Sign In Button */}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShowSignIn}
                  className="w-full px-6 lg:px-8 py-4 lg:py-5 border-2 border-blue-500 rounded-xl text-blue-400 font-semibold hover:bg-blue-500/10 transition-all duration-300 flex items-center justify-center gap-3 lg:gap-4 touch-target text-base lg:text-lg"
                >
                  <span className="text-lg lg:text-xl">🔐</span>
                  <ResponsiveText size="base">Sign In</ResponsiveText>
                </motion.button>

                {/* Sign Up Button */}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShowSignUp}
                  className="w-full px-6 lg:px-8 py-4 lg:py-5 border-2 border-cyan-500 rounded-xl text-cyan-400 font-semibold hover:bg-cyan-500/10 transition-all duration-300 flex items-center justify-center gap-3 lg:gap-4 touch-target text-base lg:text-lg"
                >
                  <span className="text-lg lg:text-xl">✨</span>
                  <ResponsiveText size="base">Create Account</ResponsiveText>
                </motion.button>
              </div>

              {/* Guest Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.8 }}
                className="mt-8 p-4 bg-blue-900/20 border border-blue-800/30 rounded-xl"
              >
                <ResponsiveText 
                  as="h3" 
                  size="base" 
                  weight="semibold" 
                  className="text-blue-300 mb-2 flex items-center gap-2"
                >
                  <span>ℹ️</span>
                  Guest Mode
                </ResponsiveText>
                <ResponsiveText size="sm" className="text-blue-200">
                  Try out LearnCraft without creating an account. Your progress won't be saved, 
                  but you can explore all the features and see what makes learning magical!
                </ResponsiveText>
              </motion.div>
            </ResponsiveCard>
          </motion.div>
        </motion.div>
      </ResponsiveContainer>
    </div>
  );
};