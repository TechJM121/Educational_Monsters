/**
 * ReducedMotionDemo Component
 * Demonstrates motion-safe animations and accessibility features
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { createMotionVariants, shouldDisableAnimation } from '../../utils/motionSafeAnimations';
import { MotionPreferences } from './MotionPreferences';

export const ReducedMotionDemo: React.FC = () => {
  const { preferences } = useReducedMotion();
  const [activeDemo, setActiveDemo] = useState<string>('buttons');
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const variants = createMotionVariants(preferences);

  const handleCelebration = () => {
    if (!shouldDisableAnimation('celebration', preferences)) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1000);
    }
  };

  const handleLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 * preferences.animationDuration }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Accessibility-First Animations
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Experience how animations adapt to your motion preferences and accessibility needs.
            All animations respect your system settings and provide alternative visual indicators.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Motion Preferences Panel */}
          <div className="lg:col-span-1">
            <MotionPreferences showAdvanced={true} />
            
            {/* Current Settings Display */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
            >
              <h4 className="text-sm font-semibold text-white mb-3">Current Settings</h4>
              <div className="space-y-2 text-xs text-white/70">
                <div>System Preference: {preferences.prefersReducedMotion ? 'Reduced' : 'Full'}</div>
                <div>Duration: {preferences.animationDuration}x</div>
                <div>Intensity: {Math.round(preferences.animationIntensity * 100)}%</div>
                <div>Micro-animations: {preferences.enableMicroAnimations ? 'On' : 'Off'}</div>
                <div>Transitions: {preferences.enableTransitions ? 'On' : 'Off'}</div>
                <div>Particles: {preferences.enableParticles ? 'On' : 'Off'}</div>
              </div>
            </motion.div>
          </div>

          {/* Demo Content */}
          <div className="lg:col-span-2">
            {/* Demo Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: 'buttons', label: 'Buttons & Interactions' },
                { id: 'transitions', label: 'Page Transitions' },
                { id: 'loading', label: 'Loading States' },
                { id: 'celebration', label: 'Celebrations' }
              ].map((demo) => (
                <motion.button
                  key={demo.id}
                  variants={variants.button}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setActiveDemo(demo.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeDemo === demo.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {demo.label}
                </motion.button>
              ))}
            </div>

            {/* Demo Content Area */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDemo}
                variants={variants.page}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 min-h-[400px]"
              >
                {activeDemo === 'buttons' && <ButtonDemo variants={variants} preferences={preferences} />}
                {activeDemo === 'transitions' && <TransitionDemo variants={variants} preferences={preferences} />}
                {activeDemo === 'loading' && <LoadingDemo variants={variants} preferences={preferences} onTrigger={handleLoading} isLoading={isLoading} />}
                {activeDemo === 'celebration' && <CelebrationDemo variants={variants} preferences={preferences} onTrigger={handleCelebration} showCelebration={showCelebration} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

// Button Demo Component
const ButtonDemo: React.FC<{ variants: any; preferences: any }> = ({ variants, preferences }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-white mb-4">Interactive Elements</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-sm font-medium text-white/80 mb-3">Buttons</h4>
        <div className="space-y-3">
          {['Primary', 'Secondary', 'Danger'].map((type, index) => (
            <motion.button
              key={type}
              variants={variants.button}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                index === 0 ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                index === 1 ? 'bg-white/20 hover:bg-white/30 text-white' :
                'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {type} Button
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-white/80 mb-3">Cards</h4>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              variants={variants.button}
              initial="rest"
              whileHover="hover"
              className="p-4 bg-white/10 rounded-lg border border-white/20 cursor-pointer"
            >
              <div className="text-white font-medium">Interactive Card {i}</div>
              <div className="text-white/60 text-sm mt-1">Hover to see motion-safe effects</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>

    <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
      <div className="text-sm text-blue-200">
        <strong>Accessibility Note:</strong> When reduced motion is enabled, these interactions use 
        {preferences.prefersReducedMotion ? ' alternative visual indicators like color and opacity changes instead of scale transforms.' : ' full scale and transform animations for enhanced feedback.'}
      </div>
    </div>
  </div>
);

// Transition Demo Component
const TransitionDemo: React.FC<{ variants: any; preferences: any }> = ({ variants, preferences }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pages = ['Home', 'About', 'Services', 'Contact'];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Page Transitions</h3>
      
      <div className="flex gap-2 mb-4">
        {pages.map((page, index) => (
          <button
            key={page}
            onClick={() => setCurrentPage(index)}
            className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
              currentPage === index ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/80'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <div className="relative h-48 bg-white/5 rounded-lg overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={variants.page}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{pages[currentPage]} Page</div>
              <div className="text-white/60">
                {preferences.prefersReducedMotion 
                  ? 'Gentle fade transition with minimal movement'
                  : 'Smooth slide transition with full animation'
                }
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Loading Demo Component
const LoadingDemo: React.FC<{ variants: any; preferences: any; onTrigger: () => void; isLoading: boolean }> = ({ 
  variants, preferences, onTrigger, isLoading 
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-white mb-4">Loading States</h3>
    
    <button
      onClick={onTrigger}
      disabled={isLoading}
      className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white rounded-lg font-medium transition-colors duration-200"
    >
      {isLoading ? 'Loading...' : 'Trigger Loading'}
    </button>

    {isLoading && (
      <div className="space-y-4">
        <motion.div
          variants={variants.loading}
          animate="animate"
          className="w-full h-4 bg-white/20 rounded-full overflow-hidden"
        >
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3 * preferences.animationDuration, ease: 'easeInOut' }}
          />
        </motion.div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              variants={variants.loading}
              animate="animate"
              className="h-20 bg-white/10 rounded-lg"
            />
          ))}
        </div>
      </div>
    )}

    <div className="text-sm text-white/60">
      {preferences.prefersReducedMotion 
        ? 'Loading animations use opacity changes instead of scaling'
        : 'Loading animations include gentle pulsing and scaling effects'
      }
    </div>
  </div>
);

// Celebration Demo Component
const CelebrationDemo: React.FC<{ variants: any; preferences: any; onTrigger: () => void; showCelebration: boolean }> = ({ 
  variants, preferences, onTrigger, showCelebration 
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-white mb-4">Celebration Animations</h3>
    
    <button
      onClick={onTrigger}
      className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-medium transition-colors duration-200"
    >
      🎉 Celebrate Achievement
    </button>

    <div className="relative h-32 flex items-center justify-center">
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            variants={variants.celebrate}
            initial={{ scale: 1, rotate: 0 }}
            animate="animate"
            exit={{ scale: 1, rotate: 0, opacity: 0 }}
            className="text-6xl"
          >
            🏆
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <div className="text-sm text-white/60">
      {preferences.prefersReducedMotion 
        ? 'Celebrations use subtle scaling without rotation to avoid motion sickness'
        : 'Celebrations include full scaling and rotation effects for maximum impact'
      }
    </div>
  </div>
);