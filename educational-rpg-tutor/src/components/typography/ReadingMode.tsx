import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  ReadabilitySettings, 
  ReadingContext, 
  generateReadabilityMetrics,
  generateReadabilityCSSProperties,
  getDyslexiaFriendlyFontStack,
  analyzeTextComplexity
} from '../../utils/readabilityOptimization';

interface ReadingModeContextType {
  isReadingMode: boolean;
  settings: ReadabilitySettings;
  context: ReadingContext;
  toggleReadingMode: () => void;
  updateSettings: (newSettings: Partial<ReadabilitySettings>) => void;
  updateContext: (newContext: Partial<ReadingContext>) => void;
}

const ReadingModeContext = createContext<ReadingModeContextType | undefined>(undefined);

export const useReadingMode = () => {
  const context = useContext(ReadingModeContext);
  if (!context) {
    throw new Error('useReadingMode must be used within a ReadingModeProvider');
  }
  return context;
};

interface ReadingModeProviderProps {
  children: ReactNode;
  defaultSettings?: Partial<ReadabilitySettings>;
}

export const ReadingModeProvider: React.FC<ReadingModeProviderProps> = ({
  children,
  defaultSettings = {},
}) => {
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [settings, setSettings] = useState<ReadabilitySettings>({
    fontSizeMultiplier: 1,
    lineHeightMultiplier: 1,
    letterSpacingAdjustment: 0,
    contrastLevel: 'normal',
    reducedMotion: false,
    dyslexiaFriendly: false,
    ...defaultSettings,
  });

  const [context, setContext] = useState<ReadingContext>({
    deviceType: 'desktop',
    screenSize: { width: 1200, height: 800 },
    viewingDistance: 'normal',
    ambientLight: 'normal',
  });

  // Detect device type and screen size
  useEffect(() => {
    const updateContext = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let deviceType: ReadingContext['deviceType'] = 'desktop';
      if (width < 768) {
        deviceType = 'mobile';
      } else if (width < 1024) {
        deviceType = 'tablet';
      }

      setContext(prev => ({
        ...prev,
        deviceType,
        screenSize: { width, height },
      }));
    };

    updateContext();
    window.addEventListener('resize', updateContext);
    return () => window.removeEventListener('resize', updateContext);
  }, []);

  // Detect user preferences
  useEffect(() => {
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
    };

    const updatePreferences = () => {
      setSettings(prev => ({
        ...prev,
        reducedMotion: mediaQueries.reducedMotion.matches,
        contrastLevel: mediaQueries.highContrast.matches ? 'high' : prev.contrastLevel,
      }));
    };

    updatePreferences();
    
    mediaQueries.reducedMotion.addEventListener('change', updatePreferences);
    mediaQueries.highContrast.addEventListener('change', updatePreferences);

    return () => {
      mediaQueries.reducedMotion.removeEventListener('change', updatePreferences);
      mediaQueries.highContrast.removeEventListener('change', updatePreferences);
    };
  }, []);

  // Apply reading mode styles
  useEffect(() => {
    if (isReadingMode) {
      const metrics = generateReadabilityMetrics(context, settings);
      const cssProperties = generateReadabilityCSSProperties(metrics);
      
      // Apply CSS custom properties to document root
      Object.entries(cssProperties).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
      });

      // Apply dyslexia-friendly font if enabled
      if (settings.dyslexiaFriendly) {
        document.documentElement.style.setProperty(
          '--readable-font-family',
          getDyslexiaFriendlyFontStack()
        );
      }

      // Add reading mode class to body
      document.body.classList.add('reading-mode');
    } else {
      // Remove reading mode styles
      document.body.classList.remove('reading-mode');
      
      // Remove CSS custom properties
      const propertiesToRemove = [
        '--readable-font-size',
        '--readable-line-height',
        '--readable-letter-spacing',
        '--readable-word-spacing',
        '--readable-paragraph-spacing',
        '--readable-max-line-length',
        '--readable-contrast-ratio',
        '--readable-font-family',
      ];
      
      propertiesToRemove.forEach(property => {
        document.documentElement.style.removeProperty(property);
      });
    }
  }, [isReadingMode, settings, context]);

  const toggleReadingMode = () => {
    setIsReadingMode(prev => !prev);
  };

  const updateSettings = (newSettings: Partial<ReadabilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateContext = (newContext: Partial<ReadingContext>) => {
    setContext(prev => ({ ...prev, ...newContext }));
  };

  return (
    <ReadingModeContext.Provider
      value={{
        isReadingMode,
        settings,
        context,
        toggleReadingMode,
        updateSettings,
        updateContext,
      }}
    >
      {children}
    </ReadingModeContext.Provider>
  );
};

interface ReadableTextProps {
  children: ReactNode;
  className?: string;
  contentType?: 'body' | 'heading' | 'caption' | 'code';
  autoOptimize?: boolean;
}

