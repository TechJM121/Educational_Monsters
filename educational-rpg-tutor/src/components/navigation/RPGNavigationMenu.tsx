import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NavigationItem } from '../../types/navigation';

interface RPGNavigationMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  navigationItems: NavigationItem[];
}

export const RPGNavigationMenu: React.FC<RPGNavigationMenuProps> = ({
  isOpen,
  onToggle,
  navigationItems
}) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40
      }
    }
  };

  const itemVariants = {
    closed: { x: -20, opacity: 0 },
    open: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    })
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Navigation Menu */}
      <motion.nav
        variants={menuVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
                   border-r-4 border-yellow-500/30 shadow-2xl z-50 lg:relative lg:translate-x-0"
      >
        {/* Header */}
        <div className="p-6 border-b border-yellow-500/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-rpg text-yellow-400 flex items-center gap-2">
              🏰 RPG Tutor
            </h2>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
              aria-label="Close menu"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-2">
          {navigationItems.map((item, index) => (
            <motion.div
              key={item.path}
              custom={index}
              variants={itemVariants}
              onHoverStart={() => setHoveredItem(item.path)}
              onHoverEnd={() => setHoveredItem(null)}
            >
              <Link
                to={item.path}
                onClick={onToggle}
                className={`
                  group relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                  ${isActiveRoute(item.path)
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-700/50'
                  }
                `}
              >
                {/* Icon */}
                <span className="text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>

                {/* Label */}
                <span className="font-medium font-rpg">{item.label}</span>

                {/* Active indicator */}
                {isActiveRoute(item.path) && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-2 w-2 h-2 bg-yellow-400 rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Hover effect */}
                {hoveredItem === item.path && !isActiveRoute(item.path) && (
                  <motion.div
                    layoutId="hoverIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-lg -z-10"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>

              {/* Submenu items */}
              {item.children && isActiveRoute(item.path) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-6 mt-2 space-y-1"
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      onClick={onToggle}
                      className={`
                        flex items-center gap-2 p-2 rounded text-sm transition-colors
                        ${isActiveRoute(child.path)
                          ? 'text-yellow-400 bg-yellow-500/10'
                          : 'text-slate-400 hover:text-yellow-400 hover:bg-slate-700/30'
                        }
                      `}
                    >
                      <span className="text-xs">{child.icon}</span>
                      <span>{child.label}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-yellow-500/20">
          <div className="text-center text-xs text-slate-500 font-rpg">
            Level up through learning! 🎓✨
          </div>
        </div>
      </motion.nav>
    </>
  );
};