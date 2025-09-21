/**
 * Lazy-Loaded Components
 * Code-split components for better bundle optimization
 */

import React, { Suspense } from 'react';
import { createLazyComponent, preloadComponent } from '../../utils/bundleOptimization';
import { Skeleton } from '../modern-ui/Skeleton';

// Fallback components for failed loads
const ComponentErrorFallback: React.FC<{ componentName: string }> = ({ componentName }) => (
  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
    <h3 className="text-red-800 font-medium">Component Load Error</h3>
    <p className="text-red-600 text-sm mt-1">
      Failed to load {componentName}. Please refresh the page.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
    >
      Refresh Page
    </button>
  </div>
);

// Loading fallbacks for different component types
const CardSkeleton = () => (
  <Skeleton variant="card" animation="shimmer" className="h-48" />
);

const FormSkeleton = () => (
  <div className="space-y-4">
    <Skeleton variant="text" lines={1} animation="pulse" />
    <Skeleton variant="text" lines={1} animation="pulse" />
    <Skeleton variant="text" lines={1} animation="pulse" />
  </div>
);

const ChartSkeleton = () => (
  <Skeleton variant="chart" animation="wave" className="h-64" />
);

const AvatarSkeleton = () => (
  <Skeleton variant="avatar" animation="pulse" className="w-32 h-32" />
);

// Lazy-loaded Modern UI Components
export const LazyGlassCard = createLazyComponent(
  () => import('../modern-ui/GlassCard').then(m => ({ default: m.GlassCard })),
  () => <ComponentErrorFallback componentName="GlassCard" />
);

export const LazyGlassModal = createLazyComponent(
  () => import('../modern-ui/GlassModal').then(m => ({ default: m.GlassModal })),
  () => <ComponentErrorFallback componentName="GlassModal" />
);

export const LazyResponsiveGrid = createLazyComponent(
  () => import('../modern-ui/ResponsiveGrid').then(m => ({ default: m.ResponsiveGrid })),
  () => <ComponentErrorFallback componentName="ResponsiveGrid" />
);

export const LazyMasonryGrid = createLazyComponent(
  () => import('../modern-ui/MasonryGrid').then(m => ({ default: m.MasonryGrid })),
  () => <ComponentErrorFallback componentName="MasonryGrid" />
);

export const LazyProgressiveImage = createLazyComponent(
  () => import('../modern-ui/ProgressiveImage').then(m => ({ default: m.ProgressiveImage })),
  () => <ComponentErrorFallback componentName="ProgressiveImage" />
);

// Lazy-loaded Form Components
export const LazyFloatingLabelInput = createLazyComponent(
  () => import('../modern-ui/FloatingLabelInput').then(m => ({ default: m.FloatingLabelInput })),
  () => <ComponentErrorFallback componentName="FloatingLabelInput" />
);

export const LazyFloatingLabelSelect = createLazyComponent(
  () => import('../modern-ui/FloatingLabelSelect').then(m => ({ default: m.FloatingLabelSelect })),
  () => <ComponentErrorFallback componentName="FloatingLabelSelect" />
);

export const LazyFloatingLabelTextarea = createLazyComponent(
  () => import('../modern-ui/FloatingLabelTextarea').then(m => ({ default: m.FloatingLabelTextarea })),
  () => <ComponentErrorFallback componentName="FloatingLabelTextarea" />
);

// Lazy-loaded Typography Components
export const LazyTypewriterText = createLazyComponent(
  () => import('../typography/TypewriterText').then(m => ({ default: m.TypewriterText })),
  () => <ComponentErrorFallback componentName="TypewriterText" />
);

export const LazyGradientText = createLazyComponent(
  () => import('../typography/GradientText').then(m => ({ default: m.GradientText })),
  () => <ComponentErrorFallback componentName="GradientText" />
);

export const LazyTextReveal = createLazyComponent(
  () => import('../typography/TextReveal').then(m => ({ default: m.TextReveal })),
  () => <ComponentErrorFallback componentName="TextReveal" />
);

// Lazy-loaded Data Visualization Components
export const LazyAnimatedProgressBar = createLazyComponent(
  () => import('../data-visualization/AnimatedProgressBar').then(m => ({ default: m.AnimatedProgressBar })),
  () => <ComponentErrorFallback componentName="AnimatedProgressBar" />
);

export const LazyAnimatedProgressRing = createLazyComponent(
  () => import('../data-visualization/AnimatedProgressRing').then(m => ({ default: m.AnimatedProgressRing })),
  () => <ComponentErrorFallback componentName="AnimatedProgressRing" />
);

export const LazyStatCard = createLazyComponent(
  () => import('../data-visualization/StatCard').then(m => ({ default: m.StatCard })),
  () => <ComponentErrorFallback componentName="StatCard" />
);

// Lazy-loaded 3D Components (Heavy dependencies)
export const LazyAvatar3D = createLazyComponent(
  () => import('../3d/Avatar3D').then(m => ({ default: m.Avatar3D })),
  () => <ComponentErrorFallback componentName="Avatar3D" />
);

// Lazy-loaded Particle System (Heavy dependencies)
export const LazyParticleEngine = createLazyComponent(
  () => import('../particles/ParticleEngine').then(m => ({ default: m.ParticleEngine })),
  () => <ComponentErrorFallback componentName="ParticleEngine" />
);

