import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SignInForm } from '../SignInForm';
import { AuthService } from '../../../services/authService';

// Mock the auth service
vi.mock('../../../services/authService', () => ({
  AuthService: {
    signIn: vi.fn()
  }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

describe('SignInForm', () => {
  const mockOnSignInSuccess = vi.fn();
  const mockOnSwitchToRegister = vi.fn();
  const mockOnForgotPassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign in form correctly', () => {
    render(
      <SignInForm
        onSignInSuccess={mockOnSignInSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    expect(screen.getByText('Welcome Back, Hero!')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('handles successful sign in', async () => {
    const user = userEvent.setup();
    (AuthService.signIn as any).mockResolvedValue({ user: { id: 'user-123' } });

    render(
      <SignInForm
        onSignInSuccess={mockOnSignInSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const signInButton = screen.getByRole('button', { name: 'Sign In' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(signInButton);

    await waitFor(() => {
      expect(AuthService.signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockOnSignInSuccess).toHaveBeenCalled();
    });
  });

  it('displays error for invalid credentials', async () => {
    const user = userEvent.setup();
    (AuthService.signIn as any).mockRejectedValue(new Error('Invalid login credentials'));

    render(
      <SignInForm
        onSignInSuccess={mockOnSignInSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const signInButton = screen.getByRole('button', { name: 'Sign In' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/)).toBeInTheDocument();
    });
  });

  it('displays error for unconfirmed email', async () => {
    const user = userEvent.setup();
    (AuthService.signIn as any).mockRejectedValue(new Error('Email not confirmed'));

    render(
      <SignInForm
        onSignInSuccess={mockOnSignInSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const signInButton = screen.getByRole('button', { name: 'Sign In' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/Please check your email and click the confirmation link/)).toBeInTheDocument();
    });
  });

  it('handles rate limiting error', async () => {
    const user = userEvent.setup();
    (AuthService.signIn as any).mockRejectedValue(new Error('Too many requests'));

    render(
      <SignInForm
        onSignInSuccess={mockOnSignInSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const signInButton = screen.getByRole('button', { name: 'Sign In' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/Too many sign-in attempts/)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();

    render(
      <SignInForm
        onSignInSuccess={mockOnSignInSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /👁️/ });

    expect(passwordInput.type).toBe('password');

    await user.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    await user.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('navigates to registration form', async () => {
    const user = userEvent.setup();

    render(
      <SignInForm
        onSignInSuccess={mockOnSignInSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const createAccountButton = screen.getByRole('button', { name: 'Create New Account' });
    await user.click(createAccountButton);

    expect(mockOnSwitchToRegister).toHaveBeenCalled();
  });

  it('navigates to password reset form', async () => {
    const user = userEvent.setup();

    render(
      <SignInForm
        onSignInSuccess={mockOnSignInSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const forgotPasswordButton = screen.getByRole('button', { name: 'Forgot your password?' });
    await user.click(forgotPasswordButton);

    expect(mockOnForgotPassword).toHaveBeenCalled();
  });

  it('disables form during loading', async () => {
    const user = userEvent.setup();
    (AuthService.signIn as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(
      <SignInForm
        onSignInSuccess={mockOnSignInSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const signInButton = screen.getByRole('button', { name: 'Sign In' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(signInButton);

    // Check that form is disabled during loading
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(screen.getByText('Signing In...')).toBeInTheDocument();
  });

  it('clears error when user starts typing', async () => {
    const user = userEvent.setup();
    (AuthService.signIn as any).mockRejectedValue(new Error('Invalid login credentials'));

    render(
      <SignInForm
        onSignInSuccess={mockOnSignInSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const signInButton = screen.getByRole('button', { name: 'Sign In' });

    // Trigger error
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/)).toBeInTheDocument();
    });

    // Clear error by typing
    await user.clear(emailInput);
    await user.type(emailInput, 'new@example.com');

    expect(screen.queryByText(/Invalid email or password/)).not.toBeInTheDocument();
  });
});