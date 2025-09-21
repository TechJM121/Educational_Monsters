// Web Worker for particle physics calculations
import { Particle } from '../types/animation';

export interface ParticleWorkerMessage {
  type: 'UPDATE_PARTICLES' | 'INIT_PARTICLES' | 'SET_CONFIG';
  payload: any;
}

export interface ParticleUpdatePayload {
  particles: Particle[];
  mousePosition: { x: number; y: number };
  canvasSize: { width: number; height: number };
  config: {
    friction: number;
    magneticForce: number;
    interactionRadius: number;
  };
}

export interface ParticleInitPayload {
  count: number;
  canvasSize: { width: number; height: number };
  config: {
    size: { min: number; max: number };
    speed: { min: number; max: number };
    color: string[];
    opacity: { min: number; max: number };
  };
}

// Physics calculation functions
const calculateMagneticForce = (
  particle: Particle,
  mouseX: number,
  mouseY: number,
  interactionRadius: number,
  magneticForce: number
) => {
  const dx = mouseX - particle.x;
  const dy = mouseY - particle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > interactionRadius) return { fx: 0, fy: 0 };
  
  const force = magneticForce * (1 - distance / interactionRadius);
  const angle = Math.atan2(dy, dx);
  
  return {
    fx: Math.cos(angle) * force,
    fy: Math.sin(angle) * force
  };
};

const updateParticlePhysics = (
  particles: Particle[],
  mousePosition: { x: number; y: number },
  canvasSize: { width: number; height: number },
  config: ParticleUpdatePayload['config']
): Particle[] => {
  return particles.map(particle => {
    let { x, y, vx, vy } = particle;
    
    // Apply magnetic force
    const { fx, fy } = calculateMagneticForce(
      particle,
      mousePosition.x,
      mousePosition.y,
      config.interactionRadius,
      config.magneticForce
    );
    
    vx += fx;
    vy += fy;
    
    // Apply friction
    vx *= config.friction;
    vy *= config.friction;
    
    // Update position
    x += vx;
    y += vy;
    
    // Boundary collision with elastic bounce
    if (x <= particle.size || x >= canvasSize.width - particle.size) {
      vx *= -0.8;
      x = Math.max(particle.size, Math.min(canvasSize.width - particle.size, x));
    }
    
    if (y <= particle.size || y >= canvasSize.height - particle.size) {
      vy *= -0.8;
      y = Math.max(particle.size, Math.min(canvasSize.height - particle.size, y));
    }
    
    return {
      ...particle,
      x,
      y,
      vx,
      vy
    };
  });
};

const initializeParticles = (payload: ParticleInitPayload): Particle[] => {
  const particles: Particle[] = [];
  
  for (let i = 0; i < payload.count; i++) {
    particles.push({
      id: `particle-${i}`,
      x: Math.random() * payload.canvasSize.width,
      y: Math.random() * payload.canvasSize.height,
      vx: (Math.random() - 0.5) * (payload.config.speed.max - payload.config.speed.min) + payload.config.speed.min,
      vy: (Math.random() - 0.5) * (payload.config.speed.max - payload.config.speed.min) + payload.config.speed.min,
      size: Math.random() * (payload.config.size.max - payload.config.size.min) + payload.config.size.min,
      color: payload.config.color[Math.floor(Math.random() * payload.config.color.length)],
      opacity: Math.random() * (payload.config.opacity.max - payload.config.opacity.min) + payload.config.opacity.min,
      life: 1,
      maxLife: 1
    });
  }
  
  return particles;
};

// Worker message handler
self.onmessage = (event: MessageEvent<ParticleWorkerMessage>) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'INIT_PARTICLES':
      const initialParticles = initializeParticles(payload as ParticleInitPayload);
      self.postMessage({
        type: 'PARTICLES_INITIALIZED',
        payload: initialParticles
      });
      break;
      
    case 'UPDATE_PARTICLES':
      const updatePayload = payload as ParticleUpdatePayload;
      const updatedParticles = updateParticlePhysics(
        updatePayload.particles,
        updatePayload.mousePosition,
        updatePayload.canvasSize,
        updatePayload.config
      );
      self.postMessage({
        type: 'PARTICLES_UPDATED',
        payload: updatedParticles
      });
      break;
      
    default:
      console.warn('Unknown worker message type:', type);
  }
};

export {};