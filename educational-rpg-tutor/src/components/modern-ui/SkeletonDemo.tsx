import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Skeleton, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonAvatar, 
  SkeletonChart, 
  SkeletonLayout 
} from './index';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';

const SkeletonDemo: React.FC = () => {
  const [currentAnimation, setCurrentAnimation] = useState<'pulse' | 'wave' | 'shimmer'>('pulse');
  const [currentLayout, setCurrentLayout] = useState<'dashboard' | 'profile' | 'feed' | 'grid' | 'list'>('dashboard');
  const [showSkeletons, setShowSkeletons] = useState(true);

  const animations: Array<'pulse' | 'wave' | 'shimmer'> = ['pulse', 'wave', 'shimmer'];
  const layouts: Array<'dashboard' | 'profile' | 'feed' | 'grid' | 'list'> = ['dashboard', 'profile', 'feed', 'grid', 'list'];

  const toggleSkeletons = () => {
    setShowSkeletons(!showSkeletons);
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
            Skeleton Loading Components Demo
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Showcase of modern skeleton loading states with glassmorphic design, 
            smooth animations, and responsive layouts.
          </p>
        </motion.div>

        {/* Controls */}
        <GlassCard className="p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {/* Animation Controls */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">Animation:</label>
                <div className="flex gap-2">
                  {animations.map((animation) => (
                    <GlassButton
                      key={animation}
                      variant={currentAnimation === animation ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setCurrentAnimation(animation)}
                    >
                      {animation.charAt(0).toUpperCase() + animation.slice(1)}
                    </GlassButton>
                  ))}
                </div>
              </div>

              {/* Layout Controls */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">Layout:</label>
                <div className="flex gap-2">
                  {layouts.map((layout) => (
                    <GlassButton
                      key={layout}
                      variant={currentLayout === layout ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setCurrentLayout(layout)}
                    >
                      {layout.charAt(0).toUpperCase() + layout.slice(1)}
                    </GlassButton>
                  ))}
                </div>
              </div>
            </div>

            {/* Toggle Button */}
            <GlassButton
              variant="accent"
              onClick={toggleSkeletons}
            >
              {showSkeletons ? 'Hide Skeletons' : 'Show Skeletons'}
            </GlassButton>
          </div>
        </GlassCard>

        {/* Individual Component Demos */}
        {showSkeletons && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Text Skeleton Demo */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Text Skeleton</h3>
              <div className="space-y-4">
                <SkeletonText lines={3} animation={currentAnimation} />
                <SkeletonText lines={5} animation={currentAnimation} lineHeight="lg" />
                <SkeletonText lines={2} animation={currentAnimation} lineHeight="sm" />
              </div>
            </GlassCard>

            {/* Card Skeleton Demo */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Card Skeleton</h3>
              <SkeletonCard 
                animation={currentAnimation} 
                hasImage={true}
                hasButton={true}
                textLines={3}
              />
            </GlassCard>

            {/* Avatar Skeleton Demo */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Avatar Skeleton</h3>
              <div className="space-y-4">
                <SkeletonAvatar size="sm" animation={currentAnimation} withName />
                <SkeletonAvatar size="md" animation={currentAnimation} withName withStatus />
                <SkeletonAvatar size="lg" animation={currentAnimation} shape="rounded" />
                <SkeletonAvatar size="xl" animation={currentAnimation} shape="square" />
              </div>
            </GlassCard>

            {/* Chart Skeleton Demo */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Chart Skeleton</h3>
              <div className="space-y-4">
                <SkeletonChart type="bar" animation={currentAnimation} height="200px" />
                <SkeletonChart type="line" animation={currentAnimation} height="150px" withTitle={false} />
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Layout Demo */}
        {showSkeletons && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-2xl font-semibold text-white mb-6">
                {currentLayout.charAt(0).toUpperCase() + currentLayout.slice(1)} Layout
              </h3>
              <SkeletonLayout 
                layout={currentLayout} 
                animation={currentAnimation}
                responsive={true}
              />
            </GlassCard>
          </motion.div>
        )}

        {/* Performance Info */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Performance Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-white/80">
            <div className="space-y-2">
              <h4 className="font-medium text-white">GPU Acceleration</h4>
              <p className="text-sm">Uses CSS transforms and opacity for smooth 60fps animations</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">Responsive Design</h4>
              <p className="text-sm">Adapts to different screen sizes with optimized layouts</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">Accessibility</h4>
              <p className="text-sm">Respects reduced motion preferences and screen readers</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">Memory Efficient</h4>
              <p className="text-sm">Lightweight components with proper cleanup</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">Customizable</h4>
              <p className="text-sm">Multiple animation types and layout variants</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">Dark Mode</h4>
              <p className="text-sm">Built-in support for light and dark themes</p>
            </div>
          </div>
        </GlassCard>

        {/* Usage Examples */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Usage Examples</h3>
          <div className="space-y-4 text-white/80">
            <div className="bg-black/20 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-green-400">// Basic skeleton usage</div>
              <div className="text-white">
                {`<Skeleton variant="text" animation="pulse" lines={3} />`}
              </div>
              <div className="text-white">
                {`<SkeletonCard hasImage hasButton textLines={4} />`}
              </div>
              <div className="text-white">
                {`<SkeletonLayout layout="dashboard" responsive />`}
              </div>
            </div>
            <div className="bg-black/20 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-green-400">// Advanced customization</div>
              <div className="text-white">
                {`<SkeletonChart type="bar" animation="shimmer" dataPoints={8} />`}
              </div>
              <div className="text-white">
                {`<SkeletonAvatar size="xl" shape="rounded" withStatus />`}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default SkeletonDemo;