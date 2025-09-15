import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthManager } from '../AuthManager';
import { AuthService } from '../../../services/authService';

// Mock the hooks
vi.mock('../../../hooks/useSupabase', () => ({
  useSupabase: vi.fn()
}));

vi.mock('../../../hooks/useCharacter', () => ({
  useCharacter: vi.fn()
}));

// Mock the auth service
vi.mock('../../../services/authService', () => ({
  AuthService: {
    needsParentalConsent: vi.fn(),
    signOut: vi.fn()
  }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => children
}));

import { useSupabase } from '../../../hooks/useSupabase';
import { useCharacter } from '../../../hooks/useCharacter';

const mockUseSupabase = useSupabase as any;
const mockUseCharacter = useCharacter as any;

describe('AuthManager', () => {
  const mockOnAuthComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading spinner while checking authentication', () => {
    mockUseSupabase.mockReturnValue({
      user: null,
      loading: true
    });
    mockUseCharacter.mockReturnValue({
      character: null,
      loading: false
    });

    render(<AuthManager onAuthComplete={mockOnAuthComplete} />);

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // LoadingSpinner
  });

  it('shows sign in form for unauthenticated users', () => {
    mockUseSupabase.mockReturnValue({
      user: null,
      loading: false
    });
    mockUseCharacter.mockReturnValue({
      character: null,
      loading: false
    });

    render(<AuthManager onAuthComplete={mockOnAuthComplete} />);

    expect(screen.getByText('Welcome Back, Hero!')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('shows parental consent waiting message for users needing consent', async () => {
    const mockUser = { id: 'user-123' };
    mockUseSupabase.mockReturnValue({
      user: mockUser,
      loading: false
    });
    mockUseCharacter.mockReturnValue({
      character: null,
      loading: false
    });

    (AuthService.needsParentalConsent as any).mockResolvedValue(true);

    render(<AuthManager onAuthComplete={mockOnAuthComplete} />);

    await waitFor(() => {
      expect(screen.getByText('Awaiting Approval')).toBeInTheDocument();
    });

    expect(screen.getByText(/waiting for parental consent/)).toBeInTheDocument();
    expect(AuthService.needsParentalConsent).toHaveBeenCalledWith('user-123');
  });

  it('shows character creation for authenticated users without characters', async () => {
    const mockUser = { id: 'user-123' };
    mockUseSupabase.mockReturnValue({
      user: mockUser,
      loading: false
    });
    mockUseCharacter.mockReturnValue({
      character: null,
      loading: false
    });

    (AuthService.needsParentalConsent as any).mockResolvedValue(false);

    render(<AuthManager onAuthComplete={mockOnAuthComplete} />);

    await waitFor(() => {
      expect(screen.getByText('Create Your Hero')).toBeInTheDocument();
    });
  });

  it('shows tutorial for new characters', async () => {
    const mockUser = { id: 'user-123' };
    const mockNewCharacter = {
      id: 'char-123',
      name: 'TestHero',
      level: 1,
      totalXP: 0,
      currentXP: 0,
      stats: {
        intelligence: 5,
        vitality: 5,
        wisdom: 5,
        charisma: 5,
        dexterity: 5,
        creativity: 5,
        availablePoints: 0
      }
    };

    mockUseSupabase.mockReturnValue({
      user: mockUser,
      loading: false
    });
    mockUseCharacter.mockReturnValue({
      character: mockNewCharacter,
      loading: false
    });

    (AuthService.needsParentalConsent as any).mockResolvedValue(false);

    render(<AuthManager onAuthComplete={mockOnAuthComplete} />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, TestHero!')).toBeInTheDocument();
    });
  });

  it('completes authentication for existing characters', async () => {
    const mockUser = { id: 'user-123' };
    const mockExistingCharacter = {
      id: 'char-123',
      name: 'ExperiencedHero',
      level: 5,
      totalXP: 1000,
      currentXP: 200,
      stats: {
        intelligence: 8,
        vitality: 7,
        wisdom: 6,
        charisma: 5,
        dexterity: 7,
        creativity: 6,
        availablePoints: 2
      }
    };

    mockUseSupabase.mockReturnValue({
      user: mockUser,
      loading: false
    });
    mockUseCharacter.mockReturnValue({
      character: mockExistingCharacter,
      loading: false
    });

    (AuthService.needsParentalConsent as any).mockResolvedValue(false);

    render(<AuthManager onAuthComplete={mockOnAuthComplete} />);

    await waitFor(() => {
      expect(mockOnAuthComplete).toHaveBeenCalled();
    });
  });

  it('handles sign out from parental consent waiting screen', async () => {
    const mockUser = { id: 'user-123' };
    mockUseSupabase.mockReturnValue({
      user: mockUser,
      loading: false
    });
    mockUseCharacter.mockReturnValue({
      character: null,
      loading: false
    });

    (AuthService.needsParentalConsent as any).mockResolvedValue(true);

    render(<AuthManager onAuthComplete={mockOnAuthComplete} />);

    await waitFor(() => {
      expect(screen.getByText('Awaiting Approval')).toBeInTheDocument();
    });

    const signOutButton = screen.getByText('Sign Out');
    await userEvent.click(signOutButton);

    expect(AuthService.signOut).toHaveBeenCalled();
  });

  it('handles errors when checking parental consent', async () => {
    const mockUser = { id: 'user-123' };
    mockUseSupabase.mockReturnValue({
      user: mockUser,
      loading: false
    });
    mockUseCharacter.mockReturnValue({
      character: null,
      loading: false
    });

    (AuthService.needsParentalConsent as any).mockRejectedValue(new Error('Network error'));

    // Should not crash and should show character creation
    render(<AuthManager onAuthComplete={mockOnAuthComplete} />);

    await waitFor(() => {
      expect(screen.getByText('Create Your Hero')).toBeInTheDocument();
    });
  });
});