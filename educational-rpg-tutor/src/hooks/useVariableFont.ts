import { useState, useEffect, useCallback } from 'react';

export interface FontVariationSettings {
  weight: number;
  slant?: number;
  width?: number;
  opticalSize?: number;
}

export interface VariableFontConfig {
  fontFamily: string;
  variations: FontVariationSettings;
  transitionDuration?: number;
  easing?: string;
}

export interface VariableFontState {
  isLoaded: boolean;
  isSupported: boolean;
  currentVariations: FontVariationSettings;
  error: string | null;
}

/**
 * Hook for managing variable font loading and dynamic effects
 */
export const useVariableFont = (config: VariableFontConfig) => {
  const [state, setState] = useState<VariableFontState>({
    isLoaded: false,
    isSupported: false,
    currentVariations: config.variations,
    error: null,
  });

  // Check if variable fonts are supported
  const checkVariableFontSupport = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    try {
      // Check for CSS font-variation-settings support
      const testElement = document.createElement('div');
      testElement.style.fontVariationSettings = "'wght' 400";
      return testElement.style.fontVariationSettings !== '';
    } catch {
      return false;
    }
  }, []);

  // Load and validate font
  const loadFont = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      setState(prev => ({ ...prev, error: null }));

      // Check if font is already loaded
      if (document.fonts && document.fonts.check) {
        const isLoaded = document.fonts.check(`16px ${config.fontFamily}`);
        if (isLoaded) {
          setState(prev => ({ 
            ...prev, 
            isLoaded: true, 
            isSupported: checkVariableFontSupport() 
          }));
          return;
        }
      }

      // Load font using Font Loading API
      if (document.fonts && document.fonts.load) {
        await document.fonts.load(`16px ${config.fontFamily}`);
        
        setState(prev => ({ 
          ...prev, 
          isLoaded: true, 
          isSupported: checkVariableFontSupport() 
        }));
      } else {
        // Fallback: wait for font to load
        await new Promise(resolve => setTimeout(resolve, 100));
        setState(prev => ({ 
          ...prev, 
          isLoaded: true, 
          isSupported: checkVariableFontSupport() 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Font loading failed',
        isLoaded: false 
      }));
    }
  }, [config.fontFamily, checkVariableFontSupport]);

  // Update font variations
  const updateVariations = useCallback((newVariations: Partial<FontVariationSettings>) => {
    setState(prev => ({
      ...prev,
      currentVariations: { ...prev.currentVariations, ...newVariations }
    }));
  }, []);

  // Generate CSS font-variation-settings string
  const getFontVariationSettings = useCallback(() => {
    const { weight, slant, width, opticalSize } = state.currentVariations;
    const settings: string[] = [];

    if (weight !== undefined) settings.push(`'wght' ${weight}`);
    if (slant !== undefined) settings.push(`'slnt' ${slant}`);
    if (width !== undefined) settings.push(`'wdth' ${width}`);
    if (opticalSize !== undefined) settings.push(`'opsz' ${opticalSize}`);

    return settings.join(', ');
  }, [state.currentVariations]);

  // Generate CSS styles object
  const getFontStyles = useCallback(() => {
    if (!state.isSupported) {
      // Fallback for non-supporting browsers
      return {
        fontFamily: config.fontFamily,
        fontWeight: state.currentVariations.weight || 400,
        fontStyle: state.currentVariations.slant ? 'italic' : 'normal',
      };
    }

    return {
      fontFamily: config.fontFamily,
      fontVariationSettings: getFontVariationSettings(),
      transition: `font-variation-settings ${config.transitionDuration || 300}ms ${config.easing || 'cubic-bezier(0.4, 0, 0.2, 1)'}`,
    };
  }, [
    state.isSupported, 
    state.currentVariations, 
    config.fontFamily, 
    config.transitionDuration, 
    config.easing, 
    getFontVariationSettings
  ]);

  // Animate to target variations
  const animateToVariations = useCallback((
    targetVariations: Partial<FontVariationSettings>,
    duration: number = 300
  ) => {
    const startVariations = { ...state.currentVariations };
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const interpolatedVariations: FontVariationSettings = {
        weight: startVariations.weight + 
          (targetVariations.weight || startVariations.weight - startVariations.weight) * easeOut,
        slant: startVariations.slant !== undefined && targetVariations.slant !== undefined
          ? startVariations.slant + (targetVariations.slant - startVariations.slant) * easeOut
          : targetVariations.slant ?? startVariations.slant,
        width: startVariations.width !== undefined && targetVariations.width !== undefined
          ? startVariations.width + (targetVariations.width - startVariations.width) * easeOut
          : targetVariations.width ?? startVariations.width,
        opticalSize: startVariations.opticalSize !== undefined && targetVariations.opticalSize !== undefined
          ? startVariations.opticalSize + (targetVariations.opticalSize - startVariations.opticalSize) * easeOut
          : targetVariations.opticalSize ?? startVariations.opticalSize,
      };

      setState(prev => ({ ...prev, currentVariations: interpolatedVariations }));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [state.currentVariations]);

  // Load font on mount
  useEffect(() => {
    loadFont();
  }, [loadFont]);

  return {
    ...state,
    updateVariations,
    getFontStyles,
    getFontVariationSettings,
    animateToVariations,
    reload: loadFont,
  };
};

/**
 * Hook for responsive font sizing based on viewport and device
 */
export const useResponsiveFont = () => {
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.5);

  useEffect(() => {
    const updateFontSize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const devicePixelRatio = window.devicePixelRatio || 1;

      // Calculate optimal font size based on viewport and device
      let baseFontSize = 16;
      
      if (viewportWidth < 640) {
        baseFontSize = 14;
      } else if (viewportWidth > 1920) {
        baseFontSize = 18;
      }

      // Adjust for high DPI displays
      if (devicePixelRatio > 1.5) {
        baseFontSize *= 1.1;
      }

      // Calculate line height based on font size and viewport
      const calculatedLineHeight = Math.max(1.4, Math.min(1.8, 1.2 + (baseFontSize / 100)));

      setFontSize(baseFontSize);
      setLineHeight(calculatedLineHeight);
    };

    updateFontSize();
    window.addEventListener('resize', updateFontSize);
    
    return () => window.removeEventListener('resize', updateFontSize);
  }, []);

  return { fontSize, lineHeight };
};