import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { AccessibleButton } from '../AccessibleButton';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    button: React.forwardRef(({ children, ...props }: any, ref: any) => 
      <button ref={ref} {...props}>{children}</button>
    )
  }
}));

describe('AccessibleButton', () => {
  it('renders with default props', () => {
    render(<AccessibleButton>Click me</AccessibleButton>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('font-rpg', 'border-2', 'rounded-lg');
  });

  it('applies variant classes correctly', () => {
    render(<AccessibleButton variant="success">Success Button</AccessibleButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('from-green-600', 'to-green-500');
  });

  it('applies size classes correctly', () => {
    render(<AccessibleButton size="lg">Large Button</AccessibleButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg', 'min-h-[48px]');
  });

  it('shows loading state correctly', () => {
    render(<AccessibleButton loading>Loading Button</AccessibleButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(<AccessibleButton disabled>Disabled Button</AccessibleButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('renders icon in correct position', () => {
    const icon = <span data-testid="icon">🎮</span>;
    
    render(
      <AccessibleButton icon={icon} iconPosition="left">
        With Icon
      </AccessibleButton>
    );
    
    const button = screen.getByRole('button');
    const iconElement = screen.getByTestId('icon');
    
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies full width when specified', () => {
    render(<AccessibleButton fullWidth>Full Width</AccessibleButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full');
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    render(<AccessibleButton onClick={onClick}>Clickable</AccessibleButton>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not handle click when disabled', () => {
    const onClick = vi.fn();
    render(
      <AccessibleButton onClick={onClick} disabled>
        Disabled
      </AccessibleButton>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies accessibility attributes', () => {
    render(
      <AccessibleButton 
        ariaLabel="Custom label"
        ariaDescribedBy="description-id"
      >
        Button
      </AccessibleButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
    expect(button).toHaveAttribute('aria-describedby', 'description-id');
  });

  it('has proper focus styles', () => {
    render(<AccessibleButton>Focus me</AccessibleButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('applies custom focus ring color', () => {
    render(
      <AccessibleButton focusRingColor="focus:ring-red-500">
        Custom Focus
      </AccessibleButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:ring-red-500');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<AccessibleButton ref={ref}>Ref Button</AccessibleButton>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('supports keyboard navigation', () => {
    const onClick = vi.fn();
    render(<AccessibleButton onClick={onClick}>Keyboard</AccessibleButton>);
    
    const button = screen.getByRole('button');
    button.focus();
    
    expect(button).toHaveFocus();
    
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();
  });
});