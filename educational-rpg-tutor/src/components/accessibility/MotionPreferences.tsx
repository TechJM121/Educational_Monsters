/**
 * MotionPreferences Component
 * Provides UI controls for users to customize animation preferences
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion, getMotionSafeProps } from '../../hooks/useReducedMotion';

interface MotionPreferencesProps {
  className?: string;
  showAdvanced?: boolean;
}

export const MotionPreferences: React.FC<MotionPreferencesProps> = ({
  className = '',
  showAdvanced = false
}) => {
  const { preferences, controls } = useReducedMotion();

  const containerProps = getMotionSafeProps({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  }, preferences);

  return (
    <motion.div
      {...containerProps}
      className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 ${className}`}
    >
      <h3 className="text-lg font-semibold text-white mb-4">
        Animation Preferences
      </h3>
      
      <div className="space-y-4">
        {/* System Detection Status */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <span className="text-sm text-white/80">System Preference</span>
          <span className={`text-sm font-medium ${
            preferences.prefersReducedMotion ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {preferences.prefersReducedMotion ? 'Reduced Motion' : 'Full Motion'}
          </span>
        </div>

        {/* Animation Duration Control */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/90">
            Animation Speed
          </label>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-white/60">Slow</span>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={preferences.animationDuration}
              onChange={(e) => controls.setAnimationDuration(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                  ((preferences.animationDuration - 0.1) / 1.9) * 100
                }%, rgba(255,255,255,0.2) ${
                  ((preferences.animationDuration - 0.1) / 1.9) * 100
                }%, rgba(255,255,255,0.2) 100%)`
              }}
            />
            <span className="text-xs text-white/60">Fast</span>
          </div>
          <div className="text-xs text-white/60 text-center">
            {preferences.animationDuration.toFixed(1)}x speed
          </div>
        </div>

        {/* Animation Intensity Control */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/90">
            Animation Intensity
          </label>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-white/60">Subtle</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={preferences.animationIntensity}
              onChange={(e) => controls.setAnimationIntensity(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                  preferences.animationIntensity * 100
                }%, rgba(255,255,255,0.2) ${
                  preferences.animationIntensity * 100
                }%, rgba(255,255,255,0.2) 100%)`
              }}
            />
            <span className="text-xs text-white/60">Full</span>
          </div>
          <div className="text-xs text-white/60 text-center">
            {Math.round(preferences.animationIntensity * 100)}% intensity
          </div>
        </div>

        {/* Toggle Controls */}
        <div className="space-y-3">
          <ToggleControl
            label="Micro-animations"
            description="Small hover and focus effects"
            checked={preferences.enableMicroAnimations}
            onChange={controls.toggleMicroAnimations}
            preferences={preferences}
          />
          
          <ToggleControl
            label="Page Transitions"
            description="Smooth transitions between pages"
            checked={preferences.enableTransitions}
            onChange={controls.toggleTransitions}
            preferences={preferences}
          />
          
          <ToggleControl
            label="Particle Effects"
            description="Background particle animations"
            checked={preferences.enableParticles}
            onChange={controls.toggleParticles}
            preferences={preferences}
          />
        </div>

        {/* Advanced Controls */}
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-4 border-t border-white/10"
          >
            <button
              onClick={controls.resetToDefaults}
              className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white/90 transition-colors duration-200"
            >
              Reset to System Defaults
            </button>
          </motion.div>
        )}

        {/* Accessibility Note */}
        <div className="text-xs text-white/60 bg-blue-500/10 p-3 rounded-lg">
          <strong>Note:</strong> These settings help make animations more comfortable for users with motion sensitivity or vestibular disorders.
        </div>
      </div>
    </motion.div>
  );
};

interface ToggleControlProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  preferences: any;
}

const ToggleControl: React.FC<ToggleControlProps> = ({
  label,
  description,
  checked,
  onChange,
  preferences
}) => {
  const buttonProps = getMotionSafeProps({
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
  }, preferences);

  return (
    <motion.div
      {...buttonProps}
      className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors duration-200"
      onClick={onChange}
    >
      <div className="flex-1">
        <div className="text-sm font-medium text-white/90">{label}</div>
        <div className="text-xs text-white/60">{description}</div>
      </div>
      <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
        checked ? 'bg-blue-500' : 'bg-white/20'
      }`}>
        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`} />
      </div>
    </motion.div>
  );
};