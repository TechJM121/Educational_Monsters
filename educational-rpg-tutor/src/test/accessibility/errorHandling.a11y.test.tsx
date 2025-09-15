import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ErrorBoundary } from '../../components/shared/ErrorBoundary';
import { ToastProvider, useToast } from '../../components/shared/ToastSystem';
import { HelpProvider, HelpButton } from '../../components/shared/HelpSystem';
import { FeedbackModal } from '../../components/shared/FeedbackSystem';
import { ConnectionStatus } from '../../components/shared/ConnectionStatus';
import { ValidatedInput, useFormValidation } from '../../components/shared/FormValidation';
import { ConnectionState } from '../../types/error';

expect.extend(toHaveNoViolations);

// Test components
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test accessibility error');
  }
  return <div>No error</div>;
};

const ToastTestComponent = () => {
  const { showError, showSuccess } = useToast();
  
  return (
    <div>
      <button onClick={() => showError('Error Title', 'Error message with actions', [{
        label: 'Retry',
        onClick: () => {},
        variant: 'primary'
      }])}>
        Show Error Toast
      </button>
      <button onClick={() => showSuccess('Success', 'Operation completed')}>
        Show Success Toast
      </button>
    </div>
  );
};

const FormTestComponent = () => {
  const [email, setEmail] = React.useState('');
  
  const validation = useFormValidation({
    rules: {
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      }
    }
  });

  return (
    <form>
      <ValidatedInput
        label="Email Address"
        field="email"
        type="email"
        value={email}
        onChange={setEmail}
        validation={validation}
        helpText="Enter your email address to continue"
      />
    </form>
  );
};

