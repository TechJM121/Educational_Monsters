import React from 'react';
import { ComingSoonPage } from '../components/shared/ComingSoonPage';

export const TeacherPortalPage: React.FC = () => {
  return (
    <ComingSoonPage
      title="Teacher Portal"
      description="Comprehensive classroom management tools designed specifically for educators to track, assign, and enhance student learning!"
      icon="👩‍🏫"
      expectedDate="Q1 2025"
      features={[
        "Classroom dashboard with student progress",
        "Custom assignment creation tools",
        "Detailed analytics and reporting",
        "Grade book integration",
        "Parent communication system",
        "Curriculum alignment tools",
        "Bulk student account management",
        "Learning objective tracking"
      ]}
    />
  );
};