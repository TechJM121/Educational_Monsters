// Analytics Service for Educational RPG Tutor
// Handles performance monitoring, user analytics, and conversion tracking

interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

interface UserOnboardingStep {
  step: string;
  completed: boolean;
  timestamp: number;
  timeSpent: number;
  userId?: string;
  isGuest: boolean;
}

interface ConversionEvent {
  type: 'guest_to_user' | 'trial_to_premium' | 'feature_adoption';
  fromState: string;
  toState: string;
  timestamp: number;
  userId: string;
  metadata: Record<string, any>;
}

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private isGuest: boolean = false;
  private eventQueue: AnalyticsEvent[] = [];
  private performanceObserver?: PerformanceObserver;
  private onboardingStartTime?: number;
  private currentOnboardingStep?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializePerformanceMonitoring();
    this.setupUnloadHandler();
  }

  // Session management
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUser(userId: string, isGuest: boolean = false): void {
    this.userId = userId;
    this.isGuest = isGuest;
    
    this.track('user_identified', {
      userId,
      isGuest,
      sessionId: this.sessionId,
    });
  }

  // Core tracking methods
  track(eventName: string, properties: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.eventQueue.push(event);
    
    // Send immediately for critical events
    const criticalEvents = ['error', 'conversion', 'payment'];
    if (criticalEvents.some(critical => eventName.includes(critical))) {
      this.flush();
    }
  }

  // Performance monitoring
  private initializePerformanceMonitoring(): void {
    // Web Vitals monitoring
    this.trackWebVitals();
    
    // Custom performance metrics
    this.trackCustomMetrics();
    
    // Resource loading monitoring
    this.trackResourceLoading();
  }

  private trackWebVitals(): void {
    // First Contentful Paint (FCP)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.trackPerformanceMetric('fcp', entry.startTime);
        }
      }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.trackPerformanceMetric('lcp', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.trackPerformanceMetric('fid', (entry as any).processingStart - entry.startTime);
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.trackPerformanceMetric('cls', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private trackCustomMetrics(): void {
    // Character loading time
    window.addEventListener('character-loaded', ((event: CustomEvent) => {
      this.trackPerformanceMetric('character_load_time', event.detail.loadTime);
    }) as EventListener);

    // Question rendering time
    window.addEventListener('question-rendered', ((event: CustomEvent) => {
      this.trackPerformanceMetric('question_render_time', event.detail.renderTime);
    }) as EventListener);

    // XP animation duration
    window.addEventListener('xp-animation-complete', ((event: CustomEvent) => {
      this.trackPerformanceMetric('xp_animation_duration', event.detail.duration);
    }) as EventListener);
  }

  private trackResourceLoading(): void {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        
        // Track slow loading resources
        if (resource.duration > 1000) {
          this.track('slow_resource_load', {
            resource: resource.name,
            duration: resource.duration,
            size: resource.transferSize,
            type: this.getResourceType(resource.name),
          });
        }
      }
    }).observe({ entryTypes: ['resource'] });
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.includes('supabase')) return 'api';
    return 'other';
  }

  private trackPerformanceMetric(name: string, value: number): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.track('performance_metric', metric);
  }

  // User onboarding tracking
  startOnboarding(): void {
    this.onboardingStartTime = Date.now();
    this.track('onboarding_started', {
      isGuest: this.isGuest,
    });
  }

  trackOnboardingStep(step: string): void {
    const now = Date.now();
    const timeSpent = this.onboardingStartTime ? now - this.onboardingStartTime : 0;

    if (this.currentOnboardingStep) {
      this.track('onboarding_step_completed', {
        step: this.currentOnboardingStep,
        timeSpent,
        isGuest: this.isGuest,
      });
    }

    this.currentOnboardingStep = step;
    this.track('onboarding_step_started', {
      step,
      isGuest: this.isGuest,
    });
  }

  completeOnboarding(): void {
    const totalTime = this.onboardingStartTime ? Date.now() - this.onboardingStartTime : 0;
    
    this.track('onboarding_completed', {
      totalTime,
      isGuest: this.isGuest,
      userId: this.userId,
    });

    this.onboardingStartTime = undefined;
    this.currentOnboardingStep = undefined;
  }

  abandonOnboarding(step: string, reason?: string): void {
    const timeSpent = this.onboardingStartTime ? Date.now() - this.onboardingStartTime : 0;
    
    this.track('onboarding_abandoned', {
      step,
      timeSpent,
      reason,
      isGuest: this.isGuest,
    });
  }

  // Conversion tracking
  trackConversion(event: Omit<ConversionEvent, 'timestamp'>): void {
    const conversionEvent: ConversionEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.track('conversion', conversionEvent);

    // Special handling for guest to user conversion
    if (event.type === 'guest_to_user') {
      this.track('guest_conversion', {
        previousGuestId: event.fromState,
        newUserId: event.toState,
        conversionTime: Date.now(),
        metadata: event.metadata,
      });
    }
  }

  // Learning analytics
  trackLearningSession(data: {
    subjectId: string;
    questionsAnswered: number;
    correctAnswers: number;
    xpEarned: number;
    timeSpent: number;
    difficultyLevel: number;
  }): void {
    this.track('learning_session_completed', {
      ...data,
      accuracy: data.correctAnswers / data.questionsAnswered,
      xpPerMinute: data.xpEarned / (data.timeSpent / 60000),
      isGuest: this.isGuest,
    });
  }

  trackCharacterProgression(data: {
    characterId: string;
    levelBefore: number;
    levelAfter: number;
    xpGained: number;
    statsChanged: Record<string, number>;
  }): void {
    this.track('character_progression', {
      ...data,
      leveledUp: data.levelAfter > data.levelBefore,
      isGuest: this.isGuest,
    });
  }

  trackFeatureUsage(feature: string, action: string, metadata?: Record<string, any>): void {
    this.track('feature_usage', {
      feature,
      action,
      metadata,
      isGuest: this.isGuest,
    });
  }

  // Error tracking
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      url: window.location.href,
      userId: this.userId,
      isGuest: this.isGuest,
    });
  }

  // A/B testing support
  trackExperiment(experimentName: string, variant: string, metadata?: Record<string, any>): void {
    this.track('experiment_exposure', {
      experiment: experimentName,
      variant,
      metadata,
      isGuest: this.isGuest,
    });
  }

  // Data flushing
  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Send to analytics endpoint
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });

      console.log(`Sent ${events.length} analytics events`);
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...events);
    }
  }

  private setupUnloadHandler(): void {
    // Flush events before page unload
    window.addEventListener('beforeunload', () => {
      if (this.eventQueue.length > 0) {
        // Use sendBeacon for reliable delivery
        const events = [...this.eventQueue];
        navigator.sendBeacon('/api/analytics/events', JSON.stringify({ events }));
      }
    });

    // Flush events periodically
    setInterval(() => {
      this.flush();
    }, 30000); // Every 30 seconds
  }

  // Public methods for manual flushing
  flushEvents(): Promise<void> {
    return this.flush();
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getUserId(): string | undefined {
    return this.userId;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Global error handler
window.addEventListener('error', (event) => {
  analyticsService.trackError(new Error(event.message), {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  analyticsService.trackError(new Error(event.reason), {
    type: 'unhandled_promise_rejection',
  });
});

export default analyticsService;