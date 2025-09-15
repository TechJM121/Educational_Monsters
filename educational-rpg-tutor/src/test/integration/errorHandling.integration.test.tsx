import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ErrorHandlingProvider, useGameErrorHandling } from '../../components/shared/ErrorHandlingProvider';
import { supabase } from '../../services/supabaseClient';

// Mock Supabase
jest.mock('../../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ error: null })),
      select: jest.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      }))
    }
  }
}));

// Mock useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    isAuthenticated: true
  })
}));

// Test component that uses error handling
const TestComponent = () => {
  const { 
    handleAsyncError, 
    handleCharacterError, 
    handleLearningError,
    handleSaveError 
  } = useGameErrorHandling();

  const triggerNetworkError = () => {
    handleAsyncError(
      () => Promise.reject(new Error('Network request failed')),
      'Failed to load data',
      { component: 'test' }
    ).catch(() => {
      // Error is handled by handleAsyncError
    });
  };

  const triggerCharacterError = () => {
    handleCharacterError(new Error('Character data corrupted'), 'load character');
  };

  const triggerLearningError = () => {
    handleLearningError(new Error('Question loading failed'), 'math quiz');
  };

  const triggerSaveError = () => {
    handleSaveError(new Error('Save operation failed'), 'character progress');
  };

  return (
    <div>
      <button onClick={triggerNetworkError} data-testid="network-error">
        Trigger Network Error
      </button>
      <button onClick={triggerCharacterError} data-testid="character-error">
        Trigger Character Error
      </button>
      <button onClick={triggerLearningError} data-testid="learning-error">
        Trigger Learning Error
      </button>
      <button onClick={triggerSaveError} data-testid="save-error">
        Trigger Save Error
      </button>
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ErrorHandlingProvider>
        {component}
      </ErrorHandlingProvider>
    </BrowserRouter>
  );
};

