import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const SimpleAuth: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'welcome' | 'guest' | 'login' | 'signup'>('welcome');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      // Create guest user
      const guestUser = {
        id: `guest_${Date.now()}`,
        name: formData.name || 'Guest User',
        age: parseInt(formData.age) || 10,
        email: `guest_${Date.now()}@example.com`,
        isGuest: true
      };

      // Store in localStorage
      localStorage.setItem('educational_rpg_user', JSON.stringify(guestUser));
      localStorage.setItem('educational_rpg_session', 'active');

      // Navigate to app
      navigate('/app/home');
    } catch (error) {
      setError('Failed to create guest session');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const validateGuestForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    const age = parseInt(formData.age);
    if (!age || age < 3 || age > 18) {
      setError('Please enter a valid age (3-18)');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'guest') {
      if (validateGuestForm()) {
        handleGuestLogin();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎓</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Educational RPG Tutor</h1>
            <p className="text-slate-400">Start your learning adventure</p>
          </div>

          {/* Welcome Screen */}
          {authMode === 'welcome' && (
            <div className="space-y-4">
              <button
                onClick={() => setAuthMode('guest')}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <span className="text-xl">👤</span>
                Continue as Guest
              </button>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-slate-600"></div>
                <span className="text-slate-400 text-sm">or</span>
                <div className="flex-1 h-px bg-slate-600"></div>
              </div>

              <button
                onClick={() => setAuthMode('login')}
                className="w-full px-6 py-4 border-2 border-blue-500 text-blue-400 rounded-xl font-semibold hover:bg-blue-500/10 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <span className="text-xl">🔐</span>
                Sign In
              </button>

              <button
                onClick={() => setAuthMode('signup')}
                className="w-full px-6 py-4 border-2 border-purple-500 text-purple-400 rounded-xl font-semibold hover:bg-purple-500/10 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <span className="text-xl">✨</span>
                Create Account
              </button>

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-xl">
                <p className="text-blue-200 text-sm text-center">
                  <strong>Guest Mode:</strong> Try the app instantly without creating an account. 
                  Your progress will be saved locally on this device.
                </p>
              </div>
            </div>
          )}

          {/* Guest Form */}
          {authMode === 'guest' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  What's your name?
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  How old are you?
                </label>
                <input
                  type="number"
                  name="age"
                  min="3"
                  max="18"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your age"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Starting Adventure...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🚀</span>
                    Start Learning Adventure
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('welcome')}
                className="w-full text-slate-400 hover:text-slate-300 text-sm transition-colors"
                disabled={isLoading}
              >
                ← Back to options
              </button>
            </form>
          )}

          {/* Login Form */}
          {authMode === 'login' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              <div className="text-center p-4 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  🚧 Account login is currently under maintenance. Please use Guest Mode to try the app.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAuthMode('guest')}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Try Guest Mode Instead
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('welcome')}
                className="w-full text-slate-400 hover:text-slate-300 text-sm transition-colors"
              >
                ← Back to options
              </button>
            </div>
          )}

          {/* Signup Form */}
          {authMode === 'signup' && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  🚧 Account creation is currently under maintenance. Please use Guest Mode to try the app.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAuthMode('guest')}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Try Guest Mode Instead
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('welcome')}
                className="w-full text-slate-400 hover:text-slate-300 text-sm transition-colors"
              >
                ← Back to options
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};