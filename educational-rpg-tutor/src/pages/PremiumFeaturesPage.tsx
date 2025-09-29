import React from 'react';
import { ComingSoonPage } from '../components/shared/ComingSoonPage';

export const PremiumFeaturesPage: React.FC = () => {
  return (
    <ComingSoonPage
      title="Premium Learning Experience"
      description="Unlock the full potential of your learning journey with exclusive premium features and personalized content!"
      icon="💎"
      expectedDate="Q1 2025"
      features={[
        "Unlimited AI tutor conversations",
        "Advanced progress analytics",
        "Custom learning paths",
        "Priority customer support",
        "Exclusive premium content",
        "Ad-free learning experience",
        "Family sharing (up to 6 accounts)",
        "Offline content downloads"
      ]}
    />
  );
};