export const LazyThemedParticleSystem = createLazyComponent(
  () => import('../particles/ThemedParticleSystem').then(m => ({ default: m.ThemedParticleSystem })),
  () => <ComponentErrorFallback componentName="ThemedParticleSystem" />
);

// Lazy-loaded Character Components
export const LazyModernCharacterCustomization = createLazyComponent(
  () => import('../character/ModernCharacterCustomization').then(m => ({ default: m.ModernCharacterCustomization })),
  () => <ComponentErrorFallback componentName="ModernCharacterCustomization" />
);

export const LazyModern3DCharacterAvatar = createLazyComponent(
  () => import('../character/Modern3DCharacterAvatar').then(m => ({ default: m.Modern3DCharacterAvatar })),
  () => <ComponentErrorFallback componentName="Modern3DCharacterAvatar" />
);

// Wrapper components with Suspense and appropriate fallbacks
export const LazyGlassCardWithSuspense: React.FC<React.ComponentProps<typeof LazyGlassCard>> = (props) => (
  <Suspense fallback={<CardSkeleton />}>
    <LazyGlassCard {...props} />
  </Suspense>
);

export const LazyFormWithSuspense: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <Suspense fallback={<FormSkeleton />}>
    {children}
  </Suspense>
);

export const LazyChartWithSuspense: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <Suspense fallback={<ChartSkeleton />}>
    {children}
  </Suspense>
);

export const LazyAvatar3DWithSuspense: React.FC<React.ComponentProps<typeof LazyAvatar3D>> = (props) => (
  <Suspense fallback={<AvatarSkeleton />}>
    <LazyAvatar3D {...props} />
  </Suspense>
);

// Preloading utilities for better UX
export const preloadCriticalComponents = () => {
  // Preload components likely to be used immediately
  preloadComponent(() => import('../modern-ui/GlassCard'));
  preloadComponent(() => import('../modern-ui/GlassButton'));
  preloadComponent(() => import('../modern-ui/FloatingLabelInput'));
};

export const preloadSecondaryComponents = () => {
  // Preload components likely to be used after initial load
  preloadComponent(() => import('../modern-ui/GlassModal'));
  preloadComponent(() => import('../modern-ui/ResponsiveGrid'));
  preloadComponent(() => import('../data-visualization/AnimatedProgressBar'));
};

export const preloadHeavyComponents = () => {
  // Preload heavy components during idle time
  preloadComponent(() => import('../3d/Avatar3D'));
  preloadComponent(() => import('../particles/ParticleEngine'));
  preloadComponent(() => import('../character/ModernCharacterCustomization'));
};

// Component bundle information for analysis
export const COMPONENT_BUNDLES = {
  critical: [
    'GlassCard',
    'GlassButton',
    'FloatingLabelInput',
    'Skeleton'
  ],
  secondary: [
    'GlassModal',
    'ResponsiveGrid',
    'MasonryGrid',
    'ProgressiveImage',
    'AnimatedProgressBar',
    'AnimatedProgressRing'
  ],
  heavy: [
    'Avatar3D',
    'ParticleEngine',
    'ThemedParticleSystem',
    'ModernCharacterCustomization',
    'Modern3DCharacterAvatar'
  ],
  typography: [
    'TypewriterText',
    'GradientText',
    'TextReveal'
  ],
  forms: [
    'FloatingLabelInput',
    'FloatingLabelSelect',
    'FloatingLabelTextarea'
  ]
};

// Bundle size estimates (in KB)
export const BUNDLE_SIZE_ESTIMATES = {
  'GlassCard': 2.1,
  'GlassButton': 1.8,
  'GlassModal': 3.2,
  'FloatingLabelInput': 2.5,
  'FloatingLabelSelect': 2.8,
  'FloatingLabelTextarea': 2.6,
  'ResponsiveGrid': 1.9,
  'MasonryGrid': 2.4,
  'ProgressiveImage': 3.1,
  'TypewriterText': 2.2,
  'GradientText': 1.7,
  'TextReveal': 2.0,
  'AnimatedProgressBar': 2.8,
  'AnimatedProgressRing': 3.0,
  'StatCard': 2.3,
  'Avatar3D': 45.2, // Heavy due to Three.js
  'ParticleEngine': 38.7, // Heavy due to physics calculations
  'ThemedParticleSystem': 41.3,
  'ModernCharacterCustomization': 52.1, // Heavy due to 3D + forms
  'Modern3DCharacterAvatar': 47.8
};

// Performance monitoring for lazy components
export const trackComponentLoad = (componentName: string, loadTime: number) => {
  // Track component loading performance
  if ('performance' in window && 'mark' in performance) {
    performance.mark(`${componentName}-loaded`);
    performance.measure(`${componentName}-load-time`, `${componentName}-start`, `${componentName}-loaded`);
  }
  
  // Send to analytics if available
  if ('gtag' in window) {
    (window as any).gtag('event', 'component_load', {
      component_name: componentName,
      load_time: loadTime,
      bundle_size: BUNDLE_SIZE_ESTIMATES[componentName as keyof typeof BUNDLE_SIZE_ESTIMATES] || 0
    });
  }
};