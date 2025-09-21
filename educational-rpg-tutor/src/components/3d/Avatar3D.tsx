import React, { useRef, useState, useEffect, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface Character {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  level: number;
  class: string;
}

interface Avatar3DProps {
  character: Character;
  interactive?: boolean;
  lighting?: 'ambient' | 'dramatic' | 'soft';
  size?: 'small' | 'medium' | 'large';
  autoRotate?: boolean;
  className?: string;
  onHover?: (hovered: boolean) => void;
  onRotationChange?: (rotation: { x: number; y: number; z: number }) => void;
  animationSpeed?: number;
}

interface AvatarMeshProps {
  character: Character;
  interactive: boolean;
  lighting: 'ambient' | 'dramatic' | 'soft';
  mousePosition: { x: number; y: number };
  onHover?: (hovered: boolean) => void;
  onRotationChange?: (rotation: { x: number; y: number; z: number }) => void;
  animationSpeed: number;
}

const AvatarMesh: React.FC<AvatarMeshProps> = ({ 
  character, 
  interactive, 
  lighting,
  mousePosition,
  onHover,
  onRotationChange,
  animationSpeed
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { viewport } = useThree();
  const [animationState, setAnimationState] = useState<'idle' | 'hover' | 'rotating'>('idle');

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;

    // Floating animation with configurable speed
    const time = state.clock.elapsedTime;
    const floatSpeed = animationSpeed * 1.5;
    groupRef.current.position.y = Math.sin(time * floatSpeed) * 0.1;

    if (interactive) {
      // Mouse-based rotation with smooth transitions
      const targetRotationY = (mousePosition.x / viewport.width) * Math.PI * 0.3;
      const targetRotationX = -(mousePosition.y / viewport.height) * Math.PI * 0.2;
      
      const lerpFactor = 0.05 * animationSpeed;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotationY,
        lerpFactor
      );
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotationX,
        lerpFactor
      );

      // Update animation state
      const isRotating = Math.abs(targetRotationY - groupRef.current.rotation.y) > 0.01 ||
                        Math.abs(targetRotationX - groupRef.current.rotation.x) > 0.01;
      const newState = hovered ? 'hover' : (isRotating ? 'rotating' : 'idle');
      if (newState !== animationState) {
        setAnimationState(newState);
      }
    } else {
      // Auto rotation when not interactive
      groupRef.current.rotation.y = time * (0.3 * animationSpeed);
      setAnimationState('rotating');
    }

    // Hover scale effect with smooth transitions
    const targetScale = hovered ? 1.1 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale), 
      0.1 * animationSpeed
    );

    // Notify parent of rotation changes
    if (onRotationChange) {
      onRotationChange({
        x: groupRef.current.rotation.x,
        y: groupRef.current.rotation.y,
        z: groupRef.current.rotation.z
      });
    }
  });

  // Lighting setup based on prop
  const getLightingIntensity = () => {
    switch (lighting) {
      case 'dramatic': return { ambient: 0.2, point: 1.5, spot: 0.8 };
      case 'soft': return { ambient: 0.8, point: 0.5, spot: 0.3 };
      default: return { ambient: 0.5, point: 1.0, spot: 0.5 };
    }
  };

  const lightIntensity = getLightingIntensity();

  return (
    <group ref={groupRef}>
      {/* Lighting setup */}
      <ambientLight intensity={lightIntensity.ambient} />
      <pointLight 
        position={[5, 5, 5]} 
        intensity={lightIntensity.point}
        color="#ffffff"
      />
      <spotLight
        position={[-5, 10, 5]}
        angle={0.3}
        penumbra={0.5}
        intensity={lightIntensity.spot}
        color={character.primaryColor}
      />

      {/* Main avatar mesh */}
      <mesh
        ref={meshRef}
        onPointerOver={() => {
          if (interactive) {
            setHovered(true);
            onHover?.(true);
          }
        }}
        onPointerOut={() => {
          if (interactive) {
            setHovered(false);
            onHover?.(false);
          }
        }}
        castShadow
        receiveShadow
      >
        {/* Character body - sphere for now, can be replaced with more complex geometry */}
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={character.primaryColor}
          metalness={0.3}
          roughness={0.4}
          emissive={hovered ? character.secondaryColor : '#000000'}
          emissiveIntensity={hovered ? 0.1 : 0}
        />
      </mesh>

      {/* Character accessories based on class */}
      {character.class === 'warrior' && (
        <mesh position={[0, 1.2, 0]} castShadow>
          <coneGeometry args={[0.3, 0.8, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      )}

      {character.class === 'mage' && (
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 1.5]} />
          <meshStandardMaterial color="#4A90E2" emissive="#4A90E2" emissiveIntensity={0.2} />
        </mesh>
      )}

      {/* Level indicator ring */}
      <mesh position={[0, -1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.3, 16]} />
        <meshBasicMaterial 
          color={character.secondaryColor} 
          transparent 
          opacity={0.6}
        />
      </mesh>
    </group>
  );
};

const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center w-full h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

const Avatar3D: React.FC<Avatar3DProps> = ({
  character,
  interactive = true,
  lighting = 'ambient',
  size = 'medium',
  autoRotate = false,
  className = '',
  onHover,
  onRotationChange,
  animationSpeed = 1
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64'
  };

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    
    setMousePosition({ x, y });
  }, [interactive]);

  const handleCanvasCreated = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className={`${sizeClasses[size]} ${className} cursor-pointer`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={interactive ? { scale: 1.05 } : undefined}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          shadows
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          onCreated={handleCanvasCreated}
          data-testid="avatar-3d-canvas"
        >
          <AvatarMesh
            character={character}
            interactive={interactive}
            lighting={lighting}
            mousePosition={mousePosition}
            onHover={onHover}
            onRotationChange={onRotationChange}
            animationSpeed={animationSpeed}
          />
          
          {/* Controls for interactive mode */}
          {interactive && (
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 3}
              autoRotate={autoRotate}
              autoRotateSpeed={2 * animationSpeed}
            />
          )}
        </Canvas>
      </Suspense>
    </motion.div>
  );
};

export default Avatar3D;
export type { Avatar3DProps, Character };