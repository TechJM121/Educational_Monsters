import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, createMockCharacter } from '../../../test/utils';
import { CharacterAvatar } from '../CharacterAvatar';

describe('CharacterAvatar', () => {
  it('renders character avatar with correct name', () => {
    const mockCharacter = createMockCharacter({ name: 'Test Hero' });
    
    renderWithProviders(<CharacterAvatar character={mockCharacter} />);
    
    expect(screen.getByText('Test Hero')).toBeInTheDocument();
  });

  it('displays character level', () => {
    const mockCharacter = createMockCharacter({ level: 5 });
    
    renderWithProviders(<CharacterAvatar character={mockCharacter} />);
    
    expect(screen.getByText('Level 5')).toBeInTheDocument();
  });

  it('shows equipped items on avatar', () => {
    const mockCharacter = createMockCharacter({
      equippedItems: [
        { id: '1', name: 'Magic Hat', type: 'head', rarity: 'rare' }
      ]
    });
    
    renderWithProviders(<CharacterAvatar character={mockCharacter} />);
    
    expect(screen.getByTestId('equipped-item-head')).toBeInTheDocument();
  });

  it('handles missing character data gracefully', () => {
    renderWithProviders(<CharacterAvatar character={null} />);
    
    expect(screen.getByText('Loading character...')).toBeInTheDocument();
  });

  it('applies correct avatar configuration styles', () => {
    const mockCharacter = createMockCharacter({
      avatarConfig: {
        hairColor: '#FF0000',
        skinColor: '#FDBCB4',
        outfit: 'wizard',
        accessories: ['glasses']
      }
    });
    
    renderWithProviders(<CharacterAvatar character={mockCharacter} />);
    
    const avatar = screen.getByTestId('character-avatar');
    expect(avatar).toHaveClass('outfit-wizard');
  });
});