import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RegistrationFlow } from '../RegistrationFlow';
import { AuthService } from '../../../services/authService';

// Mock the auth service
vi.mock('../../../services/authService', () => ({
  AuthService: {
    signUp: vi.fn()
  }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => children
}));

describe('RegistrationFlow', () => {
  const mockOnRegistrationComplete = vi.fn();
  const mockOnBackToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with age verification step', () => {
    render(
      <RegistrationFlow
        onRegistrationComplete={mockOnRegistrationComplete}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    expect(screen.getByText('Age Verification')).toBeInTheDocument();
    expect(screen.getByLabelText('How old are you?')).toBeInTheDocument();
  });

  it('validates age input correctly', async () => {
    const user = userEvent.setup();

    render(
      <RegistrationFlow
        onRegistrationComplete={mockOnRegistrationComplete}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const ageInput = screen.getByLabelText('How old are you?');
    const continueButton = screen.getByRole('button', { name: 'Continue' });

    // Test invalid age (too young)
    await user.type(ageInput, '2');
    await user.click(continueButton);

    expect(screen.getByText('Age must be between 3 and 18 years old')).toBeInTheDocument();

    // Test invalid age (too old)
    await user.clear(ageInput);
    await user.type(ageInput, '25');
    await user.click(continueButton);

    expect(screen.getByText('Age must be between 3 and 18 years old')).toBeInTheDocument();

    // Test valid age
    await user.clear(ageInput);
    await user.type(ageInput, '15');
    await user.click(continueButton);

    // Should proceed to registration step (no parental consent needed)
    await waitFor(() => {
      expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    });
  });

  it('shows parental consent step for users under 13', async () => {
    const user = userEvent.setup();

    render(
      <RegistrationFlow
        onRegistrationComplete={mockOnRegistrationComplete}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    const ageInput = screen.getByLabelText('How old are you?');
    const continueButton = screen.getByRole('button', { name: 'Continue' });

    await user.type(ageInput, '10');
    await user.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('Parental Consent Required')).toBeInTheDocument();
      expect(screen.getByText(/Since you're 10 years old/)).toBeInTheDocument();
    });
  });

  it('validates parent email in consent step', async () => {
    const user = userEvent.setup();

    render(
      <RegistrationFlow
        onRegistrationComplete={mockOnRegistrationComplete}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    // Navigate to consent step
    const ageInput = screen.getByLabelText('How old are you?');
    await user.type(ageInput, '8');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(screen.getByText('Parental Consent Required')).toBeInTheDocument();
    });

    const parentEmailInput = screen.getByLabelText('Parent/Guardian Email Address');
    const confirmEmailInput = screen.getByLabelText('Confirm Email Address');
    const sendConsentButton = screen.getByRole('button', { name: 'Send Consent Request' });

    // Test mismatched emails
    await user.type(parentEmailInput, 'parent@example.com');
    await user.type(confirmEmailInput, 'different@example.com');
    await user.click(sendConsentButton);

    expect(screen.getByText('Email addresses do not match')).toBeInTheDocument();

    // Test invalid email format
    await user.clear(parentEmailInput);
    await user.clear(confirmEmailInput);
    await user.type(parentEmailInput, 'invalid-email');
    await user.type(confirmEmailInput, 'invalid-email');
    await user.click(sendConsentButton);

    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();

    // Test valid emails
    await user.clear(parentEmailInput);
    await user.clear(confirmEmailInput);
    await user.type(parentEmailInput, 'parent@example.com');
    await user.type(confirmEmailInput, 'parent@example.com');
    await user.click(sendConsentButton);

    await waitFor(() => {
      expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    });
  });

  it('validates registration form correctly', async () => {
    const user = userEvent.setup();

    render(
      <RegistrationFlow
        onRegistrationComplete={mockOnRegistrationComplete}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    // Navigate to registration step (age 15, no consent needed)
    const ageInput = screen.getByLabelText('How old are you?');
    await user.type(ageInput, '15');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Your Name');
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const createAccountButton = screen.getByRole('button', { name: 'Create Account' });

    // Test short name
    await user.type(nameInput, 'A');
    await user.click(createAccountButton);

    expect(screen.getByText('Name must be at least 2 characters long')).toBeInTheDocument();

    // Test invalid email
    await user.clear(nameInput);
    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'invalid-email');
    await user.click(createAccountButton);

    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();

    // Test weak password
    await user.clear(emailInput);
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123');
    await user.click(createAccountButton);

    expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();

    // Test password without complexity
    await user.clear(passwordInput);
    await user.type(passwordInput, 'password');
    await user.click(createAccountButton);

    expect(screen.getByText(/Password must contain at least one uppercase letter/)).toBeInTheDocument();

    // Test mismatched passwords
    await user.clear(passwordInput);
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Different123');
    await user.click(createAccountButton);

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  it('handles successful registration for users 13+', async () => {
    const user = userEvent.setup();
    (AuthService.signUp as any).mockResolvedValue({
      user: { id: 'user-123' },
      needsParentalConsent: false
    });

    render(
      <RegistrationFlow
        onRegistrationComplete={mockOnRegistrationComplete}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    // Complete the flow
    const ageInput = screen.getByLabelText('How old are you?');
    await user.type(ageInput, '16');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Your Name');
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(AuthService.signUp).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        age: 16,
        parentEmail: undefined
      });
      expect(mockOnRegistrationComplete).toHaveBeenCalled();
    });
  });

  it('handles successful registration for users under 13', async () => {
    const user = userEvent.setup();
    (AuthService.signUp as any).mockResolvedValue({
      user: { id: 'user-123' },
      needsParentalConsent: true
    });

    render(
      <RegistrationFlow
        onRegistrationComplete={mockOnRegistrationComplete}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    // Complete the flow for under 13
    const ageInput = screen.getByLabelText('How old are you?');
    await user.type(ageInput, '10');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(screen.getByText('Parental Consent Required')).toBeInTheDocument();
    });

    // Fill parent email
    const parentEmailInput = screen.getByLabelText('Parent/Guardian Email Address');
    const confirmEmailInput = screen.getByLabelText('Confirm Email Address');
    await user.type(parentEmailInput, 'parent@example.com');
    await user.type(confirmEmailInput, 'parent@example.com');
    await user.click(screen.getByRole('button', { name: 'Send Consent Request' }));

    await waitFor(() => {
      expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    });

    // Fill registration form
    const nameInput = screen.getByLabelText('Your Name');
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    await user.type(nameInput, 'Young User');
    await user.type(emailInput, 'young@example.com');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(screen.getByRole('button', { name: 'Request Consent' }));

    await waitFor(() => {
      expect(AuthService.signUp).toHaveBeenCalledWith({
        name: 'Young User',
        email: 'young@example.com',
        password: 'Password123',
        age: 10,
        parentEmail: 'parent@example.com'
      });
      expect(screen.getByText('Parental Consent Requested')).toBeInTheDocument();
    });
  });

  it('handles registration errors', async () => {
    const user = userEvent.setup();
    (AuthService.signUp as any).mockRejectedValue(new Error('Email already exists'));

    render(
      <RegistrationFlow
        onRegistrationComplete={mockOnRegistrationComplete}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    // Navigate to registration and submit
    const ageInput = screen.getByLabelText('How old are you?');
    await user.type(ageInput, '16');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Your Name');
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('allows navigation back through steps', async () => {
    const user = userEvent.setup();

    render(
      <RegistrationFlow
        onRegistrationComplete={mockOnRegistrationComplete}
        onBackToLogin={mockOnBackToLogin}
      />
    );

    // Go to consent step
    const ageInput = screen.getByLabelText('How old are you?');
    await user.type(ageInput, '8');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(screen.getByText('Parental Consent Required')).toBeInTheDocument();
    });

    // Go back to age step
    await user.click(screen.getByRole('button', { name: 'Back' }));

    await waitFor(() => {
      expect(screen.getByText('Age Verification')).toBeInTheDocument();
    });

    // Go back to login
    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(mockOnBackToLogin).toHaveBeenCalled();
  });
});