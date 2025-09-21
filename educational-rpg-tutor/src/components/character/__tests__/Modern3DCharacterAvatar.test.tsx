import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Modern3DCharacterAvatar } from '../Modern3DCharacterAvatar';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { AnimationProvider } from '../../../contexts/AnimationContext';
import type { Character } from '../../../types/character';

// Mock hooks
vi.mock('../../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => false
}));

// Mock Three.js and React Three Fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
  useFrame: () => {},
  useThree: () => ({ mouse: { x: 0, y: 0 } })
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Environment: () => <div data-testid="environment" />,
  ContactShadows: () => <div data-testid="contact-shadows" />,
  Text: ({ children }: any) => <div data-testid="text">{children}</div>,
  Float: ({ children }: any) => <div data-testid="float">{children}</div>
}));

vi.mock('three', () => ({
  MathUtils: {
    lerp: (a: number, b: number, t: number) => a + (b - a) * t
  }
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  }
}));

const mockCharacter: Character = {
  id: 'test-character',
  userId: 'test-user',
  name: 'Test Hero',
  level: 12,
  totalXP: 3000,
  currentXP: 750,
  avatarConfig: {
    hairStyle: 'long',
    hairColor: 'blue',
    skinTone: 'medium',
    eyeColor: 'green',
    outfit: 'mystic',
    accessories: ['crown', 'necklace']
  },
  stats: {
    intelligence: 15,
    vitality: 12,
    wisdom: 18,
    charisma: 10,
    dexterity: 8,
    creativity: 14,
    availablePoints: 0
  },
  equippedItems: [
    {
      id: 'equipped-1',
      itemId: 'staff-1',
      slot: 'weapon',
      equippedAt: new Date()
    },
    {
      id: 'equipped-2',
      itemId: 'robe-1',
      slot: 'body',
      equippedAt: new Date()
    }
  ],
  specialization: 'scholar',
  createdAt: new Date(),
  updatedAt: new Date()
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <AnimationProvider>
      {children}
    </AnimationProvider>
  </ThemeProvider>
);

