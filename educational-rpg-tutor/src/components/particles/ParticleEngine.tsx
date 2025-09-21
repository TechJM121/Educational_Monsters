import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Particle, ParticleConfig } from '../../types/animation';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { useDeviceCapability } from '../../hooks/useDeviceCapability';

export interface ParticleEngineProps {
  config: ParticleConfig;
  theme?: 'magical' | 'tech' | 'nature' | 'cosmic';
  interactive?: boolean;
  className?: string;
}

export const ParticleEngine: React.FC<ParticleEngineProps> = ({
  config,
  theme = 'magical',
  interactive = true,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationIdRef = useRef<number>();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const deviceCapability = useDeviceCapability();
  
  // Adjust particle count based on device capability
  const adjustedConfig = {
    ...config,
    count: Math.floor(config.count * (
      deviceCapability === 'high' ? 1 : 
      deviceCapability === 'medium' ? 0.6 : 0.3
    ))
  };

  // Initialize particles
  const initializeParticles = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
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
  }, [adjustedConfig]);

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

  // Update particle physics
  const updateParticles = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const mouse = mouseRef.current;
    
    particlesRef.current = particlesRef.current.map(particle => {
      let { x, y, vx, vy } = particle;
      
      // Apply magnetic force if interactive
      if (interactive) {
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
      
      // Boundary collision with elastic bounce
      if (x <= particle.size || x >= canvas.width - particle.size) {
        vx *= -0.8;
        x = Math.max(particle.size, Math.min(canvas.width - particle.size, x));
      }
      
      if (y <= particle.size || y >= canvas.height - particle.size) {
        vy *= -0.8;
        y = Math.max(particle.size, Math.min(canvas.height - particle.size, y));
      }
      
      return {
        ...particle,
        x,
        y,
        vx,
        vy
      };
    });
  }, [interactive, calculateMagneticForce, adjustedConfig.friction]);

  // Render particles
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
      ctx.fillStyle = particle.color;
      
      // Create gradient for better visual effect
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
      
      ctx.restore();
    });
  }, []);

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