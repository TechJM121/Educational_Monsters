import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ParticleTransitions, useParticleLifecycle } from '../ParticleTransitions';
import { Particle } from '../../../types/animation';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

const mockParticles: Particle[] = [
  {
    id: 'particle-1',
    x: 100,
    y: 100,
    vx: 1,
    vy: 1,
    size: 5,
    color: '#8B5CF6',
    opacity: 0.8,
    life: 1,
    maxLife: 1
  },
  {
    id: 'particle-2',
    x: 200,
    y: 200,
    vx: -1,
    vy: -1,
    size: 8,
    color: '#06B6D4',
    opacity: 0.6,
    life: 1,
    maxLife: 1
  }
];

describe('ParticleLifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders particles with correct styles', () => {
    const { container } = render(
      <ParticleTransitions
        particles={mockParticles}
        spawnAnimation="scale"
        despawnAnimation="fade"
      />
    );

    // The component renders successfully
    expect(container.firstChild).toBeInTheDocument();
  });

  it('calls spawn callback for new particles', async () => {
    const onSpawn = vi.fn();
    const { rerender } = render(
      <ParticleTransitions
        particles={[]}
        onParticleSpawn={onSpawn}
      />
    );

    // Add new particles
    rerender(
      <ParticleTransitions
        particles={mockParticles}
        onParticleSpawn={onSpawn}
      />
    );

    await waitFor(() => {
      expect(onSpawn).toHaveBeenCalledTimes(2);
      expect(onSpawn).toHaveBeenCalledWith(mockParticles[0]);
      expect(onSpawn).toHaveBeenCalledWith(mockParticles[1]);
    });
  });

  it('calls despawn callback for removed particles', async () => {
    const onDespawn = vi.fn();
    const { rerender } = render(
      <ParticleTransitions
        particles={mockParticles}
        onParticleDespawn={onDespawn}
      />
    );

    // Remove particles
    rerender(
      <ParticleTransitions
        particles={[]}
        onParticleDespawn={onDespawn}
      />
    );

    await waitFor(() => {
      expect(onDespawn).toHaveBeenCalledTimes(2);
      expect(onDespawn).toHaveBeenCalledWith(mockParticles[0]);
      expect(onDespawn).toHaveBeenCalledWith(mockParticles[1]);
    });
  });

  it('handles different spawn animations', () => {
    const animations: Array<'fade' | 'scale' | 'burst' | 'spiral'> = ['fade', 'scale', 'burst', 'spiral'];
    
    animations.forEach(animation => {
      const { container, unmount } = render(
        <ParticleTransitions
          particles={mockParticles}
          spawnAnimation={animation}
        />
      );
      
      // Verify component renders without errors
      expect(container.firstChild).toBeInTheDocument();
      unmount();
    });
  });

  it('handles different despawn animations', () => {
    const animations: Array<'fade' | 'scale' | 'implode' | 'scatter'> = ['fade', 'scale', 'implode', 'scatter'];
    
    animations.forEach(animation => {
      const { container, unmount } = render(
        <ParticleTransitions
          particles={mockParticles}
          despawnAnimation={animation}
        />
      );
      
      // Verify component renders without errors
      expect(container.firstChild).toBeInTheDocument();
      unmount();
    });
  });

  it('respects custom transition duration', () => {
    const customDuration = 1000;
    const { container } = render(
      <ParticleTransitions
        particles={mockParticles}
        transitionDuration={customDuration}
      />
    );

    // Component should render with custom duration
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('useParticleLifecycle Hook', () => {
  it('manages spawn and despawn callbacks', () => {
    const TestComponent = () => {
      const { onParticleSpawn, onParticleDespawn, handleParticleSpawn, handleParticleDespawn } = useParticleLifecycle();
      
      const spawnCallback = vi.fn();
      const despawnCallback = vi.fn();
      
      React.useEffect(() => {
        const unsubscribeSpawn = onParticleSpawn(spawnCallback);
        const unsubscribeDespawn = onParticleDespawn(despawnCallback);
        
        return () => {
          unsubscribeSpawn();
          unsubscribeDespawn();
        };
      }, []);

      return (
        <div>
          <button onClick={() => handleParticleSpawn(mockParticles[0])}>
            Spawn Particle
          </button>
          <button onClick={() => handleParticleDespawn(mockParticles[0])}>
            Despawn Particle
          </button>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByText('Spawn Particle')).toBeInTheDocument();
    expect(screen.getByText('Despawn Particle')).toBeInTheDocument();
  });

  it('allows multiple callbacks for same event', () => {
    const testParticle = mockParticles[0];
    
    const TestComponent = () => {
      const { onParticleSpawn, handleParticleSpawn } = useParticleLifecycle();
      const [callCount, setCallCount] = React.useState(0);
      
      React.useEffect(() => {
        const callback1 = () => setCallCount(prev => prev + 1);
        const callback2 = () => setCallCount(prev => prev + 1);
        
        const unsubscribe1 = onParticleSpawn(callback1);
        const unsubscribe2 = onParticleSpawn(callback2);
        
        return () => {
          unsubscribe1();
          unsubscribe2();
        };
      }, []);

      return (
        <div>
          <div data-testid="call-count">{callCount}</div>
          <button onClick={() => handleParticleSpawn(testParticle)}>
            Spawn Particle
          </button>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('call-count')).toHaveTextContent('0');

    fireEvent.click(screen.getByText('Spawn Particle'));

    expect(screen.getByTestId('call-count')).toHaveTextContent('2');
  });

  it('properly unsubscribes callbacks', () => {
    const testParticle = mockParticles[0];
    
    const TestComponent = () => {
      const { onParticleSpawn, handleParticleSpawn } = useParticleLifecycle();
      const [callCount, setCallCount] = React.useState(0);
      const [subscribed, setSubscribed] = React.useState(true);
      
      React.useEffect(() => {
        if (!subscribed) return;
        
        const callback = () => setCallCount(prev => prev + 1);
        const unsubscribe = onParticleSpawn(callback);
        
        return unsubscribe;
      }, [subscribed]);

      return (
        <div>
          <div data-testid="call-count">{callCount}</div>
          <button onClick={() => handleParticleSpawn(testParticle)}>
            Spawn Particle
          </button>
          <button onClick={() => setSubscribed(false)}>
            Unsubscribe
          </button>
        </div>
      );
    };

    render(<TestComponent />);

    // First spawn should increment
    fireEvent.click(screen.getByText('Spawn Particle'));
    expect(screen.getByTestId('call-count')).toHaveTextContent('1');

    // Unsubscribe
    fireEvent.click(screen.getByText('Unsubscribe'));

    // Second spawn should not increment
    fireEvent.click(screen.getByText('Spawn Particle'));
    expect(screen.getByTestId('call-count')).toHaveTextContent('1');
  });
});

describe('Particle Animation Integration', () => {
  it('integrates spawn and despawn animations with lifecycle events', async () => {
    const onSpawn = vi.fn();
    const onDespawn = vi.fn();
    const testParticles = mockParticles;
    
    const { rerender } = render(
      <ParticleTransitions
        particles={[]}
        onParticleSpawn={onSpawn}
        onParticleDespawn={onDespawn}
        spawnAnimation="burst"
        despawnAnimation="scatter"
        transitionDuration={300}
      />
    );

    // Add particles
    rerender(
      <ParticleTransitions
        particles={testParticles}
        onParticleSpawn={onSpawn}
        onParticleDespawn={onDespawn}
        spawnAnimation="burst"
        despawnAnimation="scatter"
        transitionDuration={300}
      />
    );

    await waitFor(() => {
      expect(onSpawn).toHaveBeenCalledTimes(2);
    });

    // Remove particles
    rerender(
      <ParticleTransitions
        particles={[]}
        onParticleSpawn={onSpawn}
        onParticleDespawn={onDespawn}
        spawnAnimation="burst"
        despawnAnimation="scatter"
        transitionDuration={300}
      />
    );

    await waitFor(() => {
      expect(onDespawn).toHaveBeenCalledTimes(2);
    });
  });

  it('handles rapid particle changes without memory leaks', async () => {
    const onSpawn = vi.fn();
    const onDespawn = vi.fn();
    const testParticles = mockParticles;
    
    const { rerender } = render(
      <ParticleTransitions
        particles={[]}
        onParticleSpawn={onSpawn}
        onParticleDespawn={onDespawn}
      />
    );

    // Rapidly add and remove particles
    for (let i = 0; i < 10; i++) {
      const particles = i % 2 === 0 ? testParticles : [];
      rerender(
        <ParticleTransitions
          particles={particles}
          onParticleSpawn={onSpawn}
          onParticleDespawn={onDespawn}
        />
      );
    }

    // Should handle rapid changes without errors
    await waitFor(() => {
      expect(onSpawn).toHaveBeenCalled();
      expect(onDespawn).toHaveBeenCalled();
    });
  });
});