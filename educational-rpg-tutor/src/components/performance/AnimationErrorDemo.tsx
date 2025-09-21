import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimationErrorBoundary } from '../error-boundaries/AnimationErrorBoundary';
import { useAnimationErrorRecovery } from '../../hooks/useAnimationErrorRecovery';
import { animationErrorReporter } from '../../utils/animationErrorReporter';

// Component that can throw different types of errors
const ErrorProneComponent: React.FC<{ 
  errorType: string;
  shouldThrow: boolean;
}> = ({ errorType, shouldThrow }) => {
  if (shouldThrow) {
    switch (errorType) {
      case 'animation':
        throw new Error('Framer Motion animation failed: Invalid transform value');
      case 'webgl':
        throw new Error('WebGL context lost: Unable to render 3D elements');
      case 'memory':
        throw new Error('Out of memory: Too many particles in system');
      case 'generic':
        throw new Error('Generic component error');
      default:
        throw new Error('Unknown error occurred');
    }
  }

  return (
    <motion.div
      className="p-4 bg-green-100 border border-green-400 rounded"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h4 className="font-semibold text-green-800">Component Working</h4>
      <p className="text-green-700">No errors detected - animations running smoothly</p>
    </motion.div>
  );
};

// Component that simulates recovery
const RecoverableComponent: React.FC<{ 
  errorId: string;
  onRecover: (errorId: string) => void;
}> = ({ errorId, onRecover }) => {
  const [isRecovered, setIsRecovered] = useState(false);

  React.useEffect(() => {
    // Simulate recovery after 3 seconds
    const timer = setTimeout(() => {
      setIsRecovered(true);
      onRecover(errorId);
    }, 3000);

    return () => clearTimeout(timer);
  }, [errorId, onRecover]);

  if (isRecovered) {
    return (
      <motion.div
        className="p-4 bg-blue-100 border border-blue-400 rounded"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h4 className="font-semibold text-blue-800">Component Recovered</h4>
        <p className="text-blue-700">Successfully recovered from error: {errorId}</p>
      </motion.div>
    );
  }

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      <h4 className="font-semibold text-yellow-800">Component Recovering...</h4>
      <p className="text-yellow-700">Attempting to recover from error: {errorId}</p>
      <div className="mt-2">
        <div className="w-full bg-yellow-200 rounded-full h-2">
          <motion.div
            className="bg-yellow-600 h-2 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: 'linear' }}
          />
        </div>
      </div>
    </div>
  );
};

