import React from 'react';
import { motion } from 'framer-motion';

interface ConnectionStatusProps {
  isOnline: boolean;
  pendingActionCount?: number;
  syncInProgress?: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isOnline,
  pendingActionCount = 0,
  syncInProgress = false,
  className = ''
}) => {
  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (syncInProgress) return 'bg-yellow-500';
    if (pendingActionCount > 0) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (syncInProgress) return 'Syncing...';
    if (pendingActionCount > 0) return `${pendingActionCount} pending`;
    return 'Online';
  };

  const getStatusIcon = () => {
    if (!isOnline) return '📡';
    if (syncInProgress) return '🔄';
    if (pendingActionCount > 0) return '⏳';
    return '✅';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium
        ${isOnline ? 'bg-white/10 text-white' : 'bg-red-100 text-red-800'}
        ${className}
      `}
    >
      <motion.div
        animate={syncInProgress ? { rotate: 360 } : { rotate: 0 }}
        transition={syncInProgress ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
        className="flex items-center"
      >
        <span className="text-xs" role="img" aria-label="status">
          {getStatusIcon()}
        </span>
      </motion.div>
      
      <motion.div
        className={`w-2 h-2 rounded-full ${getStatusColor()}`}
        animate={syncInProgress ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={syncInProgress ? { duration: 1, repeat: Infinity } : {}}
      />
      
      <span className="hidden sm:inline">
        {getStatusText()}
      </span>
      
      {pendingActionCount > 0 && !syncInProgress && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.5rem] text-center"
        >
          {pendingActionCount}
        </motion.span>
      )}
    </motion.div>
  );
};

export default ConnectionStatus;