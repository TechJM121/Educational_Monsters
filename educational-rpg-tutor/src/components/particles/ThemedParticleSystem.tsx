import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdvancedParticleSystem } from './AdvancedParticleSystem';
import { useParticleTheme } from '../../contexts/ParticleThemeContext';
import { getThemeColors, getThemeBehaviors } from './ParticleConfig';

export interface ThemedParticleSystemProps {
  className?: string;
  interactive?: boolean;
  enableTransitions?: boolean;
  transitionDuration?: number;
}

export const ThemedParticleSystem: React.FC<ThemedParticleSystemProps> = ({
  className = '',
  interactive = true,
  enableTransitions = true,
  transitionDuration
}) => {
  const { currentTheme, config, isTransitioning } = useParticleTheme();
  const [displayTheme, setDisplayTheme] = useState(currentTheme);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();

  // Get theme-specific behaviors
  const themeBehaviors = getThemeBehaviors(currentTheme);
  const effectiveTransitionDuration = transitionDuration || themeBehaviors.transitionDuration;

  // Handle theme transitions with smooth crossfade
  useEffect(() => {
    if (!enableTransitions) {
      setDisplayTheme(currentTheme);
      return;
    }

    if (isTransitioning) {
      // Clear any existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      // Update display theme after half the transition duration
      transitionTimeoutRef.current = setTimeout(() => {
        setDisplayTheme(currentTheme);
      }, effectiveTransitionDuration / 2);
    }

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [currentTheme, isTransitioning, enableTransitions, effectiveTransitionDuration]);

  const themeColors = getThemeColors(displayTheme);
  const displayBehaviors = getThemeBehaviors(displayTheme);

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={displayTheme}
          initial={enableTransitions ? { opacity: 0, scale: 0.95 } : false}
          animate={{ opacity: 1, scale: 1 }}
          exit={enableTransitions ? { opacity: 0, scale: 1.05 } : false}
          transition={{
            duration: effectiveTransitionDuration / 1000,
            ease: displayBehaviors.interactionType === 'gentle' ? "easeInOut" : 
                  displayBehaviors.interactionType === 'magnetic' ? "easeOut" : "easeInOut"
          }}
          className="absolute inset-0"
        >
          <AdvancedParticleSystem
            theme={displayTheme}
            interactive={interactive}
            customConfig={config}
          />
        </motion.div>
      </AnimatePresence>

      {/* Theme transition overlay */}
      {enableTransitions && isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${themeColors.primary}20 0%, transparent 70%)`
          }}
        />
      )}
    </div>
  );
};