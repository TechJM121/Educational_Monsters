import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationProvider, useGameNotifications } from '../../components/shared/NotificationManager';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Test component that uses notifications
function TestComponent() {
  const notifications = useGameNotifications();

  return (
    <div>
      <button
        onClick={() => notifications.showXPGain(50, 'Test Answer')}
        data-testid="xp-button"
      >
        Gain XP
      </button>
      
      <button
        onClick={() => notifications.showLevelUp(5)}
        data-testid="levelup-button"
      >
        Level Up
      </button>
      
      <button
        onClick={() => notifications.showStatImprovements([
          { stat: 'intelligence', oldValue: 10, newValue: 12 }
        ])}
        data-testid="stats-button"
      >
        Improve Stats
      </button>
      
      <button
        onClick={() => notifications.celebrateAnswer(true, 75, [
          { stat: 'wisdom', oldValue: 8, newValue: 10 }
        ])}
        data-testid="celebrate-button"
      >
        Celebrate Answer
      </button>
    </div>
  );
}

describe('Animation Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('displays XP gain notification', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const xpButton = screen.getByTestId('xp-button');
    fireEvent.click(xpButton);

    expect(screen.getByText('+50 XP')).toBeInTheDocument();
    expect(screen.getByText('Test Answer')).toBeInTheDocument();
  });

  it('displays level up celebration', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const levelUpButton = screen.getByTestId('levelup-button');
    fireEvent.click(levelUpButton);

    expect(screen.getByText('LEVEL UP!')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays stat improvements', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const statsButton = screen.getByTestId('stats-button');
    fireEvent.click(statsButton);

    expect(screen.getByText('Stats Improved!')).toBeInTheDocument();
    expect(screen.getByText('Intelligence')).toBeInTheDocument();
  });

  it('handles complex celebration sequence', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const celebrateButton = screen.getByTestId('celebrate-button');
    fireEvent.click(celebrateButton);

    // Should show XP gain first
    expect(screen.getByText('+75 XP')).toBeInTheDocument();

    // Advance time to show stat improvements
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText('Stats Improved!')).toBeInTheDocument();
    });
  });

  it('clears notifications after timeout', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const xpButton = screen.getByTestId('xp-button');
    fireEvent.click(xpButton);

    expect(screen.getByText('+50 XP')).toBeInTheDocument();

    // Advance time past notification duration
    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.queryByText('+50 XP')).not.toBeInTheDocument();
    });
  });

  it('handles multiple notifications simultaneously', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Trigger multiple notifications
    fireEvent.click(screen.getByTestId('xp-button'));
    fireEvent.click(screen.getByTestId('stats-button'));

    expect(screen.getByText('+50 XP')).toBeInTheDocument();
    expect(screen.getByText('Stats Improved!')).toBeInTheDocument();
  });
});

describe('Accessibility Integration', () => {
  it('provides screen reader announcements', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const xpButton = screen.getByTestId('xp-button');
    fireEvent.click(xpButton);

    // Check for screen reader content
    const srContent = document.querySelector('[aria-live]');
    expect(srContent).toBeInTheDocument();
  });

  it('maintains focus management during animations', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const xpButton = screen.getByTestId('xp-button');
    xpButton.focus();
    
    expect(xpButton).toHaveFocus();
    
    fireEvent.click(xpButton);
    
    // Focus should remain on button after notification appears
    expect(xpButton).toHaveFocus();
  });
});

describe('Performance Integration', () => {
  it('handles rapid notification triggers gracefully', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const xpButton = screen.getByTestId('xp-button');
    
    // Rapidly trigger notifications
    for (let i = 0; i < 10; i++) {
      fireEvent.click(xpButton);
    }

    // Should still show the notification
    expect(screen.getByText('+50 XP')).toBeInTheDocument();
  });

  it('cleans up timers properly', async () => {
    const { unmount } = render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByTestId('xp-button'));
    
    // Unmount before timer completes
    unmount();
    
    // Should not cause memory leaks or errors
    vi.advanceTimersByTime(5000);
  });
});