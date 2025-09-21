import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import ContextualLoader from './ContextualLoader';
import type { LoadingType } from '../../contexts/LoadingContext';

export interface LoadingOverlayProps {
  isVisible: boolean;
  type?: LoadingType;
  message?: string;
  progress?: number;
  backdrop?: boolean;
  blur?: boolean;
  position?: 'center' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onCancel?: () => void;
  cancelable?: boolean;
  portal?: boolean;
  zIndex?: number;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  type = 'custom',
  message,
  progress,
  backdrop = true,
  blur = true,
  position = 'center',
  size = 'md',
  className = '',
  onCancel,
  cancelable = false,
  portal = true,
  zIndex = 50
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'justify-center items-start pt-20';
      case 'bottom':
        return 'justify-center items-end pb-20';
      case 'center':
      default:
        return 'justify-center items-center';
    }
  };

  const overlayContent = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed inset-0 flex ${getPositionClasses()} ${className}`}
          style={{ zIndex }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          {backdrop && (
            <motion.div
              className={`absolute inset-0 bg-black/50 ${blur ? 'backdrop-blur-sm' : ''}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelable ? onCancel : undefined}
            />
          )}
          
          {/* Loading Content */}
          <motion.div
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 mx-4 max-w-sm w-full"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex flex-col items-center space-y-4">
              <ContextualLoader
                type={type}
                message={message}
                progress={progress}
                size={size}
                variant="detailed"
                showMessage={true}
                showProgress={progress !== undefined}
              />
              
              {cancelable && onCancel && (
                <motion.button
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  onClick={onCancel}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  Cancel
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (portal && typeof document !== 'undefined') {
    return createPortal(overlayContent, document.body);
  }

  return overlayContent;
};

export default LoadingOverlay;