export const ReadableText: React.FC<ReadableTextProps> = ({
  children,
  className = '',
  contentType = 'body',
  autoOptimize = false,
}) => {
  const { isReadingMode, settings } = useReadingMode();
  const [optimizedSettings, setOptimizedSettings] = useState<Partial<ReadabilitySettings>>({});

  // Auto-optimize based on text content
  useEffect(() => {
    if (autoOptimize && typeof children === 'string') {
      const analysis = analyzeTextComplexity(children);
      setOptimizedSettings(analysis.recommendedAdjustments);
    }
  }, [children, autoOptimize]);

  const getReadableClasses = () => {
    const baseClasses = [
      'readable-text',
      `readable-text--${contentType}`,
    ];

    if (isReadingMode) {
      baseClasses.push('reading-mode-active');
      
      if (settings.dyslexiaFriendly) {
        baseClasses.push('dyslexia-friendly');
      }
      
      if (settings.reducedMotion) {
        baseClasses.push('reduced-motion');
      }
    }

    return baseClasses.join(' ');
  };

  const getInlineStyles = () => {
    if (!isReadingMode) return {};

    const styles: React.CSSProperties = {};

    // Apply optimized settings if auto-optimize is enabled
    if (autoOptimize && Object.keys(optimizedSettings).length > 0) {
      if (optimizedSettings.fontSizeMultiplier) {
        styles.fontSize = `calc(var(--readable-font-size, 1rem) * ${optimizedSettings.fontSizeMultiplier})`;
      }
      if (optimizedSettings.lineHeightMultiplier) {
        styles.lineHeight = `calc(var(--readable-line-height, 1.5) * ${optimizedSettings.lineHeightMultiplier})`;
      }
      if (optimizedSettings.letterSpacingAdjustment) {
        styles.letterSpacing = `calc(var(--readable-letter-spacing, 0) + ${optimizedSettings.letterSpacingAdjustment}em)`;
      }
    }

    return styles;
  };

  return (
    <div 
      className={`${getReadableClasses()} ${className}`}
      style={getInlineStyles()}
    >
      {children}
    </div>
  );
};

interface ReadingModeControlsProps {
  className?: string;
}

export const ReadingModeControls: React.FC<ReadingModeControlsProps> = ({
  className = '',
}) => {
  const { isReadingMode, settings, toggleReadingMode, updateSettings } = useReadingMode();

  return (
    <div className={`reading-mode-controls ${className}`}>
      <button
        onClick={toggleReadingMode}
        className={`reading-mode-toggle ${isReadingMode ? 'active' : ''}`}
        aria-label={isReadingMode ? 'Exit reading mode' : 'Enter reading mode'}
      >
        📖 {isReadingMode ? 'Exit' : 'Reading Mode'}
      </button>

      {isReadingMode && (
        <div className="reading-mode-settings">
          <div className="setting-group">
            <label htmlFor="font-size-slider">Font Size</label>
            <input
              id="font-size-slider"
              type="range"
              min="0.8"
              max="2"
              step="0.1"
              value={settings.fontSizeMultiplier}
              onChange={(e) => updateSettings({ fontSizeMultiplier: parseFloat(e.target.value) })}
            />
            <span>{Math.round(settings.fontSizeMultiplier * 100)}%</span>
          </div>

          <div className="setting-group">
            <label htmlFor="line-height-slider">Line Height</label>
            <input
              id="line-height-slider"
              type="range"
              min="1"
              max="2"
              step="0.1"
              value={settings.lineHeightMultiplier}
              onChange={(e) => updateSettings({ lineHeightMultiplier: parseFloat(e.target.value) })}
            />
            <span>{settings.lineHeightMultiplier.toFixed(1)}</span>
          </div>

          <div className="setting-group">
            <label htmlFor="letter-spacing-slider">Letter Spacing</label>
            <input
              id="letter-spacing-slider"
              type="range"
              min="-0.05"
              max="0.1"
              step="0.01"
              value={settings.letterSpacingAdjustment}
              onChange={(e) => updateSettings({ letterSpacingAdjustment: parseFloat(e.target.value) })}
            />
            <span>{(settings.letterSpacingAdjustment * 100).toFixed(0)}%</span>
          </div>

          <div className="setting-group">
            <label htmlFor="contrast-select">Contrast</label>
            <select
              id="contrast-select"
              value={settings.contrastLevel}
              onChange={(e) => updateSettings({ contrastLevel: e.target.value as any })}
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="maximum">Maximum</option>
            </select>
          </div>

          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={settings.dyslexiaFriendly}
                onChange={(e) => updateSettings({ dyslexiaFriendly: e.target.checked })}
              />
              Dyslexia-friendly font
            </label>
          </div>

          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
              />
              Reduce motion
            </label>
          </div>
        </div>
      )}
    </div>
  );
};