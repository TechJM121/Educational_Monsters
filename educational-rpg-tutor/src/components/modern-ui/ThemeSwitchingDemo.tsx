/**
 * Theme Switching Infrastructure Demo
 * Demonstrates the complete theme switching functionality
 */

import React from 'react';
import { useTheme, useThemeStyles } from '../../contexts/ThemeContext';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';

export const ThemeSwitchingDemo: React.FC = () => {
  const { 
    currentTheme, 
    mode, 
    setMode, 
    updateCustomization, 
    resetToDefault, 
    exportTheme, 
    importTheme 
  } = useTheme();
  
  const { getGlassStyles, getGradientStyles } = useThemeStyles();

  const handleExportTheme = () => {
    const exported = exportTheme();
    navigator.clipboard.writeText(exported);
    alert('Theme exported to clipboard!');
  };

  const handleImportTheme = () => {
    const themeData = prompt('Paste theme data:');
    if (themeData) {
      const success = importTheme(themeData);
      alert(success ? 'Theme imported successfully!' : 'Failed to import theme');
    }
  };

  const handleCustomizeColor = (colorType: 'primary' | 'secondary' | 'accent') => {
    const color = prompt(`Enter new ${colorType} color (hex):`);
    if (color && /^#[0-9A-F]{6}$/i.test(color)) {
      updateCustomization({ [`${colorType}Color`]: color });
    }
  };

  return (
    <div className="min-h-screen p-8 transition-all duration-500" 
         style={getGradientStyles('cosmic')}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <GlassCard className="p-8 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Theme Switching Infrastructure Demo
          </h1>
          <p className="text-lg opacity-80">
            Complete theme management with persistence, smooth transitions, and customization
          </p>
        </GlassCard>

        {/* Current Theme Info */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Current Theme</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <strong>Theme ID:</strong> {currentTheme.id}
            </div>
            <div>
              <strong>Theme Name:</strong> {currentTheme.name}
            </div>
            <div>
              <strong>Mode:</strong> {mode}
            </div>
          </div>
        </GlassCard>

        {/* Theme Mode Controls */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Theme Mode</h2>
          <div className="flex flex-wrap gap-4">
            <GlassButton
              onClick={() => setMode('light')}
              variant={mode === 'light' ? 'primary' : 'secondary'}
            >
              Light Mode
            </GlassButton>
            <GlassButton
              onClick={() => setMode('dark')}
              variant={mode === 'dark' ? 'primary' : 'secondary'}
            >
              Dark Mode
            </GlassButton>
            <GlassButton
              onClick={() => setMode('auto')}
              variant={mode === 'auto' ? 'primary' : 'secondary'}
            >
              Auto Mode
            </GlassButton>
          </div>
        </GlassCard>

        {/* Color Customization */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Color Customization</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-white/20"
                style={{ backgroundColor: currentTheme.colors.primary[500] }}
              />
              <GlassButton
                size="sm"
                onClick={() => handleCustomizeColor('primary')}
              >
                Customize Primary
              </GlassButton>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-white/20"
                style={{ backgroundColor: currentTheme.colors.secondary[500] }}
              />
              <GlassButton
                size="sm"
                onClick={() => handleCustomizeColor('secondary')}
              >
                Customize Secondary
              </GlassButton>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-white/20"
                style={{ backgroundColor: currentTheme.colors.accent[500] }}
              />
              <GlassButton
                size="sm"
                onClick={() => handleCustomizeColor('accent')}
              >
                Customize Accent
              </GlassButton>
            </div>
          </div>
          <div className="flex gap-4">
            <GlassButton onClick={resetToDefault}>
              Reset to Default
            </GlassButton>
          </div>
        </GlassCard>

        {/* Effect Customization */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Effect Customization</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Blur Intensity</label>
              <select 
                className="w-full p-2 rounded-lg bg-white/10 border border-white/20"
                value={currentTheme.effects.blur.backdrop}
                onChange={(e) => updateCustomization({ 
                  blurIntensity: e.target.value as any 
                })}
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Shadow Intensity</label>
              <select 
                className="w-full p-2 rounded-lg bg-white/10 border border-white/20"
                value={currentTheme.effects.shadows.glass}
                onChange={(e) => updateCustomization({ 
                  shadowIntensity: e.target.value as any 
                })}
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Gradient Preset</label>
              <select 
                className="w-full p-2 rounded-lg bg-white/10 border border-white/20"
                onChange={(e) => updateCustomization({ 
                  gradientPreset: e.target.value as any 
                })}
              >
                <option value="">Select Gradient</option>
                <option value="cosmic">Cosmic</option>
                <option value="sunset">Sunset</option>
                <option value="ocean">Ocean</option>
                <option value="forest">Forest</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Import/Export */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Theme Import/Export</h2>
          <div className="flex gap-4">
            <GlassButton onClick={handleExportTheme}>
              Export Theme
            </GlassButton>
            <GlassButton onClick={handleImportTheme}>
              Import Theme
            </GlassButton>
          </div>
        </GlassCard>

        {/* Visual Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">Glass Effects</h3>
            <div className="space-y-4">
              <div 
                className="p-4 rounded-lg border"
                style={getGlassStyles('light')}
              >
                Light Glass Effect
              </div>
              <div 
                className="p-4 rounded-lg border"
                style={getGlassStyles('medium')}
              >
                Medium Glass Effect
              </div>
              <div 
                className="p-4 rounded-lg border"
                style={getGlassStyles('strong')}
              >
                Strong Glass Effect
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">Gradient Examples</h3>
            <div className="space-y-4">
              <div 
                className="p-4 rounded-lg text-white"
                style={getGradientStyles('cosmic')}
              >
                Cosmic Gradient
              </div>
              <div 
                className="p-4 rounded-lg text-white"
                style={getGradientStyles('sunset')}
              >
                Sunset Gradient
              </div>
              <div 
                className="p-4 rounded-lg text-white"
                style={getGradientStyles('ocean')}
              >
                Ocean Gradient
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Transition Demo */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Smooth Transitions</h2>
          <p className="mb-4 opacity-80">
            Notice how all elements smoothly transition when you change themes. 
            The system applies CSS transitions to background colors, borders, shadows, and more.
          </p>
          <div className="text-sm opacity-60">
            Transition properties: background-color, border-color, color, box-shadow, backdrop-filter
          </div>
        </GlassCard>

      </div>
    </div>
  );
};