import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContextualSounds } from '../../hooks/useContextualSounds';

interface SoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  enableOpenSound?: boolean;
  enableCloseSound?: boolean;
  className?: string;
}

export const SoundModal: React.FC<SoundModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  enableOpenSound = true,
  enableCloseSound = true,
  className = ''
}) => {
  const { navigationSounds } = useContextualSounds();

  // Play sounds on open/close
  useEffect(() => {
    if (isOpen && enableOpenSound) {
      navigationSounds.modalOpen();
    }
  }, [isOpen, enableOpenSound, navigationSounds]);

  const handleClose = () => {
    if (enableCloseSound) {
      navigationSounds.modalClose();
    }
    // Small delay to let the sound play before closing
    setTimeout(() => {
      onClose();
    }, 50);
  };

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            className={`
              relative w-full ${sizeClasses[size]} 
              bg-white/10 backdrop-blur-md 
              border border-white/20 rounded-2xl 
              shadow-2xl overflow-hidden
              ${className}
            `}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {title && (
              <div className="px-6 py-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    {title}
                  </h2>
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* Content */}
            <div className="px-6 py-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};