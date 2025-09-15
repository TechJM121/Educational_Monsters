import React, { createContext, useContext, useEffect, useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ToastProvider, useToast } from './ToastSystem';
import { HelpProvider } from './HelpSystem';
import { FeedbackModal } from './FeedbackSystem';
import { ConnectionStatus, useConnectionStatus } from './ConnectionStatus';
import { errorService } from '../../services/errorService';
import { AppError, ConnectionState } from '../../types/error';
import { useAuth } from '../../hooks/useAuth';

interface ErrorHandlingContextType {
  reportError: (error: Error, context?: Record<string, any>) => void;
  reportNetworkError: (error: Error, context?: Record<string, any>) => void;
  reportValidationError: (field: string, message: string, context?: Record<string, any>) => void;
  connectionState: ConnectionState;
  retryConnection: () => void;
}

const ErrorHandlingContext = createContext<ErrorHandlingContextType | null>(null);

export function useErrorHandling() {
  const context = useContext(ErrorHandlingContext);
  if (!context) {
    throw new Error('useErrorHandling must be used within an ErrorHandlingProvider');
  }
  return context;
}

interface ErrorHandlingProviderProps {
  children: React.ReactNode;
}

export function ErrorHandlingProvider({ children }: ErrorHandlingProviderProps) {
  const { user } = useAuth();
  const { connectionState, updateConnectionState, incrementRetryCount, resetRetryCount } = useConnectionStatus();
  const [feedbackModalState, setFeedbackModalState] = useState<{
    isOpen: boolean;
    type?: string;
    category?: string;
    title?: string;
    description?: string;
  }>({ isOpen: false });

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      const error = errorService.createError(
        'system',
        'Unhandled promise rejection',
        {
          severity: 'high',
          details: event.reason?.toString(),
          context: { type: 'unhandledRejection' },
          userId: user?.id,
          recoverable: true,
          retryable: false
        }
      );

      errorService.logError(error);
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      
      const error = errorService.createError(
        'system',
        event.message,
        {
          severity: 'high',
          details: event.error?.stack,
          context: { 
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            type: 'globalError'
          },
          userId: user?.id,
          recoverable: true,
          retryable: false
        }
      );

      errorService.logError(error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [user?.id]);

  // Listen for feedback modal events
  useEffect(() => {
    const handleOpenFeedback = (event: CustomEvent) => {
      setFeedbackModalState({
        isOpen: true,
        ...event.detail
      });
    };

    window.addEventListener('open-feedback', handleOpenFeedback as EventListener);
    return () => {
      window.removeEventListener('open-feedback', handleOpenFeedback as EventListener);
    };
  }, []);

  // Monitor network connectivity
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Try to fetch a small resource to test connectivity
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        if (response.ok) {
          updateConnectionState({ 
            isConnected: true, 
            lastSyncTime: new Date() 
          });
          resetRetryCount();
        } else {
          throw new Error('Server responded with error');
        }
      } catch (error) {
        updateConnectionState({ isConnected: false });
        incrementRetryCount();
      }
    };

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    // Initial check
    checkConnection();

    return () => clearInterval(interval);
  }, [updateConnectionState, incrementRetryCount, resetRetryCount]);

  const reportError = (error: Error, context?: Record<string, any>) => {
    const appError = errorService.createError(
      'system',
      error.message,
      {
        severity: 'medium',
        details: error.stack,
        context,
        userId: user?.id,
        recoverable: true,
        retryable: false
      }
    );

    errorService.logError(appError);
  };

  const reportNetworkError = (error: Error, context?: Record<string, any>) => {
    const appError = errorService.handleNetworkError(error, {
      ...context,
      userId: user?.id
    });

    updateConnectionState({ isConnected: false });
    incrementRetryCount();
  };

  const reportValidationError = (field: string, message: string, context?: Record<string, any>) => {
    errorService.handleValidationError(field, message, {
      ...context,
      userId: user?.id
    });
  };

  const retryConnection = async () => {
    updateConnectionState({ syncInProgress: true });
    
    try {
      // Attempt to reconnect
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        updateConnectionState({ 
          isConnected: true, 
          syncInProgress: false,
          lastSyncTime: new Date()
        });
        resetRetryCount();
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      updateConnectionState({ 
        isConnected: false, 
        syncInProgress: false 
      });
      incrementRetryCount();
    }
  };

  const contextValue: ErrorHandlingContextType = {
    reportError,
    reportNetworkError,
    reportValidationError,
    connectionState,
    retryConnection
  };

  return (
    <ErrorHandlingContext.Provider value={contextValue}>
      <ErrorBoundary
        context="Application Root"
        userId={user?.id}
        onError={(error, errorInfo) => {
          // Additional logging for root-level errors
          console.error('Root error boundary triggered:', error, errorInfo);
        }}
      >
        <ToastProvider>
          <HelpProvider>
            <ErrorHandlingContent>
              {children}
            </ErrorHandlingContent>
            
            {/* Global feedback modal */}
            <FeedbackModal
              isOpen={feedbackModalState.isOpen}
              onClose={() => setFeedbackModalState({ isOpen: false })}
              initialType={feedbackModalState.type as any}
              initialCategory={feedbackModalState.category}
            />
          </HelpProvider>
        </ToastProvider>
      </ErrorBoundary>
    </ErrorHandlingContext.Provider>
  );
}

