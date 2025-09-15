import { useState, useEffect, useCallback } from 'react';
import { abTestingService } from '../services/abTestingService';
import { analyticsService } from '../services/analyticsService';

interface ABTestHookResult<T = any> {
  variant: string | null;
  config: T;
  isLoading: boolean;
  trackConversion: (metricName: string, value?: number) => void;
}

export function useABTest<T = any>(
  experimentId: string,
  userId?: string,
  userProperties: Record<string, any> = {},
  defaultConfig: T = {} as T
): ABTestHookResult<T> {
  const [variant, setVariant] = useState<string | null>(null);
  const [config, setConfig] = useState<T>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      // Get variant assignment
      const assignedVariant = abTestingService.getVariant(experimentId, userId, userProperties);
      setVariant(assignedVariant);

      // Get variant configuration
      const variantConfig = abTestingService.getVariantConfig(experimentId, userId, userProperties);
      setConfig({ ...defaultConfig, ...variantConfig });

      // Track experiment exposure
      if (assignedVariant) {
        analyticsService.trackExperiment(experimentId, assignedVariant, {
          userProperties,
          timestamp: Date.now(),
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error(`Error in A/B test ${experimentId}:`, error);
      setConfig(defaultConfig);
      setIsLoading(false);
    }
  }, [experimentId, userId, userProperties, defaultConfig]);

  const trackConversion = useCallback((metricName: string, value?: number) => {
    if (userId && variant) {
      abTestingService.trackConversion(experimentId, userId, metricName, value);
      
      // Also track in analytics
      analyticsService.track('ab_test_conversion', {
        experimentId,
        variant,
        metricName,
        value,
        userId,
      });
    }
  }, [experimentId, userId, variant]);

  return {
    variant,
    config,
    isLoading,
    trackConversion,
  };
}

// Hook for feature flags
export function useFeatureFlag(
  featureName: string,
  userId?: string,
  userProperties: Record<string, any> = {}
): boolean {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const enabled = abTestingService.isFeatureEnabled(featureName, userId, userProperties);
      setIsEnabled(enabled);

      // Track feature flag exposure
      analyticsService.track('feature_flag_exposure', {
        featureName,
        enabled,
        userId,
        userProperties,
      });

      setIsLoading(false);
    } catch (error) {
      console.error(`Error checking feature flag ${featureName}:`, error);
      setIsEnabled(false);
      setIsLoading(false);
    }
  }, [featureName, userId, userProperties]);

  return isEnabled;
}

// Hook for multiple experiments
export function useMultipleABTests(
  experiments: Array<{
    id: string;
    defaultConfig?: any;
  }>,
  userId?: string,
  userProperties: Record<string, any> = {}
): Record<string, ABTestHookResult> {
  const [results, setResults] = useState<Record<string, ABTestHookResult>>({});

  useEffect(() => {
    if (!userId) {
      const emptyResults = experiments.reduce((acc, exp) => {
        acc[exp.id] = {
          variant: null,
          config: exp.defaultConfig || {},
          isLoading: false,
          trackConversion: () => {},
        };
        return acc;
      }, {} as Record<string, ABTestHookResult>);
      
      setResults(emptyResults);
      return;
    }

    const experimentResults: Record<string, ABTestHookResult> = {};

    experiments.forEach(experiment => {
      try {
        const variant = abTestingService.getVariant(experiment.id, userId, userProperties);
        const config = abTestingService.getVariantConfig(experiment.id, userId, userProperties);
        
        experimentResults[experiment.id] = {
          variant,
          config: { ...experiment.defaultConfig, ...config },
          isLoading: false,
          trackConversion: (metricName: string, value?: number) => {
            if (variant) {
              abTestingService.trackConversion(experiment.id, userId, metricName, value);
            }
          },
        };

        // Track exposure
        if (variant) {
          analyticsService.trackExperiment(experiment.id, variant, userProperties);
        }
      } catch (error) {
        console.error(`Error in A/B test ${experiment.id}:`, error);
        experimentResults[experiment.id] = {
          variant: null,
          config: experiment.defaultConfig || {},
          isLoading: false,
          trackConversion: () => {},
        };
      }
    });

    setResults(experimentResults);
  }, [experiments, userId, userProperties]);

  return results;
}

// Hook for experiment-specific components
export function useExperimentComponent<T extends React.ComponentType<any>>(
  experimentId: string,
  variants: Record<string, T>,
  defaultComponent: T,
  userId?: string,
  userProperties: Record<string, any> = {}
): T {
  const { variant } = useABTest(experimentId, userId, userProperties);
  
  if (variant && variants[variant]) {
    return variants[variant];
  }
  
  return defaultComponent;
}

// Hook for gradual rollouts
export function useGradualRollout(
  featureName: string,
  rolloutPercentage: number,
  userId?: string
): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (!userId) {
      setIsEnabled(false);
      return;
    }

    // Use consistent hashing to determine if user is in rollout
    const hash = hashString(userId + featureName);
    const userPercentile = (hash % 100) + 1;
    const enabled = userPercentile <= rolloutPercentage;
    
    setIsEnabled(enabled);

    // Track rollout exposure
    analyticsService.track('gradual_rollout_exposure', {
      featureName,
      rolloutPercentage,
      enabled,
      userPercentile,
      userId,
    });
  }, [featureName, rolloutPercentage, userId]);

  return isEnabled;
}

// Utility function for consistent hashing
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}