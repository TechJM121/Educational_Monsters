import React from 'react';
import { ComingSoonPage } from '../components/shared/ComingSoonPage';

export const SocialHubPage: React.FC = () => {
  return (
    <ComingSoonPage
      title="Social Learning Hub"
      description="Connect with friends, join study groups, and learn together in our interactive social learning environment!"
      icon="👥"
      expectedDate="Q2 2025"
      features={[
        "Friend system with real-time chat",
        "Study groups and collaborative learning",
        "Peer-to-peer tutoring sessions",
        "Social leaderboards and competitions",
        "Share achievements and progress",
        "Group challenges and team quests",
        "Virtual study rooms",
        "Parent-approved social interactions"
      ]}
    />
  );
};