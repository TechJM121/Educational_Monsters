import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SimpleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-rpg text-red-400 mb-4">⚠️ Something went wrong</h1>
            <div className="bg-slate-800 rounded-lg p-6 max-w-md">
              <h2 className="text-xl font-semibold mb-4">Error Details</h2>
              <p className="text-sm text-slate-400 mb-4">
                {this.state.error?.message || 'An unknown error occurred'}
              </p>
              <button 
                className="rpg-button"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}