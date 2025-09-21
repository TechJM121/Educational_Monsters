import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Particle } from '../../types/animation';

export interface ParticleTransitionProps {
  particles: Particle[];
  onParticleSpawn?: (particle: Particle) => void;
  onParticleDespawn?: (particle: Particle) => void;
  spawnAnimation?: 'fade' | 'scale' | 'burst' | 'spiral';
  despawnAnimation?: 'fade' | 'scale' | 'implode' | 'scatter';
  transitionDuration?: number;
}

export const ParticleTransitions: React.FC<ParticleTransitionProps> = ({
  particles,
  onParticleSpawn,
  onParticleDespawn,
  spawnAnimation = 'scale',
  despawnAnimation = 'fade',
  transitionDuration = 500
}) => {
  const previousParticlesRef = useRef<Particle[]>([]);
  const spawnedParticlesRef = useRef<Set<string>>(new Set());

  const getSpawnAnimationProps = useCallback((animation: typeof spawnAnimation) => {
    switch (animation) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: transitionDuration / 1000 }
        };
      case 'scale':
        return {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { 
            duration: transitionDuration / 1000,
            type: "spring",
            stiffness: 300,
            damping: 20
          }
        };
      case 'burst':
        return {
          initial: { scale: 0, opacity: 0, rotate: 0 },
          animate: { scale: [0, 1.5, 1], opacity: [0, 0.8, 1], rotate: 360 },
          transition: { 
            duration: transitionDuration / 1000,
            times: [0, 0.6, 1],
            ease: "easeOut"
          }
        };
      case 'spiral':
        return {
          initial: { scale: 0, opacity: 0, rotate: -180, x: -20, y: -20 },
          animate: { scale: 1, opacity: 1, rotate: 0, x: 0, y: 0 },
          transition: { 
            duration: transitionDuration / 1000,
            type: "spring",
            stiffness: 200,
            damping: 15
          }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 }
        };
    }
  }, [transitionDuration]);

  const getDespawnAnimationProps = useCallback((animation: typeof despawnAnimation) => {
    switch (animation) {
      case 'fade':
        return {
          exit: { opacity: 0 },
          transition: { duration: transitionDuration / 1000 }
        };
      case 'scale':
        return {
          exit: { scale: 0, opacity: 0 },
          transition: { 
            duration: transitionDuration / 1000,
            ease: "easeIn"
          }
        };
      case 'implode':
        return {
          exit: { scale: 0, opacity: 0, rotate: 180 },
          transition: { 
            duration: transitionDuration / 1000,
            ease: "easeIn"
          }
        };
      case 'scatter':
        return {
          exit: { 
            scale: 0, 
            opacity: 0, 
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100,
            rotate: Math.random() * 720 - 360
          },
          transition: { 
            duration: transitionDuration / 1000,
            ease: "easeOut"
          }
        };
      default:
        return {
          exit: { opacity: 0 }
        };
    }
  }, [transitionDuration]);

  // Track particle lifecycle
  useEffect(() => {
    const previousParticles = previousParticlesRef.current;
    const currentParticleIds = new Set(particles.map(p => p.id));
    const previousParticleIds = new Set(previousParticles.map(p => p.id));

    // Find newly spawned particles
    const newParticles = particles.filter(p => !previousParticleIds.has(p.id));
    newParticles.forEach(particle => {
      if (!spawnedParticlesRef.current.has(particle.id)) {
        spawnedParticlesRef.current.add(particle.id);
        onParticleSpawn?.(particle);
      }
    });

    // Find despawned particles
    const despawnedParticles = previousParticles.filter(p => !currentParticleIds.has(p.id));
    despawnedParticles.forEach(particle => {
      spawnedParticlesRef.current.delete(particle.id);
      onParticleDespawn?.(particle);
    });

    previousParticlesRef.current = particles;
  }, [particles, onParticleSpawn, onParticleDespawn]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle) => {
        const spawnProps = getSpawnAnimationProps(spawnAnimation);
        const despawnProps = getDespawnAnimationProps(despawnAnimation);
        
        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.opacity,
            }}
            {...spawnProps}
            {...despawnProps}
          />
        );
      })}
    </div>
  );
};

// Utility hook for managing particle lifecycle events
export const useParticleLifecycle = () => {
  const spawnCallbacks = useRef<((particle: Particle) => void)[]>([]);
  const despawnCallbacks = useRef<((particle: Particle) => void)[]>([]);

  const onParticleSpawn = useCallback((callback: (particle: Particle) => void) => {
    spawnCallbacks.current.push(callback);
    return () => {
      const index = spawnCallbacks.current.indexOf(callback);
      if (index > -1) {
        spawnCallbacks.current.splice(index, 1);
      }
    };
  }, []);

  const onParticleDespawn = useCallback((callback: (particle: Particle) => void) => {
    despawnCallbacks.current.push(callback);
    return () => {
      const index = despawnCallbacks.current.indexOf(callback);
      if (index > -1) {
        despawnCallbacks.current.splice(index, 1);
      }
    };
  }, []);

  const handleParticleSpawn = useCallback((particle: Particle) => {
    spawnCallbacks.current.forEach(callback => callback(particle));
  }, []);

  const handleParticleDespawn = useCallback((particle: Particle) => {
    despawnCallbacks.current.forEach(callback => callback(particle));
  }, []);

  return {
    onParticleSpawn,
    onParticleDespawn,
    handleParticleSpawn,
    handleParticleDespawn
  };
};