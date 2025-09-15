import React from 'react';

export interface ScreenReaderContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  announcePageChange: (pageName: string) => void;
  announceError: (error: string) => void;
  announceSuccess: (message: string) => void;
}

export const ScreenReaderContext = React.createContext<ScreenReaderContextType | null>(null);

export function useScreenReader() {
  const context = React.useContext(ScreenReaderContext);
  if (!context) {
    throw new Error('useScreenReader must be used within a ScreenReaderProvider');
  }
  return context;
}