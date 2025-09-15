import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-screen bg-rpg-pattern flex items-center justify-center p-4"
        >
          <div className="rpg-card max-w-md w-full text-center">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-6xl mb-4"
            >
              🛡️
            </motion.div>
            
            <h2 className="text-2xl font-rpg text-slate-200 mb-4">
              Oops! Something went wrong
            </h2>
            
            <p className="text-slate-400 mb-6">
              Don't worry, brave adventurer! Even the mightiest heroes encounter unexpected challenges. 
              Let's get you back on your learning quest!
            </p>

            <div className="space-y-4">
              <button
                onClick={this.handleRetry}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-rpg py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-slate-600 hover:bg-slate-500 text-white font-rpg py-2 px-6 rounded-lg transition-all duration-200"
              >
                Restart Adventure
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-400">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-slate-800 rounded text-xs text-red-400 font-mono overflow-auto max-h-40">
                  <div className="mb-2 font-bold">Error:</div>
                  <div className="mb-2">{this.state.error.message}</div>
                  <div className="mb-2 font-bold">Stack:</div>
                  <div className="whitespace-pre-wrap">{this.state.error.stack}</div>
                </div>
              </details>
            )}
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// Game-specific error boundary for character-related errors
export function CharacterErrorBoundary({ 
  children, 
  onError 
}: { 
  children: ReactNode; 
  onError?: (error: Error) => void;
}) {
  return (
    <ErrorBoundary
      onError={(error) => onError?.(error)}
      fallback={
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rpg-card p-6 text-center"
        >
          <div className="text-4xl mb-3">⚔️</div>
          <h3 className="text-lg font-rpg text-slate-200 mb-2">
            Character Loading Failed
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Unable to load your character data. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-rpg text-sm transition-colors"
          >
            Reload Character
          </button>
        </motion.div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Learning activity error boundary
export function LearningErrorBoundary({ 
  children, 
  onRetry 
}: { 
  children: ReactNode; 
  onRetry?: () => void;
}) {
  return (
    <ErrorBoundary
      fallback={
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rpg-card p-6 text-center"
        >
          <div className="text-4xl mb-3">📚</div>
          <h3 className="text-lg font-rpg text-slate-200 mb-2">
            Learning Activity Error
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Something went wrong with this learning activity. Don't worry, your progress is saved!
          </p>
          <div className="space-y-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-rpg text-sm transition-colors"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => window.history.back()}
              className="w-full bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded font-rpg text-sm transition-colors"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}