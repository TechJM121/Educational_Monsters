import React, { useEffect, useState } from 'react';

interface AnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number;
}

export function ScreenReaderAnnouncement({
  message,
  priority = 'polite',
  clearAfter = 5000
}: AnnouncementProps) {
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    setCurrentMessage(message);

    if (clearAfter > 0) {
      const timer = setTimeout(() => {
        setCurrentMessage('');
      }, clearAfter);

      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {currentMessage}
    </div>
  );
}

// Hook for managing screen reader announcements
export function useScreenReaderAnnouncements() {
  const [announcements, setAnnouncements] = useState<Array<{
    id: string;
    message: string;
    priority: 'polite' | 'assertive';
  }>>([]);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const id = `announcement-${Date.now()}`;
    setAnnouncements(prev => [...prev, { id, message, priority }]);

    // Remove announcement after 5 seconds
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 5000);
  };

  const announceXPGain = (xp: number, reason?: string) => {
    const message = reason 
      ? `Gained ${xp} experience points for ${reason}`
      : `Gained ${xp} experience points`;
    announce(message, 'polite');
  };

  const announceLevelUp = (newLevel: number) => {
    announce(`Congratulations! You've reached level ${newLevel}!`, 'assertive');
  };

  const announceAchievement = (achievementName: string) => {
    announce(`Achievement unlocked: ${achievementName}`, 'assertive');
  };

  const announceStatImprovement = (stat: string, oldValue: number, newValue: number) => {
    const increase = newValue - oldValue;
    announce(`${stat} increased by ${increase} points, now ${newValue}`, 'polite');
  };

  const announceError = (error: string) => {
    announce(`Error: ${error}`, 'assertive');
  };

  const announceSuccess = (message: string) => {
    announce(message, 'polite');
  };

  return {
    announcements,
    announce,
    announceXPGain,
    announceLevelUp,
    announceAchievement,
    announceStatImprovement,
    announceError,
    announceSuccess
  };
}

// Component to render all active announcements
export function ScreenReaderAnnouncementContainer() {
  const { announcements } = useScreenReaderAnnouncements();

  return (
    <>
      {announcements.map(announcement => (
        <ScreenReaderAnnouncement
          key={announcement.id}
          message={announcement.message}
          priority={announcement.priority}
        />
      ))}
    </>
  );
}