import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ModernCharacterCustomizationModal } from '../ModernCharacterCustomizationModal';
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

// Mock components
vi.mock('../ModernCharacterCustomization', () => ({
  ModernCharacterCustomization: ({ character, onSave, onCancel }: any) => (
    <div data-testid="modern-character-customization">
      <div>Modern Customization for {character.name}</div>
      <button onClick={onSave}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}));

vi.mock('../StatAllocation', () => ({
  StatAllocation: ({ onAllocate, onCancel }: any) => (
    <div data-testid="stat-allocation">
      <div>Stat Allocation</div>
      <button onClick={() => onAllocate({ intelligence: 2 })}>Allocate</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}));

vi.mock('../SpecializationSelector', () => ({
  SpecializationSelector: ({ onSelect, onCancel }: any) => (
    <div data-testid="specialization-selector">
      <div>Specialization Selector</div>
      <button onClick={() => onSelect('scholar')}>Select Scholar</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}));

vi.mock('../EquipmentSystem', () => ({
  EquipmentSystem: ({ onEquip, onUnequip, onClose }: any) => (
    <div data-testid="equipment-system">
      <div>Equipment System</div>
      <button onClick={() => onEquip('sword-1', 'weapon')}>Equip Sword</button>
      <button onClick={() => onUnequip('weapon')}>Unequip</button>
      <button onClick={onClose}>Close</button>
    </div>
  )
}));

vi.mock('../RespecSystem', () => ({
  RespecSystem: ({ onRespec, onCancel }: any) => (
    <div data-testid="respec-system">
      <div>Respec System</div>
      <button onClick={() => onRespec({ intelligence: 15 })}>Respec</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}));

vi.mock('../StatChangeAnimation', () => ({
  StatChangeAnimation: ({ changes, onComplete }: any) => (
    <div data-testid="stat-change-animation">
      <div>Stat Changes: {changes.length}</div>
      <button onClick={onComplete}>Complete</button>
    </div>
  )
}));

vi.mock('../EquipmentChangeAnimation', () => ({
  EquipmentChangeAnimation: ({ change, onComplete }: any) => (
    <div data-testid="equipment-change-animation">
      <div>Equipment Change: {change.type}</div>
      <button onClick={onComplete}>Complete</button>
    </div>
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
  level: 15,
  totalXP: 5000,
  currentXP: 1250,
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
    availablePoints: 5
  },
  equippedItems: [
    {
      id: 'equipped-1',
      itemId: 'sword-1',
      slot: 'weapon',
      equippedAt: new Date()
    }
  ],
  specialization: 'scholar',
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockAvailableItems = [
  {
    id: 'sword-1',
    name: 'Iron Sword',
    icon: '⚔️',
    rarity: 'common'
  },
  {
    id: 'hat-1',
    name: 'Wizard Hat',
    icon: '🎩',
    rarity: 'rare'
  }
];

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <AnimationProvider>
      {children}
    </AnimationProvider>
  </ThemeProvider>
);

describe('ModernCharacterCustomizationModal', () => {
  const mockOnUpdateAvatar = vi.fn();
  const mockOnAllocateStats = vi.fn();
  const mockOnSelectSpecialization = vi.fn();
  const mockOnEquipItem = vi.fn();
  const mockOnUnequipItem = vi.fn();
  const mockOnRespec = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modern character customization modal with enhanced UI', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomizationModal
          character={mockCharacter}
          availableItems={mockAvailableItems}
          respecTokens={2}
          onUpdateAvatar={mockOnUpdateAvatar}
          onAllocateStats={mockOnAllocateStats}
          onSelectSpecialization={mockOnSelectSpecialization}
          onEquipItem={mockOnEquipItem}
          onUnequipItem={mockOnUnequipItem}
          onRespec={mockOnRespec}
          onClose={mockOnClose}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Character Customization')).toBeInTheDocument();
    expect(screen.getByText('Enhance and personalize your character')).toBeInTheDocument();
  });

  it('displays all customization tabs with modern styling and descriptions', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomizationModal
          character={mockCharacter}
          availableItems={mockAvailableItems}
          respecTokens={2}
          onUpdateAvatar={mockOnUpdateAvatar}
          onAllocateStats={mockOnAllocateStats}
          onSelectSpecialization={mockOnSelectSpecialization}
          onEquipItem={mockOnEquipItem}
          onUnequipItem={mockOnUnequipItem}
          onRespec={mockOnRespec}
          onClose={mockOnClose}
        />
      </TestWrapper>
    );

    // Check tab names
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.getByText('Specialization')).toBeInTheDocument();
    expect(screen.getByText('Equipment')).toBeInTheDocument();
    expect(screen.getByText('Respec')).toBeInTheDocument();

    // Check descriptions
    expect(screen.getByText('Customize your character\'s look with modern styling')).toBeInTheDocument();
    expect(screen.getByText('Allocate stat points to enhance abilities')).toBeInTheDocument();
  });

  it('shows badges for available actions', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomizationModal
          character={mockCharacter}
          availableItems={mockAvailableItems}
          respecTokens={3}
          onUpdateAvatar={mockOnUpdateAvatar}
          onAllocateStats={mockOnAllocateStats}
          onSelectSpecialization={mockOnSelectSpecialization}
          onEquipItem={mockOnEquipItem}
          onUnequipItem={mockOnUnequipItem}
          onRespec={mockOnRespec}
          onClose={mockOnClose}
        />
      </TestWrapper>
    );

    // Should show badge for available stat points
    expect(screen.getByText('5')).toBeInTheDocument(); // Available stat points

    // Should show badge for respec tokens
    expect(screen.getByText('3')).toBeInTheDocument(); // Respec tokens
  });

  it('disables tabs when requirements are not met', () => {
    const lowLevelCharacter = {
      ...mockCharacter,
      level: 5, // Below level 10 requirement for specialization
      stats: {
        ...mockCharacter.stats,
        availablePoints: 0 // No available points for stats
      }
    };

    render(
      <TestWrapper>
        <ModernCharacterCustomizationModal
          character={lowLevelCharacter}
          availableItems={mockAvailableItems}
          respecTokens={0} // No respec tokens
          onUpdateAvatar={mockOnUpdateAvatar}
          onAllocateStats={mockOnAllocateStats}
          onSelectSpecialization={mockOnSelectSpecialization}
          onEquipItem={mockOnEquipItem}
          onUnequipItem={mockOnUnequipItem}
          onRespec={mockOnRespec}
          onClose={mockOnClose}
        />
      </TestWrapper>
    );

    // Stats tab should be disabled (no available points)
    const statsButton = screen.getByText('Stats').closest('button');
    expect(statsButton).toBeDisabled();

    // Specialization tab should be disabled (level too low)
    const specializationButton = screen.getByText('Specialization').closest('button');
    expect(specializationButton).toBeDisabled();

    // Respec tab should be disabled (no tokens)
    const respecButton = screen.getByText('Respec').closest('button');
    expect(respecButton).toBeDisabled();
  });

  it('switches between tabs with smooth transitions', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomizationModal
          character={mockCharacter}
          availableItems={mockAvailableItems}
          respecTokens={2}
          onUpdateAvatar={mockOnUpdateAvatar}
          onAllocateStats={mockOnAllocateStats}
          onSelectSpecialization={mockOnSelectSpecialization}
          onEquipItem={mockOnEquipItem}
          onUnequipItem={mockOnUnequipItem}
          onRespec={mockOnRespec}
          onClose={mockOnClose}
        />
      </TestWrapper>
    );

    // Should start with appearance tab
    expect(screen.getByTestId('modern-character-customization')).toBeInTheDocument();

    // Switch to stats tab
    fireEvent.click(screen.getByText('Stats'));
    expect(screen.getByTestId('stat-allocation')).toBeInTheDocument();

    // Switch to equipment tab
    fireEvent.click(screen.getByText('Equipment'));
    expect(screen.getByTestId('equipment-system')).toBeInTheDocument();
  });

  it('handles stat allocation with animation feedback', async () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomizationModal
          character={mockCharacter}
          availableItems={mockAvailableItems}
          respecTokens={2}
          onUpdateAvatar={mockOnUpdateAvatar}
          onAllocateStats={mockOnAllocateStats}
          onSelectSpecialization={mockOnSelectSpecialization}
          onEquipItem={mockOnEquipItem}
          onUnequipItem={mockOnUnequipItem}
          onRespec={mockOnRespec}
          onClose={mockOnClose}
        />
      </TestWrapper>
    );

    // Switch to stats tab
    fireEvent.click(screen.getByText('Stats'));

    // Allocate stats
    fireEvent.click(screen.getByText('Allocate'));

    await waitFor(() => {
      expect(mockOnAllocateStats).toHaveBeenCalledWith({ intelligence: 2 });
    });

    // Should show stat change animation
    expect(screen.getByTestId('stat-change-animation')).toBeInTheDocument();
  });

  it('handles equipment changes with animation feedback', async () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomizationModal
          character={mockCharacter}
          availableItems={mockAvailableItems}
          respecTokens={2}
          onUpdateAvatar={mockOnUpdateAvatar}
          onAllocateStats={mockOnAllocateStats}
          onSelectSpecialization={mockOnSelectSpecialization}
          onEquipItem={mockOnEquipItem}
          onUnequipItem={mockOnUnequipItem}
          onRespec={mockOnRespec}
          onClose={mockOnClose}
        />
      </TestWrapper>
    );

    // Switch to equipment tab
    fireEvent.click(screen.getByText('Equipment'));

    // Equip item
    fireEvent.click(screen.getByText('Equip Sword'));

    await waitFor(() => {
      expect(mockOnEquipItem).toHaveBeenCalledWith('sword-1', 'weapon');
    });

    // Should show equipment change animation
    expect(screen.getByTestId('equipment-change-animation')).toBeInTheDocument();
  });

  it('handles specialization selection', async () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomizationModal
          character={mockCharacter}
          availableItems={mockAvailableItems}
          respecTokens={2}
          onUpdateAvatar={mockOnUpdateAvatar}
          onAllocateStats={mockOnAllocateStats}
          onSelectSpecialization={mockOnSelectSpecialization}
          onEquipItem={mockOnEquipItem}
          onUnequipItem={mockOnUnequipItem}
          onRespec={mockOnRespec}
          onClose={mockOnClose}
        />
      </TestWrapper>
    );

    // Switch to specialization tab
    fireEvent.click(screen.getByText('Specialization'));

    // Select specialization
    fireEvent.click(screen.getByText('Select Scholar'));

    await waitFor(() => {
      expect(mockOnSelectSpecialization).toHaveBeenCalledWith('scholar');
    });
  });

  it('handles respec functionality', async () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomizationModal
          character={mockCharacter}
          availableItems={mockAvailableItems}
          respecTokens={2}
          onUpdateAvatar={mockOnUpdateAvatar}
          onAllocateStats={mockOnAllocateStats}
          onSelectSpecialization={mockOnSelectSpecialization}
          onEquipItem={mockOnEquipItem}
          onUnequipItem={mockOnUnequipItem}
          onRespec={mockOnRespec}
          onClose={mockOnClose}
        />
      </TestWrapper>
    );

    // Switch to respec tab
    fireEvent.click(screen.getByText('Respec'));

    // Perform respec
    fireEvent.click(screen.getByText('Respec'));

    await waitFor(() => {
      expect(mockOnRespec).toHaveBeenCalledWith({ intelligence: 15 });
    });
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomizationModal
          character={mockCharacter}
          availableItems={mockAvailableItems}
          respecTokens={2}
          onUpdateAvatar={mockOnUpdateAvatar}
          onAllocateStats={mockOnAllocateStats}
          onSelectSpecialization={mockOnSelectSpecialization}
          onEquipItem={mockOnEquipItem}
          onUnequipItem={mockOnUnequipItem}
          onRespec={mockOnRespec}
          onClose={mockOnClose}
        />
      </TestWrapper>
    );

    // Find and click close button (X button)
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('clears animation states after completion', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomizationModal
          character={mockCharacter}
          availableItems={mockAvailableItems}
          respecTokens={2}
          onUpdateAvatar={mockOnUpdateAvatar}
          onAllocateStats={mockOnAllocateStats}
          onSelectSpecialization={mockOnSelectSpecialization}
          onEquipItem={mockOnEquipItem}
          onUnequipItem={mockOnUnequipItem}
          onRespec={mockOnRespec}
          onClose={mockOnClose}
        />
      </TestWrapper>
    );

    // Switch to stats and trigger animation
    fireEvent.click(screen.getByText('Stats'));
    fireEvent.click(screen.getByText('Allocate'));

    // Animation should appear
    expect(screen.getByTestId('stat-change-animation')).toBeInTheDocument();

    // Complete animation
    fireEvent.click(screen.getByText('Complete'));

    // Animation should be cleared
    expect(screen.queryByTestId('stat-change-animation')).not.toBeInTheDocument();
  });

  it('maintains existing functionality while adding modern enhancements', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomizationModal
          character={mockCharacter}
          availableItems={mockAvailableItems}
          respecTokens={2}
          onUpdateAvatar={mockOnUpdateAvatar}
          onAllocateStats={mockOnAllocateStats}
          onSelectSpecialization={mockOnSelectSpecialization}
          onEquipItem={mockOnEquipItem}
          onUnequipItem={mockOnUnequipItem}
          onRespec={mockOnRespec}
          onClose={mockOnClose}
        />
      </TestWrapper>
    );

    // All original tabs should be available
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.getByText('Specialization')).toBeInTheDocument();
    expect(screen.getByText('Equipment')).toBeInTheDocument();
    expect(screen.getByText('Respec')).toBeInTheDocument();

    // Original functionality should work
    fireEvent.click(screen.getByText('Stats'));
    expect(screen.getByTestId('stat-allocation')).toBeInTheDocument();
  });

  it('provides enhanced visual feedback for user interactions', () => {
    render(
      <TestWrapper>
        <ModernCharacterCustomizationModal
          character={mockCharacter}
          availableItems={mockAvailableItems}
          respecTokens={2}
          onUpdateAvatar={mockOnUpdateAvatar}
          onAllocateStats={mockOnAllocateStats}
          onSelectSpecialization={mockOnSelectSpecialization}
          onEquipItem={mockOnEquipItem}
          onUnequipItem={mockOnUnequipItem}
          onRespec={mockOnRespec}
          onClose={mockOnClose}
        />
      </TestWrapper>
    );

    // Test tab switching provides visual feedback
    fireEvent.click(screen.getByText('Equipment'));
    fireEvent.click(screen.getByText('Equip Sword'));

    // Should show equipment change animation
    expect(screen.getByTestId('equipment-change-animation')).toBeInTheDocument();
    expect(screen.getByText('Equipment Change: equipped')).toBeInTheDocument();
  });
});