import React, { useEffect, useState } from 'react';
import { useServiceWorker, useOfflineStatus } from '../hooks/useServiceWorker';
import { useOnboardingTracking } from '../hooks/useOnboardingTracking';
import { useABTest } from '../hooks/useABTest';
import { analyticsService } from '../services/analyticsService';
import { loggingService } from '../services/loggingService';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductionOptimizationsProps {
  userId?: string;
  isGuest?: boolean;
  children: React.ReactNode;
}

export function ProductionOptimizations({ 
  userId, 
  isGuest = false, 
  children 
}: ProductionOptimizationsProps) {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);
  
  // Service Worker integration
  const { 
    isSupported, 
    isRegistered, 
    updateAvailable, 
    update 
  } = useServiceWorker();
  
  // Offline status monitoring
  const { isOnline, wasOffline } = useOfflineStatus();
  
  // A/B testing for production optimizations
  const { variant: optimizationVariant, config: optimizationConfig } = useABTest(
    'production_optimizations',
    userId,
    { isGuest, userAgent: navigator.userAgent }
  );

  // Initialize services with user context
  useEffect(() => {
    if (userId) {
      analyticsService.setUser(userId, isGuest);
      loggingService.setUserId(userId);
      
      loggingService.info('Production optimizations initialized', {
        component: 'ProductionOptimizations',
        userId,
        isGuest,
        serviceWorkerSupported: isSupported,
        serviceWorkerRegistered: isRegistered,
        optimizationVariant,
      });
    }
  }, [userId, isGuest, isSupported, isRegistered, optimizationVariant]);

  // Handle service worker updates
  useEffect(() => {
    if (updateAvailable) {
      setShowUpdatePrompt(true);
      
      analyticsService.track('service_worker_update_available', {
        userId,
        isGuest,
      });
    }
  }, [updateAvailable, userId, isGuest]);

  // Handle offline/online transitions
  useEffect(() => {
    if (!isOnline) {
      setShowOfflineNotice(true);
      
      analyticsService.track('user_went_offline', {
        userId,
        isGuest,
        timestamp: Date.now(),
      });
      
      loggingService.warn('User went offline', {
        component: 'ProductionOptimizations',
        userId,
        isGuest,
      });
    } else if (wasOffline) {
      setShowOfflineNotice(false);
      
      analyticsService.track('user_came_online', {
        userId,
        isGuest,
        timestamp: Date.now(),
      });
      
      loggingService.info('User came back online', {
        component: 'ProductionOptimizations',
        userId,
        isGuest,
      });
    }
  }, [isOnline, wasOffline, userId, isGuest]);

  // Performance monitoring
  useEffect(() => {
    // Monitor page load performance
    const handleLoad = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        
        analyticsService.track('page_performance', {
          loadTime,
          domContentLoaded,
          userId,
          isGuest,
          url: window.location.href,
        });
        
        loggingService.logPerformance('page_load_time', loadTime, {
          component: 'ProductionOptimizations',
          userId,
          isGuest,
        });
      }
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [userId, isGuest]);

  // Error boundary integration
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      loggingService.error('Global JavaScript error', new Error(event.message), {
        component: 'ProductionOptimizations',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        userId,
        isGuest,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      loggingService.error('Unhandled promise rejection', new Error(event.reason), {
        component: 'ProductionOptimizations',
        userId,
        isGuest,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [userId, isGuest]);

  const handleUpdateApp = async () => {
    try {
      await update();
      setShowUpdatePrompt(false);
      
      analyticsService.track('service_worker_updated', {
        userId,
        isGuest,
      });
    } catch (error) {
      loggingService.error('Failed to update service worker', error as Error, {
        component: 'ProductionOptimizations',
        userId,
        isGuest,
      });
    }
  };

  const dismissUpdatePrompt = () => {
    setShowUpdatePrompt(false);
    
    analyticsService.track('service_worker_update_dismissed', {
      userId,
      isGuest,
    });
  };

  return (
    <>
      {children}
      
      {/* Service Worker Update Prompt */}
      <AnimatePresence>
        {showUpdatePrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-2xl">🔄</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Update Available</h3>
                <p className="text-sm text-blue-100 mb-3">
                  A new version of the app is available with improvements and bug fixes.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateApp}
                    className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
                  >
                    Update Now
                  </button>
                  <button
                    onClick={dismissUpdatePrompt}
                    className="text-blue-200 hover:text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Notice */}
      <AnimatePresence>
        {showOfflineNotice && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">📡</span>
              <span className="font-medium">You're offline</span>
              <span className="text-yellow-200">- Some features may be limited</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Monitoring (Development Only) */}
      {import.meta.env.DEV && (
        <PerformanceMonitor userId={userId} isGuest={isGuest} />
      )}
    </>
  );
}

// Development-only performance monitoring component
function PerformanceMonitor({ userId, isGuest }: { userId?: string; isGuest?: boolean }) {
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const newMetrics: Record<string, number> = {};

      entries.forEach((entry) => {
        if (entry.entryType === 'paint') {
          newMetrics[entry.name] = entry.startTime;
        } else if (entry.entryType === 'largest-contentful-paint') {
          newMetrics['largest-contentful-paint'] = entry.startTime;
        } else if (entry.entryType === 'first-input') {
          newMetrics['first-input-delay'] = (entry as any).processingStart - entry.startTime;
        }
      });

      setMetrics(prev => ({ ...prev, ...newMetrics }));
    });

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input'] });

    return () => observer.disconnect();
  }, []);

  if (!showMetrics) {
    return (
      <button
        onClick={() => setShowMetrics(true)}
        className="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-50 text-xs"
        title="Show Performance Metrics"
      >
        📊
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 max-w-xs"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm">Performance Metrics</h3>
        <button
          onClick={() => setShowMetrics(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1 text-xs">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-gray-300">{key}:</span>
            <span className="text-white">{Math.round(value)}ms</span>
          </div>
        ))}
        
        {Object.keys(metrics).length === 0 && (
          <div className="text-gray-400">Loading metrics...</div>
        )}
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400">
        User: {userId ? (isGuest ? 'Guest' : 'Registered') : 'Anonymous'}
      </div>
    </motion.div>
  );
}