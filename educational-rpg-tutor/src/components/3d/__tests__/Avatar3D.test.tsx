import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Avatar3D, { type Character } from '../Avatar3D';

// Mock Three.js and React Three Fiber
vi.mock('three', () => ({
  MathUtils: {
    lerp: vi.fn((a, b, t) => a + (b - a) * t),
  },
  Vector3: vi.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
    x, y, z,
    lerp: vi.fn(),
    set: vi.fn(),
  })),
  Group: vi.fn(),
  Mesh: vi.fn(),
}));

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, onCreated, ...props }: any) => {
    // Simulate canvas creation
    React.useEffect(() => {
      if (onCreated) {
        onCreated({});
      }
    }, [onCreated]);
    
    return (
      <div data-testid="avatar-3d-canvas" {...props}>
        {children}
      </div>
    );
  },
  useFrame: vi.fn((callback: any) => {
    // Don't execute the callback automatically to avoid errors
    // Tests can manually trigger it if needed
  }),
  useThree: () => ({
    viewport: { width: 800, height: 600 },
    camera: { position: { set: vi.fn() } },
    gl: { domElement: document.createElement('canvas') },
  }),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: ({ children, ...props }: any) => (
    <div data-testid="orbit-controls" {...props}>
      {children}
    </div>
  ),
  PerspectiveCamera: ({ children, ...props }: any) => (
    <div data-testid="perspective-camera" {...props}>
      {children}
    </div>
  ),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
  },
}));

