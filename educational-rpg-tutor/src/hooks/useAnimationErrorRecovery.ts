import { useState, useCallback, useRef, useEffect } from 'react';

export interface AnimationError {
  id: string;
  error: Error;
  timestamp: number;
  component: string;
  recoveryAttempts: number;
  resolved: boolean;
}

export interface ErrorRecoveryConfig {
  maxRetries: number;
  retryDelay: number;
  enableAutoRecovery: boolean;
  enableErrorReporting: boolean;
  fallbackMode: boolean;
}

export interface ErrorRecoveryStats {
  totalErrors: number;
  resolvedErrors: number;
  activeErrors: number;
  recoverySuccessRate: number;
  averageRecoveryTime: number;
}

const DEFAULT_CONFIG: ErrorRecoveryConfig = {
  maxRetries: 3,
  retryDelay: 2000,
  enableAutoRecovery: true,
  enableErrorReporting: true,
  fallbackMode: false
};

export const useAnimationErrorRecovery = (config: Partial<ErrorRecoveryConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [errors, setErrors] = useState<AnimationError[]>([]);
  const [isRecovering, setIsRecovering] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(finalConfig.fallbackMode);
  const [recoveryStats, setRecoveryStats] = useState<ErrorRecoveryStats>({
    totalErrors: 0,
    resolvedErrors: 0,
    activeErrors: 0,
    recoverySuccessRate: 0,
    averageRecoveryTime: 0
  });

  const errorIdCounter = useRef(0);
  const recoveryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const errorStartTimes = useRef<Map<string, number>>(new Map());

  const generateErrorId = useCallback(() => {
    return `error_${++errorIdCounter.current}_${Date.now()}`;
  }, []);

  const reportError = useCallback((error: Error, component: string = 'unknown') => {
    const errorId = generateErrorId();
    const timestamp = Date.now();
    
    const animationError: AnimationError = {
      id: errorId,
      error,
      timestamp,
      component,
      recoveryAttempts: 0,
      resolved: false
    };

    setErrors(prev => [...prev, animationError]);
    errorStartTimes.current.set(errorId, timestamp);

    // Update stats
    setRecoveryStats(prev => ({
      ...prev,
      totalErrors: prev.totalErrors + 1,
      activeErrors: prev.activeErrors + 1
    }));

    // Log error
    console.error(`Animation error in ${component}:`, error);

    // Send to error reporting service if enabled
    if (finalConfig.enableErrorReporting) {
      sendErrorReport(animationError);
    }

    // Schedule auto-recovery if enabled
    if (finalConfig.enableAutoRecovery) {
      scheduleRecovery(errorId);
    }

    return errorId;
  }, [finalConfig.enableErrorReporting, finalConfig.enableAutoRecovery, generateErrorId]);

  const sendErrorReport = useCallback(async (animationError: AnimationError) => {
    try {
      const errorReport = {
        id: animationError.id,
        message: animationError.error.message,
        stack: animationError.error.stack,
        component: animationError.component,
        timestamp: animationError.timestamp,
        userAgent: navigator.userAgent,
        url: window.location.href,
        fallbackMode
      };

      // In a real app, send to error reporting service
      console.log('Error report:', errorReport);
      
      // Example: await fetch('/api/animation-errors', { method: 'POST', body: JSON.stringify(errorReport) });
    } catch (reportingError) {
      console.error('Failed to send error report:', reportingError);
    }
  }, [fallbackMode]);

  const scheduleRecovery = useCallback((errorId: string) => {
    const timeout = setTimeout(() => {
      attemptRecovery(errorId);
    }, finalConfig.retryDelay);

    recoveryTimeouts.current.set(errorId, timeout);
  }, [finalConfig.retryDelay]);

  const attemptRecovery = useCallback((errorId: string) => {
    setIsRecovering(true);

    setErrors(prev => prev.map(error => {
      if (error.id === errorId && !error.resolved) {
        const updatedError = {
          ...error,
          recoveryAttempts: error.recoveryAttempts + 1
        };

        // Check if max retries reached
        if (updatedError.recoveryAttempts >= finalConfig.maxRetries) {
          console.warn(`Max recovery attempts reached for error ${errorId}`);
          return updatedError;
        }

        // Schedule next recovery attempt
        scheduleRecovery(errorId);
        
        return updatedError;
      }
      return error;
    }));

    // Simulate recovery process
    setTimeout(() => {
      setIsRecovering(false);
    }, 1000);
  }, [finalConfig.maxRetries, scheduleRecovery]);

  const resolveError = useCallback((errorId: string) => {
    const startTime = errorStartTimes.current.get(errorId);
    const recoveryTime = startTime ? Date.now() - startTime : 0;

    setErrors(prev => prev.map(error => {
      if (error.id === errorId) {
        return { ...error, resolved: true };
      }
      return error;
    }));

    // Clear timeout
    const timeout = recoveryTimeouts.current.get(errorId);
    if (timeout) {
      clearTimeout(timeout);
      recoveryTimeouts.current.delete(errorId);
    }

    // Update stats
    setRecoveryStats(prev => {
      const newResolvedErrors = prev.resolvedErrors + 1;
      const newActiveErrors = Math.max(0, prev.activeErrors - 1);
      const newSuccessRate = prev.totalErrors > 0 ? (newResolvedErrors / prev.totalErrors) * 100 : 0;
      
      // Calculate average recovery time
      const totalRecoveryTime = (prev.averageRecoveryTime * prev.resolvedErrors) + recoveryTime;
      const newAverageRecoveryTime = newResolvedErrors > 0 ? totalRecoveryTime / newResolvedErrors : 0;

      return {
        ...prev,
        resolvedErrors: newResolvedErrors,
        activeErrors: newActiveErrors,
        recoverySuccessRate: newSuccessRate,
        averageRecoveryTime: newAverageRecoveryTime
      };
    });

    // Clean up
    errorStartTimes.current.delete(errorId);

    console.log(`Error ${errorId} resolved in ${recoveryTime}ms`);
  }, []);

  const clearResolvedErrors = useCallback(() => {
    setErrors(prev => prev.filter(error => !error.resolved));
  }, []);

  const clearAllErrors = useCallback(() => {
    // Clear all timeouts
    recoveryTimeouts.current.forEach(timeout => clearTimeout(timeout));
    recoveryTimeouts.current.clear();
    errorStartTimes.current.clear();

    setErrors([]);
    setRecoveryStats({
      totalErrors: 0,
      resolvedErrors: 0,
      activeErrors: 0,
      recoverySuccessRate: 0,
      averageRecoveryTime: 0
    });
  }, []);

  const enableFallbackMode = useCallback(() => {
    setFallbackMode(true);
    console.log('Fallback mode enabled - animations will be simplified');
  }, []);

  const disableFallbackMode = useCallback(() => {
    setFallbackMode(false);
    console.log('Fallback mode disabled - full animations restored');
  }, []);

  const getActiveErrors = useCallback(() => {
    return errors.filter(error => !error.resolved);
  }, [errors]);

  const getResolvedErrors = useCallback(() => {
    return errors.filter(error => error.resolved);
  }, [errors]);

  const getErrorsByComponent = useCallback((component: string) => {
    return errors.filter(error => error.component === component);
  }, [errors]);

  const hasActiveErrors = useCallback(() => {
    return errors.some(error => !error.resolved);
  }, [errors]);

  const getRecoveryProgress = useCallback((errorId: string) => {
    const error = errors.find(e => e.id === errorId);
    if (!error) return 0;
    
    return Math.min((error.recoveryAttempts / finalConfig.maxRetries) * 100, 100);
  }, [errors, finalConfig.maxRetries]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recoveryTimeouts.current.forEach(timeout => clearTimeout(timeout));
      recoveryTimeouts.current.clear();
      errorStartTimes.current.clear();
    };
  }, []);

  // Auto-enable fallback mode if too many errors
  useEffect(() => {
    const activeErrorCount = errors.filter(error => !error.resolved).length;
    
    if (activeErrorCount >= 3 && !fallbackMode) {
      console.warn('Multiple animation errors detected, enabling fallback mode');
      enableFallbackMode();
    }
  }, [errors, fallbackMode, enableFallbackMode]);

  return {
    // State
    errors,
    isRecovering,
    fallbackMode,
    recoveryStats,
    
    // Actions
    reportError,
    resolveError,
    clearResolvedErrors,
    clearAllErrors,
    enableFallbackMode,
    disableFallbackMode,
    
    // Queries
    getActiveErrors,
    getResolvedErrors,
    getErrorsByComponent,
    hasActiveErrors,
    getRecoveryProgress,
    
    // Computed values
    activeErrorCount: recoveryStats.activeErrors,
    totalErrorCount: recoveryStats.totalErrors,
    successRate: recoveryStats.recoverySuccessRate,
    averageRecoveryTime: recoveryStats.averageRecoveryTime
  };
};