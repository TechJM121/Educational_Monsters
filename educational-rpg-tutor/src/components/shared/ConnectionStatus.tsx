import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectionState } from '../../types/error';
import { Tooltip } from './Tooltip';

interface ConnectionStatusProps {
  connectionState: ConnectionState;
  onRetry?: () => void;
  className?: string;
  showDetails?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionState,
  onRetry,
  className = '',
  showDetails = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { isOnline, isConnected, lastSyncTime, pendingActions, syncInProgress, retryCount } = connectionState;

  const getStatusColor = () => {
    if (!isOnline || !isConnected) return 'bg-red-500';
    if (syncInProgress) return 'bg-yellow-500';
    if (pendingActions > 0) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'No Internet';
    if (!isConnected) return 'Disconnected';
    if (syncInProgress) return 'Syncing...';
    if (pendingActions > 0) return `${pendingActions} pending`;
    return 'Connected';
  };

  const getStatusIcon = () => {
    if (!isOnline) return '📡';
    if (!isConnected) return '🔌';
    if (syncInProgress) return '🔄';
    if (pendingActions > 0) return '⏳';
    return '✅';
  };

  const getDetailedStatus = () => {
    const parts = [];
    
    if (!isOnline) {
      parts.push('No internet connection detected');
    } else if (!isConnected) {
      parts.push('Unable to connect to server');
    } else {
      parts.push('Connected to server');
    }

    if (lastSyncTime) {
      const timeSince = Math.floor((Date.now() - lastSyncTime.getTime()) / 1000);
      if (timeSince < 60) {
        parts.push(`Last sync: ${timeSince}s ago`);
      } else if (timeSince < 3600) {
        parts.push(`Last sync: ${Math.floor(timeSince / 60)}m ago`);
      } else {
        parts.push(`Last sync: ${Math.floor(timeSince / 3600)}h ago`);
      }
    }

    if (pendingActions > 0) {
      parts.push(`${pendingActions} actions waiting to sync`);
    }

    if (retryCount > 0) {
      parts.push(`Retry attempts: ${retryCount}`);
    }

    return parts.join('\n');
  };

  const shouldShowRetry = !isConnected && !syncInProgress && onRetry;

  return (
    <div className={`relative ${className}`}>
      <Tooltip
        content={getDetailedStatus()}
        position="bottom"
        className="inline-block"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`
            flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium cursor-pointer
            ${isOnline && isConnected ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-100 text-red-800 hover:bg-red-200'}
            transition-colors duration-200
          `}
          onClick={() => setShowTooltip(!showTooltip)}
        >
          <motion.div
            animate={syncInProgress ? { rotate: 360 } : { rotate: 0 }}
            transition={syncInProgress ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
            className="flex items-center"
          >
            <span className="text-xs" role="img" aria-label="connection status">
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
          
          {pendingActions > 0 && !syncInProgress && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.5rem] text-center"
            >
              {pendingActions}
            </motion.span>
          )}
        </motion.div>
      </Tooltip>

      {/* Retry button for connection issues */}
      <AnimatePresence>
        {shouldShowRetry && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onRetry}
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-primary-600 hover:bg-primary-700 text-white text-xs px-3 py-1 rounded-full transition-colors"
          >
            Retry Connection
          </motion.button>
        )}
      </AnimatePresence>

      {/* Detailed status panel */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm text-white shadow-lg z-50 min-w-[200px]"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Internet:</span>
              <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
                {isOnline ? 'Connected' : 'Offline'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Server:</span>
              <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {lastSyncTime && (
              <div className="flex items-center justify-between">
                <span>Last Sync:</span>
                <span className="text-slate-300">
                  {lastSyncTime.toLocaleTimeString()}
                </span>
              </div>
            )}
            
            {pendingActions > 0 && (
              <div className="flex items-center justify-between">
                <span>Pending:</span>
                <span className="text-orange-400">{pendingActions}</span>
              </div>
            )}
            
            {retryCount > 0 && (
              <div className="flex items-center justify-between">
                <span>Retries:</span>
                <span className="text-yellow-400">{retryCount}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Hook for managing connection state
export function useConnectionStatus() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isOnline: navigator.onLine,
    isConnected: true,
    pendingActions: 0,
    syncInProgress: false,
    retryCount: 0
  });

  useEffect(() => {
    const handleOnline = () => {
      setConnectionState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setConnectionState(prev => ({ ...prev, isOnline: false, isConnected: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateConnectionState = (updates: Partial<ConnectionState>) => {
    setConnectionState(prev => ({ ...prev, ...updates }));
  };

  const incrementRetryCount = () => {
    setConnectionState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
  };

  const resetRetryCount = () => {
    setConnectionState(prev => ({ ...prev, retryCount: 0 }));
  };

  return {
    connectionState,
    updateConnectionState,
    incrementRetryCount,
    resetRetryCount
  };
}

export default ConnectionStatus;