// Comprehensive Logging Service for Educational RPG Tutor
// Handles structured logging, error tracking, and debugging support

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context: Record<string, any>;
  userId?: string;
  sessionId: string;
  url: string;
  userAgent: string;
  stackTrace?: string;
  tags: string[];
}

interface LogContext {
  component?: string;
  action?: string;
  feature?: string;
  experimentId?: string;
  characterId?: string;
  questionId?: string;
  [key: string]: any;
}

interface LogFilter {
  level?: LogLevel;
  component?: string;
  feature?: string;
  userId?: string;
  timeRange?: { start: number; end: number };
  tags?: string[];
}

class LoggingService {
  private logs: LogEntry[] = [];
  private maxLogSize = 1000;
  private currentLogLevel = LogLevel.INFO;
  private sessionId: string;
  private userId?: string;
  private globalContext: LogContext = {};
  private logBuffer: LogEntry[] = [];
  private flushInterval: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.currentLogLevel = this.getLogLevelFromEnv();
    
    // Flush logs periodically
    this.flushInterval = window.setInterval(() => {
      this.flushLogs();
    }, 30000); // Every 30 seconds

    // Flush logs before page unload
    window.addEventListener('beforeunload', () => {
      this.flushLogs(true);
    });

    // Capture unhandled errors
    this.setupErrorCapture();
  }

  private generateSessionId(): string {
    return `log_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getLogLevelFromEnv(): LogLevel {
    const envLevel = import.meta.env.VITE_LOG_LEVEL?.toUpperCase();
    switch (envLevel) {
      case 'DEBUG': return LogLevel.DEBUG;
      case 'INFO': return LogLevel.INFO;
      case 'WARN': return LogLevel.WARN;
      case 'ERROR': return LogLevel.ERROR;
      case 'FATAL': return LogLevel.FATAL;
      default: return import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO;
    }
  }

  // Configuration methods
  setUserId(userId: string): void {
    this.userId = userId;
    this.info('User identified', { userId });
  }

  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
    this.info('Log level changed', { newLevel: LogLevel[level] });
  }

  setGlobalContext(context: LogContext): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  clearGlobalContext(): void {
    this.globalContext = {};
  }

  // Core logging methods
  debug(message: string, context: LogContext = {}, tags: string[] = []): void {
    this.log(LogLevel.DEBUG, message, context, tags);
  }

  info(message: string, context: LogContext = {}, tags: string[] = []): void {
    this.log(LogLevel.INFO, message, context, tags);
  }

  warn(message: string, context: LogContext = {}, tags: string[] = []): void {
    this.log(LogLevel.WARN, message, context, tags);
  }

  error(message: string, error?: Error, context: LogContext = {}, tags: string[] = []): void {
    const errorContext = error ? {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    } : context;

    this.log(LogLevel.ERROR, message, errorContext, [...tags, 'error'], error?.stack);
  }

  fatal(message: string, error?: Error, context: LogContext = {}, tags: string[] = []): void {
    const errorContext = error ? {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    } : context;

    this.log(LogLevel.FATAL, message, errorContext, [...tags, 'fatal'], error?.stack);
  }

  // Specialized logging methods
  logUserAction(action: string, context: LogContext = {}): void {
    this.info(`User action: ${action}`, {
      ...context,
      category: 'user_action',
    }, ['user_action']);
  }

  logPerformance(metric: string, value: number, context: LogContext = {}): void {
    this.info(`Performance: ${metric}`, {
      ...context,
      metric,
      value,
      category: 'performance',
    }, ['performance']);
  }

  logCharacterEvent(event: string, characterId: string, context: LogContext = {}): void {
    this.info(`Character event: ${event}`, {
      ...context,
      characterId,
      category: 'character',
    }, ['character']);
  }

  logLearningEvent(event: string, context: LogContext = {}): void {
    this.info(`Learning event: ${event}`, {
      ...context,
      category: 'learning',
    }, ['learning']);
  }

  logAPICall(method: string, url: string, status: number, duration: number, context: LogContext = {}): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
    this.log(level, `API call: ${method} ${url}`, {
      ...context,
      method,
      url,
      status,
      duration,
      category: 'api',
    }, ['api']);
  }

  logExperiment(experimentId: string, variant: string, context: LogContext = {}): void {
    this.info(`Experiment exposure: ${experimentId}`, {
      ...context,
      experimentId,
      variant,
      category: 'experiment',
    }, ['experiment']);
  }

  // Core logging implementation
  private log(level: LogLevel, message: string, context: LogContext = {}, tags: string[] = [], stackTrace?: string): void {
    if (level < this.currentLogLevel) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context: { ...this.globalContext, ...context },
      userId: this.userId,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      stackTrace,
      tags,
    };

    // Add to local storage
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogSize) {
      this.logs.shift();
    }

    // Add to buffer for remote logging
    this.logBuffer.push(logEntry);

    // Console output in development
    if (import.meta.env.DEV) {
      this.outputToConsole(logEntry);
    }

    // Immediate flush for errors and fatal logs
    if (level >= LogLevel.ERROR) {
      this.flushLogs();
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelName = LogLevel[entry.level];
    const prefix = `[${timestamp}] ${levelName}:`;
    
    const contextStr = Object.keys(entry.context).length > 0 
      ? `\nContext: ${JSON.stringify(entry.context, null, 2)}`
      : '';
    
    const tagsStr = entry.tags.length > 0 
      ? `\nTags: ${entry.tags.join(', ')}`
      : '';

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, contextStr, tagsStr);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, contextStr, tagsStr);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, contextStr, tagsStr);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(prefix, entry.message, contextStr, tagsStr);
        if (entry.stackTrace) {
          console.error('Stack trace:', entry.stackTrace);
        }
        break;
    }
  }

  // Remote logging
  private async flushLogs(immediate = false): Promise<void> {
    if (this.logBuffer.length === 0) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      const method = immediate ? 'sendBeacon' : 'fetch';
      
      if (method === 'sendBeacon' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/logs', JSON.stringify({ logs: logsToSend }));
      } else {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logs: logsToSend }),
        });
      }

      console.debug(`Flushed ${logsToSend.length} log entries`);
    } catch (error) {
      console.error('Failed to flush logs:', error);
      // Re-add logs to buffer for retry
      this.logBuffer.unshift(...logsToSend);
    }
  }

  // Error capture setup
  private setupErrorCapture(): void {
    // Capture JavaScript errors
    window.addEventListener('error', (event) => {
      this.error('JavaScript error', new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        category: 'javascript_error',
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', new Error(event.reason), {
        category: 'promise_rejection',
      });
    });

    // Capture React errors (would be integrated with error boundary)
    window.addEventListener('react-error', ((event: CustomEvent) => {
      this.error('React error', event.detail.error, {
        component: event.detail.component,
        props: event.detail.props,
        category: 'react_error',
      });
    }) as EventListener);
  }

  // Log retrieval and filtering
  getLogs(filter?: LogFilter): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter) {
      if (filter.level !== undefined) {
        filteredLogs = filteredLogs.filter(log => log.level >= filter.level!);
      }

      if (filter.component) {
        filteredLogs = filteredLogs.filter(log => log.context.component === filter.component);
      }

      if (filter.feature) {
        filteredLogs = filteredLogs.filter(log => log.context.feature === filter.feature);
      }

      if (filter.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filter.userId);
      }

      if (filter.timeRange) {
        filteredLogs = filteredLogs.filter(log => 
          log.timestamp >= filter.timeRange!.start && 
          log.timestamp <= filter.timeRange!.end
        );
      }

      if (filter.tags && filter.tags.length > 0) {
        filteredLogs = filteredLogs.filter(log => 
          filter.tags!.some(tag => log.tags.includes(tag))
        );
      }
    }

    return filteredLogs.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Export logs for debugging
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getLogs();
    
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'message', 'userId', 'url', 'tags'];
      const csvRows = [
        headers.join(','),
        ...logs.map(log => [
          new Date(log.timestamp).toISOString(),
          LogLevel[log.level],
          `"${log.message.replace(/"/g, '""')}"`,
          log.userId || '',
          `"${log.url}"`,
          `"${log.tags.join(';')}"`,
        ].join(','))
      ];
      return csvRows.join('\n');
    }

    return JSON.stringify(logs, null, 2);
  }

  // Debug utilities
  getLogStats(): Record<string, any> {
    const logs = this.getLogs();
    const stats = {
      total: logs.length,
      byLevel: {} as Record<string, number>,
      byComponent: {} as Record<string, number>,
      byTag: {} as Record<string, number>,
      timeRange: {
        oldest: logs.length > 0 ? Math.min(...logs.map(l => l.timestamp)) : null,
        newest: logs.length > 0 ? Math.max(...logs.map(l => l.timestamp)) : null,
      },
    };

    logs.forEach(log => {
      // Count by level
      const levelName = LogLevel[log.level];
      stats.byLevel[levelName] = (stats.byLevel[levelName] || 0) + 1;

      // Count by component
      if (log.context.component) {
        stats.byComponent[log.context.component] = (stats.byComponent[log.context.component] || 0) + 1;
      }

      // Count by tags
      log.tags.forEach(tag => {
        stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
      });
    });

    return stats;
  }

  // Cleanup
  clearLogs(): void {
    this.logs = [];
    this.logBuffer = [];
    this.info('Logs cleared');
  }

  destroy(): void {
    clearInterval(this.flushInterval);
    this.flushLogs(true);
  }
}

// Export singleton instance
export const loggingService = new LoggingService();

// Convenience functions
export const log = {
  debug: (message: string, context?: LogContext, tags?: string[]) => 
    loggingService.debug(message, context, tags),
  info: (message: string, context?: LogContext, tags?: string[]) => 
    loggingService.info(message, context, tags),
  warn: (message: string, context?: LogContext, tags?: string[]) => 
    loggingService.warn(message, context, tags),
  error: (message: string, error?: Error, context?: LogContext, tags?: string[]) => 
    loggingService.error(message, error, context, tags),
  fatal: (message: string, error?: Error, context?: LogContext, tags?: string[]) => 
    loggingService.fatal(message, error, context, tags),
};

export default loggingService;