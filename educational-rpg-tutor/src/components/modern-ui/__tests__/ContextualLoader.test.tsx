import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ContextualLoader from '../ContextualLoader';

describe('ContextualLoader Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      const { container } = render(
        <ContextualLoader type="data" />
      );
      
      expect(container.firstChild).toBeInTheDocument();
    });

    it('displays custom message when provided', () => {
      render(
        <ContextualLoader 
          type="data" 
          message="Custom loading message"
          showMessage={true}
        />
      );
      
      expect(screen.getByText('Custom loading message')).toBeInTheDocument();
    });

    it('displays default message when no custom message provided', () => {
      render(
        <ContextualLoader 
          type="data" 
          showMessage={true}
        />
      );
      
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });
  });

  describe('Loading Types', () => {
    it('renders data loading icon', () => {
      const { container } = render(
        <ContextualLoader type="data" />
      );
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders images loading icon', () => {
      const { container } = render(
        <ContextualLoader type="images" />
      );
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders forms loading icon', () => {
      const { container } = render(
        <ContextualLoader type="forms" />
      );
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders navigation loading icon', () => {
      const { container } = render(
        <ContextualLoader type="navigation" />
      );
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders content loading icon', () => {
      const { container } = render(
        <ContextualLoader type="content" />
      );
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders default spinner for custom type', () => {
      const { container } = render(
        <ContextualLoader type="custom" />
      );
      
      const spinner = container.querySelector('.border-t-transparent.rounded-full');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('applies small size classes', () => {
      const { container } = render(
        <ContextualLoader type="data" size="sm" />
      );
      
      const icon = container.querySelector('.w-4.h-4');
      expect(icon).toBeInTheDocument();
    });

    it('applies medium size classes', () => {
      const { container } = render(
        <ContextualLoader type="data" size="md" />
      );
      
      const icon = container.querySelector('.w-6.h-6');
      expect(icon).toBeInTheDocument();
    });

    it('applies large size classes', () => {
      const { container } = render(
        <ContextualLoader type="data" size="lg" />
      );
      
      const icon = container.querySelector('.w-8.h-8');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders minimal variant', () => {
      const { container } = render(
        <ContextualLoader 
          type="data" 
          variant="minimal"
          message="Test message"
        />
      );
      
      // Should not show message in minimal variant
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
      
      // Should have inline-flex class
      const element = container.querySelector('.inline-flex');
      expect(element).toBeInTheDocument();
    });

    it('renders detailed variant with message', () => {
      render(
        <ContextualLoader 
          type="data" 
          variant="detailed"
          message="Detailed loading message"
          showMessage={true}
        />
      );
      
      expect(screen.getByText('Detailed loading message')).toBeInTheDocument();
    });

    it('renders detailed variant with progress', () => {
      render(
        <ContextualLoader 
          type="data" 
          variant="detailed"
          progress={75}
          showProgress={true}
        />
      );
      
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    it('renders default variant', () => {
      render(
        <ContextualLoader 
          type="data" 
          variant="default"
          message="Default message"
          showMessage={true}
        />
      );
      
      expect(screen.getByText('Default message')).toBeInTheDocument();
    });
  });

  describe('Progress Display', () => {
    it('shows progress when enabled and progress provided', () => {
      render(
        <ContextualLoader 
          type="data" 
          progress={50}
          showProgress={true}
        />
      );
      
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('does not show progress when disabled', () => {
      render(
        <ContextualLoader 
          type="data" 
          progress={50}
          showProgress={false}
        />
      );
      
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('does not show progress when no progress provided', () => {
      render(
        <ContextualLoader 
          type="data" 
          showProgress={true}
        />
      );
      
      expect(screen.queryByText('%')).not.toBeInTheDocument();
    });
  });

  describe('Type-Specific Colors', () => {
    it('applies data loading color', () => {
      const { container } = render(
        <ContextualLoader type="data" />
      );
      
      const coloredElement = container.querySelector('.text-blue-500');
      expect(coloredElement).toBeInTheDocument();
    });

    it('applies images loading color', () => {
      const { container } = render(
        <ContextualLoader type="images" />
      );
      
      const coloredElement = container.querySelector('.text-green-500');
      expect(coloredElement).toBeInTheDocument();
    });

    it('applies forms loading color', () => {
      const { container } = render(
        <ContextualLoader type="forms" />
      );
      
      const coloredElement = container.querySelector('.text-purple-500');
      expect(coloredElement).toBeInTheDocument();
    });

    it('applies navigation loading color', () => {
      const { container } = render(
        <ContextualLoader type="navigation" />
      );
      
      const coloredElement = container.querySelector('.text-orange-500');
      expect(coloredElement).toBeInTheDocument();
    });

    it('applies content loading color', () => {
      const { container } = render(
        <ContextualLoader type="content" />
      );
      
      const coloredElement = container.querySelector('.text-indigo-500');
      expect(coloredElement).toBeInTheDocument();
    });

    it('applies default color for custom type', () => {
      const { container } = render(
        <ContextualLoader type="custom" />
      );
      
      const coloredElement = container.querySelector('.text-gray-500');
      expect(coloredElement).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ContextualLoader 
          type="data" 
          className="custom-loader-class"
        />
      );
      
      const customElement = container.querySelector('.custom-loader-class');
      expect(customElement).toBeInTheDocument();
    });
  });

  describe('Message Display', () => {
    it('shows message when showMessage is true', () => {
      render(
        <ContextualLoader 
          type="data" 
          message="Test message"
          showMessage={true}
        />
      );
      
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('hides message when showMessage is false', () => {
      render(
        <ContextualLoader 
          type="data" 
          message="Test message"
          showMessage={false}
        />
      );
      
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });
  });
});