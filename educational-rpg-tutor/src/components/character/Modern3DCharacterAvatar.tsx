import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, Float } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { Character } from '../../types/character';

interface Modern3DCharacterAvatarProps {
  character: Character;
  interactive?: boolean;
  lighting?: 'ambient' | 'dramatic' | 'soft' | 'neon';
  showStats?: boolean;
  showEquipment?: boolean;
  autoRotate?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Character mesh component with modern styling
function CharacterMesh({ 
  character, 
  lighting = 'dramatic',
  showEquipment = true 
}: { 
  character: Character;
  lighting: string;
  showEquipment: boolean;
}) {
  const meshRef = useRef<THREE.Group>();
  const [hovered, setHovered] = useState(false);
  const { mouse } = useThree();

  useFrame((state) => {
    if (meshRef.current) {
      // Smooth rotation based on mouse position
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        (mouse.x * Math.PI) / 6,
        0.05
      );
      
      // Floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Subtle breathing effect
      const breathScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      meshRef.current.scale.setScalar(hovered ? 1.1 : breathScale);
    }
  });

  // Get colors based on avatar configuration
  const getHairColor = (hairColor: string): string => {
    const colors: Record<string, string> = {
      brown: '#8B4513',
      black: '#2C2C2C',
      blonde: '#FFD700',
      red: '#CD853F',
      white: '#F5F5F5',
      blue: '#4169E1',
      purple: '#8A2BE2',
      green: '#228B22',
    };
    return colors[hairColor] || colors.brown;
  };

  const getSkinColor = (skinTone: string): string => {
    const tones: Record<string, string> = {
      pale: '#F7E7CE',
      light: '#FDBCB4',
      medium: '#E0AC69',
      dark: '#C68642',
      deep: '#8B4513',
    };
    return tones[skinTone] || tones.medium;
  };

  const getOutfitColor = (outfit: string): string => {
    const colors: Record<string, string> = {
      casual: '#4A90E2',
      formal: '#2C3E50',
      adventurer: '#8B4513',
      scholar: '#7B68EE',
      artist: '#FF6B6B',
      explorer: '#2ECC71',
      mystic: '#9B59B6',
      warrior: '#E74C3C',
    };
    return colors[outfit] || colors.casual;
  };

  return (
    <group
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.8, 1.6, 4, 8]} />
        <meshStandardMaterial
          color={getSkinColor(character.avatarConfig.skinTone)}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color={getSkinColor(character.avatarConfig.skinTone)}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.65, 16, 16]} />
        <meshStandardMaterial
          color={getHairColor(character.avatarConfig.hairColor)}
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.2, 1.3, 0.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color={character.avatarConfig.eyeColor}
          emissive={character.avatarConfig.eyeColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0.2, 1.3, 0.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color={character.avatarConfig.eyeColor}
          emissive={character.avatarConfig.eyeColor}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Outfit */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.9, 0.7, 1.2, 8]} />
        <meshStandardMaterial
          color={getOutfitColor(character.avatarConfig.outfit)}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Equipment indicators */}
      {showEquipment && character.equippedItems.map((item, index) => (
        <Float key={item.id} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={[
            Math.cos(index * Math.PI * 2 / character.equippedItems.length) * 1.5,
            1.5,
            Math.sin(index * Math.PI * 2 / character.equippedItems.length) * 1.5
          ]}>
            <octahedronGeometry args={[0.1]} />
            <meshStandardMaterial
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={0.3}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </Float>
      ))}

      {/* Level indicator */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.3}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          LV {character.level}
        </Text>
      </Float>

      {/* Specialization aura */}
      {character.specialization && (
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[2, 0.05, 8, 32]} />
          <meshStandardMaterial
            color="#8A2BE2"
            emissive="#8A2BE2"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}

// Lighting setup based on mode
function SceneLighting({ mode }: { mode: string }) {
  switch (mode) {
    case 'dramatic':
      return (
        <>
          <ambientLight intensity={0.2} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-5, 5, -5]} intensity={0.5} color="#4A90E2" />
          <pointLight position={[5, -5, 5]} intensity={0.3} color="#FF6B6B" />
        </>
      );
    case 'neon':
      return (
        <>
          <ambientLight intensity={0.1} />
          <pointLight position={[0, 5, 0]} intensity={1} color="#FF00FF" />
          <pointLight position={[5, 0, 5]} intensity={0.8} color="#00FFFF" />
          <pointLight position={[-5, 0, -5]} intensity={0.8} color="#FFFF00" />
        </>
      );
    case 'soft':
      return (
        <>
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 2, 2]} intensity={0.5} />
        </>
      );
    default: // ambient
      return <ambientLight intensity={0.8} />;
  }
}

export function Modern3DCharacterAvatar({
  character,
  interactive = true,
  lighting = 'dramatic',
  showStats = true,
  showEquipment = true,
  autoRotate = false,
  size = 'md',
  className = ''
}: Modern3DCharacterAvatarProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const sizeClasses = {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64',
    xl: 'h-80',
  };

  const cameraPosition: [number, number, number] = size === 'sm' ? [0, 0, 6] : [0, 0, 8];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: prefersReducedMotion ? 0.1 : 0.6 }}
      className={`${sizeClasses[size]} w-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 ${className}`}
    >
      <Canvas
        camera={{ position: cameraPosition, fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <SceneLighting mode={lighting} />
        
        {/* Environment for reflections */}
        <Environment preset="city" />
        
        {/* Character */}
        <CharacterMesh
          character={character}
          lighting={lighting}
          showEquipment={showEquipment}
        />
        
        {/* Ground shadow */}
        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />
        
        {/* Controls */}
        {interactive && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 4}
            autoRotate={autoRotate && !prefersReducedMotion}
            autoRotateSpeed={0.5}
          />
        )}
      </Canvas>

      {/* Stats overlay */}
      {showStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: prefersReducedMotion ? 0.1 : 0.4 }}
          className="absolute bottom-4 left-4 right-4"
        >
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
            <div className="text-white text-center">
              <div className="font-bold text-lg">{character.name}</div>
              <div className="text-sm text-slate-300">
                Level {character.level}
                {character.specialization && (
                  <span className="ml-2 text-purple-400 capitalize">
                    • {character.specialization}
                  </span>
                )}
              </div>
              <div className="flex justify-center gap-4 mt-2 text-xs">
                <span className="text-blue-400">INT: {character.stats.intelligence}</span>
                <span className="text-red-400">VIT: {character.stats.vitality}</span>
                <span className="text-purple-400">WIS: {character.stats.wisdom}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}