// Component that uses toast context (must be inside ToastProvider)
function ErrorHandlingContent({ children }: { children: React.ReactNode }) {
  const { connectionState, retryConnection } = useErrorHandling();
  const { showError, showWarning, showSuccess } = useToast();

  // Show connection status toasts
  useEffect(() => {
    if (!connectionState.isOnline) {
      showError(
        'No Internet Connection',
        'You\'re offline. Your progress will be saved locally.',
        [{
          label: 'Retry',
          onClick: retryConnection,
          variant: 'primary'
        }]
      );
    } else if (!connectionState.isConnected) {
      showWarning(
        'Connection Issues',
        'Having trouble connecting to our servers. Retrying...'
      );
    } else if (connectionState.pendingActions > 0) {
      showWarning(
        'Syncing Progress',
        `${connectionState.pendingActions} actions are being synced.`
      );
    }
  }, [connectionState.isOnline, connectionState.isConnected, connectionState.pendingActions]);

  // Show success when connection is restored
  useEffect(() => {
    if (connectionState.isConnected && connectionState.retryCount > 0) {
      showSuccess(
        'Connection Restored',
        'You\'re back online! Your progress is being synced.'
      );
    }
  }, [connectionState.isConnected, connectionState.retryCount]);

  return (
    <>
      {children}
      
      {/* Connection status indicator */}
      <div className="fixed top-4 left-4 z-40">
        <ConnectionStatus
          connectionState={connectionState}
          onRetry={retryConnection}
        />
      </div>
    </>
  );
}

// Hook for common error handling patterns
export function useGameErrorHandling() {
  const { reportError, reportNetworkError, reportValidationError } = useErrorHandling();
  const { showError, showWarning } = useToast();

  const handleAsyncError = async (
    asyncFn: () => Promise<any>,
    errorMessage: string = 'An error occurred',
    context?: Record<string, any>
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NetworkError' || error.message.includes('fetch')) {
          reportNetworkError(error, context);
          showError('Connection Error', 'Please check your internet connection and try again.');
        } else {
          reportError(error, context);
          showError('Error', errorMessage);
        }
      } else {
        reportError(new Error(String(error)), context);
        showError('Error', errorMessage);
      }
      throw error;
    }
  };

  const handleCharacterError = (error: Error, action: string) => {
    reportError(error, { action, component: 'character' });
    showError(
      'Character Error',
      `Failed to ${action}. Your character data is safe.`
    );
  };

  const handleLearningError = (error: Error, activity: string) => {
    reportError(error, { activity, component: 'learning' });
    showWarning(
      'Learning Activity Error',
      `There was an issue with ${activity}. Your progress has been saved.`
    );
  };

  const handleSaveError = (error: Error, dataType: string) => {
    reportNetworkError(error, { dataType, component: 'save' });
    showWarning(
      'Save Failed',
      `Couldn't save ${dataType}. It will be retried automatically.`
    );
  };

  return {
    handleAsyncError,
    handleCharacterError,
    handleLearningError,
    handleSaveError,
    reportError,
    reportNetworkError,
    reportValidationError
  };
}