import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ProgressiveImageProps {
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
  quality?: number;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
}

interface ImageState {
  loaded: boolean;
  error: boolean;
  inView: boolean;
  src: string | null;
}

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
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
  quality = 75,
  priority = false,
  sizes,
  style
}) => {
  const [imageState, setImageState] = useState<ImageState>({
    loaded: false,
    error: false,
    inView: !lazy || priority,
    src: null
  });

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate blur placeholder if not provided
  const getBlurDataURL = useCallback(() => {
    if (blurDataURL) return blurDataURL;
    if (placeholder) return placeholder;
    
    // Generate a simple blur placeholder
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(200,200,200);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(150,150,150);stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" fill="url(#grad)" />
      </svg>
    `)}`;
  }, [blurDataURL, placeholder]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || imageState.inView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageState(prev => ({ ...prev, inView: true }));
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [lazy, priority, imageState.inView]);

  // Load image when in view
  useEffect(() => {
    if (!imageState.inView || imageState.loaded || imageState.error) return;

    const img = new Image();
    
    img.onload = () => {
      setImageState(prev => ({ 
        ...prev, 
        loaded: true, 
        src: src 
      }));
      onLoad?.();
    };

    img.onerror = (error) => {
      if (fallbackSrc && !imageState.src) {
        // Try fallback image
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setImageState(prev => ({ 
            ...prev, 
            loaded: true, 
            src: fallbackSrc 
          }));
          onLoad?.();
        };
        fallbackImg.onerror = () => {
          setImageState(prev => ({ ...prev, error: true }));
          onError?.(error);
        };
        fallbackImg.src = fallbackSrc;
      } else {
        setImageState(prev => ({ ...prev, error: true }));
        onError?.(error);
      }
    };

    img.src = src;
  }, [imageState.inView, imageState.loaded, imageState.error, src, fallbackSrc, onLoad, onError]);

  // Render error state
  if (imageState.error) {
    return (
      <motion.div
        ref={containerRef}
        className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${className}`}
        style={{ width, height, ...style }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg 
            className="w-8 h-8 mx-auto mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <p className="text-sm">Failed to load image</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height, ...style }}
    >
      <AnimatePresence mode="wait">
        {/* Blur placeholder */}
        {!imageState.loaded && (
          <motion.img
            key="placeholder"
            src={getBlurDataURL()}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: 'blur(20px)',
              transform: 'scale(1.1)', // Slightly larger to hide blur edges
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Loading skeleton overlay */}
        {imageState.inView && !imageState.loaded && (
          <motion.div
            key="skeleton"
            className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 animate-shimmer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Main image */}
        {imageState.loaded && imageState.src && (
          <motion.img
            key="main-image"
            ref={imgRef}
            src={imageState.src}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
            sizes={sizes}
            initial={{ 
              opacity: 0,
              filter: 'blur(10px)',
              scale: 1.05
            }}
            animate={{ 
              opacity: 1,
              filter: 'blur(0px)',
              scale: 1
            }}
            transition={{ 
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth reveal
            }}
            loading={lazy && !priority ? 'lazy' : 'eager'}
          />
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      {imageState.inView && !imageState.loaded && !imageState.error && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </motion.div>
      )}
    </div>
  );
};

export default ProgressiveImage;