import { AppError, ToastNotification } from '../types/error';
import { supabase } from './supabaseClient';

class ErrorService {
  private errorQueue: AppError[] = [];
  private maxQueueSize = 100;

  // Create standardized error
  createError(
    type: AppError['type'],
    message: string,
    options: Partial<AppError> = {}
  ): AppError {
    return {
      id: crypto.randomUUID(),
      type,
      severity: options.severity || 'medium',
      message,
      details: options.details,
      timestamp: new Date(),
      userId: options.userId,
      context: options.context,
      recoverable: options.recoverable ?? true,
      retryable: options.retryable ?? false,
      ...options
    };
  }

  // Log error locally and optionally to server
  async logError(error: AppError): Promise<void> {
    // Add to local queue
    this.errorQueue.push(error);
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift(); // Remove oldest error
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', error);
    }

    // Send to server for critical errors
    if (error.severity === 'critical' || error.severity === 'high') {
      try {
        await this.sendErrorToServer(error);
      } catch (serverError) {
        console.warn('Failed to send error to server:', serverError);
      }
    }
  }

  // Send error to Supabase for monitoring
  private async sendErrorToServer(error: AppError): Promise<void> {
    try {
      const { error: supabaseError } = await supabase
        .from('error_logs')
        .insert({
          error_id: error.id,
          error_type: error.type,
          severity: error.severity,
          message: error.message,
          details: error.details,
          user_id: error.userId,
          context: error.context,
          timestamp: error.timestamp.toISOString(),
          recoverable: error.recoverable,
          retryable: error.retryable
        });

      if (supabaseError) {
        throw supabaseError;
      }
    } catch (error) {
      // Fail silently for error logging to prevent infinite loops
      console.warn('Error logging to server failed:', error);
    }
  }

  // Handle network errors specifically
  handleNetworkError(originalError: Error, context?: Record<string, any>): AppError {
    const error = this.createError(
      'network',
      'Network connection failed. Please check your internet connection.',
      {
        severity: 'medium',
        details: originalError.message,
        context,
        recoverable: true,
        retryable: true
      }
    );

    this.logError(error);
    return error;
  }

  // Handle authentication errors
  handleAuthError(originalError: Error, context?: Record<string, any>): AppError {
    const error = this.createError(
      'authentication',
      'Authentication failed. Please log in again.',
      {
        severity: 'high',
        details: originalError.message,
        context,
        recoverable: true,
        retryable: false
      }
    );

    this.logError(error);
    return error;
  }

  // Handle character loading errors
  handleCharacterError(originalError: Error, context?: Record<string, any>): AppError {
    const error = this.createError(
      'character',
      'Failed to load character data. Your progress is safe.',
      {
        severity: 'high',
        details: originalError.message,
        context,
        recoverable: true,
        retryable: true
      }
    );

    this.logError(error);
    return error;
  }

  // Handle learning activity errors
  handleLearningError(originalError: Error, context?: Record<string, any>): AppError {
    const error = this.createError(
      'learning',
      'Learning activity encountered an error. Your progress has been saved.',
      {
        severity: 'medium',
        details: originalError.message,
        context,
        recoverable: true,
        retryable: true
      }
    );

    this.logError(error);
    return error;
  }

  // Handle validation errors
  handleValidationError(field: string, message: string, context?: Record<string, any>): AppError {
    const error = this.createError(
      'validation',
      `Validation failed for ${field}: ${message}`,
      {
        severity: 'low',
        context: { field, ...context },
        recoverable: true,
        retryable: false
      }
    );

    this.logError(error);
    return error;
  }

  // Get recent errors for debugging
  getRecentErrors(count: number = 10): AppError[] {
    return this.errorQueue.slice(-count);
  }

  // Clear error queue
  clearErrors(): void {
    this.errorQueue = [];
  }

  // Convert error to user-friendly toast notification
  errorToToast(error: AppError): ToastNotification {
    const getToastType = (severity: AppError['severity']) => {
      switch (severity) {
        case 'critical':
        case 'high':
          return 'error' as const;
        case 'medium':
          return 'warning' as const;
        case 'low':
          return 'info' as const;
        default:
          return 'error' as const;
      }
    };

    return {
      id: error.id,
      type: getToastType(error.severity),
      title: this.getErrorTitle(error.type),
      message: error.message,
      duration: error.severity === 'critical' ? undefined : 5000,
      persistent: error.severity === 'critical',
      timestamp: error.timestamp,
      actions: error.retryable ? [{
        label: 'Retry',
        onClick: () => {
          // Emit retry event that components can listen to
          window.dispatchEvent(new CustomEvent('error-retry', { detail: error }));
        },
        variant: 'primary' as const
      }] : undefined
    };
  }

  private getErrorTitle(type: AppError['type']): string {
    switch (type) {
      case 'network':
        return 'Connection Issue';
      case 'authentication':
        return 'Authentication Error';
      case 'character':
        return 'Character Loading Error';
      case 'learning':
        return 'Learning Activity Error';
      case 'validation':
        return 'Input Error';
      case 'system':
        return 'System Error';
      default:
        return 'Error';
    }
  }
}

export const errorService = new ErrorService();