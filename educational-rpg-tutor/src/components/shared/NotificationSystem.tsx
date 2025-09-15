import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NotificationPayload } from '../../services/realtimeService';

interface NotificationSystemProps {
  notifications: NotificationPayload[];
  onDismiss: (notificationId: string) => void;
  maxVisible?: number;
  autoHideDuration?: number;
}

interface NotificationItemProps {
  notification: NotificationPayload;
  onDismiss: (id: string) => void;
  autoHideDuration: number;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDismiss,
  autoHideDuration
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(notification.id), 300); // Wait for exit animation
    }, autoHideDuration);

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss, autoHideDuration]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'level_up':
        return '⬆️';
      case 'friend_request':
        return '👋';
      case 'trade_request':
        return '🔄';
      case 'challenge_invite':
        return '⚔️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'from-yellow-400 to-orange-500';
      case 'level_up':
        return 'from-green-400 to-emerald-500';
      case 'friend_request':
        return 'from-blue-400 to-indigo-500';
      case 'trade_request':
        return 'from-purple-400 to-pink-500';
      case 'challenge_invite':
        return 'from-red-400 to-rose-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        x: isVisible ? 0 : 300, 
        scale: isVisible ? 1 : 0.8 
      }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        relative max-w-sm w-full bg-gradient-to-r ${getNotificationColor(notification.type)}
        shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden
        transform transition-all duration-300 hover:scale-105
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl" role="img" aria-label={notification.type}>
              {getNotificationIcon(notification.type)}
            </span>
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-white">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-white/90">
              {notification.message}
            </p>
            <div className="mt-2 text-xs text-white/70">
              {new Date(notification.createdAt).toLocaleTimeString()}
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white/20 rounded-md inline-flex text-white/80 hover:text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-200"
              onClick={() => onDismiss(notification.id)}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar for auto-hide */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-white/30"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: autoHideDuration / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
};

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss,
  maxVisible = 5,
  autoHideDuration = 5000
}) => {
  const visibleNotifications = notifications.slice(0, maxVisible);

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        <AnimatePresence mode="popLayout">
          {visibleNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDismiss={onDismiss}
              autoHideDuration={autoHideDuration}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationSystem;