import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../ErrorBoundary';
import { ToastProvider, useToast } from '../ToastSystem';
import { useFormValidation, ValidatedInput } from '../FormValidation';
import { HelpProvider, useHelp, HelpButton } from '../HelpSystem';
import { FeedbackModal } from '../FeedbackSystem';
import { ConnectionStatus, useConnectionStatus } from '../ConnectionStatus';
import { errorService } from '../../../services/errorService';

// Mock components for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

const ToastTestComponent = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  return (
    <div>
      <button onClick={() => showSuccess('Success', 'Success message')}>
        Show Success
      </button>
      <button onClick={() => showError('Error', 'Error message')}>
        Show Error
      </button>
      <button onClick={() => showWarning('Warning', 'Warning message')}>
        Show Warning
      </button>
      <button onClick={() => showInfo('Info', 'Info message')}>
        Show Info
      </button>
    </div>
  );
};

const FormTestComponent = () => {
  const [formData, setFormData] = React.useState({ email: '', password: '' });
  
  const validation = useFormValidation({
    rules: {
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      password: {
        required: true,
        minLength: 8
      }
    }
  });

  return (
    <form>
      <ValidatedInput
        label="Email"
        field="email"
        type="email"
        value={formData.email}
        onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
        validation={validation}
      />
      <ValidatedInput
        label="Password"
        field="password"
        type="password"
        value={formData.password}
        onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
        validation={validation}
      />
      <div data-testid="validation-status">
        {validation.isValid ? 'Valid' : 'Invalid'}
      </div>
    </form>
  );
};

const HelpTestComponent = () => {
  const { showHelp } = useHelp();
  
  return (
    <div>
      <button onClick={() => showHelp('character-stats')}>
        Show Help
      </button>
      <HelpButton helpId="xp-system" />
    </div>
  );
};

const ConnectionTestComponent = () => {
  const { connectionState, updateConnectionState } = useConnectionStatus();
  
  return (
    <div>
      <ConnectionStatus
        connectionState={connectionState}
        onRetry={() => updateConnectionState({ isConnected: true })}
      />
      <button 
        onClick={() => updateConnectionState({ isOnline: false })}
        data-testid="go-offline"
      >
        Go Offline
      </button>
      <button 
        onClick={() => updateConnectionState({ isConnected: false })}
        data-testid="disconnect"
      >
        Disconnect
      </button>
    </div>
  );
};

