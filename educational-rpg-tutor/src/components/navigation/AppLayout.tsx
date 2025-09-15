import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RPGNavigationMenu } from './RPGNavigationMenu';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';
import { NavigationItem } from '../../types/navigation';
import { useSupabase } from '../../hooks/useSupabase';

const navigationItems: NavigationItem[] = [
  {
    path: '/home',
    label: 'Castle Home',
    icon: '🏰',
    requiresAuth: true
  },
  {
    path: '/learning',
    label: 'Learning Worlds',
    icon: '🌍',
    requiresAuth: true,
    children: [
      { path: '/learning/worlds', label: 'All Worlds', icon: '🗺️', requiresAuth: true },
      { path: '/learning/session', label: 'Active Session', icon: '📖', requiresAuth: true }
    ]
  },
  {
    path: '/character',
    label: 'Character Sheet',
    icon: '⚔️',
    requiresAuth: true,
    children: [
      { path: '/character/stats', label: 'Stats & Abilities', icon: '📊', requiresAuth: true },
      { path: '/character/customization', label: 'Customization', icon: '🎨', requiresAuth: true }
    ]
  },
  {
    path: '/quests',
    label: 'Quest Journal',
    icon: '📜',
    requiresAuth: true
  },
  {
    path: '/achievements',
    label: 'Achievement Hall',
    icon: '🏆',
    requiresAuth: true
  },
  {
    path: '/inventory',
    label: 'Inventory Bag',
    icon: '🎒',
    requiresAuth: true
  },
  {
    path: '/leaderboard',
    label: 'Leaderboard',
    icon: '👑',
    requiresAuth: true
  },
  {
    path: '/parent-dashboard',
    label: 'Parent Portal',
    icon: '👨‍👩‍👧‍👦',
    requiresAuth: true
  }
];

interface AppLayoutProps {
  showNavigation?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  showNavigation = true 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useSupabase();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
        {/* Navigation Menu */}
        {user && (
          <RPGNavigationMenu
            isOpen={isMenuOpen}
            onToggle={toggleMenu}
            navigationItems={navigationItems}
          />
        )}

        {/* Main Content Area */}
        <div className={`flex-1 ${user ? 'lg:ml-80' : ''}`}>
          {/* Top Bar */}
          {user && (
            <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-sm border-b border-yellow-500/20">
              <div className="flex items-center justify-between p-4">
                {/* Mobile menu button */}
                <button
                  onClick={toggleMenu}
                  className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                  aria-label="Toggle navigation menu"
                >
                  <motion.div
                    animate={{ rotate: isMenuOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-2xl">☰</span>
                  </motion.div>
                </button>

                {/* Breadcrumb Navigation */}
                <div className="flex-1 ml-4">
                  <BreadcrumbNavigation />
                </div>

                {/* User info */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-slate-300 font-rpg">Welcome back,</p>
                    <p className="text-yellow-400 font-bold font-rpg">
                      {user.user_metadata?.name || user.email?.split('@')[0] || 'Adventurer'}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 
                                  rounded-full flex items-center justify-center text-xl">
                    🧙‍♂️
                  </div>
                </div>
              </div>
            </header>
          )}

          {/* Page Content */}
          <main className="relative">
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};