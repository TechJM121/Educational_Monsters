/**
 * Typography readability optimization utilities
 */

export interface ReadabilityMetrics {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  paragraphSpacing: number;
  maxLineLength: number;
  contrast: number;
}

export interface ReadingContext {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  screenSize: { width: number; height: number };
  viewingDistance: 'close' | 'normal' | 'far';
  ambientLight: 'low' | 'normal' | 'bright';
  userAge?: number;
  hasVisionImpairment?: boolean;
}

export interface ReadabilitySettings {
  fontSizeMultiplier: number;
  lineHeightMultiplier: number;
  letterSpacingAdjustment: number;
  contrastLevel: 'normal' | 'high' | 'maximum';
  reducedMotion: boolean;
  dyslexiaFriendly: boolean;
}

/**
 * Calculate optimal line height based on font size and content type
 */
export const calculateOptimalLineHeight = (
  fontSize: number,
  contentType: 'body' | 'heading' | 'caption' | 'code' = 'body'
): number => {
  const baseRatios = {
    body: 1.5,
    heading: 1.2,
    caption: 1.4,
    code: 1.6,
  };

  const baseRatio = baseRatios[contentType];
  
  // Adjust based on font size - larger fonts need relatively smaller line heights
  if (fontSize <= 12) {
    return baseRatio + 0.2;
  } else if (fontSize <= 16) {
    return baseRatio;
  } else if (fontSize <= 24) {
    return baseRatio - 0.1;
  } else {
    return baseRatio - 0.2;
  }
};

/**
 * Calculate optimal letter spacing based on font size and style
 */
export const calculateOptimalLetterSpacing = (
  fontSize: number,
  fontWeight: number = 400,
  isUppercase: boolean = false
): number => {
  let spacing = 0;

  // Base adjustment for font size
  if (fontSize <= 12) {
    spacing = 0.02;
  } else if (fontSize <= 16) {
    spacing = 0;
  } else if (fontSize >= 24) {
    spacing = -0.02;
  }

  // Adjust for font weight
  if (fontWeight >= 700) {
    spacing += 0.01;
  } else if (fontWeight <= 300) {
    spacing -= 0.01;
  }

  // Adjust for uppercase
  if (isUppercase) {
    spacing += 0.05;
  }

  return spacing;
};

/**
 * Calculate optimal paragraph spacing
 */
export const calculateOptimalParagraphSpacing = (
  fontSize: number,
  lineHeight: number
): number => {
  return fontSize * lineHeight * 0.75;
};

/**
 * Calculate optimal maximum line length (measure) in characters
 */
export const calculateOptimalLineLength = (
  fontSize: number,
  deviceType: ReadingContext['deviceType']
): number => {
  const baseCharacters = {
    mobile: 45,
    tablet: 60,
    desktop: 75,
  };

  const base = baseCharacters[deviceType];
  
  // Adjust based on font size
  const sizeMultiplier = 16 / fontSize;
  return Math.round(base * sizeMultiplier);
};

/**
 * Generate readability metrics based on context
 */
export const generateReadabilityMetrics = (
  context: ReadingContext,
  settings: ReadabilitySettings
): ReadabilityMetrics => {
  const baseFontSize = 16;
  const adjustedFontSize = baseFontSize * settings.fontSizeMultiplier;

  // Adjust for viewing distance
  const distanceMultiplier = {
    close: 0.9,
    normal: 1.0,
    far: 1.2,
  }[context.viewingDistance];

  const fontSize = adjustedFontSize * distanceMultiplier;
  const lineHeight = calculateOptimalLineHeight(fontSize) * settings.lineHeightMultiplier;
  const letterSpacing = calculateOptimalLetterSpacing(fontSize) + settings.letterSpacingAdjustment;
  const paragraphSpacing = calculateOptimalParagraphSpacing(fontSize, lineHeight);
  const maxLineLength = calculateOptimalLineLength(fontSize, context.deviceType);

  // Adjust for age and vision impairments
  let fontSizeAdjustment = 1;
  if (context.userAge && context.userAge > 65) {
    fontSizeAdjustment *= 1.2;
  }
  if (context.hasVisionImpairment) {
    fontSizeAdjustment *= 1.3;
  }

  const contrast = {
    normal: 4.5,
    high: 7,
    maximum: 21,
  }[settings.contrastLevel];

  return {
    fontSize: fontSize * fontSizeAdjustment,
    lineHeight,
    letterSpacing,
    wordSpacing: letterSpacing * 2,
    paragraphSpacing,
    maxLineLength,
    contrast,
  };
};

