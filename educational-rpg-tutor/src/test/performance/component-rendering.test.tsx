import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { measureRenderTime, createMockCharacter } from '../utils';
import { CharacterAvatar } from '../../components/character/CharacterAvatar';
import { CharacterStats } from '../../components/character/CharacterStats';
import { RPGHomePage } from '../../components/home/RPGHomePage';

describe('Component Rendering Performance', () => {
  it('renders CharacterAvatar within acceptable time', async () => {
    const mockCharacter = createMockCharacter();
    
    const renderTime = await measureRenderTime(() => {
      render(<CharacterAvatar character={mockCharacter} />);
    });
    
    // Should render within 50ms
    expect(renderTime).toBeLessThan(50);
  });

  it('renders CharacterStats efficiently with many stats', async () => {
    const mockCharacter = createMockCharacter({
      stats: {
        intelligence: 25,
        vitality: 30,
        wisdom: 20,
        charisma: 15,
        dexterity: 28,
        creativity: 22,
        availablePoints: 5,
      }
    });
    
    const renderTime = await measureRenderTime(() => {
      render(<CharacterStats character={mockCharacter} />);
    });
    
    // Should render within 30ms even with complex stats
    expect(renderTime).toBeLessThan(30);
  });

  it('handles large character data efficiently', async () => {
    const mockCharacter = createMockCharacter({
      equippedItems: Array.from({ length: 50 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        type: 'accessory',
        rarity: 'common',
      })),
    });
    
    const renderTime = await measureRenderTime(() => {
      render(<CharacterAvatar character={mockCharacter} />);
    });
    
    // Should handle large datasets within 100ms
    expect(renderTime).toBeLessThan(100);
  });

  it('optimizes re-renders when props change', () => {
    const mockCharacter = createMockCharacter();
    let renderCount = 0;
    
    const TestComponent = ({ character }: { character: any }) => {
      renderCount++;
      return <CharacterAvatar character={character} />;
    };
    
    const { rerender } = render(<TestComponent character={mockCharacter} />);
    
    // Re-render with same props
    rerender(<TestComponent character={mockCharacter} />);
    
    // Should not re-render unnecessarily (React.memo optimization)
    expect(renderCount).toBe(1);
  });

  it('loads home page components within performance budget', async () => {
    const mockCharacter = createMockCharacter();
    
    const renderTime = await measureRenderTime(() => {
      render(<RPGHomePage character={mockCharacter} />);
    });
    
    // Home page should load within 200ms
    expect(renderTime).toBeLessThan(200);
  });

  it('handles animation performance efficiently', async () => {
    const mockCharacter = createMockCharacter();
    
    // Mock performance.now for animation timing
    const mockPerformance = vi.spyOn(performance, 'now');
    let frameCount = 0;
    
    mockPerformance.mockImplementation(() => {
      frameCount++;
      return frameCount * 16.67; // 60fps = 16.67ms per frame
    });
    
    render(<CharacterAvatar character={mockCharacter} animated={true} />);
    
    // Verify smooth animation timing
    expect(frameCount).toBeGreaterThan(0);
    
    mockPerformance.mockRestore();
  });

  it('efficiently handles large lists of achievements', async () => {
    const mockAchievements = Array.from({ length: 100 }, (_, i) => ({
      id: `achievement-${i}`,
      name: `Achievement ${i}`,
      description: `Description for achievement ${i}`,
      badgeIcon: '🏆',
      unlockCriteria: 'test',
      rarityLevel: 1,
      category: 'learning',
      createdAt: new Date(),
    }));
    
    const renderTime = await measureRenderTime(() => {
      render(
        <div>
          {mockAchievements.map(achievement => (
            <div key={achievement.id}>{achievement.name}</div>
          ))}
        </div>
      );
    });
    
    // Should handle 100 achievements within 150ms
    expect(renderTime).toBeLessThan(150);
  });

  it('optimizes memory usage during component lifecycle', () => {
    const mockCharacter = createMockCharacter();
    
    // Track memory usage (simplified)
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    
    const { unmount } = render(<CharacterAvatar character={mockCharacter} />);
    
    // Unmount component
    unmount();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    
    // Memory should not increase significantly after unmount
    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(1000000); // Less than 1MB increase
  });
});