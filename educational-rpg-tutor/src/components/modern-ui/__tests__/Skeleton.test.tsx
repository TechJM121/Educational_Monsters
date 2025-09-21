import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Skeleton from '../Skeleton';

describe('Skeleton Component', () => {
  describe('Text Variant', () => {
    it('renders text skeleton with default props', () => {
      render(<Skeleton variant="text" animation="pulse" />);
      
      const skeletonElements = screen.getAllByRole('generic');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('renders correct number of text lines', () => {
      const { container } = render(
        <Skeleton variant="text" animation="pulse" lines={5} />
      );
      
      const textLines = container.querySelectorAll('.space-y-3 > div');
      expect(textLines).toHaveLength(5);
    });

    it('applies pulse animation class', () => {
      const { container } = render(
        <Skeleton variant="text" animation="pulse" />
      );
      
      const animatedElement = container.querySelector('.animate-pulse');
      expect(animatedElement).toBeInTheDocument();
    });

    it('applies wave animation class', () => {
      const { container } = render(
        <Skeleton variant="text" animation="wave" />
      );
      
      const animatedElement = container.querySelector('.animate-wave');
      expect(animatedElement).toBeInTheDocument();
    });

    it('applies shimmer animation class', () => {
      const { container } = render(
        <Skeleton variant="text" animation="shimmer" />
      );
      
      const animatedElement = container.querySelector('.animate-shimmer');
      expect(animatedElement).toBeInTheDocument();
    });
  });

  describe('Card Variant', () => {
    it('renders card skeleton with default structure', () => {
      const { container } = render(
        <Skeleton variant="card" animation="pulse" />
      );
      
      const cardContainer = container.querySelector('.p-6.space-y-4');
      expect(cardContainer).toBeInTheDocument();
    });

    it('applies custom dimensions', () => {
      const { container } = render(
        <Skeleton variant="card" animation="pulse" width="300px" height="200px" />
      );
      
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.style.width).toBe('300px');
      expect(cardElement.style.height).toBe('200px');
    });

    it('applies responsive classes when responsive is true', () => {
      const { container } = render(
        <Skeleton variant="card" animation="pulse" responsive={true} />
      );
      
      const responsiveElement = container.querySelector('.w-full.max-w-full');
      expect(responsiveElement).toBeInTheDocument();
    });
  });

  describe('Avatar Variant', () => {
    it('renders avatar skeleton with circular shape', () => {
      const { container } = render(
        <Skeleton variant="avatar" animation="pulse" />
      );
      
      const avatarElement = container.querySelector('.rounded-full');
      expect(avatarElement).toBeInTheDocument();
    });

    it('applies custom dimensions', () => {
      const { container } = render(
        <Skeleton variant="avatar" animation="pulse" width="64px" height="64px" />
      );
      
      const avatarElement = container.firstChild as HTMLElement;
      expect(avatarElement.style.width).toBe('64px');
      expect(avatarElement.style.height).toBe('64px');
    });
  });

  describe('Chart Variant', () => {
    it('renders chart skeleton with title and legend', () => {
      const { container } = render(
        <Skeleton variant="chart" animation="pulse" />
      );
      
      // Check for chart title
      const titleElement = container.querySelector('.h-6.w-1\\/3');
      expect(titleElement).toBeInTheDocument();
      
      // Check for chart area
      const chartArea = container.querySelector('.h-48.w-full');
      expect(chartArea).toBeInTheDocument();
    });

    it('renders simulated chart bars', () => {
      const { container } = render(
        <Skeleton variant="chart" animation="pulse" />
      );
      
      const chartBars = container.querySelectorAll('.w-8');
      expect(chartBars.length).toBeGreaterThan(0);
    });

    it('renders chart legend', () => {
      const { container } = render(
        <Skeleton variant="chart" animation="pulse" />
      );
      
      const legendItems = container.querySelectorAll('.w-4.h-4.rounded-full');
      expect(legendItems.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('applies proper ARIA attributes for loading state', () => {
      const { container } = render(
        <Skeleton variant="text" animation="pulse" />
      );
      
      // Skeleton should not interfere with screen readers
      const skeletonContainer = container.firstChild;
      expect(skeletonContainer).not.toHaveAttribute('role', 'alert');
    });
  });

  describe('Dark Mode Support', () => {
    it('applies dark mode classes', () => {
      const { container } = render(
        <Skeleton variant="text" animation="pulse" />
      );
      
      const darkModeElement = container.querySelector('.dark\\:from-slate-700');
      expect(darkModeElement).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Skeleton variant="text" animation="pulse" className="custom-skeleton" />
      );
      
      const customElement = container.querySelector('.custom-skeleton');
      expect(customElement).toBeInTheDocument();
    });
  });
});