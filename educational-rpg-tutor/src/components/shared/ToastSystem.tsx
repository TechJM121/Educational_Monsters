import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastNotification, ToastAction } from '../../types/error';

interface ToastContextType {
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, actions?: ToastAction[]) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const newToast: ToastNotification = {
      ...toast,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    // Auto-remove non-persistent toasts
    if (!toast.persistent && toast.duration !== undefined) {
      setTimeout(() => {
        removeToast(newToast.id);
      }, toast.duration);
    }
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showSuccess = useCallback((title: string, message: string, duration = 4000) => {
    addToast({ type: 'success', title, message, duration });
  }, [addToast]);

  const showError = useCallback((title: string, message: string, actions?: ToastAction[]) => {
    addToast({ 
      type: 'error', 
      title, 
      message, 
      duration: 6000,
      actions 
    });
  }, [addToast]);

  const showWarning = useCallback((title: string, message: string, duration = 5000) => {
    addToast({ type: 'warning', title, message, duration });
  }, [addToast]);

  const showInfo = useCallback((title: string, message: string, duration = 4000) => {
    addToast({ type: 'info', title, message, duration });
  }, [addToast]);

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: ToastNotification[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  toast: ToastNotification;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const getToastStyles = (type: ToastNotification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-500 text-white';
      case 'error':
        return 'bg-red-600 border-red-500 text-white';
      case 'warning':
        return 'bg-yellow-600 border-yellow-500 text-white';
      case 'info':
        return 'bg-blue-600 border-blue-500 text-white';
      default:
        return 'bg-slate-600 border-slate-500 text-white';
    }
  };

  const getToastIcon = (type: ToastNotification['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        relative p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${getToastStyles(toast.type)}
        min-w-[300px] max-w-sm
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 text-lg">
          {getToastIcon(toast.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-rpg text-sm font-medium">
            {toast.title}
          </h4>
          <p className="text-sm opacity-90 mt-1">
            {toast.message}
          </p>
          
          {toast.actions && toast.actions.length > 0 && (
            <div className="flex space-x-2 mt-3">
              {toast.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    onRemove(toast.id);
                  }}
                  className={`
                    px-3 py-1 text-xs font-medium rounded transition-colors
                    ${action.variant === 'primary' 
                      ? 'bg-white text-slate-800 hover:bg-slate-100' 
                      : action.variant === 'danger'
                      ? 'bg-red-700 text-white hover:bg-red-800'
                      : 'bg-white/20 text-white hover:bg-white/30'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
      
      {/* Progress bar for timed toasts */}
      {toast.duration && !toast.persistent && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg"
        />
      )}
    </motion.div>
  );
}

// Hook for common toast patterns
export function useGameToasts() {
  const toast = useToast();

  const showXPGain = useCallback((amount: number, reason?: string) => {
    toast.showSuccess(
      'XP Gained!',
      `+${amount} XP${reason ? ` for ${reason}` : ''}`,
      3000
    );
  }, [toast]);

  const showLevelUp = useCallback((newLevel: number) => {
    toast.showSuccess(
      'Level Up!',
      `Congratulations! You reached level ${newLevel}!`,
      5000
    );
  }, [toast]);

  const showAchievement = useCallback((name: string) => {
    toast.showSuccess(
      'Achievement Unlocked!',
      name,
      4000
    );
  }, [toast]);

  const showConnectionError = useCallback(() => {
    toast.showError(
      'Connection Lost',
      'Check your internet connection. Your progress is saved locally.',
      [{
        label: 'Retry',
        onClick: () => window.location.reload(),
        variant: 'primary'
      }]
    );
  }, [toast]);

  const showSaveError = useCallback(() => {
    toast.showWarning(
      'Save Failed',
      'Your progress couldn\'t be saved. It will be retried automatically.',
      4000
    );
  }, [toast]);

  return {
    ...toast,
    showXPGain,
    showLevelUp,
    showAchievement,
    showConnectionError,
    showSaveError
  };
}