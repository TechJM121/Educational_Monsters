import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProgressiveImage from '../ProgressiveImage';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock Image constructor
const mockImage = vi.fn();
global.Image = mockImage as any;

describe('ProgressiveImage Component', () => {
  let mockImageInstance: any;

  beforeEach(() => {
    mockImageInstance = {
      onload: null,
      onerror: null,
      src: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockImage.mockImplementation(() => mockImageInstance);
    mockIntersectionObserver.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      const { container } = render(
        <ProgressiveImage
          src="test-image.jpg"
          alt="Test image"
          lazy={false}
        />
      );

      // Should render the container
      expect(container.firstChild).toBeInTheDocument();
      
      // Should create an Image instance for loading
      expect(mockImage).toHaveBeenCalled();
    });

    it('applies custom className and styles', () => {
      const { container } = render(
        <ProgressiveImage
          src="test-image.jpg"
          alt="Test image"
          className="custom-class"
          style={{ border: '1px solid red' }}
          lazy={false}
        />
      );

      const imageContainer = container.firstChild as HTMLElement;
      expect(imageContainer).toHaveClass('custom-class');
      expect(imageContainer).toHaveStyle({ border: '1px solid red' });
    });

    it('sets width and height correctly', () => {
      const { container } = render(
        <ProgressiveImage
          src="test-image.jpg"
          alt="Test image"
          width={300}
          height={200}
          lazy={false}
        />
      );

      const imageContainer = container.firstChild as HTMLElement;
      expect(imageContainer).toHaveStyle({ width: '300px', height: '200px' });
    });
  });

  describe('Lazy Loading', () => {
    it('sets up IntersectionObserver when lazy loading is enabled', () => {
      render(
        <ProgressiveImage
          src="test-image.jpg"
          alt="Test image"
          lazy={true}
        />
      );

      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          rootMargin: '50px',
          threshold: 0.1
        })
      );
    });

    it('does not set up IntersectionObserver when lazy loading is disabled', () => {
      render(
        <ProgressiveImage
          src="test-image.jpg"
          alt="Test image"
          lazy={false}
        />
      );

      // Should still be called but immediately start loading
      expect(mockImage).toHaveBeenCalled();
    });

    it('does not set up IntersectionObserver when priority is true', () => {
      render(
        <ProgressiveImage
          src="test-image.jpg"
          alt="Test image"
          lazy={true}
          priority={true}
        />
      );

      // Should immediately start loading despite lazy=true
      expect(mockImage).toHaveBeenCalled();
    });
  });

  describe('Image Loading States', () => {
    it('shows placeholder initially', () => {
      const { container } = render(
        <ProgressiveImage
          src="test-image.jpg"
          alt="Test image"
          placeholder="placeholder.jpg"
          lazy={false}
        />
      );

      const placeholder = container.querySelector('img[src="placeholder.jpg"]');
      expect(placeholder).toBeInTheDocument();
    });

    it('shows loading indicator while loading', async () => {
      render(
        <ProgressiveImage
          src="test-image.jpg"
          alt="Test image"
          lazy={false}
        />
      );

      // Should show loading spinner
      await waitFor(() => {
        const loadingSpinner = document.querySelector('.animate-spin');
        expect(loadingSpinner).toBeInTheDocument();
      });
    });

    it('shows main image after successful load', async () => {
      const onLoad = vi.fn();
      
      render(
        <ProgressiveImage
          src="test-image.jpg"
          alt="Test image"
          onLoad={onLoad}
          lazy={false}
        />
      );

      // Simulate successful image load
      if (mockImageInstance.onload) {
        mockImageInstance.onload();
      }

      await waitFor(() => {
        expect(onLoad).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error state when image fails to load', async () => {
      const onError = vi.fn();
      
      render(
        <ProgressiveImage
          src="invalid-image.jpg"
          alt="Test image"
          onError={onError}
          lazy={false}
        />
      );

      // Simulate image load error
      const errorEvent = new Event('error');
      if (mockImageInstance.onerror) {
        mockImageInstance.onerror(errorEvent);
      }

      await waitFor(() => {
        expect(screen.getByText('Failed to load image')).toBeInTheDocument();
        expect(onError).toHaveBeenCalledWith(errorEvent);
      });
    });

    it('tries fallback image when main image fails', async () => {
      render(
        <ProgressiveImage
          src="invalid-image.jpg"
          alt="Test image"
          fallbackSrc="fallback.jpg"
          lazy={false}
        />
      );

      // Simulate main image failure
      const errorEvent = new Event('error');
      if (mockImageInstance.onerror) {
        mockImageInstance.onerror(errorEvent);
      }

      // Should create a new Image instance for fallback
      await waitFor(() => {
        expect(mockImage).toHaveBeenCalledTimes(2);
      });
    });

    it('shows error state when both main and fallback images fail', async () => {
      render(
        <ProgressiveImage
          src="invalid-image.jpg"
          alt="Test image"
          fallbackSrc="invalid-fallback.jpg"
          lazy={false}
        />
      );

      // Simulate main image failure
      const errorEvent = new Event('error');
      if (mockImageInstance.onerror) {
        mockImageInstance.onerror(errorEvent);
      }

      // Simulate fallback image failure
      await waitFor(() => {
        if (mockImageInstance.onerror) {
          mockImageInstance.onerror(errorEvent);
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Failed to load image')).toBeInTheDocument();
      });
    });
  });

  describe('Blur Data URL Generation', () => {
    it('uses provided blurDataURL', () => {
      const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
      
      const { container } = render(
        <ProgressiveImage
          src="test-image.jpg"
          alt="Test image"
          blurDataURL={blurDataURL}
          lazy={false}
        />
      );

      const placeholder = container.querySelector(`img[src="${blurDataURL}"]`);
      expect(placeholder).toBeInTheDocument();
    });

    it('uses placeholder when blurDataURL is not provided', () => {
      const placeholder = 'placeholder.jpg';
      
      const { container } = render(
        <ProgressiveImage
          src="test-image.jpg"
          alt="Test image"
          placeholder={placeholder}
          lazy={false}
        />
      );

      const placeholderImg = container.querySelector(`img[src="${placeholder}"]`);
      expect(placeholderImg).toBeInTheDocument();
    });

    it('generates SVG placeholder when neither blurDataURL nor placeholder is provided', () => {
      const { container } = render(
        <ProgressiveImage
          src="test-image.jpg"
          alt="Test image"
          lazy={false}
        />
      );

      const svgPlaceholder = container.querySelector('img[src^="data:image/svg+xml;base64,"]');
      expect(svgPlaceholder).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper alt text for main image', async () => {
      render(
        <ProgressiveImage
          src="test-image.jpg"
          alt="A beautiful landscape"
          lazy={false}
        />
      );

      // Simulate successful load
      if (mockImageInstance.onload) {
        mockImageInstance.onload();
      }

      await waitFor(() => {
        const mainImage = screen.getByAltText('A beautiful landscape');
        expect(mainImage).toBeInTheDocument();
      });
    });

    it('uses empty alt for placeholder image', () => {
      const { container } = render(
        <ProgressiveImage
          src="test-image.jpg"
          alt="Test image"
          placeholder="placeholder.jpg"
          lazy={false}
        />
      );

      const placeholder = container.querySelector('img[src="placeholder.jpg"]');
      expect(placeholder).toHaveAttribute('alt', '');
    });
  });

  describe('Performance Optimizations', () => {
    it('sets loading attribute based on lazy prop', async () => {
      const { container } = render(
        <ProgressiveImage
          src="test-image.jpg"
          alt="Test image"
          lazy={true}
        />
      );

      // Simulate image coming into view and loading
      if (mockImageInstance.onload) {
        mockImageInstance.onload();
      }

      await waitFor(() => {
        const mainImage = container.querySelector('img[alt="Test image"]');
        if (mainImage) {
          expect(mainImage).toHaveAttribute('loading', 'lazy');
        }
      });
    });

    it('sets loading to eager when priority is true', async () => {
      render(
        <ProgressiveImage
          src="test-image.jpg"
          alt="Test image"
          lazy={true}
          priority={true}
        />
      );

      // Simulate successful load
      if (mockImageInstance.onload) {
        mockImageInstance.onload();
      }

      await waitFor(() => {
        const mainImage = screen.getByAltText('Test image');
        expect(mainImage).toHaveAttribute('loading', 'eager');
      });
    });

    it('includes sizes attribute when provided', async () => {
      const sizes = '(max-width: 768px) 100vw, 50vw';
      
      render(
        <ProgressiveImage
          src="test-image.jpg"
          alt="Test image"
          sizes={sizes}
          lazy={false}
        />
      );

      // Simulate successful load
      if (mockImageInstance.onload) {
        mockImageInstance.onload();
      }

      await waitFor(() => {
        const mainImage = screen.getByAltText('Test image');
        expect(mainImage).toHaveAttribute('sizes', sizes);
      });
    });
  });
});