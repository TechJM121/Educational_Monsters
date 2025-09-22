import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { AuthenticationManager } from './AuthenticationManager';
import { AnimatedButton } from '../shared/AnimatedButton';

export const AuthDemo: React.FC = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup' | 'reset-password'>('login');

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-rpg text-yellow-400 mb-4">
            🎮 Authentication System Demo
          </h1>
          <p className="text-slate-300 text-lg">
            Complete authentication system with Google OAuth, password management, and COPPA compliance
          </p>
        </motion.div>

        {user && profile ? (
          // Authenticated User View
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg p-6 border border-slate-700"
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-rpg text-primary-300 mb-2">
                Welcome back, {profile.name}!
              </h2>
              <p className="text-slate-400">
                You are successfully authenticated
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Profile Info</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-400">Name:</span> {profile.name}</p>
                  <p><span className="text-slate-400">Email:</span> {profile.email}</p>
                  <p><span className="text-slate-400">Age:</span> {profile.age}</p>
                  <p><span className="text-slate-400">Parental Consent:</span> {profile.parentalConsentGiven ? '✅ Given' : '❌ Required'}</p>
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Account Status</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-400">User ID:</span> {user.id.substring(0, 8)}...</p>
                  <p><span className="text-slate-400">Email Confirmed:</span> {user.emailConfirmed ? '✅ Yes' : '❌ No'}</p>
                  <p><span className="text-slate-400">Created:</span> {new Date(profile.createdAt).toLocaleDateString()}</p>
                  <p><span className="text-slate-400">Last Updated:</span> {new Date(profile.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <AnimatedButton
                onClick={handleSignOut}
                variant="secondary"
                disabled={loading}
              >
                {loading ? 'Signing Out...' : 'Sign Out'}
              </AnimatedButton>
            </div>
          </motion.div>
        ) : (
          // Unauthenticated User View
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg p-6 border border-slate-700"
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔐</div>
              <h2 className="text-2xl font-rpg text-primary-300 mb-2">
                Authentication Required
              </h2>
              <p className="text-slate-400">
                Choose an option below to test the authentication system
              </p>
            </div>

            <div className="grid gap-4 mb-6">
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">🔑 Sign In</h3>
                <p className="text-slate-400 text-sm mb-3">
                  Sign in with existing credentials or Google OAuth
                </p>
                <AnimatedButton
                  onClick={() => {
                    setAuthView('login');
                    setShowAuth(true);
                  }}
                  className="w-full"
                >
                  Open Sign In Form
                </AnimatedButton>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">📝 Sign Up</h3>
                <p className="text-slate-400 text-sm mb-3">
                  Create a new account with age verification and parental consent
                </p>
                <AnimatedButton
                  onClick={() => {
                    setAuthView('signup');
                    setShowAuth(true);
                  }}
                  className="w-full"
                  variant="secondary"
                >
                  Open Sign Up Form
                </AnimatedButton>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">🔄 Password Reset</h3>
                <p className="text-slate-400 text-sm mb-3">
                  Reset your password via email
                </p>
                <AnimatedButton
                  onClick={() => {
                    setAuthView('reset-password');
                    setShowAuth(true);
                  }}
                  className="w-full"
                  variant="secondary"
                >
                  Open Password Reset
                </AnimatedButton>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <h3 className="text-blue-300 font-semibold mb-2">✨ Features Included</h3>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>• Email/password authentication</li>
                <li>• Google OAuth integration</li>
                <li>• Age verification (3-18 years)</li>
                <li>• COPPA compliance (parental consent for under 13)</li>
                <li>• Password strength validation</li>
                <li>• Email verification</li>
                <li>• Password reset functionality</li>
                <li>• Real-time form validation</li>
                <li>• Responsive design</li>
                <li>• Accessibility features</li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};