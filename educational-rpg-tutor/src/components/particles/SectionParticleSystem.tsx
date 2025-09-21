import React, { useEffect, useRef } from 'react';
import { ThemedParticleSystem } from './ThemedParticleSystem';
import { useParticleTheme } from '../../contexts/ParticleThemeContext';

export interface SectionParticleSystemProps {
  sectionId: string;
  className?: string;
  interactive?: boolean;
  autoSwitch?: boolean;
  children?: React.ReactNode;
}

export const SectionParticleSystem: React.FC<SectionParticleSystemProps> = ({
  sectionId,
  className = '',
  interactive = true,
  autoSwitch = true,
  children
}) => {
  const { switchThemeForSection, autoSwitchEnabled } = useParticleTheme();
  const sectionRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    if (!autoSwitch || !autoSwitchEnabled || !sectionRef.current) return;

    // Create intersection observer to detect when section is in view
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            // Switch theme when section is 30% visible
            switchThemeForSection(sectionId);
          }
        });
      },
      {
        threshold: [0.3, 0.7], // Trigger at 30% and 70% visibility
        rootMargin: '-10% 0px -10% 0px' // Add some margin to prevent rapid switching
      }
    );

    observerRef.current.observe(sectionRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sectionId, autoSwitch, autoSwitchEnabled, switchThemeForSection]);

  return (
    <div ref={sectionRef} className={`relative ${className}`}>
      <ThemedParticleSystem
        interactive={interactive}
        className="absolute inset-0 -z-10"
      />
      {children}
    </div>
  );
};