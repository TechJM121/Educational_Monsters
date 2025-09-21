import React, { Component, ErrorInfo, ReactNode } from 'react';
import { performanceOptimizer } from '../../utils/performanceOptimizer';

export interface AnimationErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableAutoRecovery?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  enableFallbackMode?: boolean;
  enableErrorReporting?: boolean;
}

export interface AnimationErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  fallbackMode: boolean;
  isRecovering: boolean;
  lastErrorTime: number;
}

export class AnimationErrorBoundary extends Component<
  AnimationErrorBoundaryProps,
  AnimationErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private errorReportingQueue: Array<{ error: Error; errorInfo: ErrorInfo; timestamp: number }> = [];

  static defaultProps: Partial<AnimationErrorBoundaryProps> = {
    enableAutoRecovery: true,
    maxRetries: 3,
    retryDelay: 2000,
    enableFallbackMode: true,
    enableErrorReporting: true
  };

  constructor(props: AnimationErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      fallbackMode: false,
      isRecovering: false,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AnimationErrorBoundaryState> {
    // Update state to trigger fallback UI
    return {
      hasError: true,
      error,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, enableErrorReporting, enableFallbackMode } = this.props;
    
    // Update state with error details
    this.setState({
      errorInfo,
      fallbackMode: enableFallbackMode || false
    });

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Log error details
    this.logError(error, errorInfo);

    // Queue error for reporting
    if (enableErrorReporting) {
      this.queueErrorReport(error, errorInfo);
    }

    // Apply performance optimizations
    this.applyEmergencyOptimizations(error);

    // Attempt auto-recovery if enabled
    if (this.props.enableAutoRecovery) {
      this.scheduleRecovery();
    }
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    console.group('🎬 Animation Error Boundary');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Boundary State:', this.state);
    console.groupEnd();
  }

  private queueErrorReport(error: Error, errorInfo: ErrorInfo) {
    this.errorReportingQueue.push({
      error,
      errorInfo,
      timestamp: Date.now()
    });

    // Keep only last 10 errors
    if (this.errorReportingQueue.length > 10) {
      this.errorReportingQueue.shift();
    }

    // Send error report (in a real app, this would go to a service like Sentry)
    this.sendErrorReport(error, errorInfo);
  }

  private async sendErrorReport(error: Error, errorInfo: ErrorInfo) {
    try {
      // In a real application, send to error reporting service
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        url: window.location.href,
        retryCount: this.state.retryCount,
        fallbackMode: this.state.fallbackMode
      };

      console.log('Error report queued:', errorReport);
      
      // Example: await fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorReport) });
    } catch (reportingError) {
      console.error('Failed to send error report:', reportingError);
    }
  }

  private applyEmergencyOptimizations(error: Error) {
    try {
      // Determine if this is an animation-related error
      const isAnimationError = this.isAnimationRelatedError(error);
      
      if (isAnimationError) {
        // Apply aggressive performance optimizations
        const emergencySettings = {
          particleCount: 10,
          blurEffects: 'disabled' as const,
          shadowEffects: 'disabled' as const,
          transitionDuration: 150,
          enableGPUAcceleration: false,
          enable3DTransforms: false,
          enableParallax: false
        };

        // Apply emergency settings
        performanceOptimizer['currentSettings'] = {
          ...performanceOptimizer.getCurrentSettings(),
          ...emergencySettings
        };

        console.warn('🚨 Emergency animation optimizations applied');
      }
    } catch (optimizationError) {
      console.error('Failed to apply emergency optimizations:', optimizationError);
    }
  }

  private isAnimationRelatedError(error: Error): boolean {
    const animationKeywords = [
      'framer-motion',
      'animation',
      'transform',
      'transition',
      'requestAnimationFrame',
      'webgl',
      'canvas',
      'three.js',
      'particle',
      'blur',
      'shadow'
    ];

    const errorString = `${error.message} ${error.stack}`.toLowerCase();
    return animationKeywords.some(keyword => errorString.includes(keyword));
  }

  private scheduleRecovery() {
    const { maxRetries = 3, retryDelay = 2000 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      console.warn('Max retries reached, staying in error state');
      return;
    }

    this.setState({ isRecovering: true });

    this.retryTimeoutId = setTimeout(() => {
      this.attemptRecovery();
    }, retryDelay);
  }

  private attemptRecovery() {
    console.log('🔄 Attempting animation error recovery...');
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      isRecovering: false,
      fallbackMode: true // Keep fallback mode active after recovery
    }));
  }

  private handleManualRetry = () => {
    this.setState({
      retryCount: 0 // Reset retry count for manual retry
    });
    this.attemptRecovery();
  };

  private handleEnableFallbackMode = () => {
    this.setState({
      fallbackMode: true,
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleResetErrorBoundary = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      fallbackMode: false,
      isRecovering: false,
      lastErrorTime: 0
    });

    // Reset performance optimizations
    performanceOptimizer.resetOptimizations();
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    const { children, fallback } = this.props;
    const { hasError, error, isRecovering, fallbackMode } = this.state;

    // Show recovery indicator
    if (isRecovering) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Recovering from animation error...</p>
          </div>
        </div>
      );
    }

    // Show error UI
    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default error UI
      return (
        <div className="border border-red-300 bg-red-50 rounded-lg p-6 m-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Animation Error Detected
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  An error occurred while rendering animations. The system has applied 
                  performance optimizations to prevent further issues.
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">
                      Error Details (Development)
                    </summary>
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                      {error.message}
                      {error.stack && `\n\n${error.stack}`}
                    </pre>
                  </details>
                )}
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={this.handleManualRetry}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  Retry
                </button>
                {!fallbackMode && (
                  <button
                    onClick={this.handleEnableFallbackMode}
                    className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm hover:bg-yellow-200 transition-colors"
                  >
                    Enable Safe Mode
                  </button>
                )}
                <button
                  onClick={this.handleResetErrorBoundary}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Reset
                </button>
              </div>
              {this.state.retryCount > 0 && (
                <p className="mt-2 text-xs text-red-600">
                  Retry attempts: {this.state.retryCount}/{this.props.maxRetries}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Render children normally
    return <>{children}</>;
  }

  // Public methods for external control
  public getErrorInfo() {
    return {
      hasError: this.state.hasError,
      error: this.state.error,
      errorInfo: this.state.errorInfo,
      retryCount: this.state.retryCount,
      fallbackMode: this.state.fallbackMode,
      errorReports: [...this.errorReportingQueue]
    };
  }

  public forceRecovery() {
    this.handleResetErrorBoundary();
  }

  public enableFallbackMode() {
    this.handleEnableFallbackMode();
  }
}