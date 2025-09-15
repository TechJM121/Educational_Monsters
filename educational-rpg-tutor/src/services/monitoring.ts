/**
 * Production monitoring and logging service
 * Handles error tracking, performance monitoring, and user analytics
 */

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

interface LogEntry {
  level: keyof LogLevel;
  message: string;
  timestamp: string;
  userId?: string;
  characterId?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}

class MonitoringService {
  private isProduction = import.meta.env.PROD;
  private apiEndpoint = import.meta.env.VITE_MONITORING_ENDPOINT;
  private logBuffer: LogEntry[] = [];
  private metricsBuffer: PerformanceMetric[] = [];
  private flushInterval = 30000; // 30 seconds

  constructor() {
    if (this.isProduction) {
      this.initializeMonitoring();
      this.startPerformanceMonitoring();
      this.setupErrorHandlers();
    }
  }

  private initializeMonitoring(): void {
    // Flush logs and metrics periodically
    setInterval(() => {
      this.flushLogs();
      this.flushMetrics();
    }, this.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushLogs();
      this.flushMetrics();
    });
  }

  private setupErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError('Global Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });
  }

  private startPerformanceMonitoring(): void {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        this.recordMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
        this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
        this.recordMetric('first_contentful_paint', this.getFirstContentfulPaint());
        this.recordMetric('largest_contentful_paint', this.getLargestContentfulPaint());
      }, 0);
    });

    // Monitor Core Web Vitals
    this.observeWebVitals();
  }

  private getFirstContentfulPaint(): number {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  private getLargestContentfulPaint(): number {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }) as any;
  }

  private observeWebVitals(): void {
    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.recordMetric('cumulative_layout_shift', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('first_input_delay', (entry as any).processingStart - entry.startTime);
      }
    }).observe({ entryTypes: ['first-input'] });
  }

  // Public logging methods
  public logError(message: string, metadata?: Record<string, any>, error?: Error): void {
    const logEntry: LogEntry = {
      level: 'ERROR',
      message,
      timestamp: new Date().toISOString(),
      metadata,
      stack: error?.stack
    };

    this.addToBuffer(logEntry);
    
    // Also log to console in development
    if (!this.isProduction) {
      console.error(message, metadata, error);
    }
  }

  public logWarning(message: string, metadata?: Record<string, any>): void {
    const logEntry: LogEntry = {
      level: 'WARN',
      message,
      timestamp: new Date().toISOString(),
      metadata
    };

    this.addToBuffer(logEntry);
    
    if (!this.isProduction) {
      console.warn(message, metadata);
    }
  }

  public logInfo(message: string, metadata?: Record<string, any>): void {
    const logEntry: LogEntry = {
      level: 'INFO',
      message,
      timestamp: new Date().toISOString(),
      metadata
    };

    this.addToBuffer(logEntry);
    
    if (!this.isProduction) {
      console.info(message, metadata);
    }
  }

  public recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date().toISOString(),
      metadata
    };

    this.metricsBuffer.push(metric);
  }

  // User context methods
  public setUserContext(userId: string, characterId?: string): void {
    this.logBuffer.forEach(entry => {
      entry.userId = userId;
      entry.characterId = characterId;
    });
    
    this.metricsBuffer.forEach(metric => {
      metric.userId = userId;
    });
  }

  // Learning analytics
  public trackLearningEvent(eventName: string, data: Record<string, any>): void {
    this.logInfo(`Learning Event: ${eventName}`, {
      event: eventName,
      ...data,
      category: 'learning_analytics'
    });
  }

  public trackXPGained(amount: number, source: string, metadata?: Record<string, any>): void {
    this.recordMetric('xp_gained', amount, {
      source,
      ...metadata
    });
  }

  public trackQuestionResponse(questionId: string, isCorrect: boolean, responseTime: number): void {
    this.recordMetric('question_response_time', responseTime, {
      questionId,
      isCorrect,
      category: 'learning_performance'
    });
  }

  // Private methods
  private addToBuffer(logEntry: LogEntry): void {
    this.logBuffer.push(logEntry);
    
    // Prevent buffer overflow
    if (this.logBuffer.length > 1000) {
      this.logBuffer = this.logBuffer.slice(-500);
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0 || !this.apiEndpoint) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await fetch(`${this.apiEndpoint}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend })
      });
    } catch (error) {
      // Re-add logs to buffer if sending failed
      this.logBuffer.unshift(...logsToSend);
      console.error('Failed to send logs:', error);
    }
  }

  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0 || !this.apiEndpoint) return;

    const metricsToSend = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      await fetch(`${this.apiEndpoint}/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metrics: metricsToSend })
      });
    } catch (error) {
      // Re-add metrics to buffer if sending failed
      this.metricsBuffer.unshift(...metricsToSend);
      console.error('Failed to send metrics:', error);
    }
  }
}

// Export singleton instance
export const monitoring = new MonitoringService();

// React hook for easy component integration
export const useMonitoring = () => {
  return {
    logError: monitoring.logError.bind(monitoring),
    logWarning: monitoring.logWarning.bind(monitoring),
    logInfo: monitoring.logInfo.bind(monitoring),
    recordMetric: monitoring.recordMetric.bind(monitoring),
    trackLearningEvent: monitoring.trackLearningEvent.bind(monitoring),
    trackXPGained: monitoring.trackXPGained.bind(monitoring),
    trackQuestionResponse: monitoring.trackQuestionResponse.bind(monitoring),
    setUserContext: monitoring.setUserContext.bind(monitoring)
  };
};