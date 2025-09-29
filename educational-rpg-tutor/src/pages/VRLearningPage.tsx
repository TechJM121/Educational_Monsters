import React from 'react';
import { ComingSoonPage } from '../components/shared/ComingSoonPage';

export const VRLearningPage: React.FC = () => {
  return (
    <ComingSoonPage
      title="Virtual Reality Learning"
      description="Step into immersive 3D worlds where learning comes alive through virtual and augmented reality experiences!"
      icon="🥽"
      expectedDate="2026"
      features={[
        "VR headset support (Quest, PICO, etc.)",
        "Immersive 3D learning environments",
        "Virtual field trips to historical sites",
        "3D molecular and atomic visualization",
        "AR overlay for real-world learning",
        "Virtual science laboratories",
        "Interactive 3D geometry lessons",
        "Collaborative VR study spaces"
      ]}
    />
  );
};