/**
 * Generate CSS custom properties for readability optimization
 */
export const generateReadabilityCSSProperties = (
  metrics: ReadabilityMetrics
): Record<string, string> => {
  return {
    '--readable-font-size': `${metrics.fontSize}px`,
    '--readable-line-height': `${metrics.lineHeight}`,
    '--readable-letter-spacing': `${metrics.letterSpacing}em`,
    '--readable-word-spacing': `${metrics.wordSpacing}em`,
    '--readable-paragraph-spacing': `${metrics.paragraphSpacing}px`,
    '--readable-max-line-length': `${metrics.maxLineLength}ch`,
    '--readable-contrast-ratio': `${metrics.contrast}`,
  };
};

/**
 * Dyslexia-friendly font recommendations
 */
export const dyslexiaFriendlyFonts = [
  'OpenDyslexic',
  'Lexie Readable',
  'Sylexiad',
  'Comic Sans MS', // Surprisingly effective for dyslexia
  'Verdana',
  'Arial',
  'Helvetica',
] as const;

/**
 * Get dyslexia-friendly font stack
 */
export const getDyslexiaFriendlyFontStack = (): string => {
  return dyslexiaFriendlyFonts.join(', ') + ', sans-serif';
};

/**
 * Calculate reading time estimate
 */
export const calculateReadingTime = (
  text: string,
  wordsPerMinute: number = 200
): { minutes: number; seconds: number; totalSeconds: number } => {
  const wordCount = text.trim().split(/\s+/).length;
  const totalSeconds = Math.ceil((wordCount / wordsPerMinute) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return { minutes, seconds, totalSeconds };
};

/**
 * Analyze text complexity for readability adjustments
 */
export const analyzeTextComplexity = (text: string): {
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  complexityScore: 'simple' | 'moderate' | 'complex';
  recommendedAdjustments: Partial<ReadabilitySettings>;
} => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.trim().split(/\s+/);
  
  const averageWordsPerSentence = words.length / sentences.length;
  
  // Simple syllable counting (approximation)
  const countSyllables = (word: string): number => {
    return word.toLowerCase().replace(/[^aeiou]/g, '').length || 1;
  };
  
  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const averageSyllablesPerWord = totalSyllables / words.length;
  
  // Determine complexity
  let complexityScore: 'simple' | 'moderate' | 'complex' = 'simple';
  if (averageWordsPerSentence > 20 || averageSyllablesPerWord > 2) {
    complexityScore = 'moderate';
  }
  if (averageWordsPerSentence > 30 || averageSyllablesPerWord > 3) {
    complexityScore = 'complex';
  }
  
  // Recommend adjustments based on complexity
  const recommendedAdjustments: Partial<ReadabilitySettings> = {};
  if (complexityScore === 'complex') {
    recommendedAdjustments.fontSizeMultiplier = 1.1;
    recommendedAdjustments.lineHeightMultiplier = 1.2;
    recommendedAdjustments.letterSpacingAdjustment = 0.02;
  }
  
  return {
    averageWordsPerSentence,
    averageSyllablesPerWord,
    complexityScore,
    recommendedAdjustments,
  };
};

/**
 * Responsive typography utilities
 */
export const generateResponsiveTypography = (
  baseSize: number,
  minSize: number,
  maxSize: number,
  minViewport: number = 320,
  maxViewport: number = 1200
): string => {
  const slope = (maxSize - minSize) / (maxViewport - minViewport);
  const yIntercept = minSize - slope * minViewport;
  
  return `clamp(${minSize}px, ${yIntercept}px + ${slope * 100}vw, ${maxSize}px)`;
};

/**
 * Color contrast utilities
 */
export const calculateContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast calculation - in a real implementation,
  // you would use a proper color parsing library
  const getLuminance = (color: string): number => {
    // This is a simplified version - use a proper color library in production
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Check if contrast meets WCAG guidelines
 */
export const meetsContrastRequirements = (
  contrastRatio: number,
  level: 'AA' | 'AAA' = 'AA',
  textSize: 'normal' | 'large' = 'normal'
): boolean => {
  const requirements = {
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 },
  };
  
  return contrastRatio >= requirements[level][textSize];
};