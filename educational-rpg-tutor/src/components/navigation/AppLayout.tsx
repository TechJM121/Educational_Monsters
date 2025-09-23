import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
}

const navigationItems: NavigationItem[] = [
  { path: '/app/home', label: 'Home', icon: '🏰' },
  { path: '/app/learning', label: 'Learning', icon: '📚' },
  { path: '/app/ai-tutor', label: 'AI Tutor', icon: '🤖' },
  { path: '/app/character', label: 'Character', icon: '🧙‍♂️' },
  { path: '/app/quests', label: 'Quests', icon: '⚔️' },
  { path: '/app/game-modes', label: 'Game Modes', icon: '🎮' },
  { path: '/app/achievements', label: 'Achievements', icon: '🏆' },
  { path: '/app/inventory', label: 'Inventory', icon: '🎒' },
  { path: '/app/leaderboard', label: 'Leaderboard', icon: '👑' }
];

interface AppLayoutProps {
  showNavigation?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  showNavigation = true 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Check screen size
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!showNavigation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="flex">
        {/* Sidebar Navigation */}
        <motion.aside
          initial={isLargeScreen ? { x: 0 } : { x: -300 }}
          animate={isLargeScreen ? { x: 0 } : { x: isMenuOpen ? 0 : -300 }}
          transition={{ duration: 0.3 }}
          className={`${
            isLargeScreen 
              ? 'relative w-72 xl:w-80' 
              : 'fixed inset-y-0 left-0 z-50 w-72 sm:w-80'
          } bg-slate-900/95 backdrop-blur-xl border-r border-blue-500/20 safe-area-inset`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 sm:p-6 border-b border-blue-500/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl sm:text-2xl">🚀</span>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    LearnCraft
                  </h1>
                  <p className="text-xs text-slate-400">Guest Mode</p>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {navigationItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        navigate(item.path);
                        if (!isLargeScreen) {
                          setIsMenuOpen(false);
                        }
                      }}
                      className={`w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl">{item.icon}</span>
                      <span className="font-medium text-sm sm:text-base">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-2 h-2 bg-white rounded-full"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-blue-500/20">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/auth')}
                className="w-full px-4 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create Account
              </motion.button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-sm border-b border-blue-500/20 safe-area-inset">
            <div className="flex items-center justify-between p-3 sm:p-4">
              {/* Mobile menu button */}
              {!isLargeScreen && (
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors touch-target"
                  aria-label="Toggle navigation menu"
                >
                  <motion.div
                    animate={{ rotate: isMenuOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-xl sm:text-2xl text-white">☰</span>
                  </motion.div>
                </button>
              )}

              {/* Page Title */}
              <div className={`flex-1 min-w-0 ${!isLargeScreen ? 'ml-2 sm:ml-4' : ''}`}>
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white truncate">
                  {navigationItems.find(item => item.path === location.pathname)?.label || 'LearnCraft'}
                </h2>
              </div>

              {/* User info */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className="text-right hidden md:block">
                  <p className="text-xs lg:text-sm text-slate-300">Welcome,</p>
                  <p className="text-blue-400 font-bold text-xs lg:text-sm">Guest Explorer</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-base sm:text-lg lg:text-xl">
                  👤
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="relative">
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </main>
        </div>

        {/* Mobile Overlay */}
        {isMenuOpen && !isLargeScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </div>
    </div>
  );
};