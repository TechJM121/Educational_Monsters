import { renderHook, act } from '@testing-library/react';
import { useVariableFont, useResponsiveFont } from '../useVariableFont';

// Mock document.fonts API
const mockFonts = {
  check: jest.fn(),
  load: jest.fn(),
};

Object.defineProperty(document, 'fonts', {
  value: mockFonts,
  writable: true,
});

// Mock performance.now
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
  },
  writable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));

describe('useVariableFont', () => {
  const mockConfig = {
    fontFamily: 'Inter',
    variations: { weight: 400 },
    transitionDuration: 300,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFonts.check.mockReturnValue(false);
    mockFonts.load.mockResolvedValue(undefined);
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useVariableFont(mockConfig));

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isSupported).toBe(false);
    expect(result.current.currentVariations).toEqual({ weight: 400 });
    expect(result.current.error).toBe(null);
  });

  it('should load font and update state', async () => {
    mockFonts.load.mockResolvedValue(undefined);
    
    const { result, waitForNextUpdate } = renderHook(() => useVariableFont(mockConfig));

    await waitForNextUpdate();

    expect(mockFonts.load).toHaveBeenCalledWith('16px Inter');
    expect(result.current.isLoaded).toBe(true);
  });

  it('should handle font loading errors', async () => {
    const error = new Error('Font loading failed');
    mockFonts.load.mockRejectedValue(error);

    const { result, waitForNextUpdate } = renderHook(() => useVariableFont(mockConfig));

    await waitForNextUpdate();

    expect(result.current.error).toBe('Font loading failed');
    expect(result.current.isLoaded).toBe(false);
  });

  it('should update font variations', () => {
    const { result } = renderHook(() => useVariableFont(mockConfig));

    act(() => {
      result.current.updateVariations({ weight: 700 });
    });

    expect(result.current.currentVariations.weight).toBe(700);
  });

  it('should generate correct font variation settings string', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useVariableFont({
      ...mockConfig,
      variations: { weight: 400, slant: -5 }
    }));

    await waitForNextUpdate();

    const settings = result.current.getFontVariationSettings();
    expect(settings).toBe("'wght' 400, 'slnt' -5");
  });

  it('should generate CSS styles with fallback for unsupported browsers', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useVariableFont(mockConfig));

    await waitForNextUpdate();

    const styles = result.current.getFontStyles();
    
    // Should include fallback properties
    expect(styles).toHaveProperty('fontFamily', 'Inter');
    expect(styles).toHaveProperty('fontWeight', 400);
  });

  it('should animate to target variations', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useVariableFont(mockConfig));

    await waitForNextUpdate();

    act(() => {
      result.current.animateToVariations({ weight: 700 }, 100);
    });

    // Animation should start
    expect(result.current.currentVariations.weight).toBeGreaterThan(400);
  });

  it('should handle font already loaded case', async () => {
    mockFonts.check.mockReturnValue(true);

    const { result, waitForNextUpdate } = renderHook(() => useVariableFont(mockConfig));

    await waitForNextUpdate();

    expect(result.current.isLoaded).toBe(true);
    expect(mockFonts.load).not.toHaveBeenCalled();
  });
});

describe('useResponsiveFont', () => {
  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: 1,
    });
  });

  it('should return default font size for desktop', () => {
    const { result } = renderHook(() => useResponsiveFont());

    expect(result.current.fontSize).toBe(16);
    expect(result.current.lineHeight).toBeCloseTo(1.36, 1);
  });

  it('should adjust font size for mobile', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 480,
      writable: true,
    });

    const { result } = renderHook(() => useResponsiveFont());

    expect(result.current.fontSize).toBe(14);
  });

  it('should adjust font size for large screens', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 2560,
      writable: true,
    });

    const { result } = renderHook(() => useResponsiveFont());

    expect(result.current.fontSize).toBe(18);
  });

  it('should adjust for high DPI displays', () => {
    Object.defineProperty(window, 'devicePixelRatio', {
      value: 2,
      writable: true,
    });

    const { result } = renderHook(() => useResponsiveFont());

    expect(result.current.fontSize).toBeGreaterThan(16);
  });

  it('should update on window resize', () => {
    const { result } = renderHook(() => useResponsiveFont());

    expect(result.current.fontSize).toBe(16);

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        value: 480,
        writable: true,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.fontSize).toBe(14);
  });
});