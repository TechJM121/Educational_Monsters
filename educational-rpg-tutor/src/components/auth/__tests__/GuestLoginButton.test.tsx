// Tests for GuestLoginButton component

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GuestLoginButton } from '../GuestLoginButton';
import { useGuestAuth } from '../../../hooks/useGuestAuth';

// Mock the useGuestAuth hook
vi.mock('../../../hooks/useGuestAuth');

const mockUseGuestAuth = useGuestAuth as any;

describe('GuestLoginButton', () => {
  const mockCreateGuestSession = vi.fn();
  const mockOnGuestSessionCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGuestAuth.mockReturnValue({
      guestUser: null,
      guestCharacter: null,
      isGuestSession: false,
      isSessionNearExpiry: false,
      guestLimitations: {
        canAddFriends: false,
        canTrade: false,
        canJoinChallenges: false,
        canViewLeaderboards: true,
        canSendMessages: false,
        maxSessionDuration: 7 * 24 * 60 * 60 * 1000,
        warningThreshold: 2 * 60 * 60 * 1000,
      },
      loading: false,
      error: null,
      createGuestSession: mockCreateGuestSession,
      loadGuestSession: vi.fn(),
      convertToUser: vi.fn(),
      updateGuestCharacter: vi.fn(),
      updateGuestProgress: vi.fn(),
      clearSession: vi.fn(),
      clearError: vi.fn(),
    });
  });

  it('should render the guest login button', () => {
    render(<GuestLoginButton />);

    expect(screen.getByText('Try as Guest')).toBeInTheDocument();
    expect(screen.getByText(/Start your learning adventure immediately/)).toBeInTheDocument();
  });

  it('should call createGuestSession when clicked', async () => {
    mockCreateGuestSession.mockResolvedValue(undefined);

    render(<GuestLoginButton onGuestSessionCreated={mockOnGuestSessionCreated} />);

    const button = screen.getByText('Try as Guest');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockCreateGuestSession).toHaveBeenCalled();
      expect(mockOnGuestSessionCreated).toHaveBeenCalled();
    });
  });

  it('should show loading state when creating session', () => {
    mockUseGuestAuth.mockReturnValue({
      ...mockUseGuestAuth(),
      loading: true,
    });

    render(<GuestLoginButton />);

    expect(screen.getByText('Creating Adventure...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should display error message when there is an error', () => {
    const errorMessage = 'Failed to create guest session';
    mockUseGuestAuth.mockReturnValue({
      ...mockUseGuestAuth(),
      error: errorMessage,
    });

    render(<GuestLoginButton />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<GuestLoginButton disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should apply custom className', () => {
    const customClass = 'custom-class';
    render(<GuestLoginButton className={customClass} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass(customClass);
  });

  it('should handle session creation failure gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockCreateGuestSession.mockRejectedValue(new Error('Network error'));

    render(<GuestLoginButton onGuestSessionCreated={mockOnGuestSessionCreated} />);

    const button = screen.getByText('Try as Guest');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockCreateGuestSession).toHaveBeenCalled();
      expect(mockOnGuestSessionCreated).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to create guest session:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});