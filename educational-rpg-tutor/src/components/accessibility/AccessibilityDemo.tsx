/**
 * AccessibilityDemo Component
 * Comprehensive demonstration of all accessibility-first animation features
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReducedMotionDemo } from './ReducedMotionDemo';
import { HighContrastDemo } from './HighContrastDemo';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useHighContrast } from '../../hooks/useHighContrast';
import { useScreenReader } from '../../hooks/useScreenReader';

export const AccessibilityDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState('overview');
  const { preferences } = useReducedMotion();
  const { isHighContrastMode } = useHighContrast();
  const { isScreenReaderActive, createAnnouncers } = useScreenReader();

  const demos = [
    { id: 'overview', label: 'Overview', icon: '🎯' },
    { id: 'reduced-motion', label: 'Reduced Motion', icon: '🎭' },
    { id: 'high-contrast', label: 'High Contrast', icon: '🎨' },
    { id: 'screen-reader', label: 'Screen Reader', icon: '🔊' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5 * preferences.animationDuration,
        staggerChildren: 0.1 * preferences.animationDuration
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 * preferences.animationDuration }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isHighContrastMode 
        ? 'bg-[var(--hc-background)]' 
        : 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900'
    }`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className={`text-5xl font-bold mb-6 ${
            isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white'
          }`}>
            Accessibility-First Animations
          </h1>
          <p className={`text-xl max-w-4xl mx-auto leading-relaxed ${
            isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/80'
          }`}>
            Experience how modern animations can be both visually stunning and fully accessible. 
            Our implementation respects user preferences while maintaining engaging interactions 
            and smooth performance across all devices and assistive technologies.
          </p>
        </motion.div>

        {/* Accessibility Status Bar */}
        <motion.div 
          variants={itemVariants}
          className={`
            mb-8 p-4 rounded-xl border backdrop-blur-sm
            ${isHighContrastMode 
              ? 'bg-[var(--hc-surface)] border-[var(--hc-border)]' 
              : 'bg-white/10 border-white/20'
            }
          `}
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                preferences.prefersReducedMotion ? 'bg-yellow-400' : 'bg-green-400'
              }`} />
              <span className={isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white/90'}>
                Motion: {preferences.prefersReducedMotion ? 'Reduced' : 'Full'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                isHighContrastMode ? 'bg-blue-400' : 'bg-gray-400'
              }`} />
              <span className={isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white/90'}>
                Contrast: {isHighContrastMode ? 'High' : 'Normal'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                isScreenReaderActive ? 'bg-purple-400' : 'bg-gray-400'
              }`} />
              <span className={isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white/90'}>
                Screen Reader: {isScreenReaderActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className={isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white/90'}>
                Animations: {preferences.animationDuration}x speed, {Math.round(preferences.animationIntensity * 100)}% intensity
              </span>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.nav 
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-2 mb-8"
          role="tablist"
          aria-label="Accessibility demo navigation"
        >
          {demos.map((demo) => (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              role="tab"
              aria-selected={activeDemo === demo.id}
              aria-controls={`demo-panel-${demo.id}`}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${activeDemo === demo.id
                  ? (isHighContrastMode 
                      ? 'bg-[var(--hc-primary)] text-[var(--hc-background)] focus:ring-[var(--hc-focus)]'
                      : 'bg-white text-gray-900 shadow-lg focus:ring-white/50'
                    )
                  : (isHighContrastMode
                      ? 'bg-[var(--hc-surface)] text-[var(--hc-text)] border border-[var(--hc-border)] hover:bg-[var(--hc-background)] focus:ring-[var(--hc-focus)]'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 focus:ring-white/30'
                    )
                }
              `}
            >
              <span className="text-lg">{demo.icon}</span>
              <span>{demo.label}</span>
            </button>
          ))}
        </motion.nav>

        {/* Demo Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDemo}
            id={`demo-panel-${activeDemo}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeDemo}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 * preferences.animationDuration }}
          >
            {activeDemo === 'overview' && <OverviewDemo />}
            {activeDemo === 'reduced-motion' && <ReducedMotionDemo />}
            {activeDemo === 'high-contrast' && <HighContrastDemo />}
            {activeDemo === 'screen-reader' && <ScreenReaderDemo />}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Screen reader announcers */}
      {isScreenReaderActive && createAnnouncers()}
    </div>
  );
};

