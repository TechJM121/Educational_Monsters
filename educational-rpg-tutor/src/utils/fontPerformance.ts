/**
 * Font performance measurement and optimization utilities
 */

export interface FontPerformanceMetrics {
  fontFamily: string;
  fontWeight: string;
  loadTime: number;
  renderTime?: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

export interface FontRenderingBenchmark {
  fontFamily: string;
  setupTime: number;
  averageRenderTime: number;
  totalTime: number;
  iterations: number;
  variationsCount: number;
  errors: number;
}

export interface FontLoadingStrategy {
  strategy: 'preload' | 'prefetch' | 'lazy' | 'critical';
  format: 'woff2' | 'woff' | 'ttf' | 'otf';
  display: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  priority: 'high' | 'medium' | 'low';
  recommendations: string[];
}

export interface FontOptimizationConfig {
  fontFamily: string;
  usage: 'critical' | 'body' | 'heading' | 'decorative';
  fileSize: number;
  supportedFormats: string[];
}

/**
 * Measure font loading performance
 */
export const measureFontLoadingPerformance = async (
  fontFamily: string,
  fontWeight: string = '400'
): Promise<FontPerformanceMetrics> => {
  const startTime = performance.now();
  
  try {
    if (!document.fonts || !document.fonts.load) {
      throw new Error('Font Loading API not supported');
    }

    await document.fonts.load(`16px ${fontFamily}`, fontWeight);
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;

    return {
      fontFamily,
      fontWeight,
      loadTime,
      success: true,
      timestamp: Date.now(),
    };
  } catch (error) {
    const endTime = performance.now();
    const loadTime = endTime - startTime;

    return {
      fontFamily,
      fontWeight,
      loadTime,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    };
  }
};

/**
 * Benchmark variable font rendering performance
 */
export const benchmarkVariableFontRendering = async (config: {
  fontFamily: string;
  variations: Array<{ weight?: number; slant?: number; width?: number }>;
  iterations: number;
}): Promise<FontRenderingBenchmark> => {
  const { fontFamily, variations, iterations } = config;
  const setupStartTime = performance.now();

  // Create test element
  const testElement = document.createElement('div');
  testElement.style.position = 'absolute';
  testElement.style.visibility = 'hidden';
  testElement.style.fontSize = '16px';
  testElement.style.fontFamily = fontFamily;
  testElement.textContent = 'The quick brown fox jumps over the lazy dog';
  document.body.appendChild(testElement);

  const setupEndTime = performance.now();
  const setupTime = setupEndTime - setupStartTime;

  const renderTimes: number[] = [];
  let errors = 0;

  // Benchmark rendering with different variations
  for (let i = 0; i < iterations; i++) {
    for (const variation of variations) {
      try {
        const renderStartTime = performance.now();

        // Apply font variation settings
        const settings: string[] = [];
        if (variation.weight !== undefined) settings.push(`'wght' ${variation.weight}`);
        if (variation.slant !== undefined) settings.push(`'slnt' ${variation.slant}`);
        if (variation.width !== undefined) settings.push(`'wdth' ${variation.width}`);

        testElement.style.fontVariationSettings = settings.join(', ');

        // Force reflow to measure actual rendering time
        testElement.offsetHeight;

        const renderEndTime = performance.now();
        renderTimes.push(renderEndTime - renderStartTime);
      } catch (error) {
        errors++;
        console.error('Font rendering error:', error);
      }
    }
  }

  // Cleanup
  document.body.removeChild(testElement);

  const totalRenderTime = renderTimes.reduce((sum, time) => sum + time, 0);
  const averageRenderTime = renderTimes.length > 0 ? totalRenderTime / renderTimes.length : 0;

  return {
    fontFamily,
    setupTime,
    averageRenderTime,
    totalTime: setupTime + totalRenderTime,
    iterations,
    variationsCount: variations.length,
    errors,
  };
};

/**
 * Optimize font loading strategy based on usage and characteristics
 */
export const optimizeFontLoading = (config: FontOptimizationConfig): FontLoadingStrategy => {
  const { fontFamily, usage, fileSize, supportedFormats } = config;
  const recommendations: string[] = [];

  // Determine loading strategy based on usage
  let strategy: FontLoadingStrategy['strategy'];
  let priority: FontLoadingStrategy['priority'];
  let display: FontLoadingStrategy['display'];

  switch (usage) {
    case 'critical':
      strategy = 'preload';
      priority = 'high';
      display = 'swap';
      break;
    case 'body':
      strategy = 'prefetch';
      priority = 'medium';
      display = 'swap';
      break;
    case 'heading':
      strategy = 'prefetch';
      priority = 'medium';
      display = 'fallback';
      break;
    case 'decorative':
      strategy = 'lazy';
      priority = 'low';
      display = 'optional';
      break;
    default:
      strategy = 'prefetch';
      priority = 'medium';
      display = 'swap';
  }

  // Determine optimal format
  let format: FontLoadingStrategy['format'] = 'woff2'; // Default
  if (supportedFormats.includes('woff2')) {
    format = 'woff2';
  } else if (supportedFormats.includes('woff')) {
    format = 'woff';
    recommendations.push('Add woff2 format support for better compression');
  } else if (supportedFormats.includes('ttf')) {
    format = 'ttf';
    recommendations.push('Add woff2 format support for better performance');
  }

  // File size recommendations
  if (fileSize > 300000) { // 300KB
    recommendations.push('Consider font subsetting to reduce file size');
    if (usage !== 'critical') {
      strategy = 'lazy';
      display = 'optional';
    }
  }

  if (fileSize > 100000 && usage === 'decorative') { // 100KB
    recommendations.push('Consider using system fonts for decorative text');
  }

  // Format-specific recommendations
  if (!supportedFormats.includes('woff2')) {
    recommendations.push('Add woff2 format support for 30% better compression');
  }

  // Display recommendations
  if (usage === 'critical' && display !== 'swap') {
    recommendations.push('Use font-display: swap for critical fonts');
  }

  // Performance recommendations
  if (usage === 'critical') {
    recommendations.push('Consider inlining critical font data in CSS');
  }

  if (fileSize < 20000 && usage === 'critical') { // 20KB
    recommendations.push('Consider base64 encoding for small critical fonts');
  }

  return {
    strategy,
    format,
    display,
    priority,
    recommendations,
  };
};

/**
 * Monitor font loading performance in real-time
 */
export class FontPerformanceMonitor {
  private metrics: FontPerformanceMetrics[] = [];
  private observer?: PerformanceObserver;