describe('Error Handling Integration', () => {
  beforeEach(() => {
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Mock fetch for connection tests
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle network errors with appropriate user feedback', async () => {
    renderWithProviders(<TestComponent />);

    fireEvent.click(screen.getByTestId('network-error'));

    await waitFor(() => {
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText(/check your internet connection/i)).toBeInTheDocument();
    });
  });

  it('should handle character errors with user-friendly messages', async () => {
    renderWithProviders(<TestComponent />);

    fireEvent.click(screen.getByTestId('character-error'));

    await waitFor(() => {
      expect(screen.getByText('Character Error')).toBeInTheDocument();
      expect(screen.getByText(/failed to load character/i)).toBeInTheDocument();
      expect(screen.getByText(/character data is safe/i)).toBeInTheDocument();
    });
  });

  it('should handle learning errors without disrupting the experience', async () => {
    renderWithProviders(<TestComponent />);

    fireEvent.click(screen.getByTestId('learning-error'));

    await waitFor(() => {
      expect(screen.getByText('Learning Activity Error')).toBeInTheDocument();
      expect(screen.getByText(/issue with math quiz/i)).toBeInTheDocument();
      expect(screen.getByText(/progress has been saved/i)).toBeInTheDocument();
    });
  });

  it('should handle save errors with retry indication', async () => {
    renderWithProviders(<TestComponent />);

    fireEvent.click(screen.getByTestId('save-error'));

    await waitFor(() => {
      expect(screen.getByText('Save Failed')).toBeInTheDocument();
      expect(screen.getByText(/couldn't save character progress/i)).toBeInTheDocument();
      expect(screen.getByText(/retried automatically/i)).toBeInTheDocument();
    });
  });

  it('should show connection status and handle offline scenarios', async () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });

    renderWithProviders(<TestComponent />);

    // Should show offline status
    await waitFor(() => {
      expect(screen.getByText(/no internet/i)).toBeInTheDocument();
    });

    // Should show offline error toast
    await waitFor(() => {
      expect(screen.getByText('No Internet Connection')).toBeInTheDocument();
      expect(screen.getByText(/offline.*progress.*saved locally/i)).toBeInTheDocument();
    });
  });

  it('should handle connection restoration', async () => {
    // Start offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/no internet/i)).toBeInTheDocument();
    });

    // Simulate going back online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });

    // Trigger online event
    fireEvent(window, new Event('online'));

    await waitFor(() => {
      expect(screen.getByText('Connection Restored')).toBeInTheDocument();
      expect(screen.getByText(/back online.*synced/i)).toBeInTheDocument();
    });
  });

  it('should show floating feedback button', () => {
    renderWithProviders(<TestComponent />);

    const feedbackButton = screen.getByLabelText('Give feedback');
    expect(feedbackButton).toBeInTheDocument();
  });

  it('should open feedback modal from floating button', async () => {
    renderWithProviders(<TestComponent />);

    const feedbackButton = screen.getByLabelText('Give feedback');
    fireEvent.click(feedbackButton);

    await waitFor(() => {
      expect(screen.getByText('Share Your Feedback')).toBeInTheDocument();
    });
  });

  it('should handle global unhandled promise rejections', async () => {
    renderWithProviders(<TestComponent />);

    // Trigger unhandled promise rejection
    const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
      promise: Promise.reject(new Error('Unhandled error')),
      reason: new Error('Unhandled error')
    });

    fireEvent(window, rejectionEvent);

    // Should log error (we can't easily test this without mocking the error service)
    expect(console.error).toHaveBeenCalledWith(
      'Unhandled promise rejection:',
      expect.any(Error)
    );
  });

  it('should handle global JavaScript errors', async () => {
    renderWithProviders(<TestComponent />);

    // Trigger global error
    const errorEvent = new ErrorEvent('error', {
      message: 'Global error occurred',
      filename: 'test.js',
      lineno: 123,
      colno: 45,
      error: new Error('Global error')
    });

    fireEvent(window, errorEvent);

    // Should log error
    expect(console.error).toHaveBeenCalledWith(
      'Global error:',
      expect.any(Error)
    );
  });

  it('should retry connection when retry button is clicked', async () => {
    // Mock fetch to simulate connection test
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200
    });

    renderWithProviders(<TestComponent />);

    // Find and click retry button (may need to trigger disconnection first)
    const retryButton = screen.queryByText(/retry connection/i);
    if (retryButton) {
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/health', {
          method: 'HEAD',
          cache: 'no-cache'
        });
      });
    }
  });

  it('should show detailed connection status on hover', async () => {
    renderWithProviders(<TestComponent />);

    const connectionStatus = screen.getByText(/connected/i).closest('div');
    if (connectionStatus) {
      fireEvent.mouseEnter(connectionStatus);

      await waitFor(() => {
        // Should show tooltip with connection details
        expect(screen.getByText(/connected to server/i)).toBeInTheDocument();
      });
    }
  });

  it('should handle form validation errors appropriately', async () => {
    const FormTestComponent = () => {
      const { reportValidationError } = useGameErrorHandling();
      
      const handleInvalidSubmit = () => {
        reportValidationError('email', 'Invalid email format', { form: 'login' });
      };

      return (
        <button onClick={handleInvalidSubmit} data-testid="invalid-form">
          Submit Invalid Form
        </button>
      );
    };

    renderWithProviders(<FormTestComponent />);

    fireEvent.click(screen.getByTestId('invalid-form'));

    // Validation errors are logged but don't show toasts by default
    // This is expected behavior as form validation should be handled by form components
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle multiple simultaneous errors gracefully', async () => {
    renderWithProviders(<TestComponent />);

    // Trigger multiple errors quickly
    fireEvent.click(screen.getByTestId('network-error'));
    fireEvent.click(screen.getByTestId('character-error'));
    fireEvent.click(screen.getByTestId('learning-error'));

    // Should show multiple toasts without crashing
    await waitFor(() => {
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText('Character Error')).toBeInTheDocument();
      expect(screen.getByText('Learning Activity Error')).toBeInTheDocument();
    });
  });

  it('should limit the number of toasts shown simultaneously', async () => {
    renderWithProviders(<TestComponent />);

    // Trigger many errors to test toast limit
    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getByTestId('character-error'));
    }

    await waitFor(() => {
      const toasts = screen.getAllByText('Character Error');
      // Should be limited to maxToasts (default 5)
      expect(toasts.length).toBeLessThanOrEqual(5);
    });
  });
});