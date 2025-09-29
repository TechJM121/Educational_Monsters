import React from 'react';
import { ComingSoonPage } from '../components/shared/ComingSoonPage';

export const MobileAppPage: React.FC = () => {
  return (
    <ComingSoonPage
      title="Native Mobile Apps"
      description="Take your learning adventure anywhere with our dedicated iOS and Android apps featuring offline support!"
      icon="📱"
      expectedDate="Q4 2025"
      features={[
        "Native iOS and Android apps",
        "Offline learning capabilities",
        "Push notifications for study reminders",
        "Mobile-optimized touch controls",
        "Camera integration for AR features",
        "Sync across all devices",
        "Mobile-specific achievements",
        "Parental controls on mobile"
      ]}
    />
  );
};