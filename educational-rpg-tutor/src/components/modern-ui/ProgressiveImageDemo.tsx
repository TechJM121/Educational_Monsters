import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProgressiveImage from './ProgressiveImage';
import OptimizedProgressiveImage from './OptimizedProgressiveImage';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';

const ProgressiveImageDemo: React.FC = () => {
  const [imageType, setImageType] = useState<'standard' | 'optimized'>('optimized');
  const [lazyLoading, setLazyLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);

  // Sample images for demo
  const sampleImages = [
    {
      src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      alt: 'Mountain landscape',
      aspectRatio: '4/3'
    },
    {
      src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
      alt: 'Forest path',
      aspectRatio: '2/1'
    },
    {
      src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      alt: 'Square mountain view',
      aspectRatio: '1/1'
    },
    {
      src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=800&fit=crop',
      alt: 'Vertical nature scene',
      aspectRatio: '3/4'
    }
  ];

  const ImageComponent = imageType === 'optimized' ? OptimizedProgressiveImage : ProgressiveImage;

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
            Progressive Image Loading Demo
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Showcase of progressive image loading with blur-to-sharp transitions, 
            lazy loading, and intelligent fallback handling.
          </p>
        </motion.div>

        {/* Controls */}
        <GlassCard className="p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {/* Component Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">Component:</label>
                <div className="flex gap-2">
                  <GlassButton
                    variant={imageType === 'standard' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setImageType('standard')}
                  >
                    Standard
                  </GlassButton>
                  <GlassButton
                    variant={imageType === 'optimized' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setImageType('optimized')}
                  >
                    Optimized
                  </GlassButton>
                </div>
              </div>

              {/* Lazy Loading Toggle */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">Lazy Loading:</label>
                <GlassButton
                  variant={lazyLoading ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setLazyLoading(!lazyLoading)}
                >
                  {lazyLoading ? 'Enabled' : 'Disabled'}
                </GlassButton>
              </div>

              {/* Fallback Demo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">Test Fallback:</label>
                <GlassButton
                  variant={showFallback ? 'accent' : 'secondary'}
                  size="sm"
                  onClick={() => setShowFallback(!showFallback)}
                >
                  {showFallback ? 'Enabled' : 'Disabled'}
                </GlassButton>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Image Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {sampleImages.map((image, index) => (
            <motion.div
              key={`${imageType}-${lazyLoading}-${showFallback}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-4">
                <div className="space-y-3">
                  <ImageComponent
                    src={showFallback ? 'https://invalid-url.jpg' : image.src}
                    alt={image.alt}
                    lazy={lazyLoading}
                    fallbackSrc={showFallback ? image.src : undefined}
                    aspectRatio={image.aspectRatio}
                    className="rounded-lg"
                    retryAttempts={2}
                    onLoad={() => console.log(`Loaded: ${image.alt}`)}
                    onError={(error) => console.log(`Error loading: ${image.alt}`, error)}
                  />
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-white">{image.alt}</h3>
                    <p className="text-xs text-white/60">Aspect Ratio: {image.aspectRatio}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Large Image Demo */}
        <GlassCard className="p-6">
          <h3 className="text-2xl font-semibold text-white mb-6">Large Image Demo</h3>
          <div className="max-w-4xl mx-auto">
            <ImageComponent
              src={showFallback ? 'https://invalid-large-image.jpg' : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop'}
              alt="Large mountain landscape"
              lazy={lazyLoading}
              fallbackSrc={showFallback ? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop' : undefined}
              aspectRatio="2/1"
              className="rounded-xl"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              priority={!lazyLoading}
            />
          </div>
        </GlassCard>

        {/* Features Overview */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Progressive Loading Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-white/80">
            <div className="space-y-2">
              <h4 className="font-medium text-white">Blur-to-Sharp Transition</h4>
              <p className="text-sm">Smooth transition from blurred placeholder to sharp image</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">Lazy Loading</h4>
              <p className="text-sm">Images load only when they enter the viewport</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">Intelligent Fallbacks</h4>
              <p className="text-sm">Automatic fallback to alternative images on failure</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">Retry Logic</h4>
              <p className="text-sm">Automatic retry with exponential backoff</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">Performance Optimized</h4>
              <p className="text-sm">Intersection Observer and efficient loading states</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">Responsive Images</h4>
              <p className="text-sm">Support for responsive images with sizes attribute</p>
            </div>
          </div>
        </GlassCard>

        {/* Usage Examples */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Usage Examples</h3>
          <div className="space-y-4 text-white/80">
            <div className="bg-black/20 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-green-400">// Basic progressive image</div>
              <div className="text-white">
                {`<ProgressiveImage`}
              </div>
              <div className="text-white ml-4">
                {`src="image.jpg"`}
              </div>
              <div className="text-white ml-4">
                {`alt="Description"`}
              </div>
              <div className="text-white ml-4">
                {`lazy={true}`}
              </div>
              <div className="text-white ml-4">
                {`aspectRatio="16/9"`}
              </div>
              <div className="text-white">
                {`/>`}
              </div>
            </div>
            <div className="bg-black/20 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-green-400">// With fallback and retry</div>
              <div className="text-white">
                {`<OptimizedProgressiveImage`}
              </div>
              <div className="text-white ml-4">
                {`src="primary.jpg"`}
              </div>
              <div className="text-white ml-4">
                {`fallbackSrc="fallback.jpg"`}
              </div>
              <div className="text-white ml-4">
                {`retryAttempts={3}`}
              </div>
              <div className="text-white ml-4">
                {`onLoad={() => console.log('Loaded!')}`}
              </div>
              <div className="text-white ml-4">
                {`onError={(e) => console.log('Error:', e)}`}
              </div>
              <div className="text-white">
                {`/>`}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ProgressiveImageDemo;