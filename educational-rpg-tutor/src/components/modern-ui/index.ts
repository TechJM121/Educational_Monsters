/**
 * Modern UI Components - Main Export
 * Exports all glassmorphic design components and skeleton loading states
 */

export { GlassCard, type GlassCardProps } from './GlassCard';
export { GlassButton, type GlassButtonProps } from './GlassButton';
export { GlassModal, type GlassModalProps } from './GlassModal';

// Skeleton Loading Components
export { default as Skeleton, type SkeletonProps } from './Skeleton';
export { default as SkeletonText, type SkeletonTextProps } from './SkeletonText';
export { default as SkeletonCard, type SkeletonCardProps } from './SkeletonCard';
export { default as SkeletonAvatar, type SkeletonAvatarProps } from './SkeletonAvatar';
export { default as SkeletonChart, type SkeletonChartProps } from './SkeletonChart';
export { default as SkeletonLayout, type SkeletonLayoutProps } from './SkeletonLayout';

// Progressive Image Loading Components
export { default as ProgressiveImage, type ProgressiveImageProps } from './ProgressiveImage';
export { default as OptimizedProgressiveImage, type OptimizedProgressiveImageProps } from './OptimizedProgressiveImage';

// Contextual Loading Components
export { default as ContextualLoader, type ContextualLoaderProps } from './ContextualLoader';
export { default as LoadingOverlay, type LoadingOverlayProps } from './LoadingOverlay';
export { default as LoadingTransition, type LoadingTransitionProps } from './LoadingTransition';

// Form Components
export { FloatingLabelInput, type FloatingLabelInputProps } from './FloatingLabelInput';
export { FloatingLabelTextarea, type FloatingLabelTextareaProps } from './FloatingLabelTextarea';
export { FloatingLabelSelect, type FloatingLabelSelectProps, type SelectOption } from './FloatingLabelSelect';

// Demo Components
export { FloatingLabelDemo } from './FloatingLabelDemo';