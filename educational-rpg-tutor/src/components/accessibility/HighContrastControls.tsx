/**
 * HighContrastControls Component
 * Provides UI controls for managing high contrast mode
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useHighContrast, calculateContrastRatio, meetsContrastRequirement } from '../../hooks/useHighContrast';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface HighContrastControlsProps {
  className?: string;
  showThemeSelector?: boolean;
  showContrastInfo?: boolean;
}

export const HighContrastControls: React.FC<HighContrastControlsProps> = ({
  className = '',
  showThemeSelector = true,
  showContrastInfo = false
}) => {
  const {
    isHighContrastMode,
    currentTheme,
    availableThemes,
    systemPreference,
    userOverride,
    toggleHighContrast,
    setTheme,
    resetToSystemPreference,
  } = useHighContrast();

  const { preferences } = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3 * preferences.animationDuration,
        staggerChildren: 0.1 * preferences.animationDuration
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.2 * preferences.animationDuration }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`
        ${isHighContrastMode 
          ? 'bg-[var(--hc-surface)] border-[var(--hc-border)] text-[var(--hc-text)]' 
          : 'bg-white/10 backdrop-blur-md border-white/20 text-white'
        }
        rounded-xl p-6 border
        ${className}
      `}
    >
      <motion.h3 
        variants={itemVariants}
        className={`text-lg font-semibold mb-4 ${
          isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white'
        }`}
      >
        High Contrast Mode
      </motion.h3>

      <div className="space-y-4">
        {/* System Detection Status */}
        <motion.div 
          variants={itemVariants}
          className={`flex items-center justify-between p-3 rounded-lg ${
            isHighContrastMode 
              ? 'bg-[var(--hc-background)] border border-[var(--hc-border)]' 
              : 'bg-white/5'
          }`}
        >
          <span className={`text-sm ${
            isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/80'
          }`}>
            System Preference
          </span>
          <span className={`text-sm font-medium ${
            systemPreference 
              ? (isHighContrastMode ? 'text-[var(--hc-info)]' : 'text-blue-400')
              : (isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/60')
          }`}>
            {systemPreference ? 'High Contrast' : 'Normal'}
          </span>
        </motion.div>

        {/* Toggle Control */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div>
            <div className={`text-sm font-medium ${
              isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white/90'
            }`}>
              High Contrast Mode
            </div>
            <div className={`text-xs ${
              isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/60'
            }`}>
              {userOverride !== null ? 'User override active' : 'Following system preference'}
            </div>
          </div>
          
          <button
            onClick={toggleHighContrast}
            className={`
              relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isHighContrastMode 
                ? `bg-[var(--hc-primary)] focus:ring-[var(--hc-focus)]` 
                : 'bg-blue-500 focus:ring-blue-500'
              }
              ${!isHighContrastMode && 'bg-white/20'}
            `}
            aria-label={`${isHighContrastMode ? 'Disable' : 'Enable'} high contrast mode`}
          >
            <div className={`
              absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-200
              ${isHighContrastMode 
                ? `bg-[var(--hc-background)] ${isHighContrastMode ? 'translate-x-6' : 'translate-x-0'}` 
                : `bg-white ${isHighContrastMode ? 'translate-x-6' : 'translate-x-0'}`
              }
            `} />
          </button>
        </motion.div>

        {/* Theme Selector */}
        {showThemeSelector && isHighContrastMode && (
          <motion.div variants={itemVariants} className="space-y-3">
            <label className={`block text-sm font-medium ${
              isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white/90'
            }`}>
              High Contrast Theme
            </label>
            
            <div className="grid grid-cols-1 gap-2">
              {availableThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className={`
                    p-3 rounded-lg text-left transition-all duration-200 focus:outline-none focus:ring-2
                    ${currentTheme.id === theme.id
                      ? (isHighContrastMode 
                          ? 'bg-[var(--hc-primary)] text-[var(--hc-background)] ring-2 ring-[var(--hc-focus)]'
                          : 'bg-blue-500 text-white ring-2 ring-blue-300'
                        )
                      : (isHighContrastMode
                          ? 'bg-[var(--hc-background)] text-[var(--hc-text)] border border-[var(--hc-border)] hover:bg-[var(--hc-surface)]'
                          : 'bg-white/5 text-white/80 hover:bg-white/10'
                        )
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}
                      />
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: theme.colors.text, borderColor: theme.colors.border }}
                      />
                    </div>
                    <span className="text-sm font-medium">{theme.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Contrast Information */}
        {showContrastInfo && isHighContrastMode && (
          <motion.div variants={itemVariants} className="space-y-3">
            <h4 className={`text-sm font-medium ${
              isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white/90'
            }`}>
              Contrast Ratios
            </h4>
            
            <div className="space-y-2">
              {[
                { name: 'Text on Background', fg: currentTheme.colors.text, bg: currentTheme.colors.background },
                { name: 'Secondary Text', fg: currentTheme.colors.textSecondary, bg: currentTheme.colors.background },
                { name: 'Primary on Background', fg: currentTheme.colors.primary, bg: currentTheme.colors.background },
                { name: 'Error Text', fg: currentTheme.colors.error, bg: currentTheme.colors.background },
              ].map(({ name, fg, bg }) => {
                const ratio = calculateContrastRatio(fg, bg);
                const meetsAA = meetsContrastRequirement(fg, bg, 'AA');
                const meetsAAA = meetsContrastRequirement(fg, bg, 'AAA');
                
                return (
                  <div key={name} className={`flex items-center justify-between text-xs ${
                    isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/70'
                  }`}>
                    <span>{name}</span>
                    <div className="flex items-center space-x-2">
                      <span>{ratio.toFixed(1)}:1</span>
                      <div className="flex space-x-1">
                        <span className={`px-1 py-0.5 rounded text-xs ${
                          meetsAA 
                            ? (isHighContrastMode ? 'bg-[var(--hc-success)] text-[var(--hc-background)]' : 'bg-green-500 text-white')
                            : (isHighContrastMode ? 'bg-[var(--hc-error)] text-[var(--hc-background)]' : 'bg-red-500 text-white')
                        }`}>
                          AA
                        </span>
                        <span className={`px-1 py-0.5 rounded text-xs ${
                          meetsAAA 
                            ? (isHighContrastMode ? 'bg-[var(--hc-success)] text-[var(--hc-background)]' : 'bg-green-500 text-white')
                            : (isHighContrastMode ? 'bg-[var(--hc-error)] text-[var(--hc-background)]' : 'bg-red-500 text-white')
                        }`}>
                          AAA
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Reset Button */}
        {userOverride !== null && (
          <motion.div variants={itemVariants}>
            <button
              onClick={resetToSystemPreference}
              className={`
                w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2
                ${isHighContrastMode
                  ? 'bg-[var(--hc-surface)] text-[var(--hc-text)] border border-[var(--hc-border)] hover:bg-[var(--hc-background)] focus:ring-[var(--hc-focus)]'
                  : 'bg-white/10 text-white/90 hover:bg-white/20 focus:ring-white/50'
                }
              `}
            >
              Reset to System Preference
            </button>
          </motion.div>
        )}

        {/* Accessibility Note */}
        <motion.div 
          variants={itemVariants}
          className={`text-xs p-3 rounded-lg ${
            isHighContrastMode 
              ? 'bg-[var(--hc-info)]/10 text-[var(--hc-textSecondary)] border border-[var(--hc-info)]/20' 
              : 'bg-blue-500/10 text-white/60 border border-blue-500/20'
          }`}
        >
          <strong>Note:</strong> High contrast mode improves visibility for users with visual impairments 
          by using colors with enhanced contrast ratios that meet WCAG accessibility guidelines.
        </motion.div>
      </div>
    </motion.div>
  );
};

// Utility component for high contrast aware elements
export const HighContrastAware: React.FC<{
  children: (isHighContrast: boolean, theme: any) => React.ReactNode;
}> = ({ children }) => {
  const { isHighContrastMode, currentTheme } = useHighContrast();
  return <>{children(isHighContrastMode, currentTheme)}</>;
};