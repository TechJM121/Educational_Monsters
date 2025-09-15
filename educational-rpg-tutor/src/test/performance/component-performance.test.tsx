// Component performance testing for Educational RPG Tutor
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { 
  PerformanceTester, 
  AnimationTester, 
  BundleAnalyzer, 
  NetworkTester, 
  MemoryLeakDetector,
  measureComponentRender 
} from './performance-utils';
import { createMockCharacter, createMockQuestion, renderWithProviders } from '../utils';

// Mock components for testing
const MockCharacterAvatar = ({ character }: { character: any }) => (
  <div data-testid="character-avatar">
    <img src={character.avatarConfig.image} alt={character.name} />
    <span>{character.name}</span>
    <span>Level {character.level}</span>
  </div>
);

const MockXPBar = ({ current, max }: { current: number; max: number }) => (
  <div data-testid="xp-bar">
    <div style={{ width: `${(current / max) * 100}%` }} />
    <span>{current} / {max}</span>
  </div>
);

const MockQuestionCard = ({ question }: { question: any }) => (
  <div data-testid="question-card">
    <h3>{question.questionText}</h3>
    {question.answerOptions.map((option: string, index: number) => (
      <button key={index} data-testid={`answer-${index}`}>
        {option}
      </button>
    ))}
  </div>
);

