import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders, createMockCharacter } from '../../../test/utils';
import { CharacterStats } from '../CharacterStats';

describe('CharacterStats', () => {
  it('displays all six character stats', () => {
    const mockCharacter = createMockCharacter({
      stats: {
        intelligence: 15,
        vitality: 12,
        wisdom: 10,
        charisma: 8,
        dexterity: 14,
        creativity: 11,
        availablePoints: 0,
      }
    });
    
    renderWithProviders(<CharacterStats character={mockCharacter} />);
    
    expect(screen.getByText('Intelligence: 15')).toBeInTheDocument();
    expect(screen.getByText('Vitality: 12')).toBeInTheDocument();
    expect(screen.getByText('Wisdom: 10')).toBeInTheDocument();
    expect(screen.getByText('Charisma: 8')).toBeInTheDocument();
    expect(screen.getByText('Dexterity: 14')).toBeInTheDocument();
    expect(screen.getByText('Creativity: 11')).toBeInTheDocument();
  });

  it('shows available stat points when present', () => {
    const mockCharacter = createMockCharacter({
      stats: { ...createMockCharacter().stats, availablePoints: 3 }
    });
    
    renderWithProviders(<CharacterStats character={mockCharacter} />);
    
    expect(screen.getByText('Available Points: 3')).toBeInTheDocument();
  });

  it('displays stat tooltips on hover', async () => {
    const mockCharacter = createMockCharacter();
    
    renderWithProviders(<CharacterStats character={mockCharacter} />);
    
    const intelligenceStat = screen.getByTestId('stat-intelligence');
    fireEvent.mouseEnter(intelligenceStat);
    
    expect(screen.getByText(/Affects problem-solving abilities/)).toBeInTheDocument();
  });

  it('shows stat allocation buttons when points available', () => {
    const mockCharacter = createMockCharacter({
      stats: { ...createMockCharacter().stats, availablePoints: 2 }
    });
    
    renderWithProviders(<CharacterStats character={mockCharacter} />);
    
    const allocateButtons = screen.getAllByText('+');
    expect(allocateButtons).toHaveLength(6); // One for each stat
  });

  it('calls onStatAllocate when stat button clicked', () => {
    const mockOnStatAllocate = vi.fn();
    const mockCharacter = createMockCharacter({
      stats: { ...createMockCharacter().stats, availablePoints: 1 }
    });
    
    renderWithProviders(
      <CharacterStats 
        character={mockCharacter} 
        onStatAllocate={mockOnStatAllocate}
      />
    );
    
    const intelligenceButton = screen.getByTestId('allocate-intelligence');
    fireEvent.click(intelligenceButton);
    
    expect(mockOnStatAllocate).toHaveBeenCalledWith('intelligence');
  });
});