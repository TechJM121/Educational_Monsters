import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive: boolean;
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Route to breadcrumb mapping
const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/home': [
    { label: 'Home', path: '/home', isActive: true }
  ],
  '/learning': [
    { label: 'Home', path: '/home', isActive: false },
    { label: 'Learning', path: '/learning', isActive: true }
  ],
  '/learning/worlds': [
    { label: 'Home', path: '/home', isActive: false },
    { label: 'Learning', path: '/learning', isActive: false },
    { label: 'Worlds', path: '/learning/worlds', isActive: true }
  ],
  '/character': [
    { label: 'Home', path: '/home', isActive: false },
    { label: 'Character', path: '/character', isActive: true }
  ],
  '/character/customization': [
    { label: 'Home', path: '/home', isActive: false },
    { label: 'Character', path: '/character', isActive: false },
    { label: 'Customization', path: '/character/customization', isActive: true }
  ],
  '/achievements': [
    { label: 'Home', path: '/home', isActive: false },
    { label: 'Achievements', path: '/achievements', isActive: true }
  ],
  '/inventory': [
    { label: 'Home', path: '/home', isActive: false },
    { label: 'Inventory', path: '/inventory', isActive: true }
  ],
  '/leaderboard': [
    { label: 'Home', path: '/home', isActive: false },
    { label: 'Leaderboard', path: '/leaderboard', isActive: true }
  ],
  '/quests': [
    { label: 'Home', path: '/home', isActive: false },
    { label: 'Quests', path: '/quests', isActive: true }
  ],
  '/parent-dashboard': [
    { label: 'Home', path: '/home', isActive: false },
    { label: 'Parent Dashboard', path: '/parent-dashboard', isActive: true }
  ]
};

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  items,
  className = ''
}) => {
  const location = useLocation();
  
  // Use provided items or generate from current route
  const breadcrumbItems = items || routeBreadcrumbs[location.pathname] || [
    { label: 'Home', path: '/home', isActive: false },
    { label: 'Unknown', isActive: true }
  ];

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumbs for single-level pages
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-2 text-sm ${className}`}
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={item.path || index} className="flex items-center">
            {index > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="mx-2 text-slate-400"
                aria-hidden="true"
              >
                ⚔️
              </motion.span>
            )}
            
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {item.isActive ? (
                <span 
                  className="text-yellow-400 font-medium font-rpg"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path!}
                  className="text-slate-300 hover:text-yellow-400 transition-colors font-rpg
                           hover:underline decoration-yellow-400/50 underline-offset-2"
                >
                  {item.label}
                </Link>
              )}
            </motion.div>
          </li>
        ))}
      </ol>
    </nav>
  );
};