describe('Component Performance Tests', () => {
  let performanceTester: PerformanceTester;
  let animationTester: AnimationTester;
  let networkTester: NetworkTester;
  let memoryDetector: MemoryLeakDetector;

  beforeEach(() => {
    performanceTester = new PerformanceTester();
    animationTester = new AnimationTester();
    networkTester = new NetworkTester();
    memoryDetector = new MemoryLeakDetector();
    
    performanceTester.startMonitoring();
  });

  afterEach(() => {
    performanceTester.stopMonitoring();
    performanceTester.reset();
    networkTester.reset();
    cleanup();
  });

  describe('Character Avatar Performance', () => {
    it('renders character avatar within performance budget', () => {
      const character = createMockCharacter();
      
      const { result, metrics } = performanceTester.measureRenderPerformance(() => {
        return render(<MockCharacterAvatar character={character} />);
      }, 'character-avatar-render');

      expect(result).toBeDefined();
      expect(metrics.renderTime).toBeLessThan(16); // Under 16ms for 60fps
      expect(metrics.memoryUsage).toBeLessThan(1024 * 1024); // Under 1MB
    });

    it('handles multiple character avatars efficiently', () => {
      const characters = Array.from({ length: 10 }, () => createMockCharacter());
      
      const { result, metrics } = performanceTester.measureRenderPerformance(() => {
        return render(
          <div>
            {characters.map((char, index) => (
              <MockCharacterAvatar key={index} character={char} />
            ))}
          </div>
        );
      }, 'multiple-avatars');

      expect(metrics.renderTime).toBeLessThan(50); // Should handle 10 avatars in under 50ms
      expect(metrics.memoryUsage).toBeLessThan(5 * 1024 * 1024); // Under 5MB for 10 avatars
    });

    it('updates avatar efficiently when character changes', () => {
      const character = createMockCharacter();
      const { rerender } = render(<MockCharacterAvatar character={character} />);
      
      const updatedCharacter = { ...character, level: character.level + 1 };
      
      const { metrics } = performanceTester.measureRenderPerformance(() => {
        rerender(<MockCharacterAvatar character={updatedCharacter} />);
      }, 'avatar-update');

      expect(metrics.renderTime).toBeLessThan(10); // Updates should be very fast
    });
  });

  describe('XP Bar Performance', () => {
    it('renders XP bar with smooth animations', async () => {
      animationTester.startMonitoring();
      
      render(<MockXPBar current={50} max={100} />);
      
      // Simulate animation duration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const animationMetrics = animationTester.stopMonitoring();
      
      expect(animationMetrics.frameRate).toBeGreaterThan(55); // Close to 60fps
      expect(animationMetrics.droppedFrames).toBeLessThan(5); // Minimal dropped frames
      expect(animationMetrics.jankScore).toBeLessThan(10); // Low jank score
    });

    it('handles rapid XP updates without performance degradation', () => {
      const { rerender } = render(<MockXPBar current={0} max={100} />);
      
      const startTime = performance.now();
      
      // Simulate rapid XP updates
      for (let i = 1; i <= 100; i++) {
        rerender(<MockXPBar current={i} max={100} />);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(100); // 100 updates in under 100ms
    });
  });

  describe('Question Card Performance', () => {
    it('renders question cards efficiently', () => {
      const question = createMockQuestion();
      
      const { result, metrics } = performanceTester.measureRenderPerformance(() => {
        return render(<MockQuestionCard question={question} />);
      }, 'question-card-render');

      expect(result).toBeDefined();
      expect(metrics.renderTime).toBeLessThan(20); // Under 20ms
    });

    it('handles large question sets without memory leaks', () => {
      memoryDetector.startMonitoring(500); // Sample every 500ms
      
      const questions = Array.from({ length: 50 }, () => createMockQuestion());
      
      // Render and unmount multiple question sets
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(
          <div>
            {questions.map((q, index) => (
              <MockQuestionCard key={`${i}-${index}`} question={q} />
            ))}
          </div>
        );
        unmount();
      }
      
      const memoryReport = memoryDetector.stopMonitoring();
      
      expect(memoryReport.hasLeak).toBe(false);
      expect(memoryReport.memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
    });
  });

  describe('Network Performance', () => {
    it('loads character data efficiently', async () => {
      const characterData = createMockCharacter();
      
      const response = await networkTester.mockNetworkRequest(
        '/api/characters/test-id',
        JSON.stringify(characterData).length
      );
      
      expect(response).toBeDefined();
      
      const metrics = networkTester.getNetworkMetrics();
      expect(metrics.averageResponseTime).toBeLessThan(200); // Under 200ms
    });

    it('utilizes caching effectively', async () => {
      const characterData = createMockCharacter();
      const dataSize = JSON.stringify(characterData).length;
      
      // First request (not cached)
      await networkTester.mockNetworkRequest('/api/characters/test-id', dataSize, false);
      
      // Second request (cached)
      await networkTester.mockNetworkRequest('/api/characters/test-id', dataSize, true);
      
      const metrics = networkTester.getNetworkMetrics();
      expect(metrics.cacheHitRate).toBe(0.5); // 50% cache hit rate
    });

    it('handles concurrent requests efficiently', async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        networkTester.mockNetworkRequest(`/api/questions/${i}`, 1024)
      );
      
      const startTime = performance.now();
      await Promise.all(requests);
      const endTime = performance.now();
      
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(500); // All requests in under 500ms
      
      const metrics = networkTester.getNetworkMetrics();
      expect(metrics.totalRequests).toBe(10);
    });
  });

  describe('Bundle Size Analysis', () => {
    it('maintains acceptable bundle size', async () => {
      const analysis = await BundleAnalyzer.analyzeBundleSize();
      const thresholds = BundleAnalyzer.checkBundleSizeThresholds(analysis);
      
      expect(thresholds.withinLimits).toBe(true);
      expect(thresholds.warnings.length).toBe(0);
      
      expect(analysis.totalSize).toBeLessThan(2 * 1024 * 1024); // Under 2MB
      expect(analysis.gzippedSize).toBeLessThan(500 * 1024); // Under 500KB gzipped
    });

    it('has reasonable chunk distribution', async () => {
      const analysis = await BundleAnalyzer.analyzeBundleSize();
      
      const mainChunk = analysis.chunks.find(chunk => chunk.name === 'main');
      const vendorChunk = analysis.chunks.find(chunk => chunk.name === 'vendor');
      
      expect(mainChunk?.size).toBeLessThan(800 * 1024); // Main chunk under 800KB
      expect(vendorChunk?.size).toBeLessThan(600 * 1024); // Vendor chunk under 600KB
    });
  });

  describe('Memory Management', () => {
    it('cleans up component memory properly', () => {
      const characters = Array.from({ length: 20 }, () => createMockCharacter());
      
      // Render many components
      const { unmount } = render(
        <div>
          {characters.map((char, index) => (
            <MockCharacterAvatar key={index} character={char} />
          ))}
        </div>
      );
      
      const beforeUnmount = performance.now();
      unmount();
      const afterUnmount = performance.now();
      
      const unmountTime = afterUnmount - beforeUnmount;
      expect(unmountTime).toBeLessThan(50); // Cleanup should be fast
    });

    it('handles component updates without memory leaks', () => {
      memoryDetector.startMonitoring(100);
      
      const character = createMockCharacter();
      const { rerender } = render(<MockCharacterAvatar character={character} />);
      
      // Perform many updates
      for (let i = 0; i < 100; i++) {
        const updatedCharacter = { ...character, level: i + 1 };
        rerender(<MockCharacterAvatar character={updatedCharacter} />);
      }
      
      const memoryReport = memoryDetector.stopMonitoring();
      
      expect(memoryReport.hasLeak).toBe(false);
      expect(memoryReport.growthRate).toBeLessThan(1024 * 1024); // Less than 1MB/s growth
    });
  });

  describe('Rendering Performance Benchmarks', () => {
    it('meets performance benchmarks for component rendering', () => {
      const renderMeasure = measureComponentRender('CharacterAvatar');
      
      renderMeasure.start();
      render(<MockCharacterAvatar character={createMockCharacter()} />);
      const renderTime = renderMeasure.end();
      
      expect(renderTime).toBeLessThan(16); // 60fps budget
    });

    it('handles complex component trees efficiently', () => {
      const characters = Array.from({ length: 5 }, () => createMockCharacter());
      const questions = Array.from({ length: 3 }, () => createMockQuestion());
      
      const { result, metrics } = performanceTester.measureRenderPerformance(() => {
        return render(
          <div>
            {characters.map((char, i) => (
              <div key={i}>
                <MockCharacterAvatar character={char} />
                <MockXPBar current={char.currentXP} max={100} />
                {questions.map((q, j) => (
                  <MockQuestionCard key={j} question={q} />
                ))}
              </div>
            ))}
          </div>
        );
      }, 'complex-tree');

      expect(metrics.renderTime).toBeLessThan(100); // Complex tree under 100ms
      expect(metrics.memoryUsage).toBeLessThan(10 * 1024 * 1024); // Under 10MB
    });
  });

  describe('Async Performance', () => {
    it('handles async data loading efficiently', async () => {
      const asyncDataLoader = async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        return createMockCharacter();
      };

      const { result, metrics } = await performanceTester.measureAsyncPerformance(
        asyncDataLoader,
        'async-character-load'
      );

      expect(result).toBeDefined();
      expect(metrics.renderTime).toBeLessThan(150); // Including 100ms simulated delay
    });

    it('batches multiple async operations efficiently', async () => {
      const batchLoader = async () => {
        const promises = Array.from({ length: 5 }, () =>
          new Promise(resolve => setTimeout(() => resolve(createMockCharacter()), 50))
        );
        return Promise.all(promises);
      };

      const { result, metrics } = await performanceTester.measureAsyncPerformance(
        batchLoader,
        'batch-load'
      );

      expect(result).toHaveLength(5);
      expect(metrics.renderTime).toBeLessThan(100); // Should run in parallel, not sequential
    });
  });
});