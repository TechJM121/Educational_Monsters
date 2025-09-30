import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createParticleConfig } from '../components/particles/ParticleConfig';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import type { ParticleConfig } from '../types/animation';

export type ParticleTheme = 'magical' | 'tech' | 'nature' | 'cosmic';

export interface ParticleThemeContextType {
  currentTheme: ParticleTheme;
  setTheme: (theme: ParticleTheme) => void;
  config: ParticleConfig;
  isTransitioning: boolean;
  autoSwitchEnabled: boolean;
  setAutoSwitchEnabled: (enabled: boolean) => void;
  switchThemeForSection: (sectionId: string) => void;
}

const ParticleThemeContext = createContext<ParticleThemeContextType | undefined>(undefined);

export interface ParticleThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ParticleTheme;
  sectionThemeMap?: Record<string, ParticleTheme>;
}

export const ParticleThemeProvider: React.FC<ParticleThemeProviderProps> = ({
  children,
  defaultTheme = 'magical',
  sectionThemeMap = {
    'hero': 'magical',
    'features': 'tech',
    'learning': 'nature',
    'progress': 'cosmic',
    'dashboard': 'tech',
    'character': 'magical',
    'achievements': 'cosmic'
  }
}) => {
  const [currentTheme, setCurrentTheme] = useState<ParticleTheme>(defaultTheme);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoSwitchEnabled, setAutoSwitchEnabled] = useState(true);
  const deviceCapability = useDeviceCapability();

  const config = createParticleConfig(currentTheme, deviceCapability);

  const setTheme = useCallback((theme: ParticleTheme) => {
    if (theme === currentTheme) return;
    
    setIsTransitioning(true);
    
    // Smooth transition with delay
    setTimeout(() => {
      setCurrentTheme(theme);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 150);
  }, [currentTheme]);

  const switchThemeForSection = useCallback((sectionId: string) => {
    if (!autoSwitchEnabled) return;
    
    const themeForSection = sectionThemeMap[sectionId];
    if (themeForSection && themeForSection !== currentTheme) {
      setTheme(themeForSection);
    }
  }, [autoSwitchEnabled, sectionThemeMap, currentTheme, setTheme]);

  // Auto-detect section based on URL hash or pathname
  useEffect(() => {
    if (!autoSwitchEnabled) return;

    const detectCurrentSection = () => {
      const hash = window.location.hash.replace('#', '');
      const pathname = window.location.pathname;
      
      // Check hash first
      if (hash && sectionThemeMap[hash]) {
        switchThemeForSection(hash);
        return;
      }
      
      // Check pathname segments
      const pathSegments = pathname.split('/').filter(Boolean);
      for (const segment of pathSegments) {
        if (sectionThemeMap[segment]) {
          switchThemeForSection(segment);
          return;
        }
      }
      
      // Check for common section keywords in pathname
      if (pathname.includes('dashboard')) switchThemeForSection('dashboard');
      else if (pathname.includes('character')) switchThemeForSection('character');
      else if (pathname.includes('progress')) switchThemeForSection('progress');
      else if (pathname.includes('learn')) switchThemeForSection('learning');
      else if (pathname === '/' || pathname === '') switchThemeForSection('hero');
    };

    detectCurrentSection();

    // Listen for navigation changes
    const handleNavigation = () => {
      setTimeout(detectCurrentSection, 100); // Small delay for route changes
    };

    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [autoSwitchEnabled, sectionThemeMap, switchThemeForSection]);

  const contextValue: ParticleThemeContextType = {
    currentTheme,
    setTheme,
    config,
    isTransitioning,
    autoSwitchEnabled,
    setAutoSwitchEnabled,
    switchThemeForSection
  };

  return (
    <ParticleThemeContext.Provider value={contextValue}>
      {children}
    </ParticleThemeContext.Provider>
  );
};

export const useParticleTheme = (): ParticleThemeContextType => {
  const context = useContext(ParticleThemeContext);
  if (!context) {
    throw new Error('useParticleTheme must be used within a ParticleThemeProvider');
  }
  return context;
};