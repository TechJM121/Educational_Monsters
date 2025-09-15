import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { XPGainNotification } from '../XPGainNotification';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('XPGainNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders XP gain notification when visible', () => {
    render(
      <XPGainNotification
        xpGained={50}
        isVisible={true}
      />
    );

    expect(screen.getByText('+50 XP')).toBeInTheDocument();
    expect(screen.getByText('⭐')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    render(
      <XPGainNotification
        xpGained={50}
        isVisible={false}
      />
    );

    expect(screen.queryByText('+50 XP')).not.toBeInTheDocument();
  });

  it('does not render when XP gained is 0', () => {
    render(
      <XPGainNotification
        xpGained={0}
        isVisible={true}
      />
    );

    expect(screen.queryByText('+0 XP')).not.toBeInTheDocument();
  });

  it('displays reason when provided', () => {
    render(
      <XPGainNotification
        xpGained={75}
        isVisible={true}
        showReason="Correct Answer"
      />
    );

    expect(screen.getByText('+75 XP')).toBeInTheDocument();
    expect(screen.getByText('Correct Answer')).toBeInTheDocument();
  });

  it('calls onComplete after timeout', async () => {
    const onComplete = vi.fn();
    
    render(
      <XPGainNotification
        xpGained={25}
        isVisible={true}
        onComplete={onComplete}
      />
    );

    expect(onComplete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledOnce();
    });
  });

  it('positions correctly based on position prop', () => {
    const { rerender } = render(
      <XPGainNotification
        xpGained={30}
        isVisible={true}
        position="top-right"
      />
    );

    let notification = document.querySelector('.top-4.right-4');
    expect(notification).toBeInTheDocument();

    rerender(
      <XPGainNotification
        xpGained={30}
        isVisible={true}
        position="bottom-center"
      />
    );

    notification = document.querySelector('.bottom-4');
    expect(notification).toBeInTheDocument();
  });

  it('formats large XP numbers correctly', () => {
    render(
      <XPGainNotification
        xpGained={1500}
        isVisible={true}
      />
    );

    expect(screen.getByText('+1500 XP')).toBeInTheDocument();
  });
});