export const AnimationErrorDemo: React.FC = () => {
  const [selectedErrorType, setSelectedErrorType] = useState('animation');
  const [shouldThrowError, setShouldThrowError] = useState(false);
  const [showRecoveryDemo, setShowRecoveryDemo] = useState(false);
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);

  const {
    errors,
    isRecovering,
    fallbackMode,
    recoveryStats,
    reportError,
    resolveError,
    clearAllErrors,
    enableFallbackMode,
    disableFallbackMode,
    getActiveErrors,
    hasActiveErrors
  } = useAnimationErrorRecovery({
    maxRetries: 3,
    retryDelay: 2000,
    enableAutoRecovery: true,
    enableErrorReporting: true
  });

  const handleTriggerError = () => {
    setShouldThrowError(true);
    // Reset after a brief moment to allow error to be caught
    setTimeout(() => {
      setShouldThrowError(false);
    }, 100);
  };

  const handleResetErrorBoundary = () => {
    setShouldThrowError(false);
    setErrorBoundaryKey(prev => prev + 1);
  };

  const handleManualErrorReport = () => {
    const error = new Error(`Manual error report: ${selectedErrorType} error`);
    const errorId = reportError(error, 'ManualTestComponent');
    console.log('Manually reported error:', errorId);
  };

  const handleStartRecoveryDemo = () => {
    const error = new Error('Simulated recoverable error');
    const errorId = reportError(error, 'RecoverableTestComponent');
    setShowRecoveryDemo(true);
    
    // Auto-resolve after demo
    setTimeout(() => {
      resolveError(errorId);
      setShowRecoveryDemo(false);
    }, 5000);
  };

  const handleRecoverComponent = (errorId: string) => {
    resolveError(errorId);
  };

  const handleCustomErrorHandler = (error: Error, errorInfo: React.ErrorInfo) => {
    console.log('Custom error handler called:', { error, errorInfo });
    
    // Report to our error recovery system
    reportError(error, 'ErrorBoundaryComponent');
    
    // Report to error reporter
    animationErrorReporter.reportError(error, 'ErrorBoundaryComponent', {
      props: { selectedErrorType, shouldThrowError }
    });
  };

  const getErrorTypeDescription = (type: string) => {
    const descriptions = {
      animation: 'Framer Motion animation failure',
      webgl: 'WebGL context loss or 3D rendering error',
      memory: 'Memory exhaustion from too many particles',
      generic: 'Generic React component error'
    };
    return descriptions[type as keyof typeof descriptions] || 'Unknown error type';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Animation Error Boundary Demo</h2>
        <p className="text-gray-600">
          Test error handling, recovery mechanisms, and fallback modes
        </p>
      </div>

      {/* Error Recovery Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Total Errors</h3>
          <div className="text-2xl font-bold text-red-600">
            {recoveryStats.totalErrors}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Active Errors</h3>
          <div className="text-2xl font-bold text-yellow-600">
            {recoveryStats.activeErrors}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
          <div className="text-2xl font-bold text-green-600">
            {recoveryStats.recoverySuccessRate.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Avg Recovery Time</h3>
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(recoveryStats.averageRecoveryTime)}ms
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Error Testing Controls</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Error Type</label>
            <select
              value={selectedErrorType}
              onChange={(e) => setSelectedErrorType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="animation">Animation Error</option>
              <option value="webgl">WebGL Error</option>
              <option value="memory">Memory Error</option>
              <option value="generic">Generic Error</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {getErrorTypeDescription(selectedErrorType)}
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleTriggerError}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Trigger Error
            </button>
            
            <button
              onClick={handleResetErrorBoundary}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Reset Error Boundary
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <button
            onClick={handleManualErrorReport}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            Manual Error Report
          </button>
          
          <button
            onClick={handleStartRecoveryDemo}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Recovery Demo
          </button>
          
          <button
            onClick={clearAllErrors}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Clear All Errors
          </button>
        </div>
      </div>

      {/* Fallback Mode Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Fallback Mode</h3>
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            fallbackMode 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {fallbackMode ? 'Fallback Mode Active' : 'Normal Mode'}
          </span>
          
          {fallbackMode ? (
            <button
              onClick={disableFallbackMode}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Disable Fallback Mode
            </button>
          ) : (
            <button
              onClick={enableFallbackMode}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              Enable Fallback Mode
            </button>
          )}
        </div>
        
        {fallbackMode && (
          <p className="text-sm text-yellow-700 mt-2">
            Fallback mode is active - animations are simplified for better stability
          </p>
        )}
      </div>

      {/* Error Boundary Demo */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Error Boundary Test</h3>
        
        <AnimationErrorBoundary
          key={errorBoundaryKey}
          onError={handleCustomErrorHandler}
          enableAutoRecovery={true}
          maxRetries={3}
          retryDelay={2000}
          enableFallbackMode={true}
          enableErrorReporting={true}
        >
          <ErrorProneComponent 
            errorType={selectedErrorType}
            shouldThrow={shouldThrowError}
          />
        </AnimationErrorBoundary>
      </div>

      {/* Recovery Demo */}
      {showRecoveryDemo && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Recovery Demo</h3>
          <RecoverableComponent
            errorId="demo-recovery"
            onRecover={handleRecoverComponent}
          />
        </div>
      )}

      {/* Active Errors List */}
      {hasActiveErrors() && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Active Errors</h3>
          <div className="space-y-3">
            {getActiveErrors().map((error) => (
              <div key={error.id} className="border border-red-200 rounded p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-red-800">{error.error.message}</h4>
                    <p className="text-sm text-gray-600">
                      Component: {error.component} | 
                      Attempts: {error.recoveryAttempts} | 
                      Time: {new Date(error.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => resolveError(error.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error History */}
      {errors.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Error History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Component</th>
                  <th className="text-left p-2">Error</th>
                  <th className="text-left p-2">Attempts</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {errors.slice(-10).map((error) => (
                  <tr key={error.id} className="border-b">
                    <td className="p-2">
                      {new Date(error.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-2">{error.component}</td>
                    <td className="p-2 max-w-xs truncate" title={error.error.message}>
                      {error.error.message}
                    </td>
                    <td className="p-2">{error.recoveryAttempts}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        error.resolved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {error.resolved ? 'Resolved' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recovery Status */}
      {isRecovering && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Recovering from errors...</span>
          </div>
        </div>
      )}
    </div>
  );
};