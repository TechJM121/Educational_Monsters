/**
 * Dark Mode Demo Component
 * Showcases dark mode implementation with accessibility features
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDarkMode, useThemeClasses } from '../../hooks/useDarkMode';
import { validateContrast, analyzeColorAccessibility } from '../../utils/contrastValidation';
import { useTheme } from '../../contexts/ThemeContext';

interface ContrastTestProps {
  foreground: string;
  background: string;
  label: string;
}

const ContrastTest: React.FC<ContrastTestProps> = ({ foreground, background, label }) => {
  const result = validateContrast(foreground, background);
  const analysis = analyzeColorAccessibility(foreground);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'AAA': return 'text-green-600 dark:text-green-400';
      case 'AA': return 'text-blue-600 dark:text-blue-400';
      case 'A': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-red-600 dark:text-red-400';
    }
  };

  return (
    <motion.div
      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-slate-900 dark:text-slate-100">{label}</h4>
        <span className={`px-2 py-1 rounded text-sm font-medium ${getLevelColor(result.level)}`}>
          {result.level}
        </span>
      </div>
      
      <div 
        className="p-3 rounded mb-3 text-center font-medium"
        style={{ backgroundColor: background, color: foreground }}
      >
        Sample Text ({result.ratio}:1)
      </div>
      
      <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
        <div>Contrast Ratio: <span className="font-mono">{result.ratio}:1</span></div>
        <div>Recommended Text: <span className="font-medium">{analysis.recommendedTextColor}</span></div>
        {result.recommendation && (
          <div className="text-xs mt-2 p-2 bg-slate-100 dark:bg-slate-700 rounded">
            {result.recommendation}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ThemeToggleButton: React.FC = () => {
  const [{ mode, isDark, isTransitioning }, { setMode, toggle }] = useDarkMode();

  const getModeIcon = () => {
    switch (mode) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'auto': return '🔄';
      default: return '🔄';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={toggle}
        disabled={isTransitioning}
        className={`
          relative p-3 rounded-full border-2 transition-all duration-300
          ${isDark 
            ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700' 
            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }
          ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        `}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: isTransitioning ? 1 : 1.05 }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={mode}
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 180, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl"
          >
            {getModeIcon()}
          </motion.span>
        </AnimatePresence>
        
        {isTransitioning && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.button>

      <div className="flex gap-1">
        {(['light', 'dark', 'auto'] as const).map((modeOption) => (
          <motion.button
            key={modeOption}
            onClick={() => setMode(modeOption)}
            className={`
              px-3 py-1 rounded text-sm font-medium transition-all duration-200
              ${mode === modeOption
                ? isDark 
                  ? 'bg-slate-700 text-slate-100' 
                  : 'bg-slate-200 text-slate-900'
                : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {modeOption}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const AccessibilityIndicators: React.FC = () => {
  const [{ isDark }] = useDarkMode();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  React.useEffect(() => {
    const checkPreferences = () => {
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      setPrefersHighContrast(window.matchMedia('(prefers-contrast: high)').matches);
    };

    checkPreferences();

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    reducedMotionQuery.addEventListener('change', checkPreferences);
    highContrastQuery.addEventListener('change', checkPreferences);

    return () => {
      reducedMotionQuery.removeEventListener('change', checkPreferences);
      highContrastQuery.removeEventListener('change', checkPreferences);
    };
  }, []);

  const indicators = [
    {
      label: 'Theme Mode',
      value: isDark ? 'Dark' : 'Light',
      status: 'active',
      icon: isDark ? '🌙' : '☀️',
    },
    {
      label: 'Reduced Motion',
      value: prefersReducedMotion ? 'Enabled' : 'Disabled',
      status: prefersReducedMotion ? 'active' : 'inactive',
      icon: '🎭',
    },
    {
      label: 'High Contrast',
      value: prefersHighContrast ? 'Enabled' : 'Disabled',
      status: prefersHighContrast ? 'active' : 'inactive',
      icon: '🎨',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {indicators.map((indicator, index) => (
        <motion.div
          key={indicator.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`
            p-4 rounded-lg border backdrop-blur-sm
            ${isDark
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-white/50 border-slate-200'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{indicator.icon}</span>
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {indicator.label}
              </div>
              <div className={`
                text-sm
                ${indicator.status === 'active'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-slate-500 dark:text-slate-400'
                }
              `}>
                {indicator.value}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const DarkModeDemo: React.FC = () => {
  const [{ isDark, mode, isSystemDark }] = useDarkMode();
  const { getGlassClasses, getTextClasses, getBgClasses } = useThemeClasses();
  const { currentTheme } = useTheme();
  const [showContrastTests, setShowContrastTests] = useState(false);

  const contrastTests = [
    {
      foreground: currentTheme.colors.primary[500],
      background: isDark ? '#0f172a' : '#ffffff',
      label: 'Primary Color',
    },
    {
      foreground: currentTheme.colors.secondary[500],
      background: isDark ? '#0f172a' : '#ffffff',
      label: 'Secondary Color',
    },
    {
      foreground: currentTheme.colors.accent[500],
      background: isDark ? '#0f172a' : '#ffffff',
      label: 'Accent Color',
    },
    {
      foreground: isDark ? '#f1f5f9' : '#1e293b',
      background: isDark ? '#0f172a' : '#ffffff',
      label: 'Text Color',
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${getBgClasses('primary')}`}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className={`text-4xl font-bold mb-4 ${getTextClasses('primary')}`}>
            Dark Mode Implementation
          </h1>
          <p className={`text-lg ${getTextClasses('secondary')}`}>
            Accessibility-compliant dark mode with smooth transitions and system preference detection
          </p>
        </motion.div>

        {/* Theme Controls */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-xl mb-8 ${getGlassClasses('medium')}`}
        >
          <h2 className={`text-2xl font-semibold mb-4 ${getTextClasses('primary')}`}>
            Theme Controls
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className={`text-sm ${getTextClasses('secondary')}`}>
              <div>Current Mode: <span className="font-medium">{mode}</span></div>
              <div>System Preference: <span className="font-medium">{isSystemDark ? 'Dark' : 'Light'}</span></div>
              <div>Active Theme: <span className="font-medium">{isDark ? 'Dark' : 'Light'}</span></div>
            </div>
            <ThemeToggleButton />
          </div>
        </motion.section>

        {/* Accessibility Indicators */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className={`text-2xl font-semibold mb-4 ${getTextClasses('primary')}`}>
            Accessibility Status
          </h2>
          <AccessibilityIndicators />
        </motion.section>

        {/* Glass Effect Showcase */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className={`text-2xl font-semibold mb-4 ${getTextClasses('primary')}`}>
            Glassmorphic Effects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['light', 'medium', 'strong'] as const).map((variant, index) => (
              <motion.div
                key={variant}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`p-6 rounded-xl ${getGlassClasses(variant)}`}
              >
                <h3 className={`text-lg font-medium mb-2 capitalize ${getTextClasses('primary')}`}>
                  {variant} Glass
                </h3>
                <p className={`text-sm ${getTextClasses('secondary')}`}>
                  This card demonstrates {variant} glassmorphic effects with proper backdrop blur and transparency.
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Contrast Testing */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-2xl font-semibold ${getTextClasses('primary')}`}>
              Contrast Validation
            </h2>
            <motion.button
              onClick={() => setShowContrastTests(!showContrastTests)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${isDark
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showContrastTests ? 'Hide Tests' : 'Show Tests'}
            </motion.button>
          </div>

          <AnimatePresence>
            {showContrastTests && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {contrastTests.map((test, index) => (
                  <ContrastTest
                    key={test.label}
                    foreground={test.foreground}
                    background={test.background}
                    label={test.label}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Feature Showcase */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-6 rounded-xl ${getGlassClasses('medium')}`}
        >
          <h2 className={`text-2xl font-semibold mb-4 ${getTextClasses('primary')}`}>
            Implementation Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className={`text-lg font-medium mb-3 ${getTextClasses('primary')}`}>
                ✅ Implemented Features
              </h3>
              <ul className={`space-y-2 text-sm ${getTextClasses('secondary')}`}>
                <li>• WCAG AA/AAA compliant contrast ratios</li>
                <li>• Automatic system theme detection</li>
                <li>• Smooth transitions with reduced motion support</li>
                <li>• Persistent theme preferences</li>
                <li>• Glassmorphic effects for both themes</li>
                <li>• Real-time contrast validation</li>
                <li>• Custom theme event dispatching</li>
                <li>• SSR-safe implementation</li>
              </ul>
            </div>
            <div>
              <h3 className={`text-lg font-medium mb-3 ${getTextClasses('primary')}`}>
                🎯 Accessibility Features
              </h3>
              <ul className={`space-y-2 text-sm ${getTextClasses('secondary')}`}>
                <li>• Respects prefers-color-scheme</li>
                <li>• Respects prefers-reduced-motion</li>
                <li>• Proper color-scheme CSS property</li>
                <li>• High contrast mode detection</li>
                <li>• Screen reader friendly transitions</li>
                <li>• Focus management during theme changes</li>
                <li>• Semantic HTML structure</li>
                <li>• ARIA labels where appropriate</li>
              </ul>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default DarkModeDemo;