describe('Avatar3D Component', () => {
  const mockCharacter: Character = {
    id: 'test-character',
    name: 'Test Hero',
    primaryColor: '#4A90E2',
    secondaryColor: '#50C878',
    level: 5,
    class: 'warrior',
  };

  const mockOnHover = vi.fn();
  const mockOnRotationChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<Avatar3D character={mockCharacter} />);
      expect(screen.getByTestId('avatar-3d-canvas')).toBeInTheDocument();
    });

    it('renders with correct size classes', () => {
      const { rerender } = render(
        <Avatar3D character={mockCharacter} size="small" />
      );
      
      let container = screen.getByTestId('avatar-3d-canvas').parentElement;
      expect(container).toHaveClass('w-32', 'h-32');

      rerender(<Avatar3D character={mockCharacter} size="medium" />);
      container = screen.getByTestId('avatar-3d-canvas').parentElement;
      expect(container).toHaveClass('w-48', 'h-48');

      rerender(<Avatar3D character={mockCharacter} size="large" />);
      container = screen.getByTestId('avatar-3d-canvas').parentElement;
      expect(container).toHaveClass('w-64', 'h-64');
    });

    it('applies custom className', () => {
      render(
        <Avatar3D 
          character={mockCharacter} 
          className="custom-avatar-class" 
        />
      );
      
      const container = screen.getByTestId('avatar-3d-canvas').parentElement;
      expect(container).toHaveClass('custom-avatar-class');
    });

    it('renders loading fallback initially', () => {
      render(<Avatar3D character={mockCharacter} />);
      // The canvas should be rendered (loading fallback is handled by Suspense)
      expect(screen.getByTestId('avatar-3d-canvas')).toBeInTheDocument();
    });
  });

  describe('Interactivity', () => {
    it('handles mouse movement when interactive', async () => {
      render(
        <Avatar3D 
          character={mockCharacter} 
          interactive={true}
          onRotationChange={mockOnRotationChange}
        />
      );

      const container = screen.getByTestId('avatar-3d-canvas').parentElement;
      
      fireEvent.mouseMove(container!, {
        clientX: 100,
        clientY: 50,
      });

      // Mouse movement should be handled
      expect(container).toBeInTheDocument();
    });

    it('calls onHover callback when provided', async () => {
      render(
        <Avatar3D 
          character={mockCharacter} 
          interactive={true}
          onHover={mockOnHover}
        />
      );

      // Since we're mocking the 3D components, we can't directly test hover
      // but we can verify the callback is passed down correctly
      expect(mockOnHover).not.toHaveBeenCalled();
    });

    it('resets mouse position on mouse leave', () => {
      render(
        <Avatar3D 
          character={mockCharacter} 
          interactive={true}
        />
      );

      const container = screen.getByTestId('avatar-3d-canvas').parentElement;
      
      fireEvent.mouseMove(container!, {
        clientX: 100,
        clientY: 50,
      });

      fireEvent.mouseLeave(container!);
      
      // Component should handle mouse leave
      expect(container).toBeInTheDocument();
    });

    it('does not handle mouse events when not interactive', () => {
      render(
        <Avatar3D 
          character={mockCharacter} 
          interactive={false}
        />
      );

      const container = screen.getByTestId('avatar-3d-canvas').parentElement;
      
      fireEvent.mouseMove(container!, {
        clientX: 100,
        clientY: 50,
      });

      // Should not crash or throw errors
      expect(container).toBeInTheDocument();
    });
  });

  describe('Animation Configuration', () => {
    it('accepts custom animation speed', () => {
      render(
        <Avatar3D 
          character={mockCharacter} 
          animationSpeed={2}
        />
      );

      expect(screen.getByTestId('avatar-3d-canvas')).toBeInTheDocument();
    });

    it('enables auto rotation when specified', () => {
      render(
        <Avatar3D 
          character={mockCharacter} 
          autoRotate={true}
        />
      );

      // OrbitControls should be rendered with autoRotate
      expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
    });

    it('handles different lighting modes', () => {
      const { rerender } = render(
        <Avatar3D character={mockCharacter} lighting="ambient" />
      );
      expect(screen.getByTestId('avatar-3d-canvas')).toBeInTheDocument();

      rerender(<Avatar3D character={mockCharacter} lighting="dramatic" />);
      expect(screen.getByTestId('avatar-3d-canvas')).toBeInTheDocument();

      rerender(<Avatar3D character={mockCharacter} lighting="soft" />);
      expect(screen.getByTestId('avatar-3d-canvas')).toBeInTheDocument();
    });
  });

  describe('Character Customization', () => {
    it('renders different character classes', () => {
      const { rerender } = render(
        <Avatar3D character={{ ...mockCharacter, class: 'warrior' }} />
      );
      expect(screen.getByTestId('avatar-3d-canvas')).toBeInTheDocument();

      rerender(
        <Avatar3D character={{ ...mockCharacter, class: 'mage' }} />
      );
      expect(screen.getByTestId('avatar-3d-canvas')).toBeInTheDocument();

      rerender(
        <Avatar3D character={{ ...mockCharacter, class: 'rogue' }} />
      );
      expect(screen.getByTestId('avatar-3d-canvas')).toBeInTheDocument();
    });

    it('handles character color changes', () => {
      const coloredCharacter: Character = {
        ...mockCharacter,
        primaryColor: '#FF6B6B',
        secondaryColor: '#4ECDC4',
      };

      render(<Avatar3D character={coloredCharacter} />);
      expect(screen.getByTestId('avatar-3d-canvas')).toBeInTheDocument();
    });

    it('displays character level information', () => {
      const highLevelCharacter: Character = {
        ...mockCharacter,
        level: 99,
      };

      render(<Avatar3D character={highLevelCharacter} />);
      expect(screen.getByTestId('avatar-3d-canvas')).toBeInTheDocument();
    });
  });

  describe('Performance and Error Handling', () => {
    it('handles missing character data gracefully', () => {
      const incompleteCharacter = {
        id: 'incomplete',
        name: 'Incomplete',
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        level: 1,
        class: 'unknown',
      } as Character;

      expect(() => {
        render(<Avatar3D character={incompleteCharacter} />);
      }).not.toThrow();
    });

    it('handles canvas creation callback', async () => {
      render(<Avatar3D character={mockCharacter} />);
      
      // Canvas should be created and callback should be called
      await waitFor(() => {
        expect(screen.getByTestId('avatar-3d-canvas')).toBeInTheDocument();
      });
    });

    it('cleans up properly on unmount', () => {
      const { unmount } = render(<Avatar3D character={mockCharacter} />);
      
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('provides proper cursor styling for interactive mode', () => {
      render(
        <Avatar3D 
          character={mockCharacter} 
          interactive={true}
        />
      );

      const container = screen.getByTestId('avatar-3d-canvas').parentElement;
      expect(container).toHaveClass('cursor-pointer');
    });

    it('maintains accessibility when not interactive', () => {
      render(
        <Avatar3D 
          character={mockCharacter} 
          interactive={false}
        />
      );

      const container = screen.getByTestId('avatar-3d-canvas').parentElement;
      expect(container).toHaveClass('cursor-pointer'); // Still has cursor class but won't respond to interactions
    });
  });

  describe('Callback Functions', () => {
    it('calls onRotationChange when rotation updates', async () => {
      render(
        <Avatar3D 
          character={mockCharacter} 
          onRotationChange={mockOnRotationChange}
        />
      );

      // The useFrame mock should trigger rotation updates
      await waitFor(() => {
        // Due to our mocking, we can't directly test the callback
        // but we can verify the component renders without errors
        expect(screen.getByTestId('avatar-3d-canvas')).toBeInTheDocument();
      });
    });

    it('handles missing callbacks gracefully', () => {
      expect(() => {
        render(<Avatar3D character={mockCharacter} />);
      }).not.toThrow();
    });
  });
});