  constructor() {
    this.setupPerformanceObserver();
  }

  private setupPerformanceObserver() {
    if (typeof PerformanceObserver !== 'undefined') {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes('font')) {
            this.recordFontMetric({
              fontFamily: entry.name,
              fontWeight: '400', // Default, could be parsed from name
              loadTime: entry.duration,
              success: true,
              timestamp: entry.startTime,
            });
          }
        });
      });

      this.observer.observe({ entryTypes: ['resource', 'measure'] });
    }
  }

  recordFontMetric(metric: FontPerformanceMetrics) {
    this.metrics.push(metric);
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  getMetrics(): FontPerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageLoadTime(fontFamily?: string): number {
    const relevantMetrics = fontFamily 
      ? this.metrics.filter(m => m.fontFamily === fontFamily && m.success)
      : this.metrics.filter(m => m.success);

    if (relevantMetrics.length === 0) return 0;

    const totalTime = relevantMetrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    return totalTime / relevantMetrics.length;
  }

  getFailureRate(fontFamily?: string): number {
    const relevantMetrics = fontFamily 
      ? this.metrics.filter(m => m.fontFamily === fontFamily)
      : this.metrics;

    if (relevantMetrics.length === 0) return 0;

    const failures = relevantMetrics.filter(m => !m.success).length;
    return failures / relevantMetrics.length;
  }

  dispose() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.metrics = [];
  }
}

/**
 * Global font performance monitor instance
 */
export const fontPerformanceMonitor = new FontPerformanceMonitor();