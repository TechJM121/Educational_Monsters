import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LevelUpCelebration } from '../LevelUpCelebration';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('LevelUpCelebration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders celebration when visible', () => {
    render(
      <LevelUpCelebration
        isVisible={true}
        newLevel={5}
      />
    );

    expect(screen.getByText('LEVEL UP!')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Congratulations! You\'ve reached a new level!')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    render(
      <LevelUpCelebration
        isVisible={false}
        newLevel={5}
      />
    );

    expect(screen.queryByText('LEVEL UP!')).not.toBeInTheDocument();
  });

  it('calls onComplete after duration', async () => {
    const onComplete = vi.fn();
    
    render(
      <LevelUpCelebration
        isVisible={true}
        newLevel={5}
        onComplete={onComplete}
        duration={1000}
      />
    );

    expect(onComplete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledOnce();
    });
  });

  it('displays level rewards information', () => {
    render(
      <LevelUpCelebration
        isVisible={true}
        newLevel={10}
      />
    );

    expect(screen.getByText('🎁 Level Rewards:')).toBeInTheDocument();
    expect(screen.getByText('+3 Stat Points')).toBeInTheDocument();
    expect(screen.getByText('New Abilities')).toBeInTheDocument();
    expect(screen.getByText('Bonus XP')).toBeInTheDocument();
  });

  it('uses custom duration when provided', async () => {
    const onComplete = vi.fn();
    const customDuration = 2000;
    
    render(
      <LevelUpCelebration
        isVisible={true}
        newLevel={5}
        onComplete={onComplete}
        duration={customDuration}
      />
    );

    vi.advanceTimersByTime(customDuration - 100);
    expect(onComplete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledOnce();
    });
  });

  it('has proper accessibility attributes', () => {
    render(
      <LevelUpCelebration
        isVisible={true}
        newLevel={7}
      />
    );

    // Check for proper heading structure
    const heading = screen.getByText('LEVEL UP!');
    expect(heading).toBeInTheDocument();
    
    // Check for descriptive text
    const congratsText = screen.getByText('Congratulations! You\'ve reached a new level!');
    expect(congratsText).toBeInTheDocument();
  });
});