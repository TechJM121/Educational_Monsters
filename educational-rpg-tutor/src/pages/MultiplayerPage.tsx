import React from 'react';
import { ComingSoonPage } from '../components/shared/ComingSoonPage';

export const MultiplayerPage: React.FC = () => {
  return (
    <ComingSoonPage
      title="Multiplayer Adventures"
      description="Team up with friends for epic learning quests and compete in real-time educational battles!"
      icon="⚔️"
      expectedDate="Summer 2025"
      features={[
        "Real-time multiplayer quiz battles",
        "Cooperative learning dungeons",
        "Team-based problem solving",
        "Cross-platform play support",
        "Voice chat for study sessions",
        "Multiplayer tournaments",
        "Guild system for long-term teams",
        "Synchronized learning progress"
      ]}
    />
  );
};