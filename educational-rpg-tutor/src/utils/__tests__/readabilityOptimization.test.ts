import {
  calculateOptimalLineHeight,
  calculateOptimalLetterSpacing,
  calculateOptimalParagraphSpacing,
  calculateOptimalLineLength,
  generateReadabilityMetrics,
  generateReadabilityCSSProperties,
  getDyslexiaFriendlyFontStack,
  calculateReadingTime,
  analyzeTextComplexity,
  generateResponsiveTypography,
  calculateContrastRatio,
  meetsContrastRequirements,
  ReadingContext,
  ReadabilitySettings,
} from '../readabilityOptimization';

describe('Readability Optimization Utils', () => {
  describe('calculateOptimalLineHeight', () => {
    it('should return appropriate line height for body text', () => {
      expect(calculateOptimalLineHeight(16, 'body')).toBe(1.5);
      expect(calculateOptimalLineHeight(12, 'body')).toBe(1.7);
      expect(calculateOptimalLineHeight(24, 'body')).toBe(1.4);
    });

    it('should return appropriate line height for headings', () => {
      expect(calculateOptimalLineHeight(32, 'heading')).toBe(1.0);
      expect(calculateOptimalLineHeight(16, 'heading')).toBe(1.2);
    });

    it('should return appropriate line height for code', () => {
      expect(calculateOptimalLineHeight(14, 'code')).toBe(1.6);
    });
  });

  describe('calculateOptimalLetterSpacing', () => {
    it('should return appropriate letter spacing for different font sizes', () => {
      expect(calculateOptimalLetterSpacing(12)).toBe(0.02);
      expect(calculateOptimalLetterSpacing(16)).toBe(0);
      expect(calculateOptimalLetterSpacing(24)).toBe(-0.02);
    });

    it('should adjust for font weight', () => {
      expect(calculateOptimalLetterSpacing(16, 700)).toBe(0.01);
      expect(calculateOptimalLetterSpacing(16, 300)).toBe(-0.01);
    });

    it('should adjust for uppercase text', () => {
      expect(calculateOptimalLetterSpacing(16, 400, true)).toBe(0.05);
    });
  });

  describe('calculateOptimalParagraphSpacing', () => {
    it('should calculate appropriate paragraph spacing', () => {
      const result = calculateOptimalParagraphSpacing(16, 1.5);
      expect(result).toBe(18); // 16 * 1.5 * 0.75
    });
  });

  describe('calculateOptimalLineLength', () => {
    it('should return appropriate line length for different devices', () => {
      expect(calculateOptimalLineLength(16, 'mobile')).toBe(45);
      expect(calculateOptimalLineLength(16, 'tablet')).toBe(60);
      expect(calculateOptimalLineLength(16, 'desktop')).toBe(75);
    });

    it('should adjust for font size', () => {
      expect(calculateOptimalLineLength(12, 'desktop')).toBe(100); // 75 * (16/12)
      expect(calculateOptimalLineLength(24, 'desktop')).toBe(50); // 75 * (16/24)
    });
  });

  describe('generateReadabilityMetrics', () => {
    const mockContext: ReadingContext = {
      deviceType: 'desktop',
      screenSize: { width: 1200, height: 800 },
      viewingDistance: 'normal',
      ambientLight: 'normal',
    };

    const mockSettings: ReadabilitySettings = {
      fontSizeMultiplier: 1,
      lineHeightMultiplier: 1,
      letterSpacingAdjustment: 0,
      contrastLevel: 'normal',
      reducedMotion: false,
      dyslexiaFriendly: false,
    };

    it('should generate appropriate metrics', () => {
      const metrics = generateReadabilityMetrics(mockContext, mockSettings);
      
      expect(metrics.fontSize).toBe(16);
      expect(metrics.lineHeight).toBe(1.5);
      expect(metrics.letterSpacing).toBe(0);
      expect(metrics.maxLineLength).toBe(75);
      expect(metrics.contrast).toBe(4.5);
    });

    it('should adjust for viewing distance', () => {
      const closeContext = { ...mockContext, viewingDistance: 'close' as const };
      const farContext = { ...mockContext, viewingDistance: 'far' as const };
      
      const closeMetrics = generateReadabilityMetrics(closeContext, mockSettings);
      const farMetrics = generateReadabilityMetrics(farContext, mockSettings);
      
      expect(closeMetrics.fontSize).toBeLessThan(16);
      expect(farMetrics.fontSize).toBeGreaterThan(16);
    });

    it('should adjust for age and vision impairments', () => {
      const elderlyContext = { ...mockContext, userAge: 70 };
      const visionImpairedContext = { ...mockContext, hasVisionImpairment: true };
      
      const elderlyMetrics = generateReadabilityMetrics(elderlyContext, mockSettings);
      const visionImpairedMetrics = generateReadabilityMetrics(visionImpairedContext, mockSettings);
      
      expect(elderlyMetrics.fontSize).toBeGreaterThan(16);
      expect(visionImpairedMetrics.fontSize).toBeGreaterThan(16);
    });
  });

  describe('generateReadabilityCSSProperties', () => {
    it('should generate CSS custom properties', () => {
      const metrics = {
        fontSize: 18,
        lineHeight: 1.6,
        letterSpacing: 0.02,
        wordSpacing: 0.04,
        paragraphSpacing: 24,
        maxLineLength: 70,
        contrast: 7,
      };

      const cssProps = generateReadabilityCSSProperties(metrics);
      
      expect(cssProps['--readable-font-size']).toBe('18px');
      expect(cssProps['--readable-line-height']).toBe('1.6');
      expect(cssProps['--readable-letter-spacing']).toBe('0.02em');
      expect(cssProps['--readable-max-line-length']).toBe('70ch');
    });
  });

  describe('getDyslexiaFriendlyFontStack', () => {
    it('should return a font stack string', () => {
      const fontStack = getDyslexiaFriendlyFontStack();
      expect(fontStack).toContain('OpenDyslexic');
      expect(fontStack).toContain('sans-serif');
    });
  });

  describe('calculateReadingTime', () => {
    it('should calculate reading time correctly', () => {
      const text = 'This is a test text with exactly ten words here.';
      const result = calculateReadingTime(text, 200); // 200 WPM
      
      expect(result.totalSeconds).toBe(3); // 10 words / 200 WPM * 60 seconds
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(3);
    });

    it('should handle longer texts', () => {
      const text = 'word '.repeat(400); // 400 words
      const result = calculateReadingTime(text, 200);
      
      expect(result.minutes).toBe(2);
      expect(result.totalSeconds).toBe(120);
    });
  });

  describe('analyzeTextComplexity', () => {
    it('should analyze simple text correctly', () => {
      const simpleText = 'The cat sat. It was fun. Dogs ran fast.';
      const analysis = analyzeTextComplexity(simpleText);
      
      expect(analysis.complexityScore).toBe('simple');
      expect(analysis.averageWordsPerSentence).toBeLessThan(10);
    });

    it('should analyze complex text correctly', () => {
      const complexText = 'The implementation of sophisticated algorithmic approaches in educational technology necessitates a comprehensive understanding of pedagogical frameworks, cognitive load theory, and adaptive learning methodologies to optimize knowledge acquisition and retention processes.';
      const analysis = analyzeTextComplexity(complexText);
      
      expect(analysis.complexityScore).toBe('complex');
      expect(analysis.averageWordsPerSentence).toBeGreaterThan(30);
    });

    it('should provide recommendations for complex text', () => {
      const complexText = 'This is an extremely complicated sentence with many multisyllabic words that demonstrate the sophisticated nature of academic discourse and require enhanced typographical considerations.';
      const analysis = analyzeTextComplexity(complexText);
      
      expect(analysis.recommendedAdjustments.fontSizeMultiplier).toBeGreaterThan(1);
      expect(analysis.recommendedAdjustments.lineHeightMultiplier).toBeGreaterThan(1);
    });
  });

  describe('generateResponsiveTypography', () => {
    it('should generate clamp function', () => {
      const result = generateResponsiveTypography(16, 14, 20, 320, 1200);
      expect(result).toContain('clamp');
      expect(result).toContain('14px');
      expect(result).toContain('20px');
    });

    it('should handle different viewport ranges', () => {
      const result = generateResponsiveTypography(18, 16, 24, 768, 1440);
      expect(result).toContain('clamp(16px');
      expect(result).toContain('24px)');
    });
  });

  describe('calculateContrastRatio', () => {
    it('should calculate contrast ratio between colors', () => {
      const whiteBlackRatio = calculateContrastRatio('#ffffff', '#000000');
      expect(whiteBlackRatio).toBeCloseTo(21, 0);
      
      const grayRatio = calculateContrastRatio('#ffffff', '#808080');
      expect(grayRatio).toBeGreaterThan(1);
      expect(grayRatio).toBeLessThan(21);
    });

    it('should handle same colors', () => {
      const sameColorRatio = calculateContrastRatio('#ff0000', '#ff0000');
      expect(sameColorRatio).toBe(1);
    });
  });

  describe('meetsContrastRequirements', () => {
    it('should check AA compliance correctly', () => {
      expect(meetsContrastRequirements(4.5, 'AA', 'normal')).toBe(true);
      expect(meetsContrastRequirements(4.0, 'AA', 'normal')).toBe(false);
      expect(meetsContrastRequirements(3.0, 'AA', 'large')).toBe(true);
    });

    it('should check AAA compliance correctly', () => {
      expect(meetsContrastRequirements(7.0, 'AAA', 'normal')).toBe(true);
      expect(meetsContrastRequirements(6.0, 'AAA', 'normal')).toBe(false);
      expect(meetsContrastRequirements(4.5, 'AAA', 'large')).toBe(true);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty text in reading time calculation', () => {
      const result = calculateReadingTime('');
      expect(result.totalSeconds).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });

    it('should handle empty text in complexity analysis', () => {
      const analysis = analyzeTextComplexity('');
      expect(analysis.complexityScore).toBe('simple');
      expect(analysis.averageWordsPerSentence).toBe(0);
    });

    it('should handle extreme font sizes', () => {
      expect(calculateOptimalLineHeight(8)).toBeGreaterThan(1);
      expect(calculateOptimalLineHeight(100)).toBeGreaterThan(0.5);
    });

    it('should handle invalid color formats gracefully', () => {
      // This would need proper error handling in a production implementation
      expect(() => calculateContrastRatio('invalid', '#000000')).not.toThrow();
    });
  });

  describe('Performance considerations', () => {
    it('should handle large texts efficiently', () => {
      const largeText = 'word '.repeat(10000);
      const start = performance.now();
      analyzeTextComplexity(largeText);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle multiple metric generations efficiently', () => {
      const context: ReadingContext = {
        deviceType: 'desktop',
        screenSize: { width: 1200, height: 800 },
        viewingDistance: 'normal',
        ambientLight: 'normal',
      };
      
      const settings: ReadabilitySettings = {
        fontSizeMultiplier: 1,
        lineHeightMultiplier: 1,
        letterSpacingAdjustment: 0,
        contrastLevel: 'normal',
        reducedMotion: false,
        dyslexiaFriendly: false,
      };

      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        generateReadabilityMetrics(context, settings);
      }
      const end = performance.now();
      
      expect(end - start).toBeLessThan(50); // Should complete 100 generations in under 50ms
    });
  });
});