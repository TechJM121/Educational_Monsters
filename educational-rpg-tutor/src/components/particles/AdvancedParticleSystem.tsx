import React, { useMemo } from 'react';
import { ParticleEngine } from './ParticleEngine';
import { createParticleConfig } from './ParticleConfig';
import { useDeviceCapability } from '../../hooks/useDeviceCapability';

export interface AdvancedParticleSystemProps {
  theme?: 'magical' | 'tech' | 'nature' | 'cosmic';
  interactive?: boolean;
  className?: string;
  customConfig?: Partial<import('../../types/animation').ParticleConfig>;
}

export const AdvancedParticleSystem: React.FC<AdvancedParticleSystemProps> = ({
  theme = 'magical',
  interactive = true,
  className = '',
  customConfig = {}
}) => {
  const deviceCapability = useDeviceCapability();
  
  const particleConfig = useMemo(() => {
    const baseConfig = createParticleConfig(theme, deviceCapability);
    return { ...baseConfig, ...customConfig };
  }, [theme, deviceCapability, customConfig]);

  return (
    <ParticleEngine
      config={particleConfig}
      theme={theme}
      interactive={interactive}
      className={className}
    />
  );
};