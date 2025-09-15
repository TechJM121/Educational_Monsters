import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NotFoundPage } from '../NotFoundPage';
import { vi } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>
  }
}));

// Mock the PageTransition component
vi.mock('../PageTransition', () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('NotFoundPage', () => {
  it('renders 404 error message with RPG theme', () => {
    renderWithRouter(<NotFoundPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('🏰 Quest Location Not Found! 🗺️')).toBeInTheDocument();
    expect(screen.getByText(/Brave adventurer, it seems you've wandered into uncharted territory!/)).toBeInTheDocument();
  });

  it('provides navigation links to main pages', () => {
    renderWithRouter(<NotFoundPage />);

    const homeLink = screen.getByRole('link', { name: /Return to Castle/ });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/home');

    const learningLink = screen.getByRole('link', { name: /Start New Quest/ });
    expect(learningLink).toBeInTheDocument();
    expect(learningLink).toHaveAttribute('href', '/learning');
  });

  it('displays suggested quest links', () => {
    renderWithRouter(<NotFoundPage />);

    expect(screen.getByRole('link', { name: /Character Sheet/ })).toHaveAttribute('href', '/character');
    expect(screen.getByRole('link', { name: /Achievements Hall/ })).toHaveAttribute('href', '/achievements');
    expect(screen.getByRole('link', { name: /Inventory Bag/ })).toHaveAttribute('href', '/inventory');
    expect(screen.getByRole('link', { name: /Leaderboard/ })).toHaveAttribute('href', '/leaderboard');
  });

  it('includes RPG-themed visual elements', () => {
    renderWithRouter(<NotFoundPage />);

    // Check for wizard emoji
    expect(screen.getByText('🧙‍♂️')).toBeInTheDocument();
    
    // Check for footer message
    expect(screen.getByText(/"Not all who wander are lost, but this page definitely is!" 🧭/)).toBeInTheDocument();
  });

  it('has proper heading structure for accessibility', () => {
    renderWithRouter(<NotFoundPage />);

    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('404');

    const subHeading = screen.getByRole('heading', { level: 2 });
    expect(subHeading).toHaveTextContent('🏰 Quest Location Not Found! 🗺️');

    const suggestionsHeading = screen.getByRole('heading', { level: 3 });
    expect(suggestionsHeading).toHaveTextContent('🗡️ Suggested Quests:');
  });
});