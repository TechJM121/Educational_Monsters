import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { abTestingService } from '../../services/abTestingService';

// Mock fetch globally
global.fetch = vi.fn();

describe('A/B Testing Service Production Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock experiments data
    const mockExperiments = [
      {
        id: 'onboarding_flow_v2',
        name: 'Onboarding Flow V2',
        description: 'Test new onboarding flow',
        status: 'running',
        variants: [
          { id: 'control', name: 'Control', allocation: 50, config: { newFlow: false }, isControl: true },
          { id: 'treatment', name: 'Treatment', allocation: 50, config: { newFlow: true }, isControl: false },
        ],
        trafficAllocation: 100,
        startDate: new Date('2024-01-01'),
        targetingRules: [],
        metrics: [
          { name: 'completion_rate', type: 'conversion', goal: 'increase', primaryMetric: true },
        ],
      },
      {
        id: 'question_ui_redesign',
        name: 'Question UI Redesign',
        description: 'Test new question interface',
        status: 'running',
        variants: [
          { id: 'control', name: 'Control', allocation: 70, config: { newUI: false }, isControl: true },
          { id: 'treatment', name: 'Treatment', allocation: 30, config: { newUI: true }, isControl: false },
        ],
        trafficAllocation: 50, // Only 50% of users
        startDate: new Date('2024-01-01'),
        targetingRules: [
          { type: 'user_property', property: 'userLevel', operator: 'greater_than', value: 5 },
        ],
        metrics: [
          { name: 'answer_accuracy', type: 'numeric', goal: 'increase', primaryMetric: true },
        ],
      },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockExperiments),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Experiment Loading', () => {
    it('should load active experiments on initialization', async () => {
      await abTestingService.loadExperiments();

      expect(fetch).toHaveBeenCalledWith('/api/experiments/active');
      
      const activeExperiments = abTestingService.getAllActiveExperiments();
      expect(activeExperiments).toHaveLength(2);
      expect(activeExperiments[0].id).toBe('onboarding_flow_v2');
    });

    it('should handle experiment loading failures gracefully', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await abTestingService.loadExperiments();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to load experiments:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('User Assignment', () => {
    beforeEach(async () => {
      await abTestingService.loadExperiments();
    });

    it('should assign users consistently to variants', () => {
      const userId = 'test-user-123';
      
      // Multiple calls should return the same variant
      const variant1 = abTestingService.getVariant('onboarding_flow_v2', userId);
      const variant2 = abTestingService.getVariant('onboarding_flow_v2', userId);
      const variant3 = abTestingService.getVariant('onboarding_flow_v2', userId);

      expect(variant1).toBe(variant2);
      expect(variant2).toBe(variant3);
      expect(['control', 'treatment']).toContain(variant1);
    });

    it('should distribute users across variants according to allocation', () => {
      const assignments: Record<string, number> = { control: 0, treatment: 0 };
      const numUsers = 1000;

      // Test with many users to check distribution
      for (let i = 0; i < numUsers; i++) {
        const variant = abTestingService.getVariant('onboarding_flow_v2', `user-${i}`);
        if (variant) {
          assignments[variant]++;
        }
      }

      // Should be roughly 50/50 split (within 10% tolerance)
      const controlPercentage = (assignments.control / numUsers) * 100;
      const treatmentPercentage = (assignments.treatment / numUsers) * 100;

      expect(controlPercentage).toBeGreaterThan(40);
      expect(controlPercentage).toBeLessThan(60);
      expect(treatmentPercentage).toBeGreaterThan(40);
      expect(treatmentPercentage).toBeLessThan(60);
    });

    it('should respect traffic allocation limits', () => {
      const numUsers = 1000;
      let assignedUsers = 0;

      // Test experiment with 50% traffic allocation
      for (let i = 0; i < numUsers; i++) {
        const variant = abTestingService.getVariant('question_ui_redesign', `user-${i}`);
        if (variant) {
          assignedUsers++;
        }
      }

      // Should assign roughly 50% of users (within 10% tolerance)
      const assignmentRate = (assignedUsers / numUsers) * 100;
      expect(assignmentRate).toBeGreaterThan(40);
      expect(assignmentRate).toBeLessThan(60);
    });

    it('should handle targeting rules correctly', () => {
      const userWithHighLevel = { userLevel: 10 };
      const userWithLowLevel = { userLevel: 3 };

      const variantHighLevel = abTestingService.getVariant(
        'question_ui_redesign', 
        'high-level-user', 
        userWithHighLevel
      );
      
      const variantLowLevel = abTestingService.getVariant(
        'question_ui_redesign', 
        'low-level-user', 
        userWithLowLevel
      );

      // High level user should be eligible
      expect(['control', 'treatment']).toContain(variantHighLevel);
      
      // Low level user should not be eligible
      expect(variantLowLevel).toBeNull();
    });
  });

  describe('Variant Configuration', () => {
    beforeEach(async () => {
      await abTestingService.loadExperiments();
    });

    it('should return correct variant configuration', () => {
      const userId = 'config-test-user';
      const variant = abTestingService.getVariant('onboarding_flow_v2', userId);
      const config = abTestingService.getVariantConfig('onboarding_flow_v2', userId);

      if (variant === 'control') {
        expect(config).toEqual({ newFlow: false });
      } else if (variant === 'treatment') {
        expect(config).toEqual({ newFlow: true });
      }
    });

    it('should return empty config for non-existent experiments', () => {
      const config = abTestingService.getVariantConfig('non_existent_experiment', 'test-user');
      expect(config).toEqual({});
    });

    it('should handle feature flags correctly', () => {
      const userId = 'feature-flag-user';
      
      // Mock a feature flag experiment
      const isEnabled = abTestingService.isFeatureEnabled('onboarding_flow_v2', userId);
      
      // Should return boolean based on variant config
      expect(typeof isEnabled).toBe('boolean');
    });
  });

  describe('Conversion Tracking', () => {
    beforeEach(async () => {
      await abTestingService.loadExperiments();
    });

    it('should track conversions for assigned users', async () => {
      const userId = 'conversion-test-user';
      const variant = abTestingService.getVariant('onboarding_flow_v2', userId);

      expect(variant).not.toBeNull();

      // Mock successful conversion tracking
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      abTestingService.trackConversion('onboarding_flow_v2', userId, 'completion_rate', 1);

      expect(fetch).toHaveBeenCalledWith('/api/experiments/conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining(userId),
      });
    });

    it('should handle conversion tracking for unassigned users', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      abTestingService.trackConversion('onboarding_flow_v2', 'unassigned-user', 'completion_rate', 1);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No assignment found for user unassigned-user')
      );

      consoleSpy.mockRestore();
    });

    it('should handle conversion tracking failures gracefully', async () => {
      const userId = 'conversion-fail-user';
      abTestingService.getVariant('onboarding_flow_v2', userId); // Assign user

      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      abTestingService.trackConversion('onboarding_flow_v2', userId, 'completion_rate', 1);

      // Should not throw
      expect(consoleSpy).toHaveBeenCalledWith('Failed to track conversion:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed experiment data', async () => {
      const malformedExperiments = [
        {
          id: 'malformed_experiment',
          // Missing required fields
          variants: [],
        },
      ];

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(malformedExperiments),
      } as Response);

      await abTestingService.loadExperiments();

      // Should not crash when getting variant from malformed experiment
      const variant = abTestingService.getVariant('malformed_experiment', 'test-user');
      expect(variant).toBeNull();
    });

    it('should handle experiments with zero allocation', async () => {
      const zeroAllocationExperiment = [
        {
          id: 'zero_allocation',
          name: 'Zero Allocation Test',
          status: 'running',
          variants: [
            { id: 'control', allocation: 0, config: {}, isControl: true },
            { id: 'treatment', allocation: 0, config: {}, isControl: false },
          ],
          trafficAllocation: 100,
          startDate: new Date(),
          targetingRules: [],
          metrics: [],
        },
      ];

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(zeroAllocationExperiment),
      } as Response);

      await abTestingService.loadExperiments();

      const variant = abTestingService.getVariant('zero_allocation', 'test-user');
      expect(variant).toBeNull();
    });

    it('should handle concurrent assignment requests', async () => {
      await abTestingService.loadExperiments();

      const userId = 'concurrent-user';
      const promises = Array(100).fill(null).map(() => 
        abTestingService.getVariant('onboarding_flow_v2', userId)
      );

      const results = await Promise.all(promises);

      // All results should be the same (consistent assignment)
      const firstResult = results[0];
      expect(results.every(result => result === firstResult)).toBe(true);
    });

    it('should handle very long user IDs', () => {
      const longUserId = 'x'.repeat(10000);
      
      // Should not crash with very long user ID
      expect(() => {
        abTestingService.getVariant('onboarding_flow_v2', longUserId);
      }).not.toThrow();
    });

    it('should handle special characters in user IDs', async () => {
      await abTestingService.loadExperiments();

      const specialUserIds = [
        'user@example.com',
        'user-with-dashes',
        'user_with_underscores',
        'user with spaces',
        'user🎮emoji',
        'user<script>alert("xss")</script>',
      ];

      specialUserIds.forEach(userId => {
        expect(() => {
          const variant = abTestingService.getVariant('onboarding_flow_v2', userId);
          expect(['control', 'treatment', null]).toContain(variant);
        }).not.toThrow();
      });
    });
  });

  describe('Performance', () => {
    it('should handle high-frequency variant requests efficiently', async () => {
      await abTestingService.loadExperiments();

      const startTime = Date.now();
      
      // Make many variant requests
      for (let i = 0; i < 10000; i++) {
        abTestingService.getVariant('onboarding_flow_v2', `user-${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete quickly (less than 1 second for 10k requests)
      expect(duration).toBeLessThan(1000);
    });

    it('should cache experiment data efficiently', async () => {
      // Load experiments multiple times
      await abTestingService.loadExperiments();
      await abTestingService.loadExperiments();
      await abTestingService.loadExperiments();

      // Should only make one network request (others should be cached or ignored)
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle memory efficiently with many users', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Assign many users
      for (let i = 0; i < 100000; i++) {
        abTestingService.getVariant('onboarding_flow_v2', `user-${i}`);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 100MB for 100k users)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe('Statistical Validity', () => {
    beforeEach(async () => {
      await abTestingService.loadExperiments();
    });

    it('should maintain consistent hash distribution', () => {
      const buckets = Array(10).fill(0);
      const numUsers = 10000;

      for (let i = 0; i < numUsers; i++) {
        // Use internal hash function (would need to expose for testing)
        const hash = Math.abs(hashString(`user-${i}onboarding_flow_v2`));
        const bucket = Math.floor((hash % 1000) / 100);
        buckets[bucket]++;
      }

      // Each bucket should have roughly equal distribution (within 20% tolerance)
      const expectedPerBucket = numUsers / 10;
      buckets.forEach(count => {
        expect(count).toBeGreaterThan(expectedPerBucket * 0.8);
        expect(count).toBeLessThan(expectedPerBucket * 1.2);
      });
    });

    it('should avoid bias in variant assignment', () => {
      const assignments: Record<string, number> = { control: 0, treatment: 0 };
      
      // Test with sequential user IDs to check for bias
      for (let i = 0; i < 1000; i++) {
        const variant = abTestingService.getVariant('onboarding_flow_v2', i.toString());
        if (variant) {
          assignments[variant]++;
        }
      }

      // Should be roughly balanced
      const total = assignments.control + assignments.treatment;
      const controlRatio = assignments.control / total;
      
      expect(controlRatio).toBeGreaterThan(0.4);
      expect(controlRatio).toBeLessThan(0.6);
    });
  });
});

// Helper function for testing (would be internal to the service)
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}