describe('Error Handling System', () => {
  beforeEach(() => {
    // Clear error service queue before each test
    errorService.clearErrors();
    
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ErrorBoundary', () => {
    it('should catch and display errors', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/try again/i)).toBeInTheDocument();
    });

    it('should allow retry after error', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Click retry button
      fireEvent.click(screen.getByText(/try again/i));

      // Rerender with no error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should show repeated error message after multiple retries', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Simulate multiple retries
      for (let i = 0; i < 3; i++) {
        fireEvent.click(screen.getByText(/try again/i));
        rerender(
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        );
      }

      expect(screen.getByText(/persistent error detected/i)).toBeInTheDocument();
      expect(screen.getByText(/report this error/i)).toBeInTheDocument();
    });

    it('should call onError callback when error occurs', () => {
      const onError = jest.fn();
      
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });
  });

  describe('Toast System', () => {
    it('should display success toast', async () => {
      render(
        <ToastProvider>
          <ToastTestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Success'));

      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText('Success message')).toBeInTheDocument();
      });
    });

    it('should display error toast with actions', async () => {
      render(
        <ToastProvider>
          <ToastTestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Error'));

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Error message')).toBeInTheDocument();
      });
    });

    it('should auto-remove toasts after duration', async () => {
      render(
        <ToastProvider>
          <ToastTestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Info'));

      await waitFor(() => {
        expect(screen.getByText('Info')).toBeInTheDocument();
      });

      // Wait for auto-removal (4 seconds for info toasts)
      await waitFor(() => {
        expect(screen.queryByText('Info')).not.toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should allow manual toast removal', async () => {
      render(
        <ToastProvider>
          <ToastTestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Warning'));

      await waitFor(() => {
        expect(screen.getByText('Warning')).toBeInTheDocument();
      });

      // Click close button
      const closeButton = screen.getByLabelText('Close notification');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Warning')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup();
      
      render(<FormTestComponent />);

      expect(screen.getByTestId('validation-status')).toHaveTextContent('Invalid');

      // Fill in valid email
      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'test@example.com');
      await user.tab(); // Trigger blur

      // Still invalid because password is missing
      expect(screen.getByTestId('validation-status')).toHaveTextContent('Invalid');

      // Fill in valid password
      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'password123');
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.getByTestId('validation-status')).toHaveTextContent('Valid');
      });
    });

    it('should show validation errors', async () => {
      const user = userEvent.setup();
      
      render(<FormTestComponent />);

      // Enter invalid email
      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.getByText(/format is invalid/i)).toBeInTheDocument();
      });

      // Enter short password
      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, '123');
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.getByText(/must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should clear errors when input becomes valid', async () => {
      const user = userEvent.setup();
      
      render(<FormTestComponent />);

      // Enter invalid email
      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'invalid');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/format is invalid/i)).toBeInTheDocument();
      });

      // Fix the email
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@example.com');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/format is invalid/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Help System', () => {
    it('should display help modal when help button is clicked', async () => {
      render(
        <HelpProvider>
          <HelpTestComponent />
        </HelpProvider>
      );

      fireEvent.click(screen.getByText('Show Help'));

      await waitFor(() => {
        expect(screen.getByText('Character Stats')).toBeInTheDocument();
        expect(screen.getByText(/your character has 6 stats/i)).toBeInTheDocument();
      });
    });

    it('should close help modal when close button is clicked', async () => {
      render(
        <HelpProvider>
          <HelpTestComponent />
        </HelpProvider>
      );

      fireEvent.click(screen.getByText('Show Help'));

      await waitFor(() => {
        expect(screen.getByText('Character Stats')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Close help'));

      await waitFor(() => {
        expect(screen.queryByText('Character Stats')).not.toBeInTheDocument();
      });
    });

    it('should show help button with tooltip', async () => {
      render(
        <HelpProvider>
          <HelpTestComponent />
        </HelpProvider>
      );

      const helpButton = screen.getByLabelText(/get help about/i);
      expect(helpButton).toBeInTheDocument();

      // Hover to show tooltip
      fireEvent.mouseEnter(helpButton);

      await waitFor(() => {
        expect(screen.getByText(/help: experience points/i)).toBeInTheDocument();
      });
    });
  });

  describe('Connection Status', () => {
    it('should display online status', () => {
      render(<ConnectionTestComponent />);

      expect(screen.getByText(/connected/i)).toBeInTheDocument();
    });

    it('should display offline status', async () => {
      render(<ConnectionTestComponent />);

      fireEvent.click(screen.getByTestId('go-offline'));

      await waitFor(() => {
        expect(screen.getByText(/no internet/i)).toBeInTheDocument();
      });
    });

    it('should display disconnected status', async () => {
      render(<ConnectionTestComponent />);

      fireEvent.click(screen.getByTestId('disconnect'));

      await waitFor(() => {
        expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
      });
    });

    it('should show retry button when disconnected', async () => {
      render(<ConnectionTestComponent />);

      fireEvent.click(screen.getByTestId('disconnect'));

      await waitFor(() => {
        expect(screen.getByText(/retry connection/i)).toBeInTheDocument();
      });
    });
  });

  describe('Feedback System', () => {
    it('should open feedback modal', () => {
      render(
        <FeedbackModal
          isOpen={true}
          onClose={() => {}}
        />
      );

      expect(screen.getByText('Share Your Feedback')).toBeInTheDocument();
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('should validate feedback form', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      
      render(
        <FeedbackModal
          isOpen={true}
          onClose={onClose}
        />
      );

      // Try to submit empty form
      const submitButton = screen.getByText('Submit Feedback');
      fireEvent.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      });

      // Fill in valid data
      await user.type(screen.getByLabelText('Title'), 'Test feedback title');
      await user.type(screen.getByLabelText('Description'), 'This is a test feedback description with enough characters');

      // Form should become valid
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Error Service', () => {
    it('should create and log errors', () => {
      const error = errorService.createError(
        'validation',
        'Test error message',
        { severity: 'medium' }
      );

      expect(error.type).toBe('validation');
      expect(error.message).toBe('Test error message');
      expect(error.severity).toBe('medium');
      expect(error.id).toBeDefined();
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should handle network errors', () => {
      const networkError = new Error('Network request failed');
      const appError = errorService.handleNetworkError(networkError, { url: '/api/test' });

      expect(appError.type).toBe('network');
      expect(appError.retryable).toBe(true);
      expect(appError.context?.url).toBe('/api/test');
    });

    it('should convert errors to toast notifications', () => {
      const error = errorService.createError(
        'character',
        'Character loading failed',
        { severity: 'high', retryable: true }
      );

      const toast = errorService.errorToToast(error);

      expect(toast.type).toBe('error');
      expect(toast.title).toBe('Character Loading Error');
      expect(toast.message).toBe('Character loading failed');
      expect(toast.actions).toHaveLength(1);
      expect(toast.actions?.[0].label).toBe('Retry');
    });

    it('should maintain error queue', () => {
      const error1 = errorService.createError('system', 'Error 1');
      const error2 = errorService.createError('system', 'Error 2');

      errorService.logError(error1);
      errorService.logError(error2);

      const recentErrors = errorService.getRecentErrors(2);
      expect(recentErrors).toHaveLength(2);
      expect(recentErrors[1].message).toBe('Error 2');

      errorService.clearErrors();
      expect(errorService.getRecentErrors()).toHaveLength(0);
    });
  });
});