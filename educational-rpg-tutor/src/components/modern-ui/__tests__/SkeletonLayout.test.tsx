import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SkeletonLayout from '../SkeletonLayout';

describe('SkeletonLayout Component', () => {
  describe('Dashboard Layout', () => {
    it('renders dashboard layout with header, stats, and main content', () => {
      const { container } = render(
        <SkeletonLayout layout="dashboard" animation="pulse" />
      );
      
      // Should have header section
      const headerSection = container.querySelector('.flex.items-center.justify-between');
      expect(headerSection).toBeInTheDocument();
      
      // Should have stats grid
      const statsGrid = container.querySelector('.grid');
      expect(statsGrid).toBeInTheDocument();
      
      // Should have main content area
      const mainContent = container.querySelector('.lg\\:col-span-2');
      expect(mainContent).toBeInTheDocument();
    });

    it('applies responsive grid classes', () => {
      const { container } = render(
        <SkeletonLayout layout="dashboard" responsive={true} />
      );
      
      const responsiveGrid = container.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(responsiveGrid).toBeInTheDocument();
    });
  });

  describe('Profile Layout', () => {
    it('renders profile layout with avatar, stats, and content', () => {
      const { container } = render(
        <SkeletonLayout layout="profile" animation="pulse" />
      );
      
      // Should have centered avatar
      const avatarSection = container.querySelector('.text-center.space-y-4');
      expect(avatarSection).toBeInTheDocument();
      
      // Should have profile stats
      const statsSection = container.querySelector('.grid-cols-1.sm\\:grid-cols-3');
      expect(statsSection).toBeInTheDocument();
      
      // Should have profile content
      const contentSection = container.querySelector('.grid-cols-1.md\\:grid-cols-2');
      expect(contentSection).toBeInTheDocument();
    });

    it('centers content with max width', () => {
      const { container } = render(
        <SkeletonLayout layout="profile" responsive={true} />
      );
      
      const centeredContent = container.querySelector('.max-w-4xl.mx-auto');
      expect(centeredContent).toBeInTheDocument();
    });
  });

  describe('Feed Layout', () => {
    it('renders feed layout with multiple posts', () => {
      const { container } = render(
        <SkeletonLayout layout="feed" animation="pulse" />
      );
      
      // Should have multiple feed items
      const feedItems = container.querySelectorAll('.flex.items-start.space-x-3');
      expect(feedItems.length).toBeGreaterThan(3);
      
      // Should have centered max width
      const centeredFeed = container.querySelector('.max-w-2xl.mx-auto');
      expect(centeredFeed).toBeInTheDocument();
    });

    it('includes avatar and content for each post', () => {
      const { container } = render(
        <SkeletonLayout layout="feed" animation="pulse" />
      );
      
      // Each post should have an avatar
      const avatars = container.querySelectorAll('.w-12.h-12.rounded-full');
      expect(avatars.length).toBeGreaterThan(3);
      
      // Each post should have content
      const postContent = container.querySelectorAll('.flex-1.space-y-2');
      expect(postContent.length).toBeGreaterThan(3);
    });
  });

  describe('Grid Layout', () => {
    it('renders grid layout with multiple cards', () => {
      const { container } = render(
        <SkeletonLayout layout="grid" animation="pulse" />
      );
      
      // Should have grid container
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      
      // Should have multiple grid items
      const gridItems = container.querySelectorAll('.grid > div');
      expect(gridItems.length).toBeGreaterThanOrEqual(8);
    });

    it('applies responsive grid columns', () => {
      const { container } = render(
        <SkeletonLayout layout="grid" responsive={true} />
      );
      
      const responsiveGrid = container.querySelector('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4');
      expect(responsiveGrid).toBeInTheDocument();
    });
  });

  describe('List Layout', () => {
    it('renders list layout with multiple items', () => {
      const { container } = render(
        <SkeletonLayout layout="list" animation="pulse" />
      );
      
      // Should have list items
      const listItems = container.querySelectorAll('.flex.items-center.space-x-4');
      expect(listItems.length).toBeGreaterThanOrEqual(6);
      
      // Each item should have backdrop blur
      const blurredItems = container.querySelectorAll('.backdrop-blur-sm');
      expect(blurredItems.length).toBeGreaterThanOrEqual(6);
    });

    it('includes avatar and content for each list item', () => {
      const { container } = render(
        <SkeletonLayout layout="list" animation="pulse" />
      );
      
      // Each item should have a small avatar
      const avatars = container.querySelectorAll('.w-8.h-8.rounded-full');
      expect(avatars.length).toBeGreaterThanOrEqual(6);
      
      // Each item should have text content
      const textContent = container.querySelectorAll('.flex-1');
      expect(textContent.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Custom Layout', () => {
    it('renders custom elements when provided', () => {
      const customElements = [
        <div key="1" data-testid="custom-element-1">Custom Element 1</div>,
        <div key="2" data-testid="custom-element-2">Custom Element 2</div>,
      ];
      
      render(
        <SkeletonLayout 
          layout="custom" 
          customElements={customElements}
          animation="pulse" 
        />
      );
      
      expect(screen.getByTestId('custom-element-1')).toBeInTheDocument();
      expect(screen.getByTestId('custom-element-2')).toBeInTheDocument();
    });

    it('handles empty custom elements gracefully', () => {
      const { container } = render(
        <SkeletonLayout layout="custom" customElements={[]} animation="pulse" />
      );
      
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Animation Variants', () => {
    it('applies pulse animation to all layouts', () => {
      const { container } = render(
        <SkeletonLayout layout="dashboard" animation="pulse" />
      );
      
      const pulseElements = container.querySelectorAll('.animate-pulse');
      expect(pulseElements.length).toBeGreaterThan(0);
    });

    it('applies wave animation to all layouts', () => {
      const { container } = render(
        <SkeletonLayout layout="profile" animation="wave" />
      );
      
      const waveElements = container.querySelectorAll('.animate-wave');
      expect(waveElements.length).toBeGreaterThan(0);
    });

    it('applies shimmer animation to all layouts', () => {
      const { container } = render(
        <SkeletonLayout layout="grid" animation="shimmer" />
      );
      
      const shimmerElements = container.querySelectorAll('.animate-shimmer');
      expect(shimmerElements.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Behavior', () => {
    it('applies responsive classes when responsive is true', () => {
      const { container } = render(
        <SkeletonLayout layout="dashboard" responsive={true} />
      );
      
      const responsiveElements = container.querySelectorAll('[class*="md:"], [class*="lg:"], [class*="xl:"]');
      expect(responsiveElements.length).toBeGreaterThan(0);
    });

    it('does not apply responsive classes when responsive is false', () => {
      const { container } = render(
        <SkeletonLayout layout="dashboard" responsive={false} />
      );
      
      // Should have fixed grid columns
      const fixedGrid = container.querySelector('.grid-cols-4');
      expect(fixedGrid).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('does not interfere with screen readers', () => {
      const { container } = render(
        <SkeletonLayout layout="dashboard" animation="pulse" />
      );
      
      // Should not have excessive ARIA attributes
      const ariaElements = container.querySelectorAll('[aria-label], [aria-describedby], [aria-hidden]');
      expect(ariaElements.length).toBeLessThan(10);
    });

    it('maintains proper semantic structure', () => {
      const { container } = render(
        <SkeletonLayout layout="profile" animation="pulse" />
      );
      
      // Should use proper div structure without semantic interference
      const divElements = container.querySelectorAll('div');
      expect(divElements.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <SkeletonLayout 
          layout="dashboard" 
          className="custom-skeleton-layout" 
          animation="pulse" 
        />
      );
      
      const customElement = container.querySelector('.custom-skeleton-layout');
      expect(customElement).toBeInTheDocument();
    });

    it('maintains layout structure with custom styling', () => {
      const { container } = render(
        <SkeletonLayout 
          layout="grid" 
          className="custom-grid-layout" 
          animation="pulse" 
        />
      );
      
      // Should still have grid structure
      const gridElement = container.querySelector('.grid.custom-grid-layout');
      expect(gridElement).toBeInTheDocument();
    });
  });
});