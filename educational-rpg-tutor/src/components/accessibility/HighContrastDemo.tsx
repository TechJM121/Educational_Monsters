/**
 * HighContrastDemo Component
 * Demonstrates high contrast mode functionality and accessibility features
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHighContrast, getHighContrastColor } from '../../hooks/useHighContrast';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { HighContrastControls } from './HighContrastControls';

export const HighContrastDemo: React.FC = () => {
  const { isHighContrastMode, currentTheme } = useHighContrast();
  const { preferences } = useReducedMotion();
  const [activeTab, setActiveTab] = useState('components');
  const [showModal, setShowModal] = useState(false);

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
    <div className={`min-h-screen p-8 transition-colors duration-300 ${
      isHighContrastMode 
        ? 'bg-[var(--hc-background)]' 
        : 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900'
    }`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-8"
        >
          <motion.h1 
            variants={itemVariants}
            className={`text-4xl font-bold mb-4 ${
              isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white'
            }`}
          >
            High Contrast Mode Demo
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className={`text-xl max-w-3xl mx-auto ${
              isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/80'
            }`}
          >
            Experience how the interface adapts to high contrast preferences while maintaining 
            all animation functionality and visual appeal.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* High Contrast Controls */}
          <div className="lg:col-span-1">
            <HighContrastControls 
              showThemeSelector={true}
              showContrastInfo={true}
            />
          </div>

          {/* Demo Content */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap gap-2 mb-6"
            >
              {[
                { id: 'components', label: 'UI Components' },
                { id: 'forms', label: 'Form Elements' },
                { id: 'data', label: 'Data Visualization' },
                { id: 'animations', label: 'Animations' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${activeTab === tab.id
                      ? (isHighContrastMode 
                          ? 'bg-[var(--hc-primary)] text-[var(--hc-background)] focus:ring-[var(--hc-focus)]'
                          : 'bg-blue-500 text-white focus:ring-blue-300'
                        )
                      : (isHighContrastMode
                          ? 'bg-[var(--hc-surface)] text-[var(--hc-text)] border border-[var(--hc-border)] hover:bg-[var(--hc-background)] focus:ring-[var(--hc-focus)]'
                          : 'bg-white/10 text-white/80 hover:bg-white/20 focus:ring-white/50'
                        )
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 * preferences.animationDuration }}
                className={`
                  rounded-xl p-8 border min-h-[500px]
                  ${isHighContrastMode 
                    ? 'bg-[var(--hc-surface)] border-[var(--hc-border)]' 
                    : 'bg-white/10 backdrop-blur-md border-white/20'
                  }
                `}
              >
                {activeTab === 'components' && <ComponentsDemo />}
                {activeTab === 'forms' && <FormsDemo />}
                {activeTab === 'data' && <DataVisualizationDemo />}
                {activeTab === 'animations' && <AnimationsDemo />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Modal Demo */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 z-50 flex items-center justify-center ${
                isHighContrastMode ? 'bg-[var(--hc-background)]/90' : 'bg-black/50'
              }`}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`
                  max-w-md w-full mx-4 rounded-lg p-6 border
                  ${isHighContrastMode 
                    ? 'bg-[var(--hc-surface)] border-[var(--hc-border)]' 
                    : 'bg-white backdrop-blur-md border-white/20'
                  }
                `}
              >
                <h3 className={`text-xl font-semibold mb-4 ${
                  isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-gray-900'
                }`}>
                  High Contrast Modal
                </h3>
                <p className={`mb-6 ${
                  isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-gray-600'
                }`}>
                  This modal demonstrates how high contrast mode maintains functionality 
                  while improving accessibility. All animations and interactions remain intact.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${isHighContrastMode
                      ? 'bg-[var(--hc-primary)] text-[var(--hc-background)] hover:bg-[var(--hc-secondary)] focus:ring-[var(--hc-focus)]'
                      : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300'
                    }
                  `}
                >
                  Close Modal
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Components Demo
const ComponentsDemo: React.FC = () => {
  const { isHighContrastMode } = useHighContrast();
  const { preferences } = useReducedMotion();

  return (
    <div className="space-y-6">
      <h3 className={`text-xl font-semibold ${
        isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white'
      }`}>
        UI Components
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buttons */}
        <div className="space-y-3">
          <h4 className={`text-sm font-medium ${
            isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/80'
          }`}>
            Buttons
          </h4>
          {['Primary', 'Secondary', 'Success', 'Warning', 'Error'].map((type, index) => (
            <motion.button
              key={type}
              whileHover={preferences.enableMicroAnimations ? { scale: 1.02 } : {}}
              whileTap={preferences.enableMicroAnimations ? { scale: 0.98 } : {}}
              className={`
                w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isHighContrastMode ? (
                  index === 0 ? 'bg-[var(--hc-primary)] text-[var(--hc-background)] focus:ring-[var(--hc-focus)]' :
                  index === 1 ? 'bg-[var(--hc-surface)] text-[var(--hc-text)] border border-[var(--hc-border)] focus:ring-[var(--hc-focus)]' :
                  index === 2 ? 'bg-[var(--hc-success)] text-[var(--hc-background)] focus:ring-[var(--hc-focus)]' :
                  index === 3 ? 'bg-[var(--hc-warning)] text-[var(--hc-background)] focus:ring-[var(--hc-focus)]' :
                  'bg-[var(--hc-error)] text-[var(--hc-background)] focus:ring-[var(--hc-focus)]'
                ) : (
                  index === 0 ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-300' :
                  index === 1 ? 'bg-white/20 hover:bg-white/30 text-white focus:ring-white/50' :
                  index === 2 ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-300' :
                  index === 3 ? 'bg-yellow-500 hover:bg-yellow-600 text-black focus:ring-yellow-300' :
                  'bg-red-500 hover:bg-red-600 text-white focus:ring-red-300'
                )}
              `}
            >
              {type} Button
            </motion.button>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-3">
          <h4 className={`text-sm font-medium ${
            isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/80'
          }`}>
            Cards
          </h4>
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              whileHover={preferences.enableMicroAnimations ? { y: -2 } : {}}
              className={`
                p-4 rounded-lg border transition-all duration-200 cursor-pointer
                ${isHighContrastMode 
                  ? 'bg-[var(--hc-surface)] border-[var(--hc-border)] hover:bg-[var(--hc-background)]' 
                  : 'bg-white/10 border-white/20 hover:bg-white/20'
                }
              `}
            >
              <div className={`font-medium ${
                isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white'
              }`}>
                Interactive Card {i}
              </div>
              <div className={`text-sm mt-1 ${
                isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/60'
              }`}>
                Hover to see high contrast effects
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Forms Demo
const FormsDemo: React.FC = () => {
  const { isHighContrastMode } = useHighContrast();
  const [formData, setFormData] = useState({ email: '', password: '', agree: false });

  return (
    <div className="space-y-6">
      <h3 className={`text-xl font-semibold ${
        isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white'
      }`}>
        Form Elements
      </h3>

      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white/90'
          }`}>
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className={`
              w-full px-3 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isHighContrastMode 
                ? 'bg-[var(--hc-background)] text-[var(--hc-text)] border-[var(--hc-border)] focus:ring-[var(--hc-focus)]' 
                : 'bg-white/10 text-white border-white/20 placeholder-white/50 focus:ring-blue-300'
              }
            `}
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white/90'
          }`}>
            Password
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className={`
              w-full px-3 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isHighContrastMode 
                ? 'bg-[var(--hc-background)] text-[var(--hc-text)] border-[var(--hc-border)] focus:ring-[var(--hc-focus)]' 
                : 'bg-white/10 text-white border-white/20 placeholder-white/50 focus:ring-blue-300'
              }
            `}
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="agree"
            checked={formData.agree}
            onChange={(e) => setFormData(prev => ({ ...prev, agree: e.target.checked }))}
            className={`
              w-4 h-4 rounded border transition-colors duration-200 focus:ring-2 focus:ring-offset-2
              ${isHighContrastMode 
                ? 'border-[var(--hc-border)] text-[var(--hc-primary)] focus:ring-[var(--hc-focus)]' 
                : 'border-white/20 text-blue-500 focus:ring-blue-300'
              }
            `}
          />
          <label htmlFor="agree" className={`text-sm ${
            isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white/90'
          }`}>
            I agree to the terms and conditions
          </label>
        </div>

        <button
          className={`
            w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isHighContrastMode
              ? 'bg-[var(--hc-primary)] text-[var(--hc-background)] hover:bg-[var(--hc-secondary)] focus:ring-[var(--hc-focus)]'
              : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300'
            }
          `}
        >
          Submit Form
        </button>
      </div>
    </div>
  );
};

// Data Visualization Demo
const DataVisualizationDemo: React.FC = () => {
  const { isHighContrastMode } = useHighContrast();

  const data = [
    { label: 'Q1', value: 65 },
    { label: 'Q2', value: 78 },
    { label: 'Q3', value: 52 },
    { label: 'Q4', value: 89 },
  ];

  return (
    <div className="space-y-6">
      <h3 className={`text-xl font-semibold ${
        isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white'
      }`}>
        Data Visualization
      </h3>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-sm font-medium ${
                isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white/90'
              }`}>
                {item.label}
              </span>
              <span className={`text-sm ${
                isHighContrastMode ? 'text-[var(--hc-textSecondary)]' : 'text-white/70'
              }`}>
                {item.value}%
              </span>
            </div>
            <div className={`w-full h-3 rounded-full border ${
              isHighContrastMode 
                ? 'bg-[var(--hc-surface)] border-[var(--hc-border)]' 
                : 'bg-white/10 border-white/20'
            }`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
                className={`h-full rounded-full ${
                  isHighContrastMode ? 'bg-[var(--hc-primary)]' : 'bg-blue-500'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Animations Demo
const AnimationsDemo: React.FC = () => {
  const { isHighContrastMode } = useHighContrast();
  const { preferences } = useReducedMotion();
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h3 className={`text-xl font-semibold ${
        isHighContrastMode ? 'text-[var(--hc-text)]' : 'text-white'
      }`}>
        Animations in High Contrast
      </h3>

      <div className="space-y-4">
        <button
          onClick={triggerAnimation}
          disabled={isAnimating}
          className={`
            px-6 py-3 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isHighContrastMode
              ? 'bg-[var(--hc-primary)] text-[var(--hc-background)] hover:bg-[var(--hc-secondary)] focus:ring-[var(--hc-focus)] disabled:opacity-50'
              : 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-300 disabled:opacity-50'
            }
          `}
        >
          {isAnimating ? 'Animating...' : 'Trigger Animation'}
        </button>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={isAnimating ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
                y: [0, -10, 0]
              } : {}}
              transition={{
                duration: 1.5 * preferences.animationDuration,
                delay: i * 0.2,
                ease: 'easeInOut'
              }}
              className={`
                h-20 rounded-lg border flex items-center justify-center font-semibold
                ${isHighContrastMode 
                  ? 'bg-[var(--hc-surface)] border-[var(--hc-border)] text-[var(--hc-text)]' 
                  : 'bg-white/10 border-white/20 text-white'
                }
              `}
            >
              {i}
            </motion.div>
          ))}
        </div>

        <div className={`text-sm p-3 rounded-lg border ${
          isHighContrastMode 
            ? 'bg-[var(--hc-info)]/10 text-[var(--hc-textSecondary)] border-[var(--hc-info)]/20' 
            : 'bg-blue-500/10 text-white/60 border-blue-500/20'
        }`}>
          <strong>Note:</strong> All animations remain fully functional in high contrast mode. 
          The system maintains motion while ensuring optimal visibility and accessibility.
        </div>
      </div>
    </div>
  );
};