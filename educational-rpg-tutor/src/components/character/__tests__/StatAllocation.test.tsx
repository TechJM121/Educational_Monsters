import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { StatAllocation } from '../StatAllocation';
import type { CharacterStats } from '../../../types/character';

const mockStats: CharacterStats = {
  intelligence: 15,
  vitality: 12,
  wisdom: 10,
  charisma: 14,
  dexterity: 11,
  creativity: 13,
  availablePoints: 5
};

describe('StatAllocation', () => {
  const mockOnAllocate = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders stat allocation interface', () => {
    render(
      <StatAllocation
        currentStats={mockStats}
        onAllocate={mockOnAllocate}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Allocate Stat Points')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Points left
    expect(screen.getByText('Points Left')).toBeInTheDocument();
  });

  it('displays all stats with current values', () => {
    render(
      <StatAllocation
        currentStats={mockStats}
        onAllocate={mockOnAllocate}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Vitality')).toBeInTheDocument();
    expect(screen.getByText('Wisdom')).toBeInTheDocument();
    expect(screen.getByText('Charisma')).toBeInTheDocument();
    expect(screen.getByText('Dexterity')).toBeInTheDocument();
    expect(screen.getByText('Creativity')).toBeInTheDocument();
  });

  it('allows allocating points to stats', () => {
    render(
      <StatAllocation
        currentStats={mockStats}
        onAllocate={mockOnAllocate}
        onCancel={mockOnCancel}
      />
    );

    // Find intelligence stat section and click the + button
    const intelligenceSection = screen.getByText('Intelligence').closest('.bg-slate-700');
    const plusButton = intelligenceSection?.querySelector('button:last-child');
    
    fireEvent.click(plusButton!);

    // Should show 1 point allocated and 4 points remaining
    expect(screen.getByText('4')).toBeInTheDocument(); // Points left should decrease
  });

  it('prevents allocating more points than available', () => {
    const lowPointsStats = { ...mockStats, availablePoints: 1 };
    
    render(
      <StatAllocation
        currentStats={lowPointsStats}
        onAllocate={mockOnAllocate}
        onCancel={mockOnCancel}
      />
    );

    // Find intelligence stat section and click + button twice
    const intelligenceSection = screen.getByText('Intelligence').closest('.bg-slate-700');
    const plusButton = intelligenceSection?.querySelector('button:last-child');
    
    fireEvent.click(plusButton!);
    fireEvent.click(plusButton!); // Second click should not work

    // Should still show 0 points left (only 1 point was available)
    const pointsLeftElement = screen.getByText('Points Left').previousElementSibling;
    expect(pointsLeftElement).toHaveTextContent('0');
  });

  it('allows removing allocated points', () => {
    render(
      <StatAllocation
        currentStats={mockStats}
        onAllocate={mockOnAllocate}
        onCancel={mockOnCancel}
      />
    );

    // Allocate a point first
    const intelligenceSection = screen.getByText('Intelligence').closest('.bg-slate-700');
    const plusButton = intelligenceSection?.querySelector('button:last-child');
    const minusButton = intelligenceSection?.querySelector('button:first-child');
    
    fireEvent.click(plusButton!);
    
    // Now remove it
    fireEvent.click(minusButton!);

    // Should be back to 5 points available
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('handles quick allocation buttons', () => {
    render(
      <StatAllocation
        currentStats={mockStats}
        onAllocate={mockOnAllocate}
        onCancel={mockOnCancel}
      />
    );

    // Find intelligence section and click +5 button
    const intelligenceSection = screen.getByText('Intelligence').closest('.bg-slate-700');
    const plus5Button = intelligenceSection?.querySelector('button[class*="bg-blue-600"]');
    
    fireEvent.click(plus5Button!);

    // Should show 0 points left (all 5 points allocated)
    const pointsLeftElement = screen.getByText('Points Left').previousElementSibling;
    expect(pointsLeftElement).toHaveTextContent('0');
  });

  it('handles max allocation button', () => {
    render(
      <StatAllocation
        currentStats={mockStats}
        onAllocate={mockOnAllocate}
        onCancel={mockOnCancel}
      />
    );

    // Find intelligence section and click Max button
    const intelligenceSection = screen.getByText('Intelligence').closest('.bg-slate-700');
    const maxButton = intelligenceSection?.querySelector('button[class*="bg-purple-600"]');
    
    fireEvent.click(maxButton!);

    // Should show 0 points left (all points allocated to intelligence)
    const pointsLeftElement = screen.getByText('Points Left').previousElementSibling;
    expect(pointsLeftElement).toHaveTextContent('0');
  });

  it('resets all allocations when reset button is clicked', () => {
    render(
      <StatAllocation
        currentStats={mockStats}
        onAllocate={mockOnAllocate}
        onCancel={mockOnCancel}
      />
    );

    // Allocate some points
    const intelligenceSection = screen.getByText('Intelligence').closest('.bg-slate-700');
    const plusButton = intelligenceSection?.querySelector('button:last-child');
    
    fireEvent.click(plusButton!);
    fireEvent.click(plusButton!);

    // Click reset
    fireEvent.click(screen.getByText('Reset'));

    // Should be back to 5 points available
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onAllocate with correct allocations', async () => {
    render(
      <StatAllocation
        currentStats={mockStats}
        onAllocate={mockOnAllocate}
        onCancel={mockOnCancel}
      />
    );

    // Allocate 2 points to intelligence and 3 to vitality
    const intelligenceSection = screen.getByText('Intelligence').closest('.bg-slate-700');
    const vitalitySection = screen.getByText('Vitality').closest('.bg-slate-700');
    
    const intPlusButton = intelligenceSection?.querySelector('button:last-child');
    const vitPlusButton = vitalitySection?.querySelector('button:last-child');
    
    fireEvent.click(intPlusButton!);
    fireEvent.click(intPlusButton!);
    fireEvent.click(vitPlusButton!);
    fireEvent.click(vitPlusButton!);
    fireEvent.click(vitPlusButton!);

    // Click allocate button
    fireEvent.click(screen.getByText(/Allocate Points/));

    await waitFor(() => {
      expect(mockOnAllocate).toHaveBeenCalledWith({
        intelligence: 2,
        vitality: 3
      });
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <StatAllocation
        currentStats={mockStats}
        onAllocate={mockOnAllocate}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows message when no points are available', () => {
    const noPointsStats = { ...mockStats, availablePoints: 0 };
    
    render(
      <StatAllocation
        currentStats={noPointsStats}
        onAllocate={mockOnAllocate}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('No points to allocate')).toBeInTheDocument();
    expect(screen.getByText('Level up your character to earn more stat points!')).toBeInTheDocument();
  });

  it('disables buttons when loading', () => {
    render(
      <StatAllocation
        currentStats={mockStats}
        onAllocate={mockOnAllocate}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    // All + and - buttons should be disabled
    const buttons = screen.getAllByRole('button');
    const statButtons = buttons.filter(btn => btn.textContent === '+' || btn.textContent === '−');
    
    statButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});