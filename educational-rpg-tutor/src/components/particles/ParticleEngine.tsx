import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Particle, ParticleConfig, DeviceCapability } from '../../types/animation';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { useDeviceCapability } from '../../hooks/useDeviceCapability';
import { AdvancedDeviceDetector } from '../../utils/deviceCapability';
import { PerformanceMonitor } from '../../utils/performance';

export interface ParticleEngineProps {
  config: ParticleConfig;
  theme?: 'magical' | 'tech' | 'nature' | 'cosmic';
  interactive?: boolean;
  className?: string;
  useWebWorker?: boolean;
  adaptToDevice?: boolean;
}

export const ParticleEngine: React.FC<ParticleEngineProps> = ({
  config,
  theme = 'magical',
  interactive = true,
  className = '',
  useWebWorker = true,
  adaptToDevice = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationIdRef = useRef<number>();
  const workerRef = useRef<Worker | null>(null);
  const performanceMonitorRef = useRef<PerformanceMonitor | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentDeviceCapability, setCurrentDeviceCapability] = useState<DeviceCapability>('medium');
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  
  const deviceCapability = useDeviceCapability();
  
  // Initialize performance monitoring and device adaptation
  useEffect(() => {
    const initializeAdaptation = async () => {
      if (adaptToDevice) {
        const detector = AdvancedDeviceDetector.getInstance();
        const deviceInfo = await detector.detectDevice();
        setCurrentDeviceCapability(deviceInfo.capability);
        
        // Initialize performance monitoring
        performanceMonitorRef.current = PerformanceMonitor.getInstance();
        performanceMonitorRef.current.startMonitoring();
        
        // Subscribe to performance changes for dynamic adaptation
        const unsubscribe = performanceMonitorRef.current.subscribe((metrics) => {
          if (metrics.fps < 30 && !isUsingFallback) {
            setIsUsingFallback(true);
            console.warn('Performance degraded, switching to fallback mode');
          } else if (metrics.fps > 50 && isUsingFallback) {
            setIsUsingFallback(false);
            console.log('Performance improved, switching back to normal mode');
          }
        });
        
        return () => {
          unsubscribe();
          performanceMonitorRef.current?.stopMonitoring();
        };
      }
    };
    
    initializeAdaptation();
  }, [adaptToDevice, isUsingFallback]);

  // Initialize Web Worker for complex calculations
  useEffect(() => {
    if (useWebWorker && typeof Worker !== 'undefined' && currentDeviceCapability !== 'low') {
      try {
        workerRef.current = new Worker(new URL('../../workers/particleWorker.ts', import.meta.url));
        
        workerRef.current.onmessage = (event) => {
          const { type, payload } = event.data;
          
          if (type === 'PARTICLES_UPDATED') {
            particlesRef.current = payload;
          } else if (type === 'PARTICLES_INITIALIZED') {
            particlesRef.current = payload;
            setIsInitialized(true);
          }
        };
        
        workerRef.current.onerror = (error) => {
          console.warn('Particle worker error, falling back to main thread:', error);
          workerRef.current = null;
          setIsUsingFallback(true);
        };
      } catch (error) {
        console.warn('Web Worker not supported, using main thread calculations');
        workerRef.current = null;
      }
    }
    
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [useWebWorker, currentDeviceCapability]);

  // Get adaptive configuration based on device capability and performance
  const getAdaptiveConfig = useCallback(() => {
    const detector = AdvancedDeviceDetector.getInstance();
    const adaptiveConfig = detector.getAdaptiveConfig(currentDeviceCapability);
    
    // Apply fallback mode adjustments if needed
    if (isUsingFallback) {
      return {
        ...config,
        count: Math.min(config.count, 15), // Severely limit particles
        interactionRadius: Math.min(config.interactionRadius, 30),
        magneticForce: config.magneticForce * 0.5
      };
    }
    
    // Apply device-based adjustments
    const particleMultiplier = adaptiveConfig.particles.maxCount / 100; // Normalize to base 100
    
    return {
      ...config,
      count: Math.floor(config.count * particleMultiplier),
      interactionRadius: Math.min(config.interactionRadius, adaptiveConfig.particles.interactionRadius),
      magneticForce: config.magneticForce * (adaptiveConfig.particles.physicsEnabled ? 1 : 0.5)
    };
  }, [config, currentDeviceCapability, isUsingFallback]);

  const adjustedConfig = getAdaptiveConfig();

  // Initialize particles (with Web Worker support)
  const initializeParticles = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    if (workerRef.current && !isUsingFallback) {
      // Use Web Worker for initialization
      workerRef.current.postMessage({
        type: 'INIT_PARTICLES',
        payload: {
          count: adjustedConfig.count,
          canvasSize: { width: canvas.width, height: canvas.height },
          config: {
            size: adjustedConfig.size,
            speed: adjustedConfig.speed,
            color: adjustedConfig.color,
            opacity: adjustedConfig.opacity
          }
        }
      });
    } else {
      // Fallback to main thread initialization
      const particles: Particle[] = [];
      
      for (let i = 0; i < adjustedConfig.count; i++) {
        particles.push({
          id: `particle-${i}`,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * (adjustedConfig.speed.max - adjustedConfig.speed.min) + adjustedConfig.speed.min,
          vy: (Math.random() - 0.5) * (adjustedConfig.speed.max - adjustedConfig.speed.min) + adjustedConfig.speed.min,
          size: Math.random() * (adjustedConfig.size.max - adjustedConfig.size.min) + adjustedConfig.size.min,
          color: adjustedConfig.color[Math.floor(Math.random() * adjustedConfig.color.length)],
          opacity: Math.random() * (adjustedConfig.opacity.max - adjustedConfig.opacity.min) + adjustedConfig.opacity.min,
          life: 1,
          maxLife: 1
        });
      }
      
      particlesRef.current = particles;
      setIsInitialized(true);
    }
  }, [adjustedConfig, isUsingFallback]);

  // Calculate magnetic force between particle and mouse
  const calculateMagneticForce = useCallback((particle: Particle, mouseX: number, mouseY: number) => {
    const dx = mouseX - particle.x;
    const dy = mouseY - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > adjustedConfig.interactionRadius) return { fx: 0, fy: 0 };
    
    const force = adjustedConfig.magneticForce * (1 - distance / adjustedConfig.interactionRadius);
    const angle = Math.atan2(dy, dx);
    
    return {
      fx: Math.cos(angle) * force,
      fy: Math.sin(angle) * force
    };
  }, [adjustedConfig.interactionRadius, adjustedConfig.magneticForce]);

  // Update particle physics (with Web Worker support)
  const updateParticles = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const mouse = mouseRef.current;
    
    if (workerRef.current && !isUsingFallback && interactive) {
      // Use Web Worker for complex physics calculations
      workerRef.current.postMessage({
        type: 'UPDATE_PARTICLES',
        payload: {
          particles: particlesRef.current,
          mousePosition: mouse,
          canvasSize: { width: canvas.width, height: canvas.height },
          config: {
            friction: adjustedConfig.friction,
            magneticForce: adjustedConfig.magneticForce,
            interactionRadius: adjustedConfig.interactionRadius
          }
        }
      });
    } else {
      // Fallback to main thread calculations (simplified for low-end devices)
      particlesRef.current = particlesRef.current.map(particle => {
        let { x, y, vx, vy } = particle;
        
        // Apply magnetic force if interactive (simplified for fallback)
        if (interactive && !isUsingFallback) {
          const { fx, fy } = calculateMagneticForce(particle, mouse.x, mouse.y);
          vx += fx;
          vy += fy;
        }
        
        // Apply friction
        vx *= adjustedConfig.friction;
        vy *= adjustedConfig.friction;
        
        // Update position
        x += vx;
        y += vy;
        
        // Simplified boundary collision for fallback mode
        if (isUsingFallback) {
          if (x <= 0 || x >= canvas.width) {
            vx *= -0.5;
            x = Math.max(0, Math.min(canvas.width, x));
          }
          if (y <= 0 || y >= canvas.height) {
            vy *= -0.5;
            y = Math.max(0, Math.min(canvas.height, y));
          }
        } else {
          // Full boundary collision
          if (x <= particle.size || x >= canvas.width - particle.size) {
            vx *= -0.8;
            x = Math.max(particle.size, Math.min(canvas.width - particle.size, x));
          }
          if (y <= particle.size || y >= canvas.height - particle.size) {
            vy *= -0.8;
            y = Math.max(particle.size, Math.min(canvas.height - particle.size, y));
          }
        }
        
        return {
          ...particle,
          x,
          y,
          vx,
          vy
        };
      });
    }
  }, [interactive, calculateMagneticForce, adjustedConfig.friction, adjustedConfig.magneticForce, adjustedConfig.interactionRadius, isUsingFallback]);

  // Render particles (with fallback mode support)
  const renderParticles = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render each particle
    particlesRef.current.forEach(particle => {
      ctx.save();
      
      // Set particle style
      ctx.globalAlpha = particle.opacity;
      
      if (isUsingFallback || currentDeviceCapability === 'low') {
        // Simplified rendering for low-end devices
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Full rendering with gradients
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
  }, [isUsingFallback, currentDeviceCapability]);

  // Animation loop
  const animate = useCallback(() => {
    updateParticles();
    renderParticles();
    animationIdRef.current = requestAnimationFrame(animate);
  }, [updateParticles, renderParticles]);

  // Handle mouse movement
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }, []);

  // Handle canvas resize
  const handleResize = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (!parent) return;
    
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    
    // Reinitialize particles with new dimensions
    initializeParticles();
  }, [initializeParticles]);

  // Initialize on mount
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [handleResize]);

  // Start animation when initialized
  useEffect(() => {
    if (isInitialized) {
      animate();
    }
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isInitialized, animate]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-${interactive ? 'auto' : 'none'} ${className}`}
      onMouseMove={interactive ? handleMouseMove : undefined}
      style={{ zIndex: 1 }}
    />
  );
};