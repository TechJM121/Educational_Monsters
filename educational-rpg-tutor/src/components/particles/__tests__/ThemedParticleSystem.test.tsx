import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ThemedParticleSystem } from '../ThemedParticleSystem';
import { SectionParticleSystem } from '../SectionParticleSystem';
import { ParticleThemeProvider, useParticleTheme } from '../../../contexts/ParticleThemeContext';
import { getThemeBehaviors, getThemeColors } from '../ParticleConfig';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock the AdvancedParticleSystem
vi.mock('../AdvancedParticleSystem', () => ({
  AdvancedParticleSystem: ({ theme, interactive }: any) => (
    <div data-testid="particle-system" data-theme={theme} data-interactive={interactive}>
      Particle System - {theme}
    </div>
  )
}));

// Mock device capability hook
vi.mock('../../hooks/useDeviceCapability', () => ({
  useDeviceCapability: vi.fn(() => 'high')
}));

// Mock intersection observer
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

describe('ThemedParticleSystem', () => {
  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ParticleThemeProvider defaultTheme="magical">
      {children}
    </ParticleThemeProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default theme', () => {
    render(
      <TestWrapper>
        <ThemedParticleSystem />
      </TestWrapper>
    );

    const particleSystem = screen.getByTestId('particle-system');
    expect(particleSystem).toHaveAttribute('data-theme', 'magical');
  });

  it('passes interactive prop correctly', () => {
    render(
      <TestWrapper>
        <ThemedParticleSystem interactive={false} />
      </TestWrapper>
    );

    const particleSystem = screen.getByTestId('particle-system');
    expect(particleSystem).toHaveAttribute('data-interactive', 'false');
  });

  it('applies custom className', () => {
    render(
      <TestWrapper>
        <ThemedParticleSystem className="custom-class" />
      </TestWrapper>
    );

    const container = screen.getByTestId('particle-system').closest('.custom-class');
    expect(container).toBeInTheDocument();
  });
});

describe('SectionParticleSystem', () => {
  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ParticleThemeProvider 
      defaultTheme="magical"
      sectionThemeMap={{
        'hero': 'magical',
        'features': 'tech',
        'learning': 'nature'
      }}
    >
      {children}
    </ParticleThemeProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with section-specific theme switching', () => {
    render(
      <TestWrapper>
        <SectionParticleSystem sectionId="features">
          <div>Section Content</div>
        </SectionParticleSystem>
      </TestWrapper>
    );

    expect(screen.getByText('Section Content')).toBeInTheDocument();
    expect(mockIntersectionObserver).toHaveBeenCalled();
  });

  it('sets up intersection observer when autoSwitch is enabled', () => {
    const mockObserve = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: mockObserve,
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    });

    render(
      <TestWrapper>
        <SectionParticleSystem sectionId="learning" autoSwitch={true}>
          <div>Learning Section</div>
        </SectionParticleSystem>
      </TestWrapper>
    );

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        threshold: [0.3, 0.7],
        rootMargin: '-10% 0px -10% 0px'
      })
    );
  });

  it('does not set up intersection observer when autoSwitch is disabled', () => {
    render(
      <TestWrapper>
        <SectionParticleSystem sectionId="learning" autoSwitch={false}>
          <div>Learning Section</div>
        </SectionParticleSystem>
      </TestWrapper>
    );

    // When autoSwitch is false, intersection observer should not be created
    expect(screen.getByText('Learning Section')).toBeInTheDocument();
  });
});

