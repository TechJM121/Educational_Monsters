import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SoundButton } from '../SoundButton';

// Mock the useContextualSounds hook
const mockButtonSounds = {
  click: vi.fn(),
  hover: vi.fn()
};

const mockPlayContextualSound = vi.fn();

vi.mock('../../hooks/useContextualSounds', () => ({
  useContextualSounds: () => ({
    buttonSounds: mockButtonSounds,
    playContextualSound: mockPlayContextualSound
  })
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  }
}));

describe('SoundButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render button with children', () => {
      render(<SoundButton>Click me</SoundButton>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should apply variant classes correctly', () => {
      render(<SoundButton variant="success">Success Button</SoundButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-500/20', 'border-green-500/30', 'text-green-200');
    });

    it('should apply size classes correctly', () => {
      render(<SoundButton size="lg">Large Button</SoundButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });

    it('should apply custom className', () => {
      render(<SoundButton className="custom-class">Button</SoundButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Sound Effects', () => {
    it('should play hover sound on mouse enter', () => {
      render(<SoundButton>Hover me</SoundButton>);
      const button = screen.getByRole('button');
      
      fireEvent.mouseEnter(button);
      
      expect(mockButtonSounds.hover).toHaveBeenCalledTimes(1);
    });

    it('should play click sound on click', () => {
      render(<SoundButton>Click me</SoundButton>);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      
      expect(mockButtonSounds.click).toHaveBeenCalledTimes(1);
    });

    it('should not play hover sound when disabled', () => {
      render(<SoundButton enableHoverSound={false}>No hover sound</SoundButton>);
      const button = screen.getByRole('button');
      
      fireEvent.mouseEnter(button);
      
      expect(mockButtonSounds.hover).not.toHaveBeenCalled();
    });

    it('should not play click sound when disabled', () => {
      render(<SoundButton enableClickSound={false}>No click sound</SoundButton>);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      
      expect(mockButtonSounds.click).not.toHaveBeenCalled();
    });

    it('should play custom hover sound', () => {
      render(
        <SoundButton customHoverSound="custom-hover-sound">
          Custom hover
        </SoundButton>
      );
      const button = screen.getByRole('button');
      
      fireEvent.mouseEnter(button);
      
      expect(mockPlayContextualSound).toHaveBeenCalledWith('custom-hover-sound', { volume: 0.3 });
      expect(mockButtonSounds.hover).not.toHaveBeenCalled();
    });

    it('should play custom click sound', () => {
      render(
        <SoundButton customClickSound="custom-click-sound">
          Custom click
        </SoundButton>
      );
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      
      expect(mockPlayContextualSound).toHaveBeenCalledWith('custom-click-sound', { volume: 0.6 });
      expect(mockButtonSounds.click).not.toHaveBeenCalled();
    });
  });

  describe('Event Handling', () => {
    it('should call custom onMouseEnter handler', () => {
      const handleMouseEnter = vi.fn();
      render(
        <SoundButton onMouseEnter={handleMouseEnter}>
          Mouse enter
        </SoundButton>
      );
      const button = screen.getByRole('button');
      
      fireEvent.mouseEnter(button);
      
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
      expect(mockButtonSounds.hover).toHaveBeenCalledTimes(1);
    });

    it('should call custom onClick handler', () => {
      const handleClick = vi.fn();
      render(
        <SoundButton onClick={handleClick}>
          Click handler
        </SoundButton>
      );
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(mockButtonSounds.click).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<SoundButton disabled>Disabled button</SoundButton>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('should have focus styles', () => {
      render(<SoundButton>Focus me</SoundButton>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500/50');
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<SoundButton ref={ref}>Ref button</SoundButton>);
      
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });
  });

  describe('Variants', () => {
    const variants = [
      { variant: 'primary' as const, expectedClasses: ['bg-blue-500/20', 'border-blue-500/30', 'text-blue-200'] },
      { variant: 'secondary' as const, expectedClasses: ['bg-gray-500/20', 'border-gray-500/30', 'text-gray-200'] },
      { variant: 'success' as const, expectedClasses: ['bg-green-500/20', 'border-green-500/30', 'text-green-200'] },
      { variant: 'warning' as const, expectedClasses: ['bg-yellow-500/20', 'border-yellow-500/30', 'text-yellow-200'] },
      { variant: 'danger' as const, expectedClasses: ['bg-red-500/20', 'border-red-500/30', 'text-red-200'] }
    ];

    variants.forEach(({ variant, expectedClasses }) => {
      it(`should apply correct classes for ${variant} variant`, () => {
        render(<SoundButton variant={variant}>{variant} button</SoundButton>);
        const button = screen.getByRole('button');
        
        expectedClasses.forEach(className => {
          expect(button).toHaveClass(className);
        });
      });
    });
  });

  describe('Sizes', () => {
    const sizes = [
      { size: 'sm' as const, expectedClasses: ['px-3', 'py-1.5', 'text-sm'] },
      { size: 'md' as const, expectedClasses: ['px-4', 'py-2', 'text-base'] },
      { size: 'lg' as const, expectedClasses: ['px-6', 'py-3', 'text-lg'] }
    ];

    sizes.forEach(({ size, expectedClasses }) => {
      it(`should apply correct classes for ${size} size`, () => {
        render(<SoundButton size={size}>{size} button</SoundButton>);
        const button = screen.getByRole('button');
        
        expectedClasses.forEach(className => {
          expect(button).toHaveClass(className);
        });
      });
    });
  });
});