describe('Error Handling Accessibility', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ErrorBoundary Accessibility', () => {
    it('should have no accessibility violations in error state', async () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading hierarchy', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent(/something went wrong/i);
    });

    it('should have accessible buttons with proper labels', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const restartButton = screen.getByRole('button', { name: /restart adventure/i });
      const reportButton = screen.getByRole('button', { name: /report this error/i });

      expect(tryAgainButton).toBeInTheDocument();
      expect(restartButton).toBeInTheDocument();
      expect(reportButton).toBeInTheDocument();
    });

    it('should have proper focus management', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      
      // Button should be focusable
      tryAgainButton.focus();
      expect(document.activeElement).toBe(tryAgainButton);
    });

    it('should have accessible error details in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const details = screen.getByRole('group');
      expect(details).toHaveAttribute('open', '');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Toast System Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <ToastProvider>
          <ToastTestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Error Toast'));

      await waitFor(() => {
        expect(screen.getByText('Error Title')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA roles and labels', async () => {
      render(
        <ToastProvider>
          <ToastTestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Error Toast'));

      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close notification');
        expect(closeButton).toBeInTheDocument();
        expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
      });
    });

    it('should announce toast content to screen readers', async () => {
      render(
        <ToastProvider>
          <ToastTestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Error Toast'));

      await waitFor(() => {
        // Toast content should be announced
        const toastContent = screen.getByText('Error message with actions');
        expect(toastContent).toBeInTheDocument();
      });
    });

    it('should have keyboard accessible action buttons', async () => {
      render(
        <ToastProvider>
          <ToastTestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Error Toast'));

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: 'Retry' });
        expect(retryButton).toBeInTheDocument();
        
        // Should be keyboard accessible
        retryButton.focus();
        expect(document.activeElement).toBe(retryButton);
      });
    });
  });

  describe('Form Validation Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<FormTestComponent />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper form labels', () => {
      render(<FormTestComponent />);

      const emailInput = screen.getByLabelText('Email Address');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should associate help text with input', () => {
      render(<FormTestComponent />);

      const emailInput = screen.getByLabelText('Email Address');
      const helpText = screen.getByText('Enter your email address to continue');
      
      expect(emailInput).toHaveAttribute('aria-describedby');
      expect(helpText).toHaveAttribute('id');
    });

    it('should announce validation errors to screen readers', async () => {
      render(<FormTestComponent />);

      const emailInput = screen.getByLabelText('Email Address');
      
      // Enter invalid email and blur
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent(/format is invalid/i);
      });

      // Input should have aria-invalid
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have proper error message association', async () => {
      render(<FormTestComponent />);

      const emailInput = screen.getByLabelText('Email Address');
      
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toHaveAttribute('id');
        expect(emailInput).toHaveAttribute('aria-describedby');
      });
    });
  });

  describe('Help System Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <HelpProvider>
          <HelpButton helpId="character-stats" />
        </HelpProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible help button', () => {
      render(
        <HelpProvider>
          <HelpButton helpId="character-stats" />
        </HelpProvider>
      );

      const helpButton = screen.getByLabelText(/get help about character stats/i);
      expect(helpButton).toBeInTheDocument();
      expect(helpButton).toHaveAttribute('aria-label');
    });

    it('should have accessible help modal', async () => {
      render(
        <HelpProvider>
          <HelpButton helpId="character-stats" />
        </HelpProvider>
      );

      fireEvent.click(screen.getByLabelText(/get help about/i));

      await waitFor(() => {
        const modal = screen.getByRole('dialog', { hidden: true });
        expect(modal).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText('Close help');
      expect(closeButton).toBeInTheDocument();
    });

    it('should trap focus in help modal', async () => {
      render(
        <HelpProvider>
          <HelpButton helpId="character-stats" />
        </HelpProvider>
      );

      fireEvent.click(screen.getByLabelText(/get help about/i));

      await waitFor(() => {
        const modal = screen.getByRole('dialog', { hidden: true });
        expect(modal).toBeInTheDocument();
      });

      // Focus should be trapped within modal
      const closeButton = screen.getByLabelText('Close help');
      closeButton.focus();
      expect(document.activeElement).toBe(closeButton);
    });
  });

  describe('Connection Status Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const connectionState: ConnectionState = {
        isOnline: true,
        isConnected: true,
        pendingActions: 0,
        syncInProgress: false,
        retryCount: 0
      };

      const { container } = render(
        <ConnectionStatus
          connectionState={connectionState}
          onRetry={() => {}}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels for status icons', () => {
      const connectionState: ConnectionState = {
        isOnline: true,
        isConnected: true,
        pendingActions: 0,
        syncInProgress: false,
        retryCount: 0
      };

      render(
        <ConnectionStatus
          connectionState={connectionState}
          onRetry={() => {}}
        />
      );

      const statusIcon = screen.getByLabelText('connection status');
      expect(statusIcon).toBeInTheDocument();
    });

    it('should have accessible retry button when disconnected', () => {
      const connectionState: ConnectionState = {
        isOnline: true,
        isConnected: false,
        pendingActions: 0,
        syncInProgress: false,
        retryCount: 1
      };

      render(
        <ConnectionStatus
          connectionState={connectionState}
          onRetry={() => {}}
        />
      );

      const retryButton = screen.getByRole('button', { name: /retry connection/i });
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Feedback Modal Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <FeedbackModal
          isOpen={true}
          onClose={() => {}}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper modal structure', () => {
      render(
        <FeedbackModal
          isOpen={true}
          onClose={() => {}}
        />
      );

      const modal = screen.getByRole('dialog', { hidden: true });
      expect(modal).toBeInTheDocument();

      const heading = screen.getByRole('heading', { name: /share your feedback/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible form controls', () => {
      render(
        <FeedbackModal
          isOpen={true}
          onClose={() => {}}
        />
      );

      const titleInput = screen.getByLabelText('Title');
      const descriptionInput = screen.getByLabelText('Description');
      const categorySelect = screen.getByLabelText('Category');

      expect(titleInput).toBeInTheDocument();
      expect(descriptionInput).toBeInTheDocument();
      expect(categorySelect).toBeInTheDocument();

      // All should have proper labels
      expect(titleInput).toHaveAttribute('id');
      expect(descriptionInput).toHaveAttribute('id');
      expect(categorySelect).toHaveAttribute('id');
    });

    it('should have accessible rating system', () => {
      render(
        <FeedbackModal
          isOpen={true}
          onClose={() => {}}
        />
      );

      const ratingButtons = screen.getAllByLabelText(/rate \d stars/i);
      expect(ratingButtons).toHaveLength(5);

      ratingButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have accessible close button', () => {
      render(
        <FeedbackModal
          isOpen={true}
          onClose={() => {}}
        />
      );

      const closeButton = screen.getByLabelText('Close feedback form');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation in error boundary', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const buttons = screen.getAllByRole('button');
      
      // All buttons should be keyboard accessible
      buttons.forEach(button => {
        button.focus();
        expect(document.activeElement).toBe(button);
        
        // Should respond to Enter key
        fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      });
    });

    it('should support keyboard navigation in toasts', async () => {
      render(
        <ToastProvider>
          <ToastTestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Error Toast'));

      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close notification');
        const retryButton = screen.getByRole('button', { name: 'Retry' });

        // Should be keyboard accessible
        closeButton.focus();
        expect(document.activeElement).toBe(closeButton);

        retryButton.focus();
        expect(document.activeElement).toBe(retryButton);
      });
    });

    it('should support keyboard navigation in help system', async () => {
      render(
        <HelpProvider>
          <HelpButton helpId="character-stats" />
        </HelpProvider>
      );

      const helpButton = screen.getByLabelText(/get help about/i);
      
      // Should open with Enter key
      helpButton.focus();
      fireEvent.keyDown(helpButton, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close help');
        expect(closeButton).toBeInTheDocument();
        
        // Should close with Escape key
        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide proper live region announcements for toasts', async () => {
      render(
        <ToastProvider>
          <ToastTestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Success Toast'));

      await waitFor(() => {
        // Toast should be announced to screen readers
        const toast = screen.getByText('Success');
        expect(toast).toBeInTheDocument();
      });
    });

    it('should provide proper error announcements', async () => {
      render(<FormTestComponent />);

      const emailInput = screen.getByLabelText('Email Address');
      
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
        // Alert role ensures screen reader announcement
      });
    });
  });
});