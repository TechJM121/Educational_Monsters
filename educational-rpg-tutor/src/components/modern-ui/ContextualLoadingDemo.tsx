import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LoadingProvider } from '../../contexts/LoadingContext';
import { useDataLoading, useImageLoading, useFormLoading, useNavigationLoading, useContentLoading } from '../../hooks/useContextualLoading';
import ContextualLoader from './ContextualLoader';
import LoadingOverlay from './LoadingOverlay';
import LoadingTransition from './LoadingTransition';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';

const LoadingDemoContent: React.FC = () => {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [transitionLoading, setTransitionLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Different loading states
  const dataLoading = useDataLoading('demo-data', { timeout: 5000 });
  const imageLoading = useImageLoading('demo-images');
  const formLoading = useFormLoading('demo-form');
  const navigationLoading = useNavigationLoading('demo-nav');
  const contentLoading = useContentLoading('demo-content');

  // Simulate progress updates
  useEffect(() => {
    if (dataLoading.loading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          dataLoading.update(newProgress, `Loading data... ${newProgress}%`);
          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              dataLoading.stop();
              setProgress(0);
            }, 500);
          }
          return newProgress;
        });
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [dataLoading.loading]);

  const startDataLoading = () => {
    setProgress(0);
    dataLoading.start('Fetching user data...');
  };

  const startImageLoading = () => {
    imageLoading.start('Loading gallery images...');
    setTimeout(() => imageLoading.stop(), 3000);
  };

  const startFormLoading = () => {
    formLoading.start('Submitting form...');
    setTimeout(() => formLoading.stop(), 2000);
  };

  const startNavigationLoading = () => {
    navigationLoading.start('Navigating to page...');
    setTimeout(() => navigationLoading.stop(), 1500);
  };

  const startContentLoading = () => {
    contentLoading.start('Loading article content...');
    setTimeout(() => contentLoading.stop(), 4000);
  };

  const showOverlay = () => {
    setOverlayVisible(true);
    setTimeout(() => setOverlayVisible(false), 3000);
  };

  const startTransitionDemo = () => {
    setTransitionLoading(true);
    setTimeout(() => setTransitionLoading(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Contextual Loading Animations Demo
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Showcase of contextual loading states with smooth transitions, 
            progress tracking, and type-specific animations.
          </p>
        </motion.div>

        {/* Loading Type Demos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Data Loading */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Data Loading</h3>
            <div className="space-y-4">
              <div className="min-h-[60px] flex items-center justify-center">
                {dataLoading.loading ? (
                  <ContextualLoader
                    type="data"
                    message={dataLoading.state?.message}
                    progress={dataLoading.state?.progress}
                    variant="detailed"
                    showProgress={true}
                  />
                ) : (
                  <p className="text-white/80 text-center">Ready to load data</p>
                )}
              </div>
              <GlassButton
                variant="primary"
                onClick={startDataLoading}
                disabled={dataLoading.loading}
                className="w-full"
              >
                {dataLoading.loading ? 'Loading...' : 'Load Data'}
              </GlassButton>
            </div>
          </GlassCard>

          {/* Image Loading */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Image Loading</h3>
            <div className="space-y-4">
              <div className="min-h-[60px] flex items-center justify-center">
                {imageLoading.loading ? (
                  <ContextualLoader
                    type="images"
                    message="Loading gallery images..."
                    variant="detailed"
                  />
                ) : (
                  <p className="text-white/80 text-center">Ready to load images</p>
                )}
              </div>
              <GlassButton
                variant="secondary"
                onClick={startImageLoading}
                disabled={imageLoading.loading}
                className="w-full"
              >
                {imageLoading.loading ? 'Loading...' : 'Load Images'}
              </GlassButton>
            </div>
          </GlassCard>

          {/* Form Loading */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Form Processing</h3>
            <div className="space-y-4">
              <div className="min-h-[60px] flex items-center justify-center">
                {formLoading.loading ? (
                  <ContextualLoader
                    type="forms"
                    message="Processing submission..."
                    variant="detailed"
                  />
                ) : (
                  <p className="text-white/80 text-center">Ready to submit form</p>
                )}
              </div>
              <GlassButton
                variant="accent"
                onClick={startFormLoading}
                disabled={formLoading.loading}
                className="w-full"
              >
                {formLoading.loading ? 'Processing...' : 'Submit Form'}
              </GlassButton>
            </div>
          </GlassCard>

          {/* Navigation Loading */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Navigation</h3>
            <div className="space-y-4">
              <div className="min-h-[60px] flex items-center justify-center">
                {navigationLoading.loading ? (
                  <ContextualLoader
                    type="navigation"
                    message="Navigating..."
                    variant="detailed"
                  />
                ) : (
                  <p className="text-white/80 text-center">Ready to navigate</p>
                )}
              </div>
              <GlassButton
                variant="primary"
                onClick={startNavigationLoading}
                disabled={navigationLoading.loading}
                className="w-full"
              >
                {navigationLoading.loading ? 'Navigating...' : 'Navigate'}
              </GlassButton>
            </div>
          </GlassCard>

          {/* Content Loading */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Content Loading</h3>
            <div className="space-y-4">
              <div className="min-h-[60px] flex items-center justify-center">
                {contentLoading.loading ? (
                  <ContextualLoader
                    type="content"
                    message="Loading article..."
                    variant="detailed"
                  />
                ) : (
                  <p className="text-white/80 text-center">Ready to load content</p>
                )}
              </div>
              <GlassButton
                variant="secondary"
                onClick={startContentLoading}
                disabled={contentLoading.loading}
                className="w-full"
              >
                {contentLoading.loading ? 'Loading...' : 'Load Content'}
              </GlassButton>
            </div>
          </GlassCard>

          {/* Overlay Demo */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Loading Overlay</h3>
            <div className="space-y-4">
              <div className="min-h-[60px] flex items-center justify-center">
                <p className="text-white/80 text-center">
                  Full-screen loading overlay with backdrop blur
                </p>
              </div>
              <GlassButton
                variant="accent"
                onClick={showOverlay}
                className="w-full"
              >
                Show Overlay
              </GlassButton>
            </div>
          </GlassCard>
        </div>

        {/* Loading Transition Demo */}
        <GlassCard className="p-6">
          <h3 className="text-2xl font-semibold text-white mb-6">Loading Transitions</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <GlassButton
                variant="primary"
                onClick={startTransitionDemo}
                disabled={transitionLoading}
              >
                Demo Transition
              </GlassButton>
            </div>
            
            <LoadingTransition
              loading={transitionLoading}
              type="content"
              message="Loading article content..."
              transition="fade"
              className="min-h-[200px]"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-lg font-medium text-white">Article Title</h4>
                  <p className="text-white/80">
                    This is sample content that appears after the loading state completes.
                    The transition provides a smooth experience between loading and loaded states.
                  </p>
                  <p className="text-white/60 text-sm">
                    Published 2 hours ago • 5 min read
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-2">Key Points</h5>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>• Smooth loading transitions</li>
                    <li>• Contextual loading states</li>
                    <li>• Progress tracking</li>
                    <li>• Type-specific animations</li>
                  </ul>
                </div>
              </div>
            </LoadingTransition>
          </div>
        </GlassCard>

        {/* Features Overview */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Contextual Loading Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-white/80">
            <div className="space-y-2">
              <h4 className="font-medium text-white">Type-Specific Animations</h4>
              <p className="text-sm">Different animations for data, images, forms, navigation, and content</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">Progress Tracking</h4>
              <p className="text-sm">Real-time progress updates with smooth progress bars</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">Smooth Transitions</h4>
              <p className="text-sm">Seamless transitions between loading and loaded states</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">Context Management</h4>
              <p className="text-sm">Centralized loading state management with React Context</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">Overlay Support</h4>
              <p className="text-sm">Full-screen overlays with backdrop blur and cancellation</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">Timeout Handling</h4>
              <p className="text-sm">Automatic timeout detection and error handling</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={overlayVisible}
        type="data"
        message="Processing your request..."
        backdrop={true}
        blur={true}
        cancelable={true}
        onCancel={() => setOverlayVisible(false)}
      />
    </div>
  );
};

const ContextualLoadingDemo: React.FC = () => {
  return (
    <LoadingProvider>
      <LoadingDemoContent />
    </LoadingProvider>
  );
};

export default ContextualLoadingDemo;