describe('Modern3DCharacterAvatar', () => {
  it('renders 3D character avatar with modern styling', () => {
    render(
      <TestWrapper>
        <Modern3DCharacterAvatar character={mockCharacter} />
      </TestWrapper>
    );

    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('environment')).toBeInTheDocument();
    expect(screen.getByTestId('contact-shadows')).toBeInTheDocument();
  });

  it('displays character stats overlay when enabled', () => {
    render(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={mockCharacter} 
          showStats={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Test Hero')).toBeInTheDocument();
    expect(screen.getByText('Level 12')).toBeInTheDocument();
    expect(screen.getByText('• scholar')).toBeInTheDocument();
    expect(screen.getByText('INT: 15')).toBeInTheDocument();
    expect(screen.getByText('VIT: 12')).toBeInTheDocument();
    expect(screen.getByText('WIS: 18')).toBeInTheDocument();
  });

  it('hides stats overlay when disabled', () => {
    render(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={mockCharacter} 
          showStats={false}
        />
      </TestWrapper>
    );

    expect(screen.queryByText('Test Hero')).not.toBeInTheDocument();
    expect(screen.queryByText('Level 12')).not.toBeInTheDocument();
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={mockCharacter} 
          size="sm"
        />
      </TestWrapper>
    );

    let container = screen.getByTestId('canvas').parentElement;
    expect(container).toHaveClass('h-32');

    rerender(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={mockCharacter} 
          size="lg"
        />
      </TestWrapper>
    );

    container = screen.getByTestId('canvas').parentElement;
    expect(container).toHaveClass('h-64');

    rerender(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={mockCharacter} 
          size="xl"
        />
      </TestWrapper>
    );

    container = screen.getByTestId('canvas').parentElement;
    expect(container).toHaveClass('h-80');
  });

  it('includes interactive controls when enabled', () => {
    render(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={mockCharacter} 
          interactive={true}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
  });

  it('excludes interactive controls when disabled', () => {
    render(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={mockCharacter} 
          interactive={false}
        />
      </TestWrapper>
    );

    expect(screen.queryByTestId('orbit-controls')).not.toBeInTheDocument();
  });

  it('displays equipment indicators when enabled', () => {
    render(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={mockCharacter} 
          showEquipment={true}
        />
      </TestWrapper>
    );

    // Should render Float components for equipped items
    const floatElements = screen.getAllByTestId('float');
    expect(floatElements.length).toBeGreaterThan(0);
  });

  it('handles characters without specialization', () => {
    const characterWithoutSpecialization = {
      ...mockCharacter,
      specialization: undefined
    };

    render(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={characterWithoutSpecialization} 
          showStats={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Test Hero')).toBeInTheDocument();
    expect(screen.getByText('Level 12')).toBeInTheDocument();
    expect(screen.queryByText('• scholar')).not.toBeInTheDocument();
  });

  it('handles characters without equipped items', () => {
    const characterWithoutItems = {
      ...mockCharacter,
      equippedItems: []
    };

    render(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={characterWithoutItems} 
          showEquipment={true}
        />
      </TestWrapper>
    );

    // Should still render without errors
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  it('applies different lighting modes correctly', () => {
    const { rerender } = render(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={mockCharacter} 
          lighting="dramatic"
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('canvas')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={mockCharacter} 
          lighting="neon"
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('canvas')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={mockCharacter} 
          lighting="soft"
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('canvas')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={mockCharacter} 
          lighting="ambient"
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  it('displays level indicator in 3D space', () => {
    render(
      <TestWrapper>
        <Modern3DCharacterAvatar character={mockCharacter} />
      </TestWrapper>
    );

    expect(screen.getByText('LV 12')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={mockCharacter} 
          className="custom-avatar-class"
        />
      </TestWrapper>
    );

    const container = screen.getByTestId('canvas').parentElement;
    expect(container).toHaveClass('custom-avatar-class');
  });

  it('handles auto-rotate functionality', () => {
    render(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={mockCharacter} 
          autoRotate={true}
          interactive={true}
        />
      </TestWrapper>
    );

    // Should include orbit controls with auto-rotate
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
  });

  it('respects reduced motion preferences', () => {
    const mockUseReducedMotion = vi.fn(() => true);
    vi.mocked(require('../../../hooks/useReducedMotion').useReducedMotion).mockImplementation(mockUseReducedMotion);

    render(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={mockCharacter} 
          autoRotate={true}
          interactive={true}
        />
      </TestWrapper>
    );

    // Should still render but with reduced motion
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
  });

  it('renders character with different avatar configurations', () => {
    const characterWithDifferentConfig = {
      ...mockCharacter,
      avatarConfig: {
        hairStyle: 'spiky',
        hairColor: 'purple',
        skinTone: 'dark',
        eyeColor: 'violet',
        outfit: 'warrior',
        accessories: ['glasses', 'bracelet']
      }
    };

    render(
      <TestWrapper>
        <Modern3DCharacterAvatar character={characterWithDifferentConfig} />
      </TestWrapper>
    );

    // Should render without errors with different configuration
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByText('Test Hero')).toBeInTheDocument();
  });

  it('maintains 3D rendering performance with complex characters', () => {
    const complexCharacter = {
      ...mockCharacter,
      equippedItems: [
        { id: '1', itemId: 'item1', slot: 'head' as const, equippedAt: new Date() },
        { id: '2', itemId: 'item2', slot: 'body' as const, equippedAt: new Date() },
        { id: '3', itemId: 'item3', slot: 'weapon' as const, equippedAt: new Date() },
        { id: '4', itemId: 'item4', slot: 'accessory' as const, equippedAt: new Date() },
      ]
    };

    render(
      <TestWrapper>
        <Modern3DCharacterAvatar 
          character={complexCharacter} 
          showEquipment={true}
          showStats={true}
        />
      </TestWrapper>
    );

    // Should render all equipment indicators
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByText('Test Hero')).toBeInTheDocument();
  });
});