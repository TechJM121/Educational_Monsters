import React from 'react';
import { AccessibleButton } from './AccessibleButton';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

// Legacy wrapper for backward compatibility
export function AnimatedButton(props: AnimatedButtonProps) {
  return <AccessibleButton {...props} />;
}