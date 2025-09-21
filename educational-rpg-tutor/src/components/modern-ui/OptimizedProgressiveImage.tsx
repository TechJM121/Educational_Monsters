import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useImageLoader } from '../../hooks/useImageLoader';
import { useLazyLoading } from '../../hooks/useLazyLoading';

export interface OptimizedProgressiveImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  blurDataURL?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  lazy?: boolean;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: (error: Event) => void;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  retryAttempts?: number;
  quality?: number;
  aspectRatio?: string;
}

const OptimizedProgressiveImage: React.FC<OptimizedProgressiveImageProps> = ({
  src,
  alt,
  placeholder,
  blurDataURL,
  className = '',
  width,
  height,
  lazy = true,
  fallbackSrc,
  onLoad,
  onError,
  priority = false,
  sizes,
  style,
  retryAttempts = 2,
  quality = 75,
  aspectRatio
}) => {
  // Lazy loading with Intersection Observer
  const { elementRef, inView } = useLazyLoading({
    disabled: !lazy || priority,
    rootMargin: '100px',
    threshold: 0.1,
    triggerOnce: true
  });

  // Image loading state management
  const imageLoader = useImageLoader(src, {
    lazy,
    priority,
    fallbackSrc,
    retryAttempts,
    onLoad,
    onError
  });

  // Trigger loading when in view
  useEffect(() => {
    if (inView) {
      imageLoader.setInView(true);
    }
  }, [inView, imageLoader]);

  // Generate optimized blur placeholder
  const getBlurDataURL = () => {
    if (blurDataURL) return blurDataURL;
    if (placeholder) return placeholder;
    
    // Generate a minimal SVG placeholder
    const svg = `
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e2e8f0" />
            <stop offset="100%" stop-color="#cbd5e1" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" fill="url(#g)" />
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // Container styles with aspect ratio support
  const containerStyles: React.CSSProperties = {
    width,
    height,
    aspectRatio,
    ...style
  };

  // Error state
  if (imageLoader.error) {
    return (
      <motion.div
        ref={elementRef}
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
        style={containerStyles}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center text-gray-500 dark:text-gray-400 p-4">
          <svg 
            className="w-8 h-8 mx-auto mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" 
            />
          </svg>
          <p className="text-sm font-medium">Image failed to load</p>
          {imageLoader.attempts > 0 && (
            <button
              onClick={imageLoader.retry}
              className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div
      ref={elementRef}
      className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`}
      style={containerStyles}
    >
      <AnimatePresence mode="wait">
        {/* Blur placeholder - always show until main image loads */}
        {!imageLoader.loaded && (
          <motion.div
            key="placeholder"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <img
              src={getBlurDataURL()}
              alt=""
              className="w-full h-full object-cover"
              style={{
                filter: 'blur(20px)',
                transform: 'scale(1.1)',
              }}
            />
            
            {/* Shimmer overlay when loading */}
            {imageLoader.loading && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </motion.div>
        )}

        {/* Main image */}
        {imageLoader.loaded && imageLoader.currentSrc && (
          <motion.img
            key="main-image"
            src={imageLoader.currentSrc}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
            sizes={sizes}
            initial={{ 
              opacity: 0,
              filter: 'blur(8px)',
              scale: 1.02
            }}
            animate={{ 
              opacity: 1,
              filter: 'blur(0px)',
              scale: 1
            }}
            transition={{ 
              duration: 0.7,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            loading={lazy && !priority ? 'lazy' : 'eager'}
            decoding="async"
          />
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      {imageLoader.loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.5 }} // Only show after a delay
        >
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </motion.div>
      )}

      {/* Progress indicator for slow connections */}
      {imageLoader.loading && imageLoader.attempts > 0 && (
        <motion.div
          className="absolute bottom-2 left-2 right-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-xs text-white">
                Loading... ({imageLoader.attempts}/{retryAttempts})
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OptimizedProgressiveImage;