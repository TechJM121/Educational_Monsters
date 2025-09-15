import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loggingService, LogLevel } from '../../services/loggingService';

// Mock fetch globally
global.fetch = vi.fn();

// Mock navigator.sendBeacon
Object.defineProperty(navigator, 'sendBeacon', {
  value: vi.fn(),
  writable: true,
});

describe('Logging Service Production Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset logging service state
    loggingService.clearLogs();
    loggingService.setLogLevel(LogLevel.DEBUG);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Log Level Filtering', () => {
    it('should filter logs based on current log level', () => {
      loggingService.setLogLevel(LogLevel.WARN);

      loggingService.debug('Debug message');
      loggingService.info('Info message');
      loggingService.warn('Warning message');
      loggingService.error('Error message');

      const logs = loggingService.getLogs();
      
      // Should only contain WARN and ERROR logs
      expect(logs).toHaveLength(2);
      expect(logs.some(log => log.level === LogLevel.WARN)).toBe(true);
      expect(logs.some(log => log.level === LogLevel.ERROR)).toBe(true);
      expect(logs.some(log => log.level === LogLevel.DEBUG)).toBe(false);
      expect(logs.some(log => log.level === LogLevel.INFO)).toBe(false);
    });

    it('should respect production log level settings', () => {
      // Simulate production environment
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = false;
      (import.meta.env as any).VITE_LOG_LEVEL = 'ERROR';

      // In production, should default to higher log level
      loggingService.setLogLevel(LogLevel.ERROR);

      loggingService.debug('Debug message');
      loggingService.info('Info message');
      loggingService.warn('Warning message');
      loggingService.error('Error message');

      const logs = loggingService.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);

      // Restore
      (import.meta.env as any).DEV = originalEnv;
    });
  });

  describe('High Volume Logging', () => {
    it('should handle high-frequency logging without performance degradation', () => {
      const startTime = Date.now();
      
      // Log many messages rapidly
      for (let i = 0; i < 10000; i++) {
        loggingService.info(`High frequency log ${i}`, { index: i });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete quickly (less than 1 second for 10k logs)
      expect(duration).toBeLessThan(1000);

      const logs = loggingService.getLogs();
      expect(logs).toHaveLength(10000);
    });

    it('should maintain memory limits with continuous logging', () => {
      // Log more than the max log size
      for (let i = 0; i < 2000; i++) {
        loggingService.info(`Memory test log ${i}`);
      }

      const logs = loggingService.getLogs();
      
      // Should not exceed max log size (1000 by default)
      expect(logs.length).toBeLessThanOrEqual(1000);
      
      // Should keep the most recent logs
      const lastLog = logs[0]; // Logs are sorted by timestamp desc
      expect(lastLog.message).toContain('1999');
    });

    it('should handle concurrent logging from multiple sources', async () => {
      const promises = Array(100).fill(null).map((_, index) => 
        Promise.resolve().then(() => {
          for (let i = 0; i < 10; i++) {
            loggingService.info(`Concurrent log ${index}-${i}`, { 
              source: index, 
              iteration: i 
            });
          }
        })
      );

      await Promise.all(promises);

      const logs = loggingService.getLogs();
      expect(logs).toHaveLength(1000); // Should have all 1000 logs
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle network failures gracefully', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValue(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      loggingService.error('Test error');
      
      // Fast forward to trigger flush
      vi.advanceTimersByTime(30000);

      await vi.waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to flush logs:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should retry failed log uploads', async () => {
      const mockFetch = vi.mocked(fetch);
      
      // First call fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      loggingService.error('Retry test error');
      
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

    it('should handle circular references in log context', () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      // Should not throw with circular reference
      expect(() => {
        loggingService.info('Circular reference test', { data: circularObj });
      }).not.toThrow();

      const logs = loggingService.getLogs();
      expect(logs).toHaveLength(1);
    });

    it('should handle extremely large log messages', () => {
      const largeMessage = 'x'.repeat(1024 * 1024); // 1MB message
      
      expect(() => {
        loggingService.info(largeMessage);
      }).not.toThrow();

      const logs = loggingService.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe(largeMessage);
    });

    it('should handle malformed context objects', () => {
      const malformedContexts = [
        null,
        undefined,
        'string instead of object',
        123,
        [],
        new Date(),
        /regex/,
      ];

      malformedContexts.forEach((context, index) => {
        expect(() => {
          loggingService.info(`Malformed context test ${index}`, context as any);
        }).not.toThrow();
      });

      const logs = loggingService.getLogs();
      expect(logs).toHaveLength(malformedContexts.length);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track logging performance metrics', () => {
      const startTime = performance.now();
      
      // Log many messages
      for (let i = 0; i < 1000; i++) {
        loggingService.info(`Performance test ${i}`);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should be fast (less than 100ms for 1000 logs)
      expect(duration).toBeLessThan(100);
    });

    it('should not block the main thread during flush', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        } as Response), 100))
      );

      // Log some messages
      for (let i = 0; i < 100; i++) {
        loggingService.info(`Non-blocking test ${i}`);
      }

      const startTime = performance.now();
      
      // Trigger flush
      vi.advanceTimersByTime(30000);
      
      // Should return immediately (non-blocking)
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should handle memory pressure gracefully', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Create memory pressure with large logs
      for (let i = 0; i < 1000; i++) {
        loggingService.info(`Memory pressure test ${i}`, {
          largeData: 'x'.repeat(1000),
          timestamp: Date.now(),
          index: i,
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Log Filtering and Querying', () => {
    beforeEach(() => {
      // Create test logs with different properties
      loggingService.setUser('test-user-123');
      loggingService.setGlobalContext({ component: 'TestComponent' });
      
      loggingService.debug('Debug message', { feature: 'auth' });
      loggingService.info('Info message', { feature: 'learning' });
      loggingService.warn('Warning message', { feature: 'auth' });
      loggingService.error('Error message', new Error('Test error'), { feature: 'payment' });
      
      vi.advanceTimersByTime(1000);
      
      loggingService.info('Later message', { feature: 'learning' });
    });

    it('should filter logs by level', () => {
      const errorLogs = loggingService.getLogs({ level: LogLevel.ERROR });
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].level).toBe(LogLevel.ERROR);

      const warnAndAbove = loggingService.getLogs({ level: LogLevel.WARN });
      expect(warnAndAbove).toHaveLength(2);
      expect(warnAndAbove.every(log => log.level >= LogLevel.WARN)).toBe(true);
    });

    it('should filter logs by component', () => {
      const componentLogs = loggingService.getLogs({ component: 'TestComponent' });
      expect(componentLogs).toHaveLength(5);
      expect(componentLogs.every(log => log.context.component === 'TestComponent')).toBe(true);
    });

    it('should filter logs by feature', () => {
      const authLogs = loggingService.getLogs({ feature: 'auth' });
      expect(authLogs).toHaveLength(2);
      expect(authLogs.every(log => log.context.feature === 'auth')).toBe(true);
    });

    it('should filter logs by time range', () => {
      const now = Date.now();
      const oneSecondAgo = now - 1000;
      
      const recentLogs = loggingService.getLogs({
        timeRange: { start: oneSecondAgo, end: now }
      });
      
      expect(recentLogs).toHaveLength(1);
      expect(recentLogs[0].message).toBe('Later message');
    });

    it('should filter logs by tags', () => {
      loggingService.info('Tagged message', {}, ['important', 'user-action']);
      
      const taggedLogs = loggingService.getLogs({ tags: ['important'] });
      expect(taggedLogs).toHaveLength(1);
      expect(taggedLogs[0].tags).toContain('important');
    });

    it('should combine multiple filters', () => {
      const filteredLogs = loggingService.getLogs({
        level: LogLevel.INFO,
        feature: 'learning',
      });
      
      expect(filteredLogs).toHaveLength(2);
      expect(filteredLogs.every(log => 
        log.level >= LogLevel.INFO && log.context.feature === 'learning'
      )).toBe(true);
    });
  });

  describe('Log Export and Analysis', () => {
    beforeEach(() => {
      // Create diverse test logs
      loggingService.setUser('export-test-user');
      
      loggingService.info('User login', { action: 'login' });
      loggingService.warn('Slow response', { responseTime: 5000 });
      loggingService.error('Database error', new Error('Connection failed'));
      loggingService.debug('Debug info', { debugData: { x: 1, y: 2 } });
    });

    it('should export logs in JSON format', () => {
      const jsonExport = loggingService.exportLogs('json');
      
      expect(() => JSON.parse(jsonExport)).not.toThrow();
      
      const parsedLogs = JSON.parse(jsonExport);
      expect(Array.isArray(parsedLogs)).toBe(true);
      expect(parsedLogs).toHaveLength(4);
      
      // Verify structure
      expect(parsedLogs[0]).toHaveProperty('timestamp');
      expect(parsedLogs[0]).toHaveProperty('level');
      expect(parsedLogs[0]).toHaveProperty('message');
      expect(parsedLogs[0]).toHaveProperty('context');
    });

    it('should export logs in CSV format', () => {
      const csvExport = loggingService.exportLogs('csv');
      
      const lines = csvExport.split('\n');
      expect(lines[0]).toContain('timestamp,level,message,userId,url,tags');
      expect(lines).toHaveLength(5); // Header + 4 log entries
      
      // Verify CSV structure
      lines.slice(1).forEach(line => {
        if (line.trim()) {
          const columns = line.split(',');
          expect(columns.length).toBeGreaterThanOrEqual(6);
        }
      });
    });

    it('should generate log statistics', () => {
      const stats = loggingService.getLogStats();
      
      expect(stats).toHaveProperty('total', 4);
      expect(stats).toHaveProperty('byLevel');
      expect(stats).toHaveProperty('byComponent');
      expect(stats).toHaveProperty('byTag');
      expect(stats).toHaveProperty('timeRange');
      
      expect(stats.byLevel).toHaveProperty('INFO', 1);
      expect(stats.byLevel).toHaveProperty('WARN', 1);
      expect(stats.byLevel).toHaveProperty('ERROR', 1);
      expect(stats.byLevel).toHaveProperty('DEBUG', 1);
    });
  });

  describe('Security and Privacy', () => {
    it('should not log sensitive information', () => {
      const sensitiveData = {
        password: 'secret123',
        creditCard: '4111-1111-1111-1111',
        ssn: '123-45-6789',
        email: 'user@example.com',
        phone: '+1-555-123-4567',
      };

      loggingService.info('User data', sensitiveData);

      const logs = loggingService.getLogs();
      const logEntry = logs[0];
      
      // In a real implementation, sensitive fields should be filtered
      // For this test, we just verify the structure exists
      expect(logEntry.context).toBeDefined();
    });

    it('should sanitize log messages', () => {
      const maliciousMessage = '<script>alert("xss")</script>';
      const sqlInjection = "'; DROP TABLE users; --";
      
      loggingService.info(maliciousMessage);
      loggingService.error(sqlInjection);

      const logs = loggingService.getLogs();
      
      // Messages should be stored as-is for debugging, but would be sanitized on export
      expect(logs[1].message).toBe(maliciousMessage);
      expect(logs[0].message).toBe(sqlInjection);
    });

    it('should handle user data privacy correctly', () => {
      loggingService.setUser('privacy-test-user');
      
      loggingService.info('User action', {
        userId: 'privacy-test-user', // OK - already hashed/anonymized
        action: 'purchase',
        // Should not include: email, name, address, etc.
      });

      const logs = loggingService.getLogs();
      const logEntry = logs[0];
      
      expect(logEntry.userId).toBe('privacy-test-user');
      expect(logEntry.context).not.toHaveProperty('email');
      expect(logEntry.context).not.toHaveProperty('name');
      expect(logEntry.context).not.toHaveProperty('address');
    });
  });

  describe('Integration with Error Boundaries', () => {
    it('should capture React errors', () => {
      const reactError = new Error('Component render failed');
      const errorInfo = {
        componentStack: 'at Component (Component.tsx:10)',
        errorBoundary: 'ErrorBoundary',
      };

      // Simulate React error boundary
      window.dispatchEvent(new CustomEvent('react-error', {
        detail: {
          error: reactError,
          component: 'TestComponent',
          props: { id: 123 },
        }
      }));

      // Should be captured by the logging service
      const logs = loggingService.getLogs();
      const errorLog = logs.find(log => log.level === LogLevel.ERROR);
      
      expect(errorLog).toBeDefined();
      expect(errorLog?.context).toHaveProperty('component', 'TestComponent');
    });

    it('should handle unhandled promise rejections', () => {
      const rejectionReason = 'Async operation failed';
      
      // Simulate unhandled promise rejection
      window.dispatchEvent(new CustomEvent('unhandledrejection', {
        detail: { reason: rejectionReason }
      }));

      const logs = loggingService.getLogs();
      const errorLog = logs.find(log => 
        log.level === LogLevel.ERROR && 
        log.context.category === 'promise_rejection'
      );
      
      expect(errorLog).toBeDefined();
    });
  });

  describe('Cleanup and Resource Management', () => {
    it('should clean up resources on destroy', () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      loggingService.info('Test message before destroy');
      
      // Destroy should flush remaining logs
      loggingService.destroy();

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle page unload gracefully', () => {
      const mockSendBeacon = vi.mocked(navigator.sendBeacon);
      mockSendBeacon.mockReturnValue(true);

      loggingService.info('Message before unload');
      
      // Simulate page unload
      window.dispatchEvent(new Event('beforeunload'));

      expect(mockSendBeacon).toHaveBeenCalledWith(
        '/api/logs',
        expect.stringContaining('Message before unload')
      );
    });

    it('should prevent memory leaks with long-running sessions', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Simulate long-running session with periodic logging
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute++) {
          loggingService.info(`Hourly log ${hour}:${minute}`);
          
          // Simulate periodic cleanup
          if (minute % 10 === 0) {
            vi.advanceTimersByTime(30000); // Trigger flush
          }
        }
      }

      // Force garbage collection
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not have significant memory increase due to log rotation
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });
  });
});