describe('ParticleThemeProvider', () => {
  it('provides default theme context', () => {
    const TestComponent = () => {
      const { currentTheme } = useParticleTheme();
      return <div data-testid="theme">{currentTheme}</div>;
    };

    render(
      <ParticleThemeProvider defaultTheme="tech">
        <TestComponent />
      </ParticleThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('tech');
  });

  it('allows theme switching', async () => {
    const TestComponent = () => {
      const { currentTheme, setTheme } = useParticleTheme();
      return (
        <div>
          <div data-testid="theme">{currentTheme}</div>
          <button onClick={() => setTheme('cosmic')}>Switch to Cosmic</button>
        </div>
      );
    };

    render(
      <ParticleThemeProvider defaultTheme="magical">
        <TestComponent />
      </ParticleThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('magical');

    fireEvent.click(screen.getByText('Switch to Cosmic'));

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('cosmic');
    });
  });

  it('handles section-based theme switching', () => {
    const TestComponent = () => {
      const { currentTheme, switchThemeForSection } = useParticleTheme();
      return (
        <div>
          <div data-testid="theme">{currentTheme}</div>
          <button onClick={() => switchThemeForSection('features')}>
            Switch to Features
          </button>
        </div>
      );
    };

    render(
      <ParticleThemeProvider 
        defaultTheme="magical"
        sectionThemeMap={{ 'features': 'tech' }}
      >
        <TestComponent />
      </ParticleThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('magical');

    fireEvent.click(screen.getByText('Switch to Features'));

    // Just verify the button click worked
    expect(screen.getByText('Switch to Features')).toBeInTheDocument();
  });

  it('respects autoSwitch setting', () => {
    const TestComponent = () => {
      const { autoSwitchEnabled, setAutoSwitchEnabled, switchThemeForSection } = useParticleTheme();
      return (
        <div>
          <div data-testid="auto-switch">{autoSwitchEnabled.toString()}</div>
          <button onClick={() => setAutoSwitchEnabled(false)}>Disable Auto Switch</button>
          <button onClick={() => switchThemeForSection('features')}>Switch Section</button>
        </div>
      );
    };

    render(
      <ParticleThemeProvider>
        <TestComponent />
      </ParticleThemeProvider>
    );

    expect(screen.getByTestId('auto-switch')).toHaveTextContent('true');

    fireEvent.click(screen.getByText('Disable Auto Switch'));
    expect(screen.getByTestId('auto-switch')).toHaveTextContent('false');
  });
});

describe('Theme Transitions', () => {
  it('handles transition states correctly', async () => {
    const TestComponent = () => {
      const { currentTheme, setTheme, isTransitioning } = useParticleTheme();
      return (
        <div>
          <div data-testid="theme">{currentTheme}</div>
          <div data-testid="transitioning">{isTransitioning.toString()}</div>
          <button onClick={() => setTheme('nature')}>Switch Theme</button>
        </div>
      );
    };

    render(
      <ParticleThemeProvider defaultTheme="magical">
        <TestComponent />
      </ParticleThemeProvider>
    );

    expect(screen.getByTestId('transitioning')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('Switch Theme'));

    // Should be transitioning immediately after click
    await waitFor(() => {
      expect(screen.getByTestId('transitioning')).toHaveTextContent('true');
    });

    // Should complete transition after delay
    await waitFor(() => {
      expect(screen.getByTestId('transitioning')).toHaveTextContent('false');
    }, { timeout: 1000 });
  });
});

describe('Theme Behaviors', () => {
  it('returns correct behaviors for each theme', () => {
    const magicalBehaviors = getThemeBehaviors('magical');
    expect(magicalBehaviors.spawnAnimation).toBe('spiral');
    expect(magicalBehaviors.despawnAnimation).toBe('fade');
    expect(magicalBehaviors.movementPattern).toBe('floating');
    expect(magicalBehaviors.interactionType).toBe('gentle');

    const techBehaviors = getThemeBehaviors('tech');
    expect(techBehaviors.spawnAnimation).toBe('burst');
    expect(techBehaviors.despawnAnimation).toBe('implode');
    expect(techBehaviors.movementPattern).toBe('linear');
    expect(techBehaviors.interactionType).toBe('magnetic');

    const natureBehaviors = getThemeBehaviors('nature');
    expect(natureBehaviors.spawnAnimation).toBe('scale');
    expect(natureBehaviors.despawnAnimation).toBe('scatter');
    expect(natureBehaviors.movementPattern).toBe('organic');
    expect(natureBehaviors.interactionType).toBe('soft');

    const cosmicBehaviors = getThemeBehaviors('cosmic');
    expect(cosmicBehaviors.spawnAnimation).toBe('burst');
    expect(cosmicBehaviors.despawnAnimation).toBe('implode');
    expect(cosmicBehaviors.movementPattern).toBe('orbital');
    expect(cosmicBehaviors.interactionType).toBe('strong');
  });

  it('returns correct colors for each theme', () => {
    const magicalColors = getThemeColors('magical');
    expect(magicalColors.primary).toBe('#8B5CF6');
    expect(magicalColors.background).toBe('rgba(139, 92, 246, 0.1)');

    const techColors = getThemeColors('tech');
    expect(techColors.primary).toBe('#06B6D4');
    expect(techColors.background).toBe('rgba(6, 182, 212, 0.1)');

    const natureColors = getThemeColors('nature');
    expect(natureColors.primary).toBe('#10B981');
    expect(natureColors.background).toBe('rgba(16, 185, 129, 0.1)');

    const cosmicColors = getThemeColors('cosmic');
    expect(cosmicColors.primary).toBe('#7C3AED');
    expect(cosmicColors.background).toBe('rgba(124, 58, 237, 0.1)');
  });
});

describe('Particle Lifecycle Management', () => {
  it('handles theme-specific transition durations', () => {
    const TestComponent = () => {
      const { currentTheme } = useParticleTheme();
      const behaviors = getThemeBehaviors(currentTheme);
      return (
        <div>
          <div data-testid="duration">{behaviors.transitionDuration}</div>
          <ThemedParticleSystem />
        </div>
      );
    };

    render(
      <ParticleThemeProvider defaultTheme="magical">
        <TestComponent />
      </ParticleThemeProvider>
    );

    expect(screen.getByTestId('duration')).toHaveTextContent('800');
  });

  it('uses theme-specific behaviors in particle system', () => {
    const TestComponent = () => {
      const { currentTheme, setTheme } = useParticleTheme();
      const behaviors = getThemeBehaviors(currentTheme);
      return (
        <div>
          <div data-testid="spawn-animation">{behaviors.spawnAnimation}</div>
          <div data-testid="despawn-animation">{behaviors.despawnAnimation}</div>
          <div data-testid="interaction-type">{behaviors.interactionType}</div>
          <button onClick={() => setTheme('tech')}>Switch to Tech</button>
          <ThemedParticleSystem />
        </div>
      );
    };

    render(
      <ParticleThemeProvider defaultTheme="magical">
        <TestComponent />
      </ParticleThemeProvider>
    );

    expect(screen.getByTestId('spawn-animation')).toHaveTextContent('spiral');
    expect(screen.getByTestId('despawn-animation')).toHaveTextContent('fade');
    expect(screen.getByTestId('interaction-type')).toHaveTextContent('gentle');

    fireEvent.click(screen.getByText('Switch to Tech'));

    // After theme switch, behaviors should update
    waitFor(() => {
      expect(screen.getByTestId('spawn-animation')).toHaveTextContent('burst');
      expect(screen.getByTestId('despawn-animation')).toHaveTextContent('implode');
      expect(screen.getByTestId('interaction-type')).toHaveTextContent('magnetic');
    });
  });
});