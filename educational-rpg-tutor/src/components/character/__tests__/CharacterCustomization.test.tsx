import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { CharacterCustomization } from '../CharacterCustomization';
import type { Character } from '../../../types/character';

const mockCharacter: Character = {
  id: '1',
  userId: 'user1',
  name: 'Test Hero',
  level: 5,
  totalXP: 1000,
  currentXP: 200,
  avatarConfig: {
    hairStyle: 'short',
    hairColor: 'brown',
    skinTone: 'medium',
    eyeColor: 'brown',
    outfit: 'casual',
    accessories: []
  },
  stats: {
    intelligence: 15,
    vitality: 12,
    wisdom: 10,
    charisma: 14,
    dexterity: 11,
    creativity: 13,
    availablePoints: 0
  },
  specialization: 'scholar',
  equippedItems: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('CharacterCustomization', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders character customization interface', () => {
    render(
      <CharacterCustomization
        character={mockCharacter}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Customize Your Character')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Test Hero')).toBeInTheDocument();
  });

  it('displays all customization tabs', () => {
    render(
      <CharacterCustomization
        character={mockCharacter}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Check for tab buttons specifically
    expect(screen.getByRole('button', { name: /Hair Style/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hair Color/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Skin Tone/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Eye Color/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Outfit/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Accessories/ })).toBeInTheDocument();
  });

  it('allows switching between customization tabs', () => {
    render(
      <CharacterCustomization
        character={mockCharacter}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Click on Hair Color tab
    fireEvent.click(screen.getByRole('button', { name: /Hair Color/ }));
    
    // Should show hair color options
    expect(screen.getByText('Brown')).toBeInTheDocument();
    expect(screen.getByText('Black')).toBeInTheDocument();
    expect(screen.getByText('Blonde')).toBeInTheDocument();
  });

  it('updates avatar configuration when options are selected', () => {
    render(
      <CharacterCustomization
        character={mockCharacter}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Switch to hair color tab and select a different color
    fireEvent.click(screen.getByRole('button', { name: /Hair Color/ }));
    fireEvent.click(screen.getByText('Blonde'));

    // The selection should be visually indicated (tested through class changes)
    const blondeOption = screen.getByText('Blonde').closest('button');
    expect(blondeOption).toHaveClass('border-primary-500');
  });

  it('handles accessory selection correctly', () => {
    render(
      <CharacterCustomization
        character={mockCharacter}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Switch to accessories tab
    fireEvent.click(screen.getByRole('button', { name: /Accessories/ }));
    
    // Select glasses
    fireEvent.click(screen.getByText('Glasses'));
    
    // Select hat (should allow multiple accessories)
    fireEvent.click(screen.getByText('Hat'));
    
    // Both should be selected
    const glassesOption = screen.getByText('Glasses').closest('button');
    const hatOption = screen.getByText('Hat').closest('button');
    
    expect(glassesOption).toHaveClass('border-primary-500');
    expect(hatOption).toHaveClass('border-primary-500');
  });

  it('calls onSave with updated avatar configuration', async () => {
    render(
      <CharacterCustomization
        character={mockCharacter}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Make some changes
    fireEvent.click(screen.getByRole('button', { name: /Hair Color/ }));
    fireEvent.click(screen.getByText('Blonde'));

    // Save changes
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockCharacter.avatarConfig,
        hairColor: 'blonde'
      });
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <CharacterCustomization
        character={mockCharacter}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables buttons when loading', () => {
    render(
      <CharacterCustomization
        character={mockCharacter}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    const saveButton = screen.getByText('Save Changes');
    const cancelButton = screen.getByText('Cancel');

    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('shows loading spinner when saving', () => {
    render(
      <CharacterCustomization
        character={mockCharacter}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    // Should show loading spinner in save button
    const saveButton = screen.getByText('Save Changes');
    expect(saveButton.querySelector('.animate-spin')).toBeInTheDocument();
  });
});