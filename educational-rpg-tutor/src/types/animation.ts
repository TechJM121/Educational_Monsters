/**
 * Animation State Management Types
 * Defines interfaces for managing animation states, queues, and performance metrics
 */

export type AnimationType = 'micro' | 'transition' | 'celebration' | 'loading' | 'hover' | 'focus';
export type AnimationPriority = 'low' | 'medium' | 'high' | 'critical';
export type DeviceCapability = 'low' | 'medium' | 'high';

export interface AnimationQueueItem {
  id: string;
  type: AnimationType;
  priority: AnimationPriority;
  duration: number;
  element: string;
  startTime?: number;
  endTime?: number;
  cancelled?: boolean;
}

export interface AnimationState {
  isAnimating: boolean;
  currentAnimation: string | null;
  queue: AnimationQueueItem[];
  performance: PerformanceMetrics;
  deviceCapability: DeviceCapability;
}

export interface PerformanceMetrics {
  fps: number;
  frameDrops: number;
  memoryUsage: number;
  averageFrameTime: number;
  lastMeasurement: number;
  isThrottled: boolean;
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  repeat?: number;
  yoyo?: boolean;
  enabled: boolean;
}

export interface AnimationPresets {
  micro: AnimationConfig;
  hover: AnimationConfig;
  focus: AnimationConfig;
  celebration: AnimationConfig;
  transition: AnimationConfig;
  loading: AnimationConfig;
}

export interface ParticleConfig {
  count: number;
  size: { min: number; max: number };
  speed: { min: number; max: number };
  color: string[];
  opacity: { min: number; max: number };
  interactionRadius: number;
  magneticForce: number;
  friction: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
}

export interface AnimationContext {
  state: AnimationState;
  addToQueue: (item: Omit<AnimationQueueItem, 'id'>) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  updatePerformance: (metrics: Partial<PerformanceMetrics>) => void;
  setDeviceCapability: (capability: DeviceCapability) => void;
}