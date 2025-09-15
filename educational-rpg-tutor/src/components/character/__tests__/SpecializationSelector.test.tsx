import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { SpecializationSelector } from '../SpecializationSelector';
import type { Character } from '../../../types/character';

const mockCharacter: Character = {
  id: '1',
  userId: 'user1',
  name: 'Test Hero',
  level: 15,
  totalXP: 5000,
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
    intelligence: 30,
    vitality: 20,
    wisdom: 15,
    charisma: 25,
    dexterity: 28,
    creativity: 22,
    availablePoints: 0
  },
  specialization: undefined,
  equippedItems: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('SpecializationSelector', () => {
  const mockOnSelect = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders specialization selector interface', () => {
    render(
      <SpecializationSelector
        character={mockCharacter}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Choose Your Specialization')).toBeInTheDocument();
    expect(screen.getByText('Specializations provide unique bonuses and unlock special abilities')).toBeInTheDocument();
  });

  it('displays all specialization options', () => {
    render(
      <SpecializationSelector
        character={mockCharacter}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Scholar')).toBeInTheDocument();
    expect(screen.getByText('Explorer')).toBeInTheDocument();
    expect(screen.getByText('Guardian')).toBeInTheDocument();
    expect(screen.getByText('Artist')).toBeInTheDocument();
    expect(screen.getByText('Diplomat')).toBeInTheDocument();
    expect(screen.getByText('Inventor')).toBeInTheDocument();
  });

  it('shows unlocked specializations based on character stats', () => {
    render(
      <SpecializationSelector
        character={mockCharacter}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    // Scholar should be unlocked (Intelligence >= 25)
    const scholarCard = screen.getByText('Scholar').closest('.bg-slate-700');
    expect(scholarCard).not.toHaveClass('opacity-60');

    // Explorer should be unlocked (Dexterity >= 25)
    const explorerCard = screen.getByText('Explorer').closest('.bg-slate-700');
    expect(explorerCard).not.toHaveClass('opacity-60');

    // Diplomat should be unlocked (Charisma >= 25)
    const diplomatCard = screen.getByText('Diplomat').closest('.bg-slate-700');
    expect(diplomatCard).not.toHaveClass('opacity-60');
  });

  it('shows locked specializations when requirements not met', () => {
    const lowLevelCharacter = {
      ...mockCharacter,
      level: 5,
      stats: {
        ...mockCharacter.stats,
        intelligence: 15,
        dexterity: 15,
        charisma: 15
      }
    };

    render(
      <SpecializationSelector
        character={lowLevelCharacter}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    // All specializations should be locked due to low level and stats
    const lockedOverlays = screen.getAllByText('Locked');
    expect(lockedOverlays.length).toBeGreaterThan(0);
  });

  it('allows selecting an unlocked specialization', () => {
    render(
      <SpecializationSelector
        character={mockCharacter}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    // Click on Scholar specialization
    const scholarCard = screen.getByText('Scholar').closest('.bg-slate-700');
    fireEvent.click(scholarCard!);

    // Should be visually selected
    expect(scholarCard).toHaveClass('border-primary-500');
  });

  it('prevents selecting locked specializations', () => {
    const lowStatCharacter = {
      ...mockCharacter,
      stats: {
        ...mockCharacter.stats,
        intelligence: 15,
        dexterity: 15,
        charisma: 15,
        vitality: 15,
        creativity: 15
      }
    };

    render(
      <SpecializationSelector
        character={lowStatCharacter}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    // Try to click on a locked specialization
    const scholarCard = screen.getByText('Scholar').closest('.bg-slate-700');
    fireEvent.click(scholarCard!);

    // Should not be selected (no primary border color)
    expect(scholarCard).not.toHaveClass('border-primary-500');
  });

  it('shows current specialization badge', () => {
    const characterWithSpec = {
      ...mockCharacter,
      specialization: 'scholar' as const
    };

    render(
      <SpecializationSelector
        character={characterWithSpec}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('calls onSelect with chosen specialization', async () => {
    render(
      <SpecializationSelector
        character={mockCharacter}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    // Select Scholar
    const scholarCard = screen.getByText('Scholar').closest('.bg-slate-700');
    fireEvent.click(scholarCard!);

    // Click select button
    fireEvent.click(screen.getByText('Select Specialization'));

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith('scholar');
    });
  });

  it('shows change specialization button for characters with existing specialization', () => {
    const characterWithSpec = {
      ...mockCharacter,
      specialization: 'scholar' as const
    };

    render(
      <SpecializationSelector
        character={characterWithSpec}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Change Specialization')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <SpecializationSelector
        character={mockCharacter}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables select button when no specialization is chosen', () => {
    render(
      <SpecializationSelector
        character={mockCharacter}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    const selectButton = screen.getByText('Select Specialization');
    expect(selectButton).toBeDisabled();
  });

  it('shows specialization bonuses and requirements', () => {
    render(
      <SpecializationSelector
        character={mockCharacter}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    // Check that bonuses are displayed
    expect(screen.getByText(/\+25% XP from math and science activities/)).toBeInTheDocument();
    expect(screen.getByText(/Unlock advanced problem-solving hints/)).toBeInTheDocument();

    // Check that requirements are displayed
    expect(screen.getAllByText(/Reach level 10 with Intelligence ≥ 25/)[0]).toBeInTheDocument();
  });

  it('shows loading state when processing selection', () => {
    render(
      <SpecializationSelector
        character={mockCharacter}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    const selectButton = screen.getByText('Select Specialization');
    expect(selectButton).toBeDisabled();
    expect(selectButton.querySelector('.animate-spin')).toBeInTheDocument();
  });
});