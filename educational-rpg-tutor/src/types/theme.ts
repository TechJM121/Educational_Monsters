/**
 * Modern Theme System Types
 * Defines interfaces for glassmorphic themes, color systems, and visual effects
 */

export type ThemeMode = 'light' | 'dark' | 'auto';
export type BlurIntensity = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type ShadowIntensity = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type GlowIntensity = 'none' | 'sm' | 'md' | 'lg';

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface GlassColors {
  background: string;
  border: string;
  highlight: string;
  shadow: string;
}

export interface GradientColors {
  start: string;
  end: string;
  direction?: string;
}

export interface BlurSettings {
  backdrop: BlurIntensity;
  content: BlurIntensity;
  overlay: BlurIntensity;
}

export interface ShadowSettings {
  glass: ShadowIntensity;
  depth: ShadowIntensity;
  glow: GlowIntensity;
}

export interface GradientPresets {
  cosmic: GradientColors;
  sunset: GradientColors;
  ocean: GradientColors;
  forest: GradientColors;
  custom?: GradientColors;
}

export interface TypographyScale {
  xs: { fontSize: string; lineHeight: string };
  sm: { fontSize: string; lineHeight: string };
  base: { fontSize: string; lineHeight: string };
  lg: { fontSize: string; lineHeight: string };
  xl: { fontSize: string; lineHeight: string };
  '2xl': { fontSize: string; lineHeight: string };
  '3xl': { fontSize: string; lineHeight: string };
}

export interface FontFamilies {
  rpg: string[];
  fantasy: string[];
  modern: string[];
  display: string[];
}

export interface ModernTheme {
  id: string;
  name: string;
  mode: ThemeMode;
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    accent: ColorScale;
    glass: GlassColors;
    gradient: GradientPresets;
  };
  effects: {
    blur: BlurSettings;
    shadows: ShadowSettings;
    gradients: GradientPresets;
  };
  typography: {
    scale: TypographyScale;
    families: FontFamilies;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  animations: import('./animation').AnimationPresets;
}

export interface ThemeCustomization {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  blurIntensity?: BlurIntensity;
  shadowIntensity?: ShadowIntensity;
  glowIntensity?: GlowIntensity;
  gradientPreset?: keyof GradientPresets;
  customGradient?: GradientColors;
}

export interface ThemeContext {
  currentTheme: ModernTheme;
  mode: ThemeMode;
  customization: ThemeCustomization;
  setTheme: (theme: ModernTheme) => void;
  setMode: (mode: ThemeMode) => void;
  updateCustomization: (customization: Partial<ThemeCustomization>) => void;
  resetToDefault: () => void;
  exportTheme: () => string;
  importTheme: (themeData: string) => boolean;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  theme: ModernTheme;
  preview: {
    primaryColor: string;
    secondaryColor: string;
    backgroundGradient: GradientColors;
  };
}