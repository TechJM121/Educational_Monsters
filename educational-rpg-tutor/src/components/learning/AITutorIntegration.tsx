import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AITutorChat } from './AITutorChat';

interface AITutorIntegrationProps {
  currentSubject?: string;
  currentTopic?: string;
  userAge: number;
  onClose?: () => void;
}

export const AITutorIntegration: React.FC<AITutorIntegrationProps> = ({
  currentSubject,
  currentTopic,
  userAge,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const suggestedQuestions = [
    `Can you help me understand ${currentTopic || 'this topic'} better?`,
    `What's a fun way to remember ${currentTopic || 'this concept'}?`,
    `Can you give me more examples of ${currentTopic || 'this'}?`,
    `How is ${currentTopic || 'this topic'} used in real life?`
  ];

  return (
    <>
      {/* Floating AI Tutor Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        🤖
      </motion.button>

      {/* AI Tutor Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl h-[80vh] bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden"
            >
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        AI Tutor{currentSubject ? ` - ${currentSubject}` : ''}
                      </h3>
                      {currentTopic && (
                        <p className="text-sm text-slate-400">
                          Getting help with: {currentTopic}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Suggested Questions */}
                {currentTopic && (
                  <div className="p-4 bg-slate-800/50 border-b border-slate-700">
                    <p className="text-sm text-slate-300 mb-2">Quick questions about {currentTopic}:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedQuestions.slice(0, 2).map((question, index) => (
                        <button
                          key={index}
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full text-xs transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat Interface */}
                <div className="flex-1 overflow-hidden">
                  <AITutorChat
                    userAge={userAge}
                    subject={currentSubject}
                    onClose={handleClose}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};