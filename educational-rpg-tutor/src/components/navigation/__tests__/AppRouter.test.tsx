import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppRouter } from '../../../router/AppRouter';
import { vi } from 'vitest';

// Mock all the page components
vi.mock('../../../pages/HomePage', () => ({
  HomePage: () => <div data-testid="home-page">Home Page</div>
}));

vi.mock('../../../pages/AuthPage', () => ({
  AuthPage: () => <div data-testid="auth-page">Auth Page</div>
}));

vi.mock('../../../pages/LearningPage', () => ({
  LearningPage: () => <div data-testid="learning-page">Learning Page</div>
}));

// Mock the useSupabase hook
vi.mock('../../../hooks/useSupabase', () => ({
  useSupabase: () => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn()
  })
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>
}));

// Mock other components
vi.mock('../AppLayout', () => ({
  AppLayout: ({ children, showNavigation }: any) => (
    <div data-testid="app-layout" data-show-navigation={showNavigation}>
      {children}
    </div>
  )
}));

vi.mock('../ProtectedRoute', () => ({
  ProtectedRoute: ({ children, requiresAuth }: any) => (
    <div data-testid="protected-route" data-requires-auth={requiresAuth}>
      {children}
    </div>
  )
}));

describe('AppRouter', () => {
  it('renders without crashing', () => {
    render(<AppRouter />);
    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
  });

  it('sets up routing structure correctly', () => {
    render(<AppRouter />);
    // Just verify the router renders without errors
    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
  });
});