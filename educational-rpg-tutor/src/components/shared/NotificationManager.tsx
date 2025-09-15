import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { XPGainNotification } from './XPGainNotification';
import { StatImprovementNotification } from './StatImprovementNotification';
import { LevelUpCelebration } from './LevelUpCelebration';
import { useScreenReaderAnnouncements } from './ScreenReaderAnnouncements';

interface StatImprovement {
  stat: 'intelligence' | 'vitality' | 'wisdom' | 'charisma' | 'dexterity' | 'creativity';
  oldValue: number;
  newValue: number;
}

interface NotificationState {
  xpGain: {
    isVisible: boolean;
    amount: number;
    reason?: string;
  };
  statImprovements: {
    isVisible: boolean;
    improvements: StatImprovement[];
  };
  levelUp: {
    isVisible: boolean;
    newLevel: number;
  };
}

interface NotificationContextType {
  showXPGain: (amount: number, reason?: string) => void;
  showStatImprovements: (improvements: StatImprovement[]) => void;
  showLevelUp: (newLevel: number) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationState>({
    xpGain: { isVisible: false, amount: 0 },
    statImprovements: { isVisible: false, improvements: [] },
    levelUp: { isVisible: false, newLevel: 0 }
  });

  const {
    announceXPGain,
    announceLevelUp,
    announceStatImprovement
  } = useScreenReaderAnnouncements();

  const showXPGain = useCallback((amount: number, reason?: string) => {
    setNotifications(prev => ({
      ...prev,
      xpGain: { isVisible: true, amount, reason }
    }));
    
    announceXPGain(amount, reason);
  }, [announceXPGain]);

  const showStatImprovements = useCallback((improvements: StatImprovement[]) => {
    setNotifications(prev => ({
      ...prev,
      statImprovements: { isVisible: true, improvements }
    }));

    // Announce each stat improvement
    improvements.forEach(improvement => {
      announceStatImprovement(
        improvement.stat,
        improvement.oldValue,
        improvement.newValue
      );
    });
  }, [announceStatImprovement]);

  const showLevelUp = useCallback((newLevel: number) => {
    setNotifications(prev => ({
      ...prev,
      levelUp: { isVisible: true, newLevel }
    }));

    announceLevelUp(newLevel);
  }, [announceLevelUp]);

  const clearAll = useCallback(() => {
    setNotifications({
      xpGain: { isVisible: false, amount: 0 },
      statImprovements: { isVisible: false, improvements: [] },
      levelUp: { isVisible: false, newLevel: 0 }
    });
  }, []);

  const handleXPGainComplete = useCallback(() => {
    setNotifications(prev => ({
      ...prev,
      xpGain: { ...prev.xpGain, isVisible: false }
    }));
  }, []);

  const handleStatImprovementsComplete = useCallback(() => {
    setNotifications(prev => ({
      ...prev,
      statImprovements: { ...prev.statImprovements, isVisible: false }
    }));
  }, []);

  const handleLevelUpComplete = useCallback(() => {
    setNotifications(prev => ({
      ...prev,
      levelUp: { ...prev.levelUp, isVisible: false }
    }));
  }, []);

  const contextValue: NotificationContextType = {
    showXPGain,
    showStatImprovements,
    showLevelUp,
    clearAll
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Notification Components */}
      <AnimatePresence>
        {notifications.xpGain.isVisible && (
          <XPGainNotification
            xpGained={notifications.xpGain.amount}
            isVisible={notifications.xpGain.isVisible}
            showReason={notifications.xpGain.reason}
            onComplete={handleXPGainComplete}
            position="center"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notifications.statImprovements.isVisible && (
          <StatImprovementNotification
            improvements={notifications.statImprovements.improvements}
            isVisible={notifications.statImprovements.isVisible}
            onComplete={handleStatImprovementsComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notifications.levelUp.isVisible && (
          <LevelUpCelebration
            isVisible={notifications.levelUp.isVisible}
            newLevel={notifications.levelUp.newLevel}
            onComplete={handleLevelUpComplete}
          />
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}

// Hook for common notification patterns
export function useGameNotifications() {
  const notifications = useNotifications();

  const celebrateAnswer = useCallback((
    isCorrect: boolean,
    xpGained: number,
    statImprovements?: StatImprovement[]
  ) => {
    if (isCorrect && xpGained > 0) {
      notifications.showXPGain(xpGained, 'Correct Answer');
      
      if (statImprovements && statImprovements.length > 0) {
        // Delay stat improvements to show after XP gain
        setTimeout(() => {
          notifications.showStatImprovements(statImprovements);
        }, 1000);
      }
    }
  }, [notifications]);

  const celebrateLevelUp = useCallback((
    newLevel: number,
    xpGained: number,
    statImprovements: StatImprovement[]
  ) => {
    // Show XP gain first
    notifications.showXPGain(xpGained, 'Level Up!');
    
    // Then show level up celebration
    setTimeout(() => {
      notifications.showLevelUp(newLevel);
    }, 1500);
    
    // Finally show stat improvements
    setTimeout(() => {
      notifications.showStatImprovements(statImprovements);
    }, 6000); // After level up celebration
  }, [notifications]);

  const celebrateAchievement = useCallback((
    achievementName: string,
    xpBonus?: number
  ) => {
    if (xpBonus && xpBonus > 0) {
      notifications.showXPGain(xpBonus, `Achievement: ${achievementName}`);
    }
  }, [notifications]);

  return {
    ...notifications,
    celebrateAnswer,
    celebrateLevelUp,
    celebrateAchievement
  };
}