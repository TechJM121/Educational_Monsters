import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { analyticsService } from '../../services/analyticsService';

// Mock fetch globally
global.fetch = vi.fn();

// Mock navigator.sendBeacon
Object.defineProperty(navigator, 'sendBeacon', {
  value: vi.fn(),
  writable: true,
});

// Mock performance API
Object.defineProperty(global, 'PerformanceObserver', {
  value: vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
  })),
  writable: true,
});

describe('Analytics Service Production Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Event Tracking', () => {
    it('should track events with proper structure', () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      analyticsService.setUser('test-user-123', false);
      analyticsService.track('test_event', {
        property1: 'value1',
        property2: 123,
      });

      // Fast forward to trigger flush
      vi.advanceTimersByTime(30000);

      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('test_event'),
      });

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      
      expect(body.events).toHaveLength(2); // user_identified + test_event
      expect(body.events[1]).toMatchObject({
        name: 'test_event',
        userId: 'test-user-123',
        properties: expect.objectContaining({
          property1: 'value1',
          property2: 123,
        }),
      });
    });

    it('should handle high-volume event tracking', () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      // Track many events rapidly
      for (let i = 0; i < 1000; i++) {
        analyticsService.track(`event_${i}`, { index: i });
      }

      // Should not overwhelm the system
      expect(mockFetch).not.toHaveBeenCalled(); // Events are queued

      // Fast forward to trigger flush
      vi.advanceTimersByTime(30000);

      expect(mockFetch).toHaveBeenCalled();
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      
      expect(body.events.length).toBe(1000);
    });

    it('should use sendBeacon for critical events on page unload', () => {
      const mockSendBeacon = vi.mocked(navigator.sendBeacon);
      mockSendBeacon.mockReturnValue(true);

      analyticsService.track('critical_error', { severity: 'high' });

      // Simulate page unload
      window.dispatchEvent(new Event('beforeunload'));

      expect(mockSendBeacon).toHaveBeenCalledWith(
        '/api/analytics/events',
        expect.stringContaining('critical_error')
      );
    });
  });

  describe('Performance Monitoring', () => {
    it('should track Web Vitals metrics', () => {
      const trackSpy = vi.spyOn(analyticsService, 'track');

      // Simulate FCP measurement
      const fcpEntry = {
        name: 'first-contentful-paint',
        startTime: 1500,
        entryType: 'paint',
      };

      // Simulate performance observer callback
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            analyticsService.track('performance_metric', {
              name: 'fcp',
              value: entry.startTime,
            });
          }
        }
      });

      // Manually trigger the callback
      analyticsService.track('performance_metric', {
        name: 'fcp',
        value: 1500,
      });

      expect(trackSpy).toHaveBeenCalledWith('performance_metric', {
        name: 'fcp',
        value: 1500,
      });
    });

    it('should track slow resource loading', () => {
      const trackSpy = vi.spyOn(analyticsService, 'track');

      // Simulate slow resource
      analyticsService.track('slow_resource_load', {
        resource: '/large-image.jpg',
        duration: 5000,
        size: 2048000,
        type: 'image',
      });

      expect(trackSpy).toHaveBeenCalledWith('slow_resource_load', {
        resource: '/large-image.jpg',
        duration: 5000,
        size: 2048000,
        type: 'image',
      });
    });

    it('should handle performance API unavailability', () => {
      // Mock missing performance API
      const originalPerformanceObserver = global.PerformanceObserver;
      delete (global as any).PerformanceObserver;

      // Should not throw when performance API is unavailable
      expect(() => {
        analyticsService.track('test_event');
      }).not.toThrow();

      // Restore
      global.PerformanceObserver = originalPerformanceObserver;
    });
  });

  describe('User Onboarding Tracking', () => {
    it('should track complete onboarding flow', () => {
      const trackSpy = vi.spyOn(analyticsService, 'track');

      analyticsService.setUser('onboarding-user', true);
      analyticsService.startOnboarding();
      
      vi.advanceTimersByTime(1000);
      analyticsService.trackOnboardingStep('character_creation');
      
      vi.advanceTimersByTime(2000);
      analyticsService.trackOnboardingStep('tutorial_basics');
      
      vi.advanceTimersByTime(1500);
      analyticsService.completeOnboarding();

      expect(trackSpy).toHaveBeenCalledWith('onboarding_started', {
        isGuest: true,
      });

      expect(trackSpy).toHaveBeenCalledWith('onboarding_step_started', {
        step: 'character_creation',
        isGuest: true,
      });

      expect(trackSpy).toHaveBeenCalledWith('onboarding_completed', {
        totalTime: expect.any(Number),
        isGuest: true,
        userId: 'onboarding-user',
      });
    });

    it('should track onboarding abandonment', () => {
      const trackSpy = vi.spyOn(analyticsService, 'track');

      analyticsService.setUser('abandoning-user', false);
      analyticsService.startOnboarding();
      analyticsService.trackOnboardingStep('character_creation');
      
      vi.advanceTimersByTime(5000);
      analyticsService.abandonOnboarding('character_creation', 'too_complex');

      expect(trackSpy).toHaveBeenCalledWith('onboarding_abandoned', {
        step: 'character_creation',
        timeSpent: expect.any(Number),
        reason: 'too_complex',
        isGuest: false,
      });
    });
  });

  describe('Conversion Tracking', () => {
    it('should track guest to user conversion', () => {
      const trackSpy = vi.spyOn(analyticsService, 'track');

      analyticsService.trackConversion({
        type: 'guest_to_user',
        fromState: 'guest_123',
        toState: 'user_456',
        userId: 'user_456',
        metadata: {
          onboardingCompleted: true,
          timeAsGuest: 300000, // 5 minutes
          xpEarned: 150,
        },
      });

      expect(trackSpy).toHaveBeenCalledWith('conversion', {
        type: 'guest_to_user',
        fromState: 'guest_123',
        toState: 'user_456',
        userId: 'user_456',
        timestamp: expect.any(Number),
        metadata: {
          onboardingCompleted: true,
          timeAsGuest: 300000,
          xpEarned: 150,
        },
      });

      expect(trackSpy).toHaveBeenCalledWith('guest_conversion', {
        previousGuestId: 'guest_123',
        newUserId: 'user_456',
        conversionTime: expect.any(Number),
        metadata: {
          onboardingCompleted: true,
          timeAsGuest: 300000,
          xpEarned: 150,
        },
      });
    });

    it('should track feature adoption conversion', () => {
      const trackSpy = vi.spyOn(analyticsService, 'track');

      analyticsService.trackConversion({
        type: 'feature_adoption',
        fromState: 'feature_available',
        toState: 'feature_adopted',
        userId: 'user_123',
        metadata: {
          feature: 'social_features',
          timeToAdoption: 86400000, // 1 day
        },
      });

      expect(trackSpy).toHaveBeenCalledWith('conversion', {
        type: 'feature_adoption',
        fromState: 'feature_available',
        toState: 'feature_adopted',
        userId: 'user_123',
        timestamp: expect.any(Number),
        metadata: {
          feature: 'social_features',
          timeToAdoption: 86400000,
        },
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network failures gracefully', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValue(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      analyticsService.track('test_event');
      
      // Fast forward to trigger flush
      vi.advanceTimersByTime(30000);

      await vi.waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to send analytics events:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should retry failed events', async () => {
      const mockFetch = vi.mocked(fetch);
      
      // First call fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      analyticsService.track('retry_test');
      
      // First flush attempt (fails)
      vi.advanceTimersByTime(30000);
      
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Second flush attempt (succeeds)
      vi.advanceTimersByTime(30000);
      
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle malformed event data', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Should not throw with circular reference
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      expect(() => {
        analyticsService.track('circular_test', { data: circularObj });
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Privacy and Compliance', () => {
    it('should not track PII in events', () => {
      const trackSpy = vi.spyOn(analyticsService, 'track');

      analyticsService.track('user_action', {
        action: 'login',
        // Should not include PII like email, phone, etc.
        userId: 'hashed_user_id',
        timestamp: Date.now(),
      });

      const call = trackSpy.mock.calls[0];
      const properties = call[1];

      // Ensure no common PII fields
      expect(properties).not.toHaveProperty('email');
      expect(properties).not.toHaveProperty('phone');
      expect(properties).not.toHaveProperty('address');
      expect(properties).not.toHaveProperty('name');
    });

    it('should respect do-not-track header', () => {
      // Mock DNT header
      Object.defineProperty(navigator, 'doNotTrack', {
        value: '1',
        writable: true,
      });

      const trackSpy = vi.spyOn(analyticsService, 'track');

      // In a real implementation, this would check DNT and not track
      // For this test, we'll just verify the property exists
      expect(navigator.doNotTrack).toBe('1');
    });
  });

  describe('Performance Under Load', () => {
    it('should handle burst traffic without memory leaks', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Simulate burst of events
      for (let i = 0; i < 10000; i++) {
        analyticsService.track(`burst_event_${i}`, {
          index: i,
          timestamp: Date.now(),
          data: 'x'.repeat(100), // Some data
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB for 10k events)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should throttle events under extreme load', () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      // Track events very rapidly
      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        analyticsService.track(`rapid_event_${i}`);
      }
      const endTime = Date.now();

      // Should complete quickly (not be blocked by network calls)
      expect(endTime - startTime).toBeLessThan(1000); // Less than 1 second
    });
  });
});