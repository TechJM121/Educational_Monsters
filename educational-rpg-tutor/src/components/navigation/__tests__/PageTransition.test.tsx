import React from 'react';
import { render, screen } from '@testing-library/react';
import { 
  PageTransition, 
  HomePageTransition, 
  LearningPageTransition, 
  CharacterPageTransition,
  ModalTransition 
} from '../PageTransition';

import { vi } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

describe('PageTransition', () => {
  it('renders children with default transition', () => {
    render(
      <PageTransition>
        <div data-testid="test-content">Test Content</div>
      </PageTransition>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PageTransition className="custom-class">
        <div>Test Content</div>
      </PageTransition>
    );

    expect(container.firstChild).toHaveClass('w-full', 'custom-class');
  });

  it('accepts custom transition configuration', () => {
    const customTransition = {
      initial: { opacity: 0, x: -100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 100 },
      transition: { duration: 0.5 }
    };

    render(
      <PageTransition transition={customTransition}>
        <div data-testid="test-content">Test Content</div>
      </PageTransition>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });
});

describe('Specialized Transitions', () => {
  it('HomePageTransition renders children', () => {
    render(
      <HomePageTransition>
        <div data-testid="home-content">Home Content</div>
      </HomePageTransition>
    );

    expect(screen.getByTestId('home-content')).toBeInTheDocument();
  });

  it('LearningPageTransition renders children', () => {
    render(
      <LearningPageTransition>
        <div data-testid="learning-content">Learning Content</div>
      </LearningPageTransition>
    );

    expect(screen.getByTestId('learning-content')).toBeInTheDocument();
  });

  it('CharacterPageTransition renders children', () => {
    render(
      <CharacterPageTransition>
        <div data-testid="character-content">Character Content</div>
      </CharacterPageTransition>
    );

    expect(screen.getByTestId('character-content')).toBeInTheDocument();
  });

  it('ModalTransition renders children', () => {
    render(
      <ModalTransition>
        <div data-testid="modal-content">Modal Content</div>
      </ModalTransition>
    );

    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });
});