/**
 * Comprehensive Visual Regression Tests for Modern UI Components
 * Tests all component variants and states across different themes and viewports
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import {
  renderWithProviders,
  VisualRegressionTester,
  VIEWPORTS,
  TEST_THEMES,
  COMPONENT_STATES,
  setBrowserEnvironment,
  waitForAnimations,
  mockAnimationFrame,
  type ViewportName,
  type TestThemeName,
  type ComponentState,
  type BrowserName
} from './setup';

// Import all modern UI components
import { GlassCard } from '../../components/modern-ui/GlassCard';
import { GlassButton } from '../../components/modern-ui/GlassButton';
import { GlassModal } from '../../components/modern-ui/GlassModal';
import { Skeleton } from '../../components/modern-ui/Skeleton';
import { ProgressiveImage } from '../../components/modern-ui/ProgressiveImage';
import { ResponsiveGrid } from '../../components/modern-ui/ResponsiveGrid';
import { MasonryGrid } from '../../components/modern-ui/MasonryGrid';
import { FloatingLabelInput } from '../../components/modern-ui/FloatingLabelInput';
import { TypewriterText } from '../../components/typography/TypewriterText';
import { GradientText } from '../../components/typography/GradientText';
import { AnimatedProgressBar } from '../../components/data-visualization/AnimatedProgressBar';
import { AnimatedProgressRing } from '../../components/data-visualization/AnimatedProgressRing';
import { Avatar3D } from '../../components/3d/Avatar3D';
import { ParticleEngine } from '../../components/particles/ParticleEngine';

describe('Visual Regression Tests', () => {
  let visualTester: VisualRegressionTester;
  let animationFrame: ReturnType<typeof mockAnimationFrame>;

  beforeEach(() => {
    visualTester = new VisualRegressionTester();
    animationFrame = mockAnimationFrame();
    
    // Reset DOM
    document.body.innerHTML = '';
    document.documentElement.className = '';
    
    // Mock performance.now for consistent animation timing
    vi.spyOn(performance, 'now').mockReturnValue(0);
  });

  describe('GlassCard Component', () => {
    const testConfigurations = [
      { blur: 'sm', opacity: 0.1, border: 'subtle', shadow: 'soft' },
      { blur: 'md', opacity: 0.15, border: 'prominent', shadow: 'medium' },
      { blur: 'lg', opacity: 0.2, border: 'glow', shadow: 'dramatic' },
      { blur: 'xl', opacity: 0.25, border: 'subtle', shadow: 'soft', interactive: true }
    ] as const;

    testConfigurations.forEach((config, index) => {
      it(`should render GlassCard variant ${index + 1} consistently across themes and viewports`, async () => {
        const themes: TestThemeName[] = ['light', 'dark', 'highContrast'];
        const viewports: ViewportName[] = ['mobile', 'tablet', 'desktop', 'wide'];
        const states: ComponentState[] = ['default', 'hover', 'focus'];

        for (const theme of themes) {
          for (const viewport of viewports) {
            for (const state of states) {
              const { container } = renderWithProviders(
                <GlassCard {...config} {...COMPONENT_STATES[state]}>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">Glass Card Content</h3>
                    <p className="text-sm opacity-80">This is test content for visual regression testing.</p>
                  </div>
                </GlassCard>,
                { theme, viewport }
              );

              const cardElement = container.firstChild as HTMLElement;
              
              // Simulate state if needed
              if (state === 'hover') {
                fireEvent.mouseEnter(cardElement);
                await waitForAnimations(cardElement);
              } else if (state === 'focus') {
                cardElement.focus();
                await waitForAnimations(cardElement);
              }

              // Capture snapshot
              const snapshot = await visualTester.captureSnapshot(
                cardElement,
                `glass-card-variant-${index + 1}`,
                { theme, viewport, state }
              );

              expect(snapshot).toBeDefined();
              expect(snapshot).toMatchSnapshot(`glass-card-variant-${index + 1}-${theme}-${viewport}-${state}.json`);
            }
          }
        }
      });
    });
  });

  describe('GlassButton Component', () => {
    const buttonVariants = [
      { variant: 'primary', size: 'sm' },
      { variant: 'secondary', size: 'md' },
      { variant: 'accent', size: 'lg' },
      { variant: 'ghost', size: 'xl' }
    ] as const;

    buttonVariants.forEach((variant, index) => {
      it(`should render GlassButton ${variant.variant} ${variant.size} consistently`, async () => {
        const { container } = renderWithProviders(
          <GlassButton {...variant}>
            Test Button {index + 1}
          </GlassButton>
        );

        const buttonElement = container.firstChild as HTMLElement;
        
        // Test different interaction states
        const states = ['default', 'hover', 'focus', 'active', 'disabled'] as const;
        
        for (const state of states) {
          if (state === 'hover') {
            fireEvent.mouseEnter(buttonElement);
          } else if (state === 'focus') {
            buttonElement.focus();
          } else if (state === 'active') {
            fireEvent.mouseDown(buttonElement);
          } else if (state === 'disabled') {
            buttonElement.setAttribute('disabled', 'true');
          }

          await waitForAnimations(buttonElement);
          
          const snapshot = await visualTester.captureSnapshot(
            buttonElement,
            `glass-button-${variant.variant}-${variant.size}`,
            { state }
          );

          expect(snapshot).toMatchSnapshot(`glass-button-${variant.variant}-${variant.size}-${state}.json`);
        }
      });
    });
  });

  describe('Skeleton Components', () => {
    const skeletonVariants = [
      { variant: 'text', animation: 'pulse', lines: 3 },
      { variant: 'card', animation: 'wave' },
      { variant: 'avatar', animation: 'shimmer' },
      { variant: 'chart', animation: 'pulse' }
    ] as const;

    skeletonVariants.forEach((config) => {
      it(`should render Skeleton ${config.variant} with ${config.animation} animation consistently`, async () => {
        const { container } = renderWithProviders(
          <Skeleton {...config} />
        );

        const skeletonElement = container.firstChild as HTMLElement;
        
        // Let animation run for a few frames
        animationFrame.flush();
        await new Promise(resolve => setTimeout(resolve, 100));
        animationFrame.flush();

        const snapshot = await visualTester.captureSnapshot(
          skeletonElement,
          `skeleton-${config.variant}-${config.animation}`
        );

        expect(snapshot).toMatchSnapshot(`skeleton-${config.variant}-${config.animation}.json`);
      });
    });
  });

  describe('Typography Components', () => {
    it('should render TypewriterText consistently across different speeds', async () => {
      const speeds = [50, 100, 200] as const;
      
      for (const speed of speeds) {
        const { container } = renderWithProviders(
          <TypewriterText text="Visual regression test text" speed={speed} />
        );

        const textElement = container.firstChild as HTMLElement;
        
        // Let typewriter animation run
        animationFrame.flush();
        await new Promise(resolve => setTimeout(resolve, 200));
        animationFrame.flush();

        const snapshot = await visualTester.captureSnapshot(
          textElement,
          `typewriter-text-speed-${speed}`
        );

        expect(snapshot).toMatchSnapshot(`typewriter-text-speed-${speed}.json`);
      }
    });

    it('should render GradientText with different gradient types', async () => {
      const gradients = ['primary', 'secondary', 'rainbow', 'sunset'] as const;
      
      for (const gradient of gradients) {
        const { container } = renderWithProviders(
          <GradientText gradient={gradient}>
            Gradient Text Test
          </GradientText>
        );

        const textElement = container.firstChild as HTMLElement;
        
        const snapshot = await visualTester.captureSnapshot(
          textElement,
          `gradient-text-${gradient}`
        );

        expect(snapshot).toMatchSnapshot(`gradient-text-${gradient}.json`);
      }
    });
  });

  describe('Data Visualization Components', () => {
    it('should render AnimatedProgressBar at different progress values', async () => {
      const progressValues = [0, 25, 50, 75, 100] as const;
      
      for (const progress of progressValues) {
        const { container } = renderWithProviders(
          <AnimatedProgressBar 
            progress={progress} 
            label={`Progress: ${progress}%`}
            color="primary"
          />
        );

        const progressElement = container.firstChild as HTMLElement;
        
        // Let animation complete
        await waitForAnimations(progressElement);
        
        const snapshot = await visualTester.captureSnapshot(
          progressElement,
          `progress-bar-${progress}`
        );

        expect(snapshot).toMatchSnapshot(`progress-bar-${progress}.json`);
      }
    });

    it('should render AnimatedProgressRing with different sizes and colors', async () => {
      const configurations = [
        { size: 'sm', color: 'primary', progress: 75 },
        { size: 'md', color: 'secondary', progress: 50 },
        { size: 'lg', color: 'accent', progress: 90 }
      ] as const;
      
      for (const config of configurations) {
        const { container } = renderWithProviders(
          <AnimatedProgressRing {...config} />
        );

        const ringElement = container.firstChild as HTMLElement;
        
        await waitForAnimations(ringElement);
        
        const snapshot = await visualTester.captureSnapshot(
          ringElement,
          `progress-ring-${config.size}-${config.color}`
        );

        expect(snapshot).toMatchSnapshot(`progress-ring-${config.size}-${config.color}.json`);
      }
    });
  });

  describe('Layout Components', () => {
    it('should render ResponsiveGrid consistently across viewports', async () => {
      const viewports: ViewportName[] = ['mobile', 'tablet', 'desktop', 'wide'];
      
      for (const viewport of viewports) {
        const { container } = renderWithProviders(
          <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3, wide: 4 }} gap="md">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="bg-blue-100 p-4 rounded">
                Grid Item {i + 1}
              </div>
            ))}
          </ResponsiveGrid>,
          { viewport }
        );

        const gridElement = container.firstChild as HTMLElement;
        
        const snapshot = await visualTester.captureSnapshot(
          gridElement,
          `responsive-grid`,
          { viewport }
        );

        expect(snapshot).toMatchSnapshot(`responsive-grid-${viewport}.json`);
      }
    });

    it('should render MasonryGrid with different item heights', async () => {
      const { container } = renderWithProviders(
        <MasonryGrid columns={3} gap="md">
          {Array.from({ length: 9 }, (_, i) => (
            <div 
              key={i} 
              className="bg-green-100 p-4 rounded"
              style={{ height: `${100 + (i % 3) * 50}px` }}
            >
              Masonry Item {i + 1}
            </div>
          ))}
        </MasonryGrid>
      );

      const masonryElement = container.firstChild as HTMLElement;
      
      const snapshot = await visualTester.captureSnapshot(
        masonryElement,
        'masonry-grid'
      );

      expect(snapshot).toMatchSnapshot('masonry-grid.json');
    });
  });

  describe('Form Components', () => {
    it('should render FloatingLabelInput in different states', async () => {
      const states = ['empty', 'filled', 'focused', 'error'] as const;
      
      for (const state of states) {
        const props = {
          label: 'Test Input',
          ...(state === 'filled' && { value: 'Test value' }),
          ...(state === 'error' && { error: 'Test error message' })
        };

        const { container } = renderWithProviders(
          <FloatingLabelInput {...props} />
        );

        const inputContainer = container.firstChild as HTMLElement;
        const input = inputContainer.querySelector('input') as HTMLInputElement;
        
        if (state === 'focused') {
          input.focus();
          await waitForAnimations(inputContainer);
        }
        
        const snapshot = await visualTester.captureSnapshot(
          inputContainer,
          `floating-label-input`,
          { state }
        );

        expect(snapshot).toMatchSnapshot(`floating-label-input-${state}.json`);
      }
    });
  });

  describe('Cross-Browser Compatibility', () => {
    const browsers: BrowserName[] = ['chrome', 'firefox', 'safari', 'edge'];
    
    browsers.forEach(browser => {
      it(`should render components consistently in ${browser}`, async () => {
        setBrowserEnvironment(browser);
        
        const { container } = renderWithProviders(
          <div className="space-y-4">
            <GlassCard blur="md" opacity={0.15}>
              <div className="p-4">Cross-browser test</div>
            </GlassCard>
            <GlassButton variant="primary">Test Button</GlassButton>
            <AnimatedProgressBar progress={75} label="Progress" />
          </div>
        );

        const testContainer = container.firstChild as HTMLElement;
        
        const snapshot = await visualTester.captureSnapshot(
          testContainer,
          `cross-browser-${browser}`
        );

        expect(snapshot).toMatchSnapshot(`cross-browser-${browser}.json`);
      });
    });
  });

  describe('Accessibility Visual States', () => {
    it('should render components correctly with reduced motion', async () => {
      const { container } = renderWithProviders(
        <div className="space-y-4">
          <TypewriterText text="Reduced motion test" speed={100} />
          <AnimatedProgressBar progress={50} label="Progress" />
          <GlassButton variant="primary">Accessible Button</GlassButton>
        </div>,
        { reducedMotion: true }
      );

      const testContainer = container.firstChild as HTMLElement;
      
      const snapshot = await visualTester.captureSnapshot(
        testContainer,
        'reduced-motion'
      );

      expect(snapshot).toMatchSnapshot('reduced-motion.json');
    });

    it('should render components correctly in high contrast mode', async () => {
      const { container } = renderWithProviders(
        <div className="space-y-4">
          <GlassCard blur="md" opacity={0.15}>
            <div className="p-4">High contrast test</div>
          </GlassCard>
          <GlassButton variant="primary">High Contrast Button</GlassButton>
          <FloatingLabelInput label="High Contrast Input" />
        </div>,
        { theme: 'highContrast', highContrast: true }
      );

      const testContainer = container.firstChild as HTMLElement;
      
      const snapshot = await visualTester.captureSnapshot(
        testContainer,
        'high-contrast'
      );

      expect(snapshot).toMatchSnapshot('high-contrast.json');
    });
  });

  describe('Performance Visual States', () => {
    it('should render components with performance optimizations', async () => {
      // Mock low-end device
      Object.defineProperty(navigator, 'hardwareConcurrency', { value: 2 });
      Object.defineProperty(navigator, 'deviceMemory', { value: 2 });
      
      const { container } = renderWithProviders(
        <div className="space-y-4">
          <ParticleEngine 
            particleCount={10} // Reduced for low-end device
            interactionRadius={50}
            theme="magical"
            responsive={true}
          />
          <Avatar3D 
            character={{ primaryColor: '#3b82f6' }}
            interactive={false} // Reduced interactivity
            lighting="ambient"
          />
        </div>
      );

      const testContainer = container.firstChild as HTMLElement;
      
      // Let components initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const snapshot = await visualTester.captureSnapshot(
        testContainer,
        'performance-optimized'
      );

      expect(snapshot).toMatchSnapshot('performance-optimized.json');
    });
  });

  describe('Modal and Overlay Components', () => {
    it('should render GlassModal with backdrop blur', async () => {
      const { container } = renderWithProviders(
        <GlassModal isOpen={true} onClose={() => {}}>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Modal Title</h2>
            <p>Modal content for visual regression testing.</p>
            <div className="mt-4 flex gap-2">
              <GlassButton variant="primary">Confirm</GlassButton>
              <GlassButton variant="secondary">Cancel</GlassButton>
            </div>
          </div>
        </GlassModal>
      );

      // Modal should be in document body
      const modalElement = document.body.querySelector('[role="dialog"]') as HTMLElement;
      expect(modalElement).toBeTruthy();
      
      await waitForAnimations(modalElement);
      
      const snapshot = await visualTester.captureSnapshot(
        modalElement,
        'glass-modal'
      );

      expect(snapshot).toMatchSnapshot('glass-modal.json');
    });
  });
});

// Integration tests for component combinations
describe('Component Integration Visual Tests', () => {
  let visualTester: VisualRegressionTester;

  beforeEach(() => {
    visualTester = new VisualRegressionTester();
  });

  it('should render complex component combinations consistently', async () => {
    const { container } = renderWithProviders(
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <GradientText gradient="primary" className="text-4xl font-bold">
              Modern UI Showcase
            </GradientText>
            <TypewriterText 
              text="Experience the future of user interfaces" 
              speed={100}
              className="text-lg text-gray-600"
            />
          </div>

          {/* Cards Grid */}
          <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="lg">
            <GlassCard blur="md" opacity={0.15} interactive>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">Progress Tracking</h3>
                <AnimatedProgressBar progress={75} label="Overall Progress" />
                <AnimatedProgressRing size="sm" progress={60} color="accent" />
              </div>
            </GlassCard>

            <GlassCard blur="lg" opacity={0.2} interactive>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">User Input</h3>
                <FloatingLabelInput label="Username" />
                <FloatingLabelInput label="Email" type="email" />
                <GlassButton variant="primary" className="w-full">
                  Submit
                </GlassButton>
              </div>
            </GlassCard>

            <GlassCard blur="xl" opacity={0.25} interactive>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">Loading States</h3>
                <Skeleton variant="text" lines={3} animation="shimmer" />
                <Skeleton variant="avatar" animation="pulse" />
              </div>
            </GlassCard>
          </ResponsiveGrid>

          {/* Masonry Layout */}
          <MasonryGrid columns={4} gap="md">
            {Array.from({ length: 8 }, (_, i) => (
              <GlassCard key={i} blur="sm" opacity={0.1} interactive>
                <div 
                  className="p-4"
                  style={{ height: `${120 + (i % 3) * 40}px` }}
                >
                  <h4 className="font-medium mb-2">Card {i + 1}</h4>
                  <p className="text-sm text-gray-600">
                    Dynamic height content for masonry layout testing.
                  </p>
                </div>
              </GlassCard>
            ))}
          </MasonryGrid>
        </div>
      </div>
    );

    const showcaseElement = container.firstChild as HTMLElement;
    
    // Let all animations settle
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const snapshot = await visualTester.captureSnapshot(
      showcaseElement,
      'modern-ui-showcase'
    );

    expect(snapshot).toMatchSnapshot('modern-ui-showcase.json');
  });
});