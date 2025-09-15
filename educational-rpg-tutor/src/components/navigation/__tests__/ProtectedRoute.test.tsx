import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { useSupabase } from '../../../hooks/useSupabase';
import { vi } from 'vitest';

// Mock the useSupabase hook
vi.mock('../../../hooks/useSupabase');
const mockUseSupabase = useSupabase as any;

// Mock the LoadingSpinner component
vi.mock('../../shared/LoadingSpinner', () => ({
  LoadingSpinner: ({ text }: { text?: string }) => (
    <div data-testid="loading-spinner">{text}</div>
  )
}));

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner when authentication is loading', () => {
    mockUseSupabase.mockReturnValue({
      user: null,
      loading: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders children when user is authenticated and route requires auth', () => {
    mockUseSupabase.mockReturnValue({
      user: { id: '123', email: 'test@example.com' } as any,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    });

    renderWithRouter(
      <ProtectedRoute requiresAuth={true}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('renders children when user is not authenticated and route does not require auth', () => {
    mockUseSupabase.mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    });

    renderWithRouter(
      <ProtectedRoute requiresAuth={false}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('redirects to auth when user is not authenticated and route requires auth', () => {
    mockUseSupabase.mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    });

    renderWithRouter(
      <ProtectedRoute requiresAuth={true}>
        <TestComponent />
      </ProtectedRoute>
    );

    // Should redirect to /auth, so protected content should not be visible
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirects to home when user is authenticated and route does not require auth', () => {
    mockUseSupabase.mockReturnValue({
      user: { id: '123', email: 'test@example.com' } as any,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    });

    renderWithRouter(
      <ProtectedRoute requiresAuth={false}>
        <TestComponent />
      </ProtectedRoute>
    );

    // Should redirect to /home, so protected content should not be visible
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});