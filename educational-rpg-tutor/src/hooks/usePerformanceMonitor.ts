import { useState, useEffect, useCallback, useRef } from 'react';

export interface PerformanceMetrics {
  fps: number;
  averageFPS: number;
  frameDrops: number;
  memoryUsage: number;
  animationDuration: number;
  isPerformanceGood: boolean;
  deviceCapability: 'high' | 'medium' | 'low';
}

export interface PerformanceThresholds {
  minFPS: number;
  maxFrameDrops: number;
  maxMemoryUsage: number;
  maxAnimationDuration: number;
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  minFPS: 55,
  maxFrameDrops: 5,
  maxMemoryUsage: 100, // MB
  maxAnimationDuration: 16.67 // 60fps target
};

export const usePerformanceMonitor = (
  thresholds: Partial<PerformanceThresholds> = {}
) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    averageFPS: 60,
    frameDrops: 0,
    memoryUsage: 0,
    animationDuration: 0,
    isPerformanceGood: true,
    deviceCapability: 'high'
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);
  const frameDropsRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const performanceObserverRef = useRef<PerformanceObserver>();

  const finalThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };

  const calculateFPS = useCallback(() => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    
    if (delta >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / delta);
      
      // Track FPS history for averaging
      fpsHistoryRef.current.push(fps);
      if (fpsHistoryRef.current.length > 10) {
        fpsHistoryRef.current.shift();
      }
      
      // Detect frame drops (FPS below threshold)
      if (fps < finalThresholds.minFPS) {
        frameDropsRef.current++;
      }
      
      const averageFPS = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;
      
      setMetrics(prev => ({
        ...prev,
        fps,
        averageFPS: Math.round(averageFPS),
        frameDrops: frameDropsRef.current
      }));
      
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
    
    frameCountRef.current++;
    animationFrameRef.current = requestAnimationFrame(calculateFPS);
  }, [finalThresholds.minFPS]);

  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024); // Convert to MB
    }
    return 0;
  }, []);

  const assessDeviceCapability = useCallback((): 'high' | 'medium' | 'low' => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    
    if (!gl) return 'low';
    
    const renderer = gl.getParameter(gl.RENDERER) || '';
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 2;
    
    // High-end: 8GB+ RAM, 8+ cores, dedicated GPU
    if (memory >= 8 && cores >= 8 && !renderer.includes('Intel')) {
      return 'high';
    }
    
    // Medium: 4GB+ RAM, 4+ cores
    if (memory >= 4 && cores >= 4) {
      return 'medium';
    }
    
    return 'low';
  }, []);

  const setupPerformanceObserver = useCallback(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.name.includes('animation')) {
            setMetrics(prev => ({
              ...prev,
              animationDuration: entry.duration
            }));
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['measure', 'navigation'] });
        performanceObserverRef.current = observer;
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }
  }, []);

  const updatePerformanceStatus = useCallback(() => {
    const memoryUsage = getMemoryUsage();
    const deviceCapability = assessDeviceCapability();
    
    setMetrics(prev => {
      const isPerformanceGood = 
        prev.averageFPS >= finalThresholds.minFPS &&
        prev.frameDrops <= finalThresholds.maxFrameDrops &&
        memoryUsage <= finalThresholds.maxMemoryUsage &&
        prev.animationDuration <= finalThresholds.maxAnimationDuration;
      
      return {
        ...prev,
        memoryUsage,
        deviceCapability,
        isPerformanceGood
      };
    });
  }, [finalThresholds, getMemoryUsage, assessDeviceCapability]);

  useEffect(() => {
    // Start FPS monitoring
    animationFrameRef.current = requestAnimationFrame(calculateFPS);
    
    // Setup performance observer
    setupPerformanceObserver();
    
    // Update performance status periodically
    const statusInterval = setInterval(updatePerformanceStatus, 2000);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
      }
      
      clearInterval(statusInterval);
    };
  }, [calculateFPS, setupPerformanceObserver, updatePerformanceStatus]);

  const resetMetrics = useCallback(() => {
    frameDropsRef.current = 0;
    fpsHistoryRef.current = [];
    setMetrics(prev => ({
      ...prev,
      frameDrops: 0,
      averageFPS: 60,
      fps: 60
    }));
  }, []);

  const measureAnimation = useCallback((name: string, fn: () => void) => {
    performance.mark(`${name}-start`);
    fn();
    performance.mark(`${name}-end`);
    performance.measure(`animation-${name}`, `${name}-start`, `${name}-end`);
  }, []);

  return {
    metrics,
    resetMetrics,
    measureAnimation,
    thresholds: finalThresholds
  };
};