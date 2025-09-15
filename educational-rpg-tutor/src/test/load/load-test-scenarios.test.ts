// Load testing scenarios for Educational RPG Tutor
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LoadTester, mockDatabaseOperations, PerformanceMonitor, MemoryMonitor } from '../load-testing';

describe('Load Testing Scenarios', () => {
  let loadTester: LoadTester;
  let performanceMonitor: PerformanceMonitor;
  let memoryMonitor: MemoryMonitor;

  beforeEach(() => {
    loadTester = new LoadTester();
    performanceMonitor = new PerformanceMonitor();
    memoryMonitor = new MemoryMonitor();
  });

  afterEach(() => {
    performanceMonitor.reset();
  });

  describe('Character Loading Performance', () => {
    it('handles 50 concurrent users loading characters', async () => {
      const config = {
        concurrentUsers: 50,
        testDuration: 10000, // 10 seconds
        requestsPerSecond: 5
      };

      const testFunction = async () => {
        const endTiming = performanceMonitor.startTiming('character-load');
        await mockDatabaseOperations.getCharacter('test-character-id');
        endTiming();
      };

      const results = await loadTester.runLoadTest(config, testFunction);

      expect(results.successfulRequests).toBeGreaterThan(0);
      expect(results.failedRequests).toBeLessThan(results.totalRequests * 0.05); // Less than 5% failure rate
      expect(results.averageResponseTime).toBeLessThan(500); // Under 500ms average
      expect(results.requestsPerSecond).toBeGreaterThan(4); // At least 4 RPS

      const metrics = performanceMonitor.getMetrics('character-load');
      expect(metrics?.average).toBeLessThan(200); // Average under 200ms
      expect(metrics?.p95).toBeLessThan(500); // 95th percentile under 500ms
    });

    it('maintains performance under memory pressure', async () => {
      memoryMonitor.takeSample();

      const config = {
        concurrentUsers: 20,
        testDuration: 5000,
        requestsPerSecond: 10
      };

      const testFunction = async () => {
        // Simulate memory-intensive character operations
        const character = await mockDatabaseOperations.getCharacter('test-id');
        const largeData = new Array(1000).fill(character); // Create memory pressure
        memoryMonitor.takeSample();
        return largeData;
      };

      const results = await loadTester.runLoadTest(config, testFunction);
      const memoryReport = memoryMonitor.getMemoryReport();

      expect(results.successfulRequests).toBeGreaterThan(0);
      expect(memoryReport?.growth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB growth
    });
  });

  describe('XP System Performance', () => {
    it('handles rapid XP updates from multiple users', async () => {
      const config = {
        concurrentUsers: 30,
        testDuration: 8000,
        requestsPerSecond: 8
      };

      const testFunction = async () => {
        const endTiming = performanceMonitor.startTiming('xp-update');
        await mockDatabaseOperations.updateCharacterXP('test-character', Math.floor(Math.random() * 100));
        endTiming();
      };

      const results = await loadTester.runLoadTest(config, testFunction);

      expect(results.successfulRequests).toBeGreaterThan(100);
      expect(results.averageResponseTime).toBeLessThan(300);
      expect(results.failedRequests).toBe(0); // XP updates should never fail

      const metrics = performanceMonitor.getMetrics('xp-update');
      expect(metrics?.p99).toBeLessThan(1000); // 99th percentile under 1 second
    });

    it('processes question responses efficiently', async () => {
      const config = {
        concurrentUsers: 25,
        testDuration: 6000,
        requestsPerSecond: 6
      };

      const responses = [
        { questionId: 'q1', answer: 'correct', userId: 'user1' },
        { questionId: 'q2', answer: 'incorrect', userId: 'user2' },
        { questionId: 'q3', answer: 'correct', userId: 'user3' }
      ];

      const testFunction = async () => {
        const response = responses[Math.floor(Math.random() * responses.length)];
        const endTiming = performanceMonitor.startTiming('question-response');
        await mockDatabaseOperations.saveQuestionResponse(response);
        endTiming();
      };

      const results = await loadTester.runLoadTest(config, testFunction);

      expect(results.successfulRequests).toBeGreaterThan(50);
      expect(results.averageResponseTime).toBeLessThan(200);

      const metrics = performanceMonitor.getMetrics('question-response');
      expect(metrics?.average).toBeLessThan(100); // Very fast response saving
    });
  });

  describe('Leaderboard Performance', () => {
    it('handles leaderboard queries under load', async () => {
      const config = {
        concurrentUsers: 40,
        testDuration: 7000,
        requestsPerSecond: 4
      };

      const testFunction = async () => {
        const endTiming = performanceMonitor.startTiming('leaderboard-query');
        await mockDatabaseOperations.getLeaderboard();
        endTiming();
      };

      const results = await loadTester.runLoadTest(config, testFunction);

      expect(results.successfulRequests).toBeGreaterThan(80);
      expect(results.averageResponseTime).toBeLessThan(400); // Leaderboard can be slightly slower

      const metrics = performanceMonitor.getMetrics('leaderboard-query');
      expect(metrics?.max).toBeLessThan(1000); // No query should take over 1 second
    });
  });

  describe('Database Connection Pool', () => {
    it('manages database connections efficiently', async () => {
      const config = {
        concurrentUsers: 60, // High concurrency to test connection pooling
        testDuration: 5000,
        requestsPerSecond: 10
      };

      const operations = [
        () => mockDatabaseOperations.getCharacter('char1'),
        () => mockDatabaseOperations.updateCharacterXP('char1', 50),
        () => mockDatabaseOperations.getLeaderboard(),
        () => mockDatabaseOperations.saveQuestionResponse({ questionId: 'q1', answer: 'test' })
      ];

      const testFunction = async () => {
        const operation = operations[Math.floor(Math.random() * operations.length)];
        await operation();
      };

      const results = await loadTester.runLoadTest(config, testFunction);

      // With proper connection pooling, we should handle high concurrency
      expect(results.successfulRequests).toBeGreaterThan(200);
      expect(results.failedRequests).toBeLessThan(results.totalRequests * 0.02); // Less than 2% failure
      expect(results.requestsPerSecond).toBeGreaterThan(8);
    });
  });

  describe('Real-time Features Performance', () => {
    it('handles real-time updates efficiently', async () => {
      const config = {
        concurrentUsers: 35,
        testDuration: 6000,
        requestsPerSecond: 7
      };

      const testFunction = async () => {
        // Simulate real-time character updates
        const endTiming = performanceMonitor.startTiming('realtime-update');
        
        // Mock real-time subscription update
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
        await mockDatabaseOperations.updateCharacterXP('char-id', 10);
        
        endTiming();
      };

      const results = await loadTester.runLoadTest(config, testFunction);

      expect(results.successfulRequests).toBeGreaterThan(100);
      expect(results.averageResponseTime).toBeLessThan(250);

      const metrics = performanceMonitor.getMetrics('realtime-update');
      expect(metrics?.p95).toBeLessThan(400);
    });
  });

  describe('Stress Testing', () => {
    it('maintains stability under extreme load', async () => {
      const config = {
        concurrentUsers: 100, // Extreme load
        testDuration: 3000, // Short duration for stress test
        requestsPerSecond: 15
      };

      const testFunction = async () => {
        // Mix of operations to stress test the system
        const operations = [
          () => mockDatabaseOperations.getCharacter('stress-test'),
          () => mockDatabaseOperations.updateCharacterXP('stress-test', 1),
          () => mockDatabaseOperations.getLeaderboard()
        ];
        
        const operation = operations[Math.floor(Math.random() * operations.length)];
        await operation();
      };

      const results = await loadTester.runLoadTest(config, testFunction);

      // Under extreme load, we accept higher failure rates but system should not crash
      expect(results.totalRequests).toBeGreaterThan(300);
      expect(results.failedRequests).toBeLessThan(results.totalRequests * 0.15); // Less than 15% failure
      expect(results.requestsPerSecond).toBeGreaterThan(10); // Still maintaining decent throughput
    });
  });

  describe('Memory Leak Detection', () => {
    it('does not leak memory during extended operations', async () => {
      memoryMonitor.takeSample();

      const config = {
        concurrentUsers: 20,
        testDuration: 10000, // Longer test to detect leaks
        requestsPerSecond: 5
      };

      const testFunction = async () => {
        // Operations that might cause memory leaks
        const character = await mockDatabaseOperations.getCharacter('memory-test');
        
        // Simulate some processing that might retain references
        const processedData = JSON.parse(JSON.stringify(character));
        processedData.timestamp = Date.now();
        
        memoryMonitor.takeSample();
        return processedData;
      };

      await loadTester.runLoadTest(config, testFunction);
      const memoryReport = memoryMonitor.getMemoryReport();

      // Memory growth should be reasonable for the amount of work done
      expect(memoryReport?.growth).toBeLessThan(100 * 1024 * 1024); // Less than 100MB growth
      
      if (memoryReport?.growthRate) {
        expect(memoryReport.growthRate).toBeLessThan(1024 * 1024); // Less than 1MB/second growth rate
      }
    });
  });
});