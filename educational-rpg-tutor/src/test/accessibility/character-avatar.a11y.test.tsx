import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'vitest-axe';
import { CharacterAvatar } from '../../components/character/CharacterAvatar';
import { createMockCharacter, axeConfig } from '../utils';

expect.extend(toHaveNoViolations);

describe('CharacterAvatar Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const mockCharacter = createMockCharacter();
    const { container } = render(<CharacterAvatar character={mockCharacter} />);
    
    const results = await axe(container, axeConfig);
    expect(results).toHaveNoViolations();
  });

  it('provides proper alt text for character image', () => {
    const mockCharacter = createMockCharacter({ name: 'Magic Wizard' });
    const { getByRole } = render(<CharacterAvatar character={mockCharacter} />);
    
    const avatarImage = getByRole('img');
    expect(avatarImage).toHaveAttribute('alt', 'Magic Wizard character avatar');
  });

  it('has proper heading structure', () => {
    const mockCharacter = createMockCharacter({ name: 'Test Hero', level: 5 });
    const { getByRole } = render(<CharacterAvatar character={mockCharacter} />);
    
    const heading = getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Test Hero - Level 5');
  });

  it('provides keyboard navigation for interactive elements', () => {
    const mockCharacter = createMockCharacter();
    const { getByRole } = render(
      <CharacterAvatar character={mockCharacter} interactive={true} />
    );
    
    const avatarButton = getByRole('button');
    expect(avatarButton).toHaveAttribute('tabindex', '0');
  });

  it('has proper ARIA labels for stat information', () => {
    const mockCharacter = createMockCharacter({
      stats: { intelligence: 15, vitality: 12, wisdom: 10, charisma: 8, dexterity: 14, creativity: 11, availablePoints: 0 }
    });
    
    const { getByLabelText } = render(<CharacterAvatar character={mockCharacter} showStats={true} />);
    
    expect(getByLabelText('Character intelligence stat: 15')).toBeInTheDocument();
    expect(getByLabelText('Character vitality stat: 12')).toBeInTheDocument();
  });

  it('supports screen reader announcements for level changes', () => {
    const mockCharacter = createMockCharacter({ level: 1 });
    const { rerender, getByRole } = render(<CharacterAvatar character={mockCharacter} />);
    
    // Simulate level up
    const leveledUpCharacter = { ...mockCharacter, level: 2 };
    rerender(<CharacterAvatar character={leveledUpCharacter} />);
    
    const announcement = getByRole('status');
    expect(announcement).toHaveTextContent('Character leveled up to level 2');
  });

  it('provides sufficient color contrast for text elements', async () => {
    const mockCharacter = createMockCharacter();
    const { container } = render(<CharacterAvatar character={mockCharacter} />);
    
    // Test with color contrast checking enabled
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });
    
    expect(results).toHaveNoViolations();
  });

  it('handles focus management correctly', () => {
    const mockCharacter = createMockCharacter();
    const { getByRole } = render(
      <CharacterAvatar character={mockCharacter} interactive={true} />
    );
    
    const avatarButton = getByRole('button');
    avatarButton.focus();
    
    expect(document.activeElement).toBe(avatarButton);
    expect(avatarButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('provides appropriate semantic structure', async () => {
    const mockCharacter = createMockCharacter();
    const { container } = render(<CharacterAvatar character={mockCharacter} />);
    
    // Check for proper semantic HTML usage
    const results = await axe(container, {
      rules: {
        'landmark-one-main': { enabled: false }, // Not applicable for component test
        'page-has-heading-one': { enabled: false }, // Not applicable for component test
      },
    });
    
    expect(results).toHaveNoViolations();
  });

  it('supports high contrast mode', () => {
    const mockCharacter = createMockCharacter();
    
    // Simulate high contrast mode
    document.body.classList.add('high-contrast');
    
    const { container } = render(<CharacterAvatar character={mockCharacter} />);
    
    // Component should adapt to high contrast mode
    const avatar = container.querySelector('[data-testid="character-avatar"]');
    expect(avatar).toBeInTheDocument();
    
    // Clean up
    document.body.classList.remove('high-contrast');
  });

  it('respects reduced motion preferences', () => {
    const mockCharacter = createMockCharacter();
    
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    
    const { container } = render(<CharacterAvatar character={mockCharacter} />);
    
    // Animations should be disabled or reduced
    const avatar = container.querySelector('[data-testid="character-avatar"]');
    expect(avatar).toHaveStyle('animation-duration: 0s');
  });

  it('provides error states accessibly', () => {
    const { getByRole } = render(<CharacterAvatar character={null} />);
    
    const errorMessage = getByRole('alert');
    expect(errorMessage).toHaveTextContent('Character data could not be loaded');
    expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
  });

  it('supports screen reader navigation with proper landmarks', async () => {
    const mockCharacter = createMockCharacter();
    const { container } = render(
      <main>
        <CharacterAvatar character={mockCharacter} />
      </main>
    );
    
    const results = await axe(container, {
      rules: {
        'landmark-one-main': { enabled: true },
      },
    });
    
    expect(results).toHaveNoViolations();
  });});
