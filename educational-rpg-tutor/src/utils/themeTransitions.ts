/**
 * Theme Transition Utilities
 * Manages smooth transitions between themes and provides transition effects
 */

import type { ThemeMode } from '../types/theme';

export interface ThemeTransitionOptions {
  duration?: number;
  easing?: string;
  enableParticleEffect?: boolean;
  enableColorWave?: boolean;
}

export interface ThemeTransitionState {
  isTransitioning: boolean;
  fromMode: ThemeMode | null;
  toMode: ThemeMode | null;
  progress: number;
}

/**
 * Creates smooth CSS transitions for theme changes
 */
export const createThemeTransitionStyles = (options: ThemeTransitionOptions = {}) => {
  const {
    duration = 500,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    enableParticleEffect = false,
    enableColorWave = false,
  } = options;

  const transitionProperties = [
    'background-color',
    'border-color',
    'color',
    'box-shadow',
    'backdrop-filter',
    'fill',
    'stroke',
  ];

  const baseTransition = `${transitionProperties.join(` ${duration}ms ${easing}, `)} ${duration}ms ${easing}`;

  return {
    transition: baseTransition,
    willChange: 'background-color, border-color, color, box-shadow',
    ...(enableColorWave && {
      position: 'relative' as const,
      overflow: 'hidden' as const,
    }),
  };
};

/**
 * Manages theme transition state and provides callbacks
 */
export class ThemeTransitionManager {
  private state: ThemeTransitionState = {
    isTransitioning: false,
    fromMode: null,
    toMode: null,
    progress: 0,
  };

  private listeners: Array<(state: ThemeTransitionState) => void> = [];
  private transitionTimeout: number | null = null;

  /**
   * Starts a theme transition
   */
  startTransition(fromMode: ThemeMode, toMode: ThemeMode, duration = 500): Promise<void> {
    return new Promise((resolve) => {
      // Clear any existing transition
      if (this.transitionTimeout) {
        clearTimeout(this.transitionTimeout);
      }

      // Update state
      this.state = {
        isTransitioning: true,
        fromMode,
        toMode,
        progress: 0,
      };

      this.notifyListeners();

      // Add transition class to document
      document.documentElement.classList.add('theme-transitioning');

      // Animate progress
      const startTime = Date.now();
      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        this.state.progress = progress;
        this.notifyListeners();

        if (progress < 1) {
          requestAnimationFrame(animateProgress);
        } else {
          this.completeTransition();
          resolve();
        }
      };

      requestAnimationFrame(animateProgress);
    });
  }

  /**
   * Completes the current transition
   */
  private completeTransition(): void {
    this.state = {
      isTransitioning: false,
      fromMode: null,
      toMode: null,
      progress: 1,
    };

    document.documentElement.classList.remove('theme-transitioning');
    this.notifyListeners();
  }

  /**
   * Subscribes to transition state changes
   */
  subscribe(listener: (state: ThemeTransitionState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Gets current transition state
   */
  getState(): ThemeTransitionState {
    return { ...this.state };
  }

  /**
   * Notifies all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// Global transition manager instance
export const themeTransitionManager = new ThemeTransitionManager();

/**
 * Creates a color wave effect during theme transitions
 */
export const createColorWaveEffect = (
  fromColor: string,
  toColor: string,
  duration = 1000
): void => {
  const wave = document.createElement('div');
  wave.className = 'theme-color-wave';
  wave.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(45deg, ${fromColor}, ${toColor});
    opacity: 0;
    pointer-events: none;
    z-index: 9999;
    animation: colorWave ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  `;

  // Add keyframes if not already present
  if (!document.getElementById('color-wave-keyframes')) {
    const style = document.createElement('style');
    style.id = 'color-wave-keyframes';
    style.textContent = `
      @keyframes colorWave {
        0% {
          opacity: 0;
          transform: scale(0) rotate(0deg);
          border-radius: 50%;
        }
        50% {
          opacity: 0.3;
          border-radius: 20%;
        }
        100% {
          opacity: 0;
          transform: scale(3) rotate(180deg);
          border-radius: 0%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(wave);

  // Remove wave after animation
  setTimeout(() => {
    if (wave.parentNode) {
      wave.parentNode.removeChild(wave);
    }
  }, duration);
};

/**
 * Creates particle effects during theme transitions
 */
export const createThemeParticleEffect = (
  fromTheme: string,
  toTheme: string,
  particleCount = 20
): void => {
  const container = document.createElement('div');
  container.className = 'theme-particles';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9998;
  `;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'theme-particle';
    
    const size = Math.random() * 6 + 2;
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    const endX = Math.random() * window.innerWidth;
    const endY = Math.random() * window.innerHeight;
    const duration = Math.random() * 2000 + 1000;
    const delay = Math.random() * 500;

    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${i % 2 === 0 ? fromTheme : toTheme};
      border-radius: 50%;
      left: ${startX}px;
      top: ${startY}px;
      opacity: 0;
      animation: themeParticle ${duration}ms ease-out ${delay}ms forwards;
      transform: translate(${endX - startX}px, ${endY - startY}px);
    `;

    container.appendChild(particle);
  }

  // Add keyframes if not already present
  if (!document.getElementById('theme-particle-keyframes')) {
    const style = document.createElement('style');
    style.id = 'theme-particle-keyframes';
    style.textContent = `
      @keyframes themeParticle {
        0% {
          opacity: 0;
          transform: translate(0, 0) scale(0);
        }
        20% {
          opacity: 1;
          transform: translate(0, 0) scale(1);
        }
        80% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform: translate(var(--end-x, 0), var(--end-y, 0)) scale(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(container);

  // Remove particles after animation
  setTimeout(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 3000);
};

/**
 * Hook for using theme transitions in React components
 */
export const useThemeTransition = () => {
  const [transitionState, setTransitionState] = React.useState<ThemeTransitionState>(
    themeTransitionManager.getState()
  );

  React.useEffect(() => {
    const unsubscribe = themeTransitionManager.subscribe(setTransitionState);
    return unsubscribe;
  }, []);

  const startTransition = React.useCallback(
    (fromMode: ThemeMode, toMode: ThemeMode, options?: ThemeTransitionOptions) => {
      const duration = options?.duration || 500;
      
      if (options?.enableColorWave) {
        const fromColor = fromMode === 'dark' ? '#1a1a1a' : '#ffffff';
        const toColor = toMode === 'dark' ? '#1a1a1a' : '#ffffff';
        createColorWaveEffect(fromColor, toColor, duration);
      }

      if (options?.enableParticleEffect) {
        const fromTheme = fromMode === 'dark' ? '#4f46e5' : '#f59e0b';
        const toTheme = toMode === 'dark' ? '#4f46e5' : '#f59e0b';
        createThemeParticleEffect(fromTheme, toTheme);
      }

      return themeTransitionManager.startTransition(fromMode, toMode, duration);
    },
    []
  );

  return {
    transitionState,
    startTransition,
    isTransitioning: transitionState.isTransitioning,
  };
};

// Add React import for the hook
import React from 'react';