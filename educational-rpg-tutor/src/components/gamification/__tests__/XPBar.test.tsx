import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { XPBar } from '../XPBar';

describe('XPBar', () => {
  it('renders XP progress correctly', () => {
    render(
      <XPBar
        currentXP={250}
        xpForNextLevel={500}
        level={5}
        totalXP={1250}
        showTotal={true}
      />
    );
    
    expect(screen.getByText('Level 5')).toBeInTheDocument();
    expect(screen.getByText('250 / 500 XP')).toBeInTheDocument();
    expect(screen.getByText('Total: 1,250 XP')).toBeInTheDocument();
  });

  it('calculates percentage correctly', () => {
    render(
      <XPBar
        currentXP={250}
        xpForNextLevel={500}
        level={5}
      />
    );
    
    expect(screen.getByText('50.0% to next level')).toBeInTheDocument();
    expect(screen.getByText('250 XP needed')).toBeInTheDocument();
  });

  it('hides level when showLevel is false', () => {
    render(
      <XPBar
        currentXP={250}
        xpForNextLevel={500}
        level={5}
        showLevel={false}
      />
    );
    
    expect(screen.queryByText('Level 5')).not.toBeInTheDocument();
  });

  it('hides total XP when showTotal is false', () => {
    render(
      <XPBar
        currentXP={250}
        xpForNextLevel={500}
        level={5}
        totalXP={1250}
        showTotal={false}
      />
    );
    
    expect(screen.queryByText('Total: 1,250 XP')).not.toBeInTheDocument();
  });

  it('formats large numbers with commas', () => {
    render(
      <XPBar
        currentXP={1250}
        xpForNextLevel={2000}
        level={10}
        totalXP={15000}
        showTotal={true}
      />
    );
    
    expect(screen.getByText('1,250 / 2,000 XP')).toBeInTheDocument();
    expect(screen.getByText('Total: 15,000 XP')).toBeInTheDocument();
    expect(screen.getByText('750 XP needed')).toBeInTheDocument();
  });

  it('handles edge case where current XP equals required XP', () => {
    render(
      <XPBar
        currentXP={500}
        xpForNextLevel={500}
        level={5}
      />
    );
    
    expect(screen.getByText('100.0% to next level')).toBeInTheDocument();
    expect(screen.getByText('0 XP needed')).toBeInTheDocument();
  });
});