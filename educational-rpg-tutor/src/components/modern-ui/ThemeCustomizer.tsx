/**
 * Theme Customization Interface
 * Provides color pickers, presets, and personalization options
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import type { ThemeCustomization, GradientColors } from '../../types/theme';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, disabled }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <div 
          className="w-12 h-12 rounded-lg border-2 border-white/20 shadow-lg cursor-pointer transition-transform hover:scale-105"
          style={{ backgroundColor: value }}
          onClick={() => !disabled && document.getElementById(`color-${label}`)?.click()}
        />
        <input
          id={`color-${label}`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="sr-only"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-mono backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

interface GradientPickerProps {
  label: string;
  value: GradientColors;
  onChange: (gradient: GradientColors) => void;
  disabled?: boolean;
}

const GradientPicker: React.FC<GradientPickerProps> = ({ label, value, onChange, disabled }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div 
        className="w-full h-16 rounded-lg border-2 border-white/20 shadow-lg"
        style={{ 
          background: `linear-gradient(135deg, ${value.start}, ${value.end})` 
        }}
      />
      <div className="grid grid-cols-2 gap-3">
        <ColorPicker
          label="Start Color"
          value={value.start}
          onChange={(color) => onChange({ ...value, start: color })}
          disabled={disabled}
        />
        <ColorPicker
          label="End Color"
          value={value.end}
          onChange={(color) => onChange({ ...value, end: color })}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

interface ThemePresetCardProps {
  preset: {
    id: string;
    name: string;
    description: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    gradient: GradientColors;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const ThemePresetCard: React.FC<ThemePresetCardProps> = ({ preset, isSelected, onSelect }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer transition-all duration-300 ${
        isSelected ? 'ring-2 ring-primary-500/50' : ''
      }`}
      onClick={onSelect}
    >
      <GlassCard interactive className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
            {preset.name}
          </h3>
          {isSelected && (
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
          )}
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {preset.description}
        </p>
        
        {/* Color preview */}
        <div className="flex space-x-2">
          <div 
            className="w-6 h-6 rounded-full border border-white/20"
            style={{ backgroundColor: preset.colors.primary }}
          />
          <div 
            className="w-6 h-6 rounded-full border border-white/20"
            style={{ backgroundColor: preset.colors.secondary }}
          />
          <div 
            className="w-6 h-6 rounded-full border border-white/20"
            style={{ backgroundColor: preset.colors.accent }}
          />
        </div>
        
        {/* Gradient preview */}
        <div 
          className="w-full h-3 rounded-full"
          style={{ 
            background: `linear-gradient(90deg, ${preset.gradient.start}, ${preset.gradient.end})` 
          }}
        />
      </GlassCard>
    </motion.div>
  );
};

export interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ isOpen, onClose }) => {
  const { currentTheme, customization, updateCustomization, resetToDefault, exportTheme, importTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'colors' | 'effects' | 'presets' | 'share'>('colors');
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);

  // Theme presets
  const themePresets = [
    {
      id: 'cosmic',
      name: 'Cosmic Adventure',
      description: 'Deep space colors with stellar gradients',
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb',
      },
      gradient: { start: '#667eea', end: '#764ba2' },
    },
    {
      id: 'forest',
      name: 'Enchanted Forest',
      description: 'Natural greens with mystical touches',
      colors: {
        primary: '#43e97b',
        secondary: '#38f9d7',
        accent: '#4facfe',
      },
      gradient: { start: '#43e97b', end: '#38f9d7' },
    },
    {
      id: 'sunset',
      name: 'Dragon Sunset',
      description: 'Warm oranges and magical pinks',
      colors: {
        primary: '#f093fb',
        secondary: '#f5576c',
        accent: '#ffd89b',
      },
      gradient: { start: '#f093fb', end: '#f5576c' },
    },
    {
      id: 'ocean',
      name: 'Ocean Depths',
      description: 'Cool blues with aquatic vibes',
      colors: {
        primary: '#4facfe',
        secondary: '#00f2fe',
        accent: '#43e97b',
      },
      gradient: { start: '#4facfe', end: '#00f2fe' },
    },
  ];

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleColorChange = useCallback((colorType: keyof ThemeCustomization, color: string) => {
    updateCustomization({ [colorType]: color });
  }, [updateCustomization]);

  const handleEffectChange = useCallback((effectType: keyof ThemeCustomization, value: any) => {
    updateCustomization({ [effectType]: value });
  }, [updateCustomization]);

  const handlePresetSelect = useCallback((preset: typeof themePresets[0]) => {
    setSelectedPreset(preset.id);
    updateCustomization({
      primaryColor: preset.colors.primary,
      secondaryColor: preset.colors.secondary,
      accentColor: preset.colors.accent,
      customGradient: preset.gradient,
    });
  }, [updateCustomization]);

  const handleExport = useCallback(async () => {
    try {
      const themeData = exportTheme();
      await navigator.clipboard.writeText(themeData);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to export theme:', error);
    }
  }, [exportTheme]);

  const handleImport = useCallback(() => {
    setImportError('');
    if (!importData.trim()) {
      setImportError('Please paste theme data to import');
      return;
    }

    const success = importTheme(importData);
    if (success) {
      setImportData('');
      setImportError('');
      // Show success feedback
    } else {
      setImportError('Invalid theme data. Please check the format and try again.');
    }
  }, [importData, importTheme]);

  const tabs = [
    { id: 'colors', label: 'Colors', icon: '🎨' },
    { id: 'effects', label: 'Effects', icon: '✨' },
    { id: 'presets', label: 'Presets', icon: '🎭' },
    { id: 'share', label: 'Share', icon: '📤' },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Customizer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 z-50"
          >
            <GlassCard className="h-full rounded-none rounded-l-2xl p-6 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  Theme Customizer
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-slate-800 dark:text-slate-200'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="mr-1">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto space-y-6">
                {activeTab === 'colors' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <ColorPicker
                      label="Primary Color"
                      value={customization.primaryColor || currentTheme.colors.primary[500]}
                      onChange={(color) => handleColorChange('primaryColor', color)}
                    />
                    
                    <ColorPicker
                      label="Secondary Color"
                      value={customization.secondaryColor || currentTheme.colors.secondary[500]}
                      onChange={(color) => handleColorChange('secondaryColor', color)}
                    />
                    
                    <ColorPicker
                      label="Accent Color"
                      value={customization.accentColor || currentTheme.colors.accent[500]}
                      onChange={(color) => handleColorChange('accentColor', color)}
                    />

                    <GradientPicker
                      label="Custom Gradient"
                      value={customization.customGradient || { start: '#667eea', end: '#764ba2' }}
                      onChange={(gradient) => handleEffectChange('customGradient', gradient)}
                    />
                  </motion.div>
                )}

                {activeTab === 'effects' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Blur Intensity
                      </label>
                      <select
                        value={customization.blurIntensity || currentTheme.effects.blur.backdrop}
                        onChange={(e) => handleEffectChange('blurIntensity', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                      >
                        <option value="none">None</option>
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                        <option value="xl">Extra Large</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Shadow Intensity
                      </label>
                      <select
                        value={customization.shadowIntensity || currentTheme.effects.shadows.glass}
                        onChange={(e) => handleEffectChange('shadowIntensity', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                      >
                        <option value="none">None</option>
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                        <option value="xl">Extra Large</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Glow Intensity
                      </label>
                      <select
                        value={customization.glowIntensity || currentTheme.effects.shadows.glow}
                        onChange={(e) => handleEffectChange('glowIntensity', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                      >
                        <option value="none">None</option>
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'presets' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {themePresets.map((preset) => (
                      <ThemePresetCard
                        key={preset.id}
                        preset={preset}
                        isSelected={selectedPreset === preset.id}
                        onSelect={() => handlePresetSelect(preset)}
                      />
                    ))}
                  </motion.div>
                )}

                {activeTab === 'share' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                        Export Theme
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Copy your customized theme to share with others or save as backup.
                      </p>
                      <GlassButton
                        onClick={handleExport}
                        className="w-full"
                      >
                        {exportSuccess ? '✅ Copied to Clipboard!' : '📤 Export Theme'}
                      </GlassButton>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                        Import Theme
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Paste theme data to import a custom theme.
                      </p>
                      <textarea
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        placeholder="Paste theme data here..."
                        className="w-full h-32 px-3 py-2 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none text-sm font-mono"
                      />
                      {importError && (
                        <p className="text-red-400 text-sm mt-2">{importError}</p>
                      )}
                      <GlassButton
                        onClick={handleImport}
                        className="w-full mt-3"
                        disabled={!importData.trim()}
                      >
                        📥 Import Theme
                      </GlassButton>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="flex space-x-3 pt-6 border-t border-white/10">
                <GlassButton
                  onClick={resetToDefault}
                  variant="secondary"
                  className="flex-1"
                >
                  Reset
                </GlassButton>
                <GlassButton
                  onClick={onClose}
                  className="flex-1"
                >
                  Done
                </GlassButton>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};