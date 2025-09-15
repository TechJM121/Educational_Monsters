import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserFeedback } from '../../types/error';
import { useFormValidation, ValidatedInput, ValidatedTextarea } from './FormValidation';
import { useToast } from './ToastSystem';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../hooks/useAuth';

interface FeedbackFormData {
  type: UserFeedback['type'];
  category: string;
  title: string;
  description: string;
  rating?: number;
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: UserFeedback['type'];
  initialCategory?: string;
}

export function FeedbackModal({ 
  isOpen, 
  onClose, 
  initialType = 'general',
  initialCategory = 'general'
}: FeedbackModalProps) {
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: initialType,
    category: initialCategory,
    title: '',
    description: '',
    rating: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const validation = useFormValidation({
    rules: {
      title: {
        required: true,
        minLength: 5,
        maxLength: 100
      },
      description: {
        required: true,
        minLength: 10,
        maxLength: 1000
      },
      category: {
        required: true
      }
    },
    onValidationChange: (isValid) => {
      // Could update submit button state here
    }
  });

  const feedbackTypes = [
    { value: 'bug', label: 'Bug Report', icon: '🐛' },
    { value: 'feature', label: 'Feature Request', icon: '💡' },
    { value: 'improvement', label: 'Improvement', icon: '⚡' },
    { value: 'general', label: 'General Feedback', icon: '💬' }
  ];

  const categories = [
    'Character System',
    'Learning Activities',
    'User Interface',
    'Performance',
    'Social Features',
    'Quests & Achievements',
    'Mobile Experience',
    'Accessibility',
    'General'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validation.validateForm(formData);
    if (errors.length > 0) {
      showError('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const feedback: Omit<UserFeedback, 'id' | 'status'> = {
        userId: user?.id || 'anonymous',
        type: formData.type,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        rating: formData.rating,
        metadata: {
          page: window.location.pathname,
          userAgent: navigator.userAgent,
          timestamp: new Date(),
          sessionDuration: performance.now()
        }
      };

      const { error } = await supabase
        .from('user_feedback')
        .insert(feedback);

      if (error) throw error;

      showSuccess(
        'Feedback Submitted!',
        'Thank you for your feedback. We\'ll review it soon.'
      );

      // Reset form
      setFormData({
        type: 'general',
        category: 'general',
        title: '',
        description: '',
        rating: undefined
      });
      validation.clearAllErrors();
      onClose();

    } catch (error) {
      console.error('Failed to submit feedback:', error);
      showError(
        'Submission Failed',
        'Unable to submit feedback. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof FeedbackFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-800 border border-slate-600 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-600">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📝</span>
              <h2 className="text-xl font-rpg text-white">Share Your Feedback</h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close feedback form"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="space-y-6">
              {/* Feedback Type */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  What type of feedback is this?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {feedbackTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => updateFormData('type', type.value)}
                      className={`
                        p-3 rounded-lg border transition-colors text-left
                        ${formData.type === type.value
                          ? 'border-primary-500 bg-primary-500/20 text-white'
                          : 'border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{type.icon}</span>
                        <span className="font-medium">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-200 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => updateFormData('category', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <ValidatedInput
                label="Title"
                field="title"
                value={formData.title}
                onChange={(value) => updateFormData('title', value)}
                validation={validation}
                placeholder="Brief summary of your feedback"
                helpText="A short, descriptive title for your feedback"
              />

              {/* Description */}
              <ValidatedTextarea
                label="Description"
                field="description"
                value={formData.description}
                onChange={(value) => updateFormData('description', value)}
                validation={validation}
                placeholder="Please provide detailed information about your feedback..."
                rows={5}
                helpText="The more details you provide, the better we can help"
              />

              {/* Rating (optional) */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Overall Experience Rating (Optional)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => updateFormData('rating', rating)}
                      className={`
                        w-10 h-10 rounded-full transition-colors
                        ${formData.rating === rating
                          ? 'bg-yellow-500 text-white'
                          : 'bg-slate-600 text-slate-400 hover:bg-slate-500'
                        }
                      `}
                      aria-label={`Rate ${rating} stars`}
                    >
                      ⭐
                    </button>
                  ))}
                  {formData.rating && (
                    <button
                      type="button"
                      onClick={() => updateFormData('rating', undefined)}
                      className="ml-2 text-slate-400 hover:text-white text-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-slate-600">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !validation.isValid}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface FeedbackButtonProps {
  type?: UserFeedback['type'];
  category?: string;
  className?: string;
  children?: React.ReactNode;
}

export function FeedbackButton({ 
  type = 'general', 
  category = 'general',
  className = '',
  children
}: FeedbackButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 
          text-white rounded-lg transition-colors
          ${className}
        `}
      >
        <span>💬</span>
        <span>{children || 'Give Feedback'}</span>
      </button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType={type}
        initialCategory={category}
      />
    </>
  );
}

// Quick feedback buttons for common scenarios
export function QuickFeedbackButtons({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <FeedbackButton type="bug" category="General">
        Report Bug
      </FeedbackButton>
      <FeedbackButton type="feature" category="General">
        Request Feature
      </FeedbackButton>
      <FeedbackButton type="improvement" category="User Interface">
        Suggest Improvement
      </FeedbackButton>
    </div>
  );
}

// Floating feedback button
export function FloatingFeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg z-40 flex items-center justify-center"
        aria-label="Give feedback"
      >
        <span className="text-xl">💬</span>
      </motion.button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}