import { 
  measureFontLoadingPerformance, 
  benchmarkVariableFontRendering,
  optimizeFontLoading,
  FontPerformanceMetrics,
  FontLoadingStrategy
} from '../fontPerformance';

// Mock performance API
const mockPerformance = {
  now: jest.fn(),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(),
  getEntriesByName: jest.fn(),
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock document.fonts API
const mockFonts = {
  check: jest.fn(),
  load: jest.fn(),
  ready: Promise.resolve(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

Object.defineProperty(document, 'fonts', {
  value: mockFonts,
  writable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));

describe('Font Performance Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000);
  });

  describe('measureFontLoadingPerformance', () => {
    it('should measure font loading time successfully', async () => {
      mockFonts.load.mockResolvedValue(undefined);
      mockPerformance.now
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1200); // End time

      const metrics = await measureFontLoadingPerformance('Inter', '400');

      expect(metrics.loadTime).toBe(200);
      expect(metrics.success).toBe(true);
      expect(metrics.fontFamily).toBe('Inter');
      expect(metrics.fontWeight).toBe('400');
    });

    it('should handle font loading failures', async () => {
      const error = new Error('Font loading failed');
      mockFonts.load.mockRejectedValue(error);

      const metrics = await measureFontLoadingPerformance('NonExistentFont', '400');

      expect(metrics.success).toBe(false);
      expect(metrics.error).toBe('Font loading failed');
      expect(metrics.loadTime).toBeGreaterThan(0);
    });

    it('should handle missing document.fonts API', async () => {
      const originalFonts = document.fonts;
      // @ts-ignore
      delete document.fonts;

      const metrics = await measureFontLoadingPerformance('Inter', '400');

      expect(metrics.success).toBe(false);
      expect(metrics.error).toBe('Font Loading API not supported');

      Object.defineProperty(document, 'fonts', {
        value: originalFonts,
        writable: true,
      });
    });
  });

  describe('benchmarkVariableFontRendering', () => {
    it('should benchmark variable font rendering performance', async () => {
      mockPerformance.now
        .mockReturnValueOnce(1000) // Setup start
        .mockReturnValueOnce(1050) // Setup end
        .mockReturnValueOnce(1100) // Render start
        .mockReturnValueOnce(1150); // Render end

      const benchmark = await benchmarkVariableFontRendering({
        fontFamily: 'Inter',
        variations: [
          { weight: 400 },
          { weight: 700 },
          { weight: 400, slant: -5 },
        ],
        iterations: 3,
      });

      expect(benchmark.setupTime).toBe(50);
      expect(benchmark.averageRenderTime).toBe(50);
      expect(benchmark.totalTime).toBe(100);
      expect(benchmark.iterations).toBe(3);
      expect(benchmark.variationsCount).toBe(3);
    });

    it('should handle rendering errors gracefully', async () => {
      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const benchmark = await benchmarkVariableFontRendering({
        fontFamily: 'InvalidFont',
        variations: [{ weight: 400 }],
        iterations: 1,
      });

      expect(benchmark.errors).toBeGreaterThan(0);
      expect(benchmark.averageRenderTime).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });
  });

  describe('optimizeFontLoading', () => {
    it('should return preload strategy for critical fonts', () => {
      const strategy = optimizeFontLoading({
        fontFamily: 'Inter',
        usage: 'critical',
        fileSize: 50000, // 50KB
        supportedFormats: ['woff2', 'woff'],
      });

      expect(strategy.strategy).toBe('preload');
      expect(strategy.format).toBe('woff2');
      expect(strategy.display).toBe('swap');
    });

    it('should return lazy strategy for non-critical fonts', () => {
      const strategy = optimizeFontLoading({
        fontFamily: 'Decorative',
        usage: 'decorative',
        fileSize: 200000, // 200KB
        supportedFormats: ['woff2', 'woff'],
      });

      expect(strategy.strategy).toBe('lazy');
      expect(strategy.format).toBe('woff2');
      expect(strategy.display).toBe('optional');
    });

    it('should recommend font subsetting for large fonts', () => {
      const strategy = optimizeFontLoading({
        fontFamily: 'LargeFont',
        usage: 'body',
        fileSize: 500000, // 500KB
        supportedFormats: ['woff2'],
      });

      expect(strategy.recommendations).toContain('Consider font subsetting');
    });

    it('should recommend fallback for unsupported formats', () => {
      const strategy = optimizeFontLoading({
        fontFamily: 'OldFont',
        usage: 'body',
        fileSize: 100000,
        supportedFormats: ['ttf'], // Only old format
      });

      expect(strategy.recommendations).toContain('Add woff2 format support');
    });

    it('should handle missing format support', () => {
      const strategy = optimizeFontLoading({
        fontFamily: 'TestFont',
        usage: 'body',
        fileSize: 100000,
        supportedFormats: [],
      });

      expect(strategy.format).toBe('woff2'); // Default fallback
      expect(strategy.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('FontPerformanceMetrics', () => {
    it('should create valid performance metrics object', () => {
      const metrics: FontPerformanceMetrics = {
        fontFamily: 'Inter',
        fontWeight: '400',
        loadTime: 150,
        renderTime: 50,
        success: true,
        timestamp: Date.now(),
      };

      expect(metrics.fontFamily).toBe('Inter');
      expect(metrics.loadTime).toBe(150);
      expect(metrics.success).toBe(true);
    });

    it('should handle error metrics', () => {
      const metrics: FontPerformanceMetrics = {
        fontFamily: 'FailedFont',
        fontWeight: '400',
        loadTime: 0,
        success: false,
        error: 'Network error',
        timestamp: Date.now(),
      };

      expect(metrics.success).toBe(false);
      expect(metrics.error).toBe('Network error');
    });
  });

  describe('FontLoadingStrategy', () => {
    it('should create valid loading strategy', () => {
      const strategy: FontLoadingStrategy = {
        strategy: 'preload',
        format: 'woff2',
        display: 'swap',
        priority: 'high',
        recommendations: ['Use font-display: swap'],
      };

      expect(strategy.strategy).toBe('preload');
      expect(strategy.format).toBe('woff2');
      expect(strategy.recommendations).toContain('Use font-display: swap');
    });
  });
});