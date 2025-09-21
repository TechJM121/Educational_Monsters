import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ThemedParticleSystem } from './ThemedParticleSystem';
import { SectionParticleSystem } from './SectionParticleSystem';
import { ParticleThemeProvider, useParticleTheme } from '../../contexts/ParticleThemeContext';
import { getThemeColors, getThemeBehaviors } from './ParticleConfig';

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, isTransitioning, autoSwitchEnabled, setAutoSwitchEnabled } = useParticleTheme();
  const themes: Array<'magical' | 'tech' | 'nature' | 'cosmic'> = ['magical', 'tech', 'nature', 'cosmic'];

  return (
    <div className="absolute top-4 left-4 z-20 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
      <h3 className="text-white font-semibold mb-3">Particle Themes</h3>
      
      <div className="flex flex-col gap-2 mb-4">
        {themes.map((theme) => {
          const colors = getThemeColors(theme);
          const behaviors = getThemeBehaviors(theme);
          
          return (
            <motion.button
              key={theme}
              onClick={() => setTheme(theme)}
              disabled={isTransitioning}
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${currentTheme === theme 
                  ? 'bg-white/20 text-white border border-white/30' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-transparent'
                }
                ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{
                boxShadow: currentTheme === theme ? `0 0 20px ${colors.primary}40` : 'none'
              }}
              whileHover={!isTransitioning ? { scale: 1.02 } : undefined}
              whileTap={!isTransitioning ? { scale: 0.98 } : undefined}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors.primary }}
                />
                <span className="capitalize">{theme}</span>
              </div>
              <div className="text-xs text-white/50 mt-1">
                {behaviors.movementPattern} • {behaviors.interactionType}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="border-t border-white/20 pt-3">
        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={autoSwitchEnabled}
            onChange={(e) => setAutoSwitchEnabled(e.target.checked)}
            className="rounded"
          />
          Auto-switch by section
        </label>
      </div>

      {isTransitioning && (
        <div className="mt-3 text-xs text-white/60">
          Transitioning themes...
        </div>
      )}
    </div>
  );
};

const SectionDemo: React.FC = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const sections = [
    { id: 'hero', name: 'Hero', theme: 'magical' },
    { id: 'features', name: 'Features', theme: 'tech' },
    { id: 'learning', name: 'Learning', theme: 'nature' },
    { id: 'progress', name: 'Progress', theme: 'cosmic' }
  ];

  return (
    <div className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
      <h3 className="text-white font-semibold mb-3">Section Themes</h3>
      
      <div className="flex flex-col gap-2">
        {sections.map((section) => (
          <motion.button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${activeSection === section.id 
                ? 'bg-white/20 text-white border border-white/30' 
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-transparent'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {section.name}
            <div className="text-xs text-white/50 capitalize">
              {section.theme} theme
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const ThemeInfo: React.FC = () => {
  const { currentTheme } = useParticleTheme();
  const colors = getThemeColors(currentTheme);
  const behaviors = getThemeBehaviors(currentTheme);

  return (
    <div className="absolute bottom-4 left-4 z-20 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
      <h3 className="text-white font-semibold mb-3 capitalize">{currentTheme} Theme</h3>
      
      <div className="space-y-2 text-sm text-white/80">
        <div>
          <span className="text-white/60">Movement:</span> {behaviors.movementPattern}
        </div>
        <div>
          <span className="text-white/60">Interaction:</span> {behaviors.interactionType}
        </div>
        <div>
          <span className="text-white/60">Spawn:</span> {behaviors.spawnAnimation}
        </div>
        <div>
          <span className="text-white/60">Despawn:</span> {behaviors.despawnAnimation}
        </div>
        <div>
          <span className="text-white/60">Transition:</span> {behaviors.transitionDuration}ms
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/20">
        <div className="text-xs text-white/60 mb-2">Color Palette</div>
        <div className="flex gap-1">
          <div 
            className="w-4 h-4 rounded-full border border-white/30"
            style={{ backgroundColor: colors.primary }}
            title="Primary"
          />
          <div 
            className="w-4 h-4 rounded-full border border-white/30"
            style={{ backgroundColor: colors.secondary }}
            title="Secondary"
          />
          <div 
            className="w-4 h-4 rounded-full border border-white/30"
            style={{ backgroundColor: colors.accent }}
            title="Accent"
          />
        </div>
      </div>
    </div>
  );
};

export const EnhancedThemedDemo: React.FC = () => {
  return (
    <ParticleThemeProvider
      defaultTheme="magical"
      sectionThemeMap={{
        'hero': 'magical',
        'features': 'tech',
        'learning': 'nature',
        'progress': 'cosmic'
      }}
    >
      <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        {/* Particle System */}
        <ThemedParticleSystem 
          className="absolute inset-0"
          interactive={true}
          enableTransitions={true}
        />

        {/* Demo Controls */}
        <ThemeSelector />
        <SectionDemo />
        <ThemeInfo />

        {/* Center Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">
              Enhanced Themed Particle System
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Interactive particles with theme-specific behaviors
            </p>
            <div className="text-sm text-white/60">
              Move your mouse to interact with particles
            </div>
          </motion.div>
        </div>

        {/* Section-based Demo Areas */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-4">
          {['hero', 'features', 'learning', 'progress'].map((sectionId) => (
            <SectionParticleSystem
              key={sectionId}
              sectionId={sectionId}
              className="w-32 h-20 bg-white/5 backdrop-blur-sm rounded-lg border border-white/20"
              interactive={true}
            >
              <div className="flex items-center justify-center h-full text-white/80 text-sm capitalize">
                {sectionId}
              </div>
            </SectionParticleSystem>
          ))}
        </div>
      </div>
    </ParticleThemeProvider>
  );
};