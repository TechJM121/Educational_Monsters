export interface AnimationErrorReport {
  id: string;
  timestamp: number;
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  context: {
    component: string;
    props?: Record<string, any>;
    state?: Record<string, any>;
    userAgent: string;
    url: string;
    viewport: {
      width: number;
      height: number;
      pixelRatio: number;
    };
  };
  performance: {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
    timing: {
      navigationStart: number;
      loadEventEnd: number;
      domContentLoadedEventEnd: number;
    };
    fps?: number;
  };
  recovery: {
    attempts: number;
    successful: boolean;
    fallbackMode: boolean;
    recoveryTime?: number;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorReportingConfig {
  endpoint?: string;
  apiKey?: string;
  enableConsoleLogging: boolean;
  enableLocalStorage: boolean;
  maxStoredReports: number;
  batchSize: number;
  flushInterval: number; // ms
  enablePerformanceData: boolean;
  enableUserContext: boolean;
}

const DEFAULT_CONFIG: ErrorReportingConfig = {
  enableConsoleLogging: true,
  enableLocalStorage: true,
  maxStoredReports: 50,
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
  enablePerformanceData: true,
  enableUserContext: true
};

export class AnimationErrorReporter {
  private config: ErrorReportingConfig;
  private reportQueue: AnimationErrorReport[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private reportIdCounter = 0;

  constructor(config: Partial<ErrorReportingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startFlushTimer();
    this.loadStoredReports();
  }

  async reportError(
    error: Error,
    component: string,
    context: Partial<AnimationErrorReport['context']> = {},
    recovery: Partial<AnimationErrorReport['recovery']> = {}
  ): Promise<string> {
    const reportId = this.generateReportId();
    
    const report: AnimationErrorReport = {
      id: reportId,
      timestamp: Date.now(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context: {
        component,
        userAgent: navigator.userAgent,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          pixelRatio: window.devicePixelRatio || 1
        },
        ...context
      },
      performance: await this.collectPerformanceData(),
      recovery: {
        attempts: 0,
        successful: false,
        fallbackMode: false,
        ...recovery
      },
      severity: this.determineSeverity(error, recovery)
    };

    // Add to queue
    this.reportQueue.push(report);

    // Log to console if enabled
    if (this.config.enableConsoleLogging) {
      this.logToConsole(report);
    }

    // Store locally if enabled
    if (this.config.enableLocalStorage) {
      this.storeLocally(report);
    }

    // Flush immediately for critical errors
    if (report.severity === 'critical') {
      await this.flush();
    }

    return reportId;
  }

  updateRecoveryStatus(
    reportId: string,
    recovery: Partial<AnimationErrorReport['recovery']>
  ): void {
    // Update in queue
    const queueIndex = this.reportQueue.findIndex(report => report.id === reportId);
    if (queueIndex !== -1) {
      this.reportQueue[queueIndex].recovery = {
        ...this.reportQueue[queueIndex].recovery,
        ...recovery
      };
    }

    // Update in local storage
    if (this.config.enableLocalStorage) {
      const stored = this.getStoredReports();
      const storedIndex = stored.findIndex(report => report.id === reportId);
      if (storedIndex !== -1) {
        stored[storedIndex].recovery = {
          ...stored[storedIndex].recovery,
          ...recovery
        };
        this.saveStoredReports(stored);
      }
    }
  }

  private generateReportId(): string {
    return `anim_error_${++this.reportIdCounter}_${Date.now()}`;
  }

  private async collectPerformanceData(): Promise<AnimationErrorReport['performance']> {
    const performance: AnimationErrorReport['performance'] = {
      timing: {
        navigationStart: window.performance.timing.navigationStart,
        loadEventEnd: window.performance.timing.loadEventEnd,
        domContentLoadedEventEnd: window.performance.timing.domContentLoadedEventEnd
      }
    };

    if (this.config.enablePerformanceData) {
      // Memory information
      if ('memory' in window.performance) {
        const memory = (window.performance as any).memory;
        performance.memory = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        };
      }

      // FPS estimation (simplified)
      performance.fps = await this.estimateFPS();
    }

    return performance;
  }

  private async estimateFPS(): Promise<number> {
    return new Promise((resolve) => {
      let frames = 0;
      const startTime = performance.now();
      
      const countFrames = () => {
        frames++;
        const elapsed = performance.now() - startTime;
        
        if (elapsed < 1000) {
          requestAnimationFrame(countFrames);
        } else {
          const fps = Math.round((frames * 1000) / elapsed);
          resolve(fps);
        }
      };
      
      requestAnimationFrame(countFrames);
    });
  }

  private determineSeverity(
    error: Error,
    recovery: Partial<AnimationErrorReport['recovery']>
  ): AnimationErrorReport['severity'] {
    // Critical: Multiple failed recovery attempts
    if (recovery.attempts && recovery.attempts >= 3 && !recovery.successful) {
      return 'critical';
    }

    // High: Animation system errors
    const highSeverityKeywords = [
      'webgl',
      'canvas',
      'requestAnimationFrame',
      'three.js',
      'framer-motion'
    ];
    
    if (highSeverityKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword) ||
      (error.stack && error.stack.toLowerCase().includes(keyword))
    )) {
      return 'high';
    }

    // Medium: Component-level animation errors
    const mediumSeverityKeywords = [
      'animation',
      'transition',
      'transform',
      'opacity'
    ];
    
    if (mediumSeverityKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword)
    )) {
      return 'medium';
    }

    return 'low';
  }

  private logToConsole(report: AnimationErrorReport): void {
    const severityColors = {
      low: '#3B82F6',      // blue
      medium: '#F59E0B',   // yellow
      high: '#EF4444',     // red
      critical: '#DC2626'  // dark red
    };

    console.group(
      `%c🎬 Animation Error Report [${report.severity.toUpperCase()}]`,
      `color: ${severityColors[report.severity]}; font-weight: bold;`
    );
    
    console.log('Report ID:', report.id);
    console.log('Component:', report.context.component);
    console.log('Error:', report.error);
    console.log('Context:', report.context);
    console.log('Performance:', report.performance);
    console.log('Recovery:', report.recovery);
    
    console.groupEnd();
  }

  private storeLocally(report: AnimationErrorReport): void {
    try {
      const stored = this.getStoredReports();
      stored.push(report);
      
      // Keep only the most recent reports
      if (stored.length > this.config.maxStoredReports) {
        stored.splice(0, stored.length - this.config.maxStoredReports);
      }
      
      this.saveStoredReports(stored);
    } catch (error) {
      console.error('Failed to store error report locally:', error);
    }
  }

  private getStoredReports(): AnimationErrorReport[] {
    try {
      const stored = localStorage.getItem('animation_error_reports');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveStoredReports(reports: AnimationErrorReport[]): void {
    try {
      localStorage.setItem('animation_error_reports', JSON.stringify(reports));
    } catch (error) {
      console.error('Failed to save error reports to localStorage:', error);
    }
  }

  private loadStoredReports(): void {
    if (this.config.enableLocalStorage) {
      const stored = this.getStoredReports();
      // Add stored reports to queue for potential re-sending
      this.reportQueue.push(...stored.filter(report => !report.recovery.successful));
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private async flush(): Promise<void> {
    if (this.reportQueue.length === 0) return;

    const batch = this.reportQueue.splice(0, this.config.batchSize);
    
    try {
      await this.sendBatch(batch);
      console.log(`Sent ${batch.length} error reports`);
    } catch (error) {
      console.error('Failed to send error reports:', error);
      // Re-add to queue for retry
      this.reportQueue.unshift(...batch);
    }
  }

  private async sendBatch(reports: AnimationErrorReport[]): Promise<void> {
    if (!this.config.endpoint) {
      // No endpoint configured, just log
      console.log('Error reports batch (no endpoint configured):', reports);
      return;
    }

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      },
      body: JSON.stringify({
        reports,
        metadata: {
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  // Public methods
  getQueuedReports(): AnimationErrorReport[] {
    return [...this.reportQueue];
  }

  getStoredReportsCount(): number {
    return this.getStoredReports().length;
  }

  clearStoredReports(): void {
    if (this.config.enableLocalStorage) {
      localStorage.removeItem('animation_error_reports');
    }
  }

  async flushNow(): Promise<void> {
    await this.flush();
  }

  updateConfig(newConfig: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart flush timer if interval changed
    if (newConfig.flushInterval && this.flushTimer) {
      clearInterval(this.flushTimer);
      this.startFlushTimer();
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Flush remaining reports
    this.flush();
  }
}

// Global instance
export const animationErrorReporter = new AnimationErrorReporter();