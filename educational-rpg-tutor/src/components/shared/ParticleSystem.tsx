import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'star' | 'sparkle' | 'circle' | 'diamond';
}

interface ParticleSystemProps {
  isActive: boolean;
  particleCount?: number;
  duration?: number;
  colors?: string[];
  types?: Array<'star' | 'sparkle' | 'circle' | 'diamond'>;
  className?: string;
}

const PARTICLE_SYMBOLS = {
  star: '⭐',
  sparkle: '✨',
  circle: '●',
  diamond: '💎'
};

export function ParticleSystem({
  isActive,
  particleCount = 20,
  duration = 3000,
  colors = ['#fbbf24', '#f59e0b', '#d97706', '#92400e'],
  types = ['star', 'sparkle', 'circle'],
  className = ''
}: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Create initial particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: `particle-${i}-${Date.now()}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: duration,
        maxLife: duration,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 0.8 + 0.2,
        type: types[Math.floor(Math.random() * types.length)]
      });
    }
    setParticles(newParticles);

    // Animation loop
    const interval = setInterval(() => {
      setParticles(prevParticles => {
        return prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 50,
            vy: particle.vy + 0.1 // gravity
          }))
          .filter(particle => particle.life > 0);
      });
    }, 50);

    // Clean up after duration
    const timeout = setTimeout(() => {
      setParticles([]);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isActive, particleCount, duration, colors, types]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ 
              opacity: particle.life / particle.maxLife,
              scale: particle.size,
              x: `${particle.x}vw`,
              y: `${particle.y}vh`
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute text-2xl"
            style={{ color: particle.color }}
          >
            {PARTICLE_SYMBOLS[particle.type]}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}