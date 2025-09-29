import { useState } from 'react';

interface ComingSoonConfig {
  title: string;
  description: string;
  icon?: string;
  expectedDate?: string;
}

export const useComingSoon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ComingSoonConfig>({
    title: 'Coming Soon',
    description: 'This feature is currently in development.'
  });

  const showComingSoon = (newConfig: ComingSoonConfig) => {
    setConfig(newConfig);
    setIsOpen(true);
  };

  const hideComingSoon = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    config,
    showComingSoon,
    hideComingSoon
  };
};