// Overview Demo Component
const OverviewDemo: React.FC = () => {
  const { preferences } = useReducedMotion();
  const { isHighContrastMode } = useHighContrast();

  const features = [
    {
      icon: '🎭',
      title: 'Reduced Motion Support',
      description: 'Automatically detects and respects user motion preferences, providing alternative visual indicators when needed.',
      benefits: ['Prevents motion sickness', 'Improves focus', 'Reduces cognitive load']
    },
    {
      icon: '🎨',
      title: 'High Contrast Mode',
      description: 'Enhances visibility with high contrast color schemes while maintaining all animation functionality.',
      benefits: ['Better visibility', 'WCAG compliance', 'Customizable themes']
    },
    {
      icon: '🔊',
      title: 'Screen Reader Compatibility',
      description: 'Provides proper ARIA labels, announcements, and focus management for assistive technologies.',
      benefits: ['Full accessibility', 'Clear navigation', 'State announcements']
    },
    {
      icon: '⚡',
      title: 'Performance Optimization',
      description: 'Adapts animation complexity based on device capabilities and user preferences.',
      benefits: ['Smooth 60fps', 'Battery efficient', 'Device adaptive']
    }
  ];

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className={`text-3xl font-bold mb-4 ${
          isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white'
        }`}>
          Accessibility-First Animation System
        </h2>
        <p className={`text-lg max-w-3xl mx-auto ${
          isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/80'
        }`}>
          Our animation system prioritizes accessibility without compromising on visual appeal. 
          Every animation is designed to be inclusive, performant, and respectful of user preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5 * preferences.animationDuration,
              delay: index * 0.1 * preferences.animationDuration
            }}
            className={`
              p-6 rounded-xl border backdrop-blur-sm
              ${isHighContrastMode 
                ? 'bg-[var(--hc-surface)] border-[var(--hc-border)]' 
                : 'bg-white/10 border-white/20'
              }
            `}
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className={`text-xl font-semibold mb-3 ${
              isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white'
            }`}>
              {feature.title}
            </h3>
            <p className={`mb-4 ${
              isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/80'
            }`}>
              {feature.description}
            </p>
            <ul className="space-y-2">
              {feature.benefits.map((benefit) => (
                <li key={benefit} className={`flex items-center space-x-2 text-sm ${
                  isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/70'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    isHighContrastMode ? 'bg-[var(--hc-primary)]' : 'bg-green-400'
                  }`} />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className={`
        p-6 rounded-xl border backdrop-blur-sm text-center
        ${isHighContrastMode 
          ? 'bg-[var(--hc-info)]/10 border-[var(--hc-info)]/20' 
          : 'bg-blue-500/10 border-blue-500/20'
        }
      `}>
        <h3 className={`text-lg font-semibold mb-2 ${
          isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white'
        }`}>
          WCAG 2.1 AA Compliant
        </h3>
        <p className={`${
          isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/80'
        }`}>
          All animations and interactions meet or exceed Web Content Accessibility Guidelines, 
          ensuring your application is usable by everyone.
        </p>
      </div>
    </div>
  );
};

// Screen Reader Demo Component
const ScreenReaderDemo: React.FC = () => {
  const { isHighContrastMode } = useHighContrast();
  const { announce, announceLoadingState, announceValidation, isScreenReaderActive } = useScreenReader();
  const [isLoading, setIsLoading] = useState(false);
  const [formValid, setFormValid] = useState<boolean | null>(null);

  const handleAnnouncement = () => {
    announce('This is a test announcement for screen readers', 'polite');
  };

  const handleLoadingDemo = () => {
    setIsLoading(true);
    announceLoadingState(true, 'demo content');
    
    setTimeout(() => {
      setIsLoading(false);
      announceLoadingState(false, 'demo content');
    }, 3000);
  };

  const handleValidationDemo = (isValid: boolean) => {
    setFormValid(isValid);
    announceValidation('Email field', isValid, isValid ? undefined : 'Please enter a valid email address');
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className={`text-3xl font-bold mb-4 ${
          isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white'
        }`}>
          Screen Reader Compatibility
        </h2>
        <p className={`text-lg max-w-3xl mx-auto ${
          isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/80'
        }`}>
          Experience how animations work seamlessly with screen readers and assistive technologies.
        </p>
      </div>

      <div className={`
        p-4 rounded-lg border
        ${isScreenReaderActive 
          ? (isHighContrastMode ? 'bg-[var(--hc-success)]/10 border-[var(--hc-success)]/20' : 'bg-green-500/10 border-green-500/20')
          : (isHighContrastMode ? 'bg-[var(--hc-warning)]/10 border-[var(--hc-warning)]/20' : 'bg-yellow-500/10 border-yellow-500/20')
        }
      `}>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isScreenReaderActive ? 'bg-green-400' : 'bg-yellow-400'
          }`} />
          <span className={`font-medium ${
            isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white'
          }`}>
            Screen Reader Status: {isScreenReaderActive ? 'Detected' : 'Not Detected'}
          </span>
        </div>
        <p className={`text-sm mt-2 ${
          isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/70'
        }`}>
          {isScreenReaderActive 
            ? 'Screen reader support is active. Announcements and ARIA labels are being provided.'
            : 'No screen reader detected. Enable high contrast or reduced motion to simulate screen reader detection.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`
          p-6 rounded-xl border
          ${isHighContrastMode 
            ? 'bg-[var(--hc-surface)] border-[var(--hc-border)]' 
            : 'bg-white/10 border-white/20'
          }
        `}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white'
          }`}>
            Announcements
          </h3>
          
          <button
            onClick={handleAnnouncement}
            className={`
              w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isHighContrastMode
                ? 'bg-[var(--hc-primary)] text-[var(--hc-background)] hover:bg-[var(--hc-secondary)] focus:ring-[var(--hc-focus)]'
                : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300'
              }
            `}
            aria-describedby="announcement-help"
          >
            Test Announcement
          </button>
          
          <p id="announcement-help" className={`text-xs mt-2 ${
            isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/60'
          }`}>
            This will announce a message to screen readers
          </p>
        </div>

        <div className={`
          p-6 rounded-xl border
          ${isHighContrastMode 
            ? 'bg-[var(--hc-surface)] border-[var(--hc-border)]' 
            : 'bg-white/10 border-white/20'
          }
        `}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white'
          }`}>
            Loading States
          </h3>
          
          <button
            onClick={handleLoadingDemo}
            disabled={isLoading}
            className={`
              w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isHighContrastMode
                ? 'bg-[var(--hc-primary)] text-[var(--hc-background)] hover:bg-[var(--hc-secondary)] focus:ring-[var(--hc-focus)] disabled:opacity-50'
                : 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-300 disabled:opacity-50'
              }
            `}
            aria-describedby="loading-help"
          >
            {isLoading ? 'Loading...' : 'Test Loading'}
          </button>
          
          <p id="loading-help" className={`text-xs mt-2 ${
            isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/60'
          }`}>
            This will announce loading states to screen readers
          </p>
        </div>
      </div>

      <div className={`
        p-6 rounded-xl border
        ${isHighContrastMode 
          ? 'bg-[var(--hc-surface)] border-[var(--hc-border)]' 
          : 'bg-white/10 border-white/20'
        }
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white'
        }`}>
          Form Validation
        </h3>
        
        <div className="flex gap-4">
          <button
            onClick={() => handleValidationDemo(true)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${formValid === true
                ? (isHighContrastMode ? 'bg-[var(--hc-success)] text-[var(--hc-background)]' : 'bg-green-600 text-white')
                : (isHighContrastMode ? 'bg-[var(--hc-surface)] text-[var(--hc-text)] border border-[var(--hc-border)]' : 'bg-white/10 text-white')
              }
              ${isHighContrastMode ? 'focus:ring-[var(--hc-focus)]' : 'focus:ring-green-300'}
            `}
          >
            Valid Input
          </button>
          
          <button
            onClick={() => handleValidationDemo(false)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${formValid === false
                ? (isHighContrastMode ? 'bg-[var(--hc-error)] text-[var(--hc-background)]' : 'bg-red-600 text-white')
                : (isHighContrastMode ? 'bg-[var(--hc-surface)] text-[var(--hc-text)] border border-[var(--hc-border)]' : 'bg-white/10 text-white')
              }
              ${isHighContrastMode ? 'focus:ring-[var(--hc-focus)]' : 'focus:ring-red-300'}
            `}
          >
            Invalid Input
          </button>
        </div>
        
        <p className={`text-xs mt-2 ${
          isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/60'
        }`}>
          These buttons will announce validation results to screen readers
        </p>
      </div>
    </div>
  );
};