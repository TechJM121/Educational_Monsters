import { useEffect, useState, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';

interface OnboardingStep {
  id: string;
  name: string;
  required: boolean;
  completed: boolean;
  startTime?: number;
  completionTime?: number;
  attempts: number;
  errors: string[];
}

interface OnboardingMetrics {
  totalSteps: number;
  completedSteps: number;
  currentStep: string | null;
  progress: number;
  totalTime: number;
  averageTimePerStep: number;
  abandonmentRate: number;
  conversionRate: number;
}

const ONBOARDING_STEPS = [
  { id: 'welcome', name: 'Welcome Screen', required: true },
  { id: 'age_verification', name: 'Age Verification', required: true },
  { id: 'character_creation', name: 'Character Creation', required: true },
  { id: 'tutorial_basics', name: 'Basic Tutorial', required: true },
  { id: 'first_question', name: 'First Question', required: true },
  { id: 'stats_explanation', name: 'Stats Explanation', required: false },
  { id: 'social_features', name: 'Social Features', required: false },
  { id: 'parent_notification', name: 'Parent Notification', required: false },
];

export function useOnboardingTracking(userId?: string, isGuest: boolean = false) {
  const [steps, setSteps] = useState<OnboardingStep[]>(
    ONBOARDING_STEPS.map(step => ({
      ...step,
      completed: false,
      attempts: 0,
      errors: [],
    }))
  );
  
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [onboardingStartTime, setOnboardingStartTime] = useState<number | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // Initialize onboarding tracking
  useEffect(() => {
    if (userId && !onboardingStartTime) {
      const startTime = Date.now();
      setOnboardingStartTime(startTime);
      analyticsService.setUser(userId, isGuest);
      analyticsService.startOnboarding();
    }
  }, [userId, isGuest, onboardingStartTime]);

  // Start a specific onboarding step
  const startStep = useCallback((stepId: string) => {
    setCurrentStepId(stepId);
    
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, startTime: Date.now(), attempts: step.attempts + 1 }
        : step
    ));

    analyticsService.trackOnboardingStep(stepId);
    
    // Track step-specific metrics
    analyticsService.track('onboarding_step_started', {
      stepId,
      stepName: ONBOARDING_STEPS.find(s => s.id === stepId)?.name,
      isGuest,
      userId,
      attempt: steps.find(s => s.id === stepId)?.attempts || 1,
    });
  }, [steps, isGuest, userId]);

  // Complete a specific onboarding step
  const completeStep = useCallback((stepId: string, metadata?: Record<string, any>) => {
    const now = Date.now();
    
    setSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        const timeSpent = step.startTime ? now - step.startTime : 0;
        
        // Track step completion
        analyticsService.track('onboarding_step_completed', {
          stepId,
          stepName: step.name,
          timeSpent,
          attempts: step.attempts,
          isGuest,
          userId,
          metadata,
        });

        return {
          ...step,
          completed: true,
          completionTime: now,
        };
      }
      return step;
    }));

    // Check if onboarding is complete
    const updatedSteps = steps.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    );
    
    const requiredSteps = updatedSteps.filter(step => step.required);
    const completedRequiredSteps = requiredSteps.filter(step => step.completed);
    
    if (completedRequiredSteps.length === requiredSteps.length && !isOnboardingComplete) {
      setIsOnboardingComplete(true);
      analyticsService.completeOnboarding();
      
      // Track conversion if guest becomes user
      if (isGuest && userId) {
        analyticsService.trackConversion({
          type: 'guest_to_user',
          fromState: 'guest',
          toState: userId,
          userId,
          metadata: {
            onboardingTime: onboardingStartTime ? now - onboardingStartTime : 0,
            stepsCompleted: updatedSteps.filter(s => s.completed).length,
            totalSteps: updatedSteps.length,
          },
        });
      }
    }
  }, [steps, isGuest, userId, isOnboardingComplete, onboardingStartTime]);

  // Track step error
  const trackStepError = useCallback((stepId: string, error: string, metadata?: Record<string, any>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, errors: [...step.errors, error] }
        : step
    ));

    analyticsService.track('onboarding_step_error', {
      stepId,
      error,
      attempts: steps.find(s => s.id === stepId)?.attempts || 0,
      isGuest,
      userId,
      metadata,
    });
  }, [steps, isGuest, userId]);

  // Abandon onboarding
  const abandonOnboarding = useCallback((reason?: string, metadata?: Record<string, any>) => {
    const currentStep = currentStepId || 'unknown';
    
    analyticsService.abandonOnboarding(currentStep, reason);
    
    analyticsService.track('onboarding_abandoned', {
      currentStep,
      reason,
      completedSteps: steps.filter(s => s.completed).length,
      totalSteps: steps.length,
      timeSpent: onboardingStartTime ? Date.now() - onboardingStartTime : 0,
      isGuest,
      userId,
      metadata,
    });
  }, [currentStepId, steps, onboardingStartTime, isGuest, userId]);

  // Skip optional step
  const skipStep = useCallback((stepId: string, reason?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, completed: true, completionTime: Date.now() }
        : step
    ));

    analyticsService.track('onboarding_step_skipped', {
      stepId,
      reason,
      isGuest,
      userId,
    });
  }, [isGuest, userId]);

  // Calculate metrics
  const metrics: OnboardingMetrics = {
    totalSteps: steps.length,
    completedSteps: steps.filter(s => s.completed).length,
    currentStep: currentStepId,
    progress: (steps.filter(s => s.completed).length / steps.length) * 100,
    totalTime: onboardingStartTime ? Date.now() - onboardingStartTime : 0,
    averageTimePerStep: steps.filter(s => s.completionTime && s.startTime)
      .reduce((acc, step) => acc + (step.completionTime! - step.startTime!), 0) / 
      Math.max(1, steps.filter(s => s.completed).length),
    abandonmentRate: 0, // Would be calculated from historical data
    conversionRate: 0, // Would be calculated from historical data
  };

  // Track funnel metrics
  useEffect(() => {
    const completedSteps = steps.filter(s => s.completed).length;
    const totalSteps = steps.length;
    
    if (completedSteps > 0) {
      analyticsService.track('onboarding_funnel_progress', {
        completedSteps,
        totalSteps,
        progress: (completedSteps / totalSteps) * 100,
        currentStep: currentStepId,
        isGuest,
        userId,
      });
    }
  }, [steps, currentStepId, isGuest, userId]);

  return {
    steps,
    currentStepId,
    metrics,
    isOnboardingComplete,
    startStep,
    completeStep,
    trackStepError,
    abandonOnboarding,
    skipStep,
  };
}

// Hook for conversion tracking
export function useConversionTracking() {
  const trackGuestToUserConversion = useCallback((
    guestId: string,
    newUserId: string,
    conversionData: {
      onboardingCompleted: boolean;
      timeAsGuest: number;
      actionsPerformed: number;
      xpEarned: number;
      levelsGained: number;
    }
  ) => {
    analyticsService.trackConversion({
      type: 'guest_to_user',
      fromState: guestId,
      toState: newUserId,
      userId: newUserId,
      metadata: conversionData,
    });

    // Track detailed conversion metrics
    analyticsService.track('guest_conversion_detailed', {
      guestId,
      newUserId,
      ...conversionData,
      conversionRate: conversionData.onboardingCompleted ? 1 : 0,
    });
  }, []);

  const trackFeatureAdoption = useCallback((
    userId: string,
    feature: string,
    adoptionData: {
      timeToAdoption: number;
      triggeredBy: string;
      userLevel: number;
      sessionCount: number;
    }
  ) => {
    analyticsService.trackConversion({
      type: 'feature_adoption',
      fromState: 'feature_available',
      toState: 'feature_adopted',
      userId,
      metadata: { feature, ...adoptionData },
    });
  }, []);

  const trackTrialToPremium = useCallback((
    userId: string,
    conversionData: {
      trialDuration: number;
      featuresUsed: string[];
      engagementScore: number;
      lastActiveDate: number;
    }
  ) => {
    analyticsService.trackConversion({
      type: 'trial_to_premium',
      fromState: 'trial_user',
      toState: 'premium_user',
      userId,
      metadata: conversionData,
    });
  }, []);

  return {
    trackGuestToUserConversion,
    trackFeatureAdoption,
    trackTrialToPremium,
  };
}