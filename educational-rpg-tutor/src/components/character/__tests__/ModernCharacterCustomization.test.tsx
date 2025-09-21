import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ModernCharacterCustomization } from '../ModernCharacterCustomization';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { AnimationProvider } from '../../../contexts/AnimationContext';
import type { Character } from '../../../types/character';

// Mock hooks
vi.mock('../../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => false
}));

vi.mock('../../../hooks/useContextualSounds', () => ({
  useContextualSounds: () => ({
    playSound: vi.fn()
  })
}));

// Mock 3D components
vi.mock('../3d/Avatar3D', () => ({
  default: ({ character }: { character: Character }) => (
    <div data-testid="avatar-3d">3D Avatar for {character.name}</div>
  )
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const mockCharacter: Character = {
  id: 'test-character',
  userId: 'test-user',
  name: 'Test Hero',
  level: 5,
  totalXP: 1000,
  currentXP: 250,
  avatarConfig: {
    hairStyle: 'short',
    hairColor: 'brown',
    skinTone: 'medium',
    eyeColor: 'brown',
    outfit: 'casual',
    accessories: ['glasses']
  },
  stats: {
    intelligence: 10,
    vitality: 8,
    wisdom: 12,
    charisma: 6,
    dexterity: 9,
    creativity: 11,
    availablePoints: 3
  },
  equippedItems: [],
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

describe('ModernCharacterCustomization', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modern character customization interface', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomization
          character={mockCharacter}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Customize Your Character')).toBeInTheDocument();
    expect(screen.getByText('Create your unique avatar with modern styling options')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Test Hero')).toBeInTheDocument();
  });

  it('displays all customization tabs with modern styling', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomization
          character={mockCharacter}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const expectedTabs = ['Hair Style', 'Hair Color', 'Skin Tone', 'Eye Color', 'Outfit', 'Accessories'];
    expectedTabs.forEach(tab => {
      const tabElements = screen.getAllByText(tab);
      expect(tabElements.length).toBeGreaterThan(0);
    });
  });

  it('allows switching between 2D and 3D preview modes', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomization
          character={mockCharacter}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const threeDButton = screen.getByText('3D');
    const twoDButton = screen.getByText('2D');

    expect(threeDButton).toBeInTheDocument();
    expect(twoDButton).toBeInTheDocument();

    // Should start in 3D mode - check for canvas instead
    expect(screen.getByTestId('avatar-3d-canvas')).toBeInTheDocument();

    // Switch to 2D mode
    fireEvent.click(twoDButton);
    expect(screen.queryByTestId('avatar-3d-canvas')).not.toBeInTheDocument();
  });

  it('allows switching between customization tabs with smooth transitions', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomization
          character={mockCharacter}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    // Click on Hair Color tab
    fireEvent.click(screen.getByText('Hair Color'));
    
    // Should show hair color options
    expect(screen.getByText('Brown')).toBeInTheDocument();
    expect(screen.getByText('Black')).toBeInTheDocument();
    expect(screen.getByText('Blonde')).toBeInTheDocument();
  });

  it('updates avatar configuration when options are selected', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomization
          character={mockCharacter}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    // Switch to Hair Color tab
    fireEvent.click(screen.getByText('Hair Color'));
    
    // Select blonde hair
    fireEvent.click(screen.getByText('Blonde'));
    
    // The selection should be visually indicated (component internal state)
    // We can't directly test state, but we can test the save functionality
    fireEvent.click(screen.getByText('Save Changes'));
    
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        hairColor: 'blonde'
      })
    );
  });

  it('handles accessory selection correctly with multiple selections', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomization
          character={mockCharacter}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    // Switch to Accessories tab
    fireEvent.click(screen.getByText('Accessories'));
    
    // Select hat (glasses should already be selected)
    fireEvent.click(screen.getByText('Hat'));
    
    fireEvent.click(screen.getByText('Save Changes'));
    
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        accessories: expect.arrayContaining(['glasses', 'hat'])
      })
    );
  });

  it('shows enhanced option descriptions on hover', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomization
          character={mockCharacter}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    // Should show descriptions for hair styles (default tab)
    expect(screen.getByText('Clean and professional')).toBeInTheDocument();
    expect(screen.getByText('Flowing and elegant')).toBeInTheDocument();
  });

  it('calls onSave with updated avatar configuration', async () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomization
          character={mockCharacter}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Save Changes'));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(mockCharacter.avatarConfig);
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomization
          character={mockCharacter}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables buttons and shows loading state when saving', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomization
          character={mockCharacter}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isLoading={true}
        />
      </TestWrapper>
    );

    const saveButton = screen.getByText('Save Changes');
    const cancelButton = screen.getByText('Cancel');
    
    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('displays character stats and specialization in preview', () => {
    const characterWithSpecialization = {
      ...mockCharacter,
      specialization: 'scholar' as const
    };

    render(
      <TestWrapper>
        <ModernCharacterCustomization
          character={characterWithSpecialization}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Level 5')).toBeInTheDocument();
    expect(screen.getByText('scholar')).toBeInTheDocument();
  });

  it('handles save errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockOnSave.mockRejectedValue(new Error('Save failed'));

    render(
      <TestWrapper>
        <ModernCharacterCustomization
          character={mockCharacter}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Save Changes'));
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save avatar configuration:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('maintains existing functionality while adding modern UI enhancements', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomization
          character={mockCharacter}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    // All original customization options should still be available
    const expectedOptions = [
      'Hair Style', 'Hair Color', 'Skin Tone', 
      'Eye Color', 'Outfit', 'Accessories'
    ];

    expectedOptions.forEach(option => {
      const elements = screen.getAllByText(option);
      expect(elements.length).toBeGreaterThan(0);
    });

    // Original functionality should work
    fireEvent.click(screen.getByText('Save Changes'));
    expect(mockOnSave).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('provides smooth transitions between customization options', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomization
          character={mockCharacter}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    // Test tab transitions
    const hairColorTabs = screen.getAllByText('Hair Color');
    const outfitTabs = screen.getAllByText('Outfit');
    const accessoryTabs = screen.getAllByText('Accessories');

    fireEvent.click(hairColorTabs[0]);
    fireEvent.click(outfitTabs[0]);
    fireEvent.click(accessoryTabs[0]);

    // Should not crash and should maintain functionality
    expect(screen.getAllByText('Accessories').length).toBeGreaterThan(0);
  });
});