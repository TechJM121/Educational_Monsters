import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PasswordResetForm } from '../PasswordResetForm';
import { supabase } from '../../../services/supabaseClient';

// Mock supabase
vi.mock('../../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn()
    }
  }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

describe('PasswordResetForm', () => {
  const mockOnBackToSignIn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders password reset form correctly', () => {
    render(<PasswordResetForm onBackToSignIn={mockOnBackToSignIn} />);

    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to Sign In' })).toBeInTheDocument();
  });

  it('validates email input', async () => {
    const user = userEvent.setup();

    render(<PasswordResetForm onBackToSignIn={mockOnBackToSignIn} />);

    const sendButton = screen.getByRole('button', { name: 'Send Reset Link' });

    // Button should be disabled when email is empty
    expect(sendButton).toBeDisabled();

    const emailInput = screen.getByLabelText('Email Address');
    await user.type(emailInput, 'test@example.com');

    // Button should be enabled with valid email
    expect(sendButton).not.toBeDisabled();
  });

  it('handles successful password reset request', async () => {
    const user = userEvent.setup();
    (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ error: null });

    render(<PasswordResetForm onBackToSignIn={mockOnBackToSignIn} />);

    const emailInput = screen.getByLabelText('Email Address');
    const sendButton = screen.getByRole('button', { name: 'Send Reset Link' });

    await user.type(emailInput, 'test@example.com');
    await user.click(sendButton);

    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      expect(screen.getByText('Reset Link Sent!')).toBeInTheDocument();
      expect(screen.getByText(/We've sent a password reset link to test@example.com/)).toBeInTheDocument();
    });
  });

  it('displays error for failed reset request', async () => {
    const user = userEvent.setup();
    (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({
      error: new Error('User not found')
    });

    render(<PasswordResetForm onBackToSignIn={mockOnBackToSignIn} />);

    const emailInput = screen.getByLabelText('Email Address');
    const sendButton = screen.getByRole('button', { name: 'Send Reset Link' });

    await user.type(emailInput, 'nonexistent@example.com');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('handles rate limiting error', async () => {
    const user = userEvent.setup();
    (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({
      error: new Error('rate limit exceeded')
    });

    render(<PasswordResetForm onBackToSignIn={mockOnBackToSignIn} />);

    const emailInput = screen.getByLabelText('Email Address');
    const sendButton = screen.getByRole('button', { name: 'Send Reset Link' });

    await user.type(emailInput, 'test@example.com');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/Too many reset requests/)).toBeInTheDocument();
    });
  });

  it('shows loading state during request', async () => {
    const user = userEvent.setup();
    (supabase.auth.resetPasswordForEmail as any).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 1000))
    );

    render(<PasswordResetForm onBackToSignIn={mockOnBackToSignIn} />);

    const emailInput = screen.getByLabelText('Email Address');
    const sendButton = screen.getByRole('button', { name: 'Send Reset Link' });

    await user.type(emailInput, 'test@example.com');
    await user.click(sendButton);

    expect(screen.getByText('Sending Reset Link...')).toBeInTheDocument();
    expect(emailInput).toBeDisabled();
  });

  it('navigates back to sign in from form', async () => {
    const user = userEvent.setup();

    render(<PasswordResetForm onBackToSignIn={mockOnBackToSignIn} />);

    const backButton = screen.getByRole('button', { name: 'Back to Sign In' });
    await user.click(backButton);

    expect(mockOnBackToSignIn).toHaveBeenCalled();
  });

  it('navigates back to sign in from success screen', async () => {
    const user = userEvent.setup();
    (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ error: null });

    render(<PasswordResetForm onBackToSignIn={mockOnBackToSignIn} />);

    const emailInput = screen.getByLabelText('Email Address');
    const sendButton = screen.getByRole('button', { name: 'Send Reset Link' });

    await user.type(emailInput, 'test@example.com');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Reset Link Sent!')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: 'Back to Sign In' });
    await user.click(backButton);

    expect(mockOnBackToSignIn).toHaveBeenCalled();
  });

  it('displays success screen with correct email', async () => {
    const user = userEvent.setup();
    (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ error: null });

    render(<PasswordResetForm onBackToSignIn={mockOnBackToSignIn} />);

    const emailInput = screen.getByLabelText('Email Address');
    const sendButton = screen.getByRole('button', { name: 'Send Reset Link' });

    await user.type(emailInput, 'user@example.com');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      expect(screen.getByText(/user@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/Check your email inbox/)).toBeInTheDocument();
    });
  });

  it('disables form elements during loading', async () => {
    const user = userEvent.setup();
    (supabase.auth.resetPasswordForEmail as any).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 1000))
    );

    render(<PasswordResetForm onBackToSignIn={mockOnBackToSignIn} />);

    const emailInput = screen.getByLabelText('Email Address');
    const sendButton = screen.getByRole('button', { name: 'Send Reset Link' });
    const backButton = screen.getByRole('button', { name: 'Back to Sign In' });

    await user.type(emailInput, 'test@example.com');
    await user.click(sendButton);

    expect(emailInput).toBeDisabled();
    expect(backButton).toBeDisabled();
  });
});