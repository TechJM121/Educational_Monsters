import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MasonryGridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
  animated?: boolean;
  onItemsChange?: (itemCount: number) => void;
}

interface MasonryItem {
  id: string;
  element: React.ReactNode;
  height: number;
  column: number;
  top: number;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 16,
  className = '',
  animated = true,
  onItemsChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<MasonryItem[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const [currentColumns, setCurrentColumns] = useState(3);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Get current column count based on screen size
  const getCurrentColumns = useCallback(() => {
    if (!window) return columns.md || 3;
    
    const width = window.innerWidth;
    if (width >= 1280 && columns.xl) return columns.xl;
    if (width >= 1024 && columns.lg) return columns.lg;
    if (width >= 768 && columns.md) return columns.md;
    if (width >= 640 && columns.sm) return columns.sm;
    return columns.xs || 1;
  }, [columns]);

  // Calculate masonry layout
  const calculateLayout = useCallback(() => {
    if (!containerRef.current) return;

    const columnCount = getCurrentColumns();
    const columnHeights = new Array(columnCount).fill(0);
    const newItems: MasonryItem[] = [];

    React.Children.forEach(children, (child, index) => {
      if (!React.isValidElement(child)) return;

      const itemId = `masonry-item-${index}`;
      const itemElement = itemRefs.current.get(itemId);
      
      if (!itemElement) {
        // If element hasn't been measured yet, use estimated height
        const estimatedHeight = 200;
        const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
        
        newItems.push({
          id: itemId,
          element: child,
          height: estimatedHeight,
          column: shortestColumn,
          top: columnHeights[shortestColumn]
        });
        
        columnHeights[shortestColumn] += estimatedHeight + gap;
        return;
      }

      const itemHeight = itemElement.offsetHeight;
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      
      newItems.push({
        id: itemId,
        element: child,
        height: itemHeight,
        column: shortestColumn,
        top: columnHeights[shortestColumn]
      });
      
      columnHeights[shortestColumn] += itemHeight + gap;
    });

    setItems(newItems);
    setContainerHeight(Math.max(...columnHeights));
    setCurrentColumns(columnCount);
    
    if (onItemsChange) {
      onItemsChange(newItems.length);
    }
  }, [children, gap, getCurrentColumns, onItemsChange]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const newColumnCount = getCurrentColumns();
      if (newColumnCount !== currentColumns) {
        calculateLayout();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateLayout, currentColumns, getCurrentColumns]);

  // Recalculate layout when children change
  useEffect(() => {
    const timer = setTimeout(calculateLayout, 100);
    return () => clearTimeout(timer);
  }, [children, calculateLayout]);

  // Initial layout calculation
  useEffect(() => {
    calculateLayout();
  }, [calculateLayout]);

  const getColumnWidth = () => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    return (containerWidth - (gap * (currentColumns - 1))) / currentColumns;
  };

  const renderItem = (item: MasonryItem, index: number) => {
    const columnWidth = getColumnWidth();
    const left = item.column * (columnWidth + gap);

    const itemStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${left}px`,
      top: `${item.top}px`,
      width: `${columnWidth}px`,
      transition: animated ? 'all 0.3s ease-out' : 'none'
    };

    if (animated) {
      return (
        <motion.div
          key={item.id}
          style={itemStyle}
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ 
            duration: 0.4, 
            delay: index * 0.05,
            ease: "easeOut"
          }}
          ref={(el) => {
            if (el) itemRefs.current.set(item.id, el);
          }}
        >
          {item.element}
        </motion.div>
      );
    }

    return (
      <div
        key={item.id}
        style={itemStyle}
        ref={(el) => {
          if (el) itemRefs.current.set(item.id, el);
        }}
      >
        {item.element}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ height: `${containerHeight}px` }}
    >
      {/* CSS Grid fallback for browsers without masonry support */}
      <style jsx>{`
        @supports (grid-template-rows: masonry) {
          .masonry-fallback {
            display: grid;
            grid-template-columns: repeat(${currentColumns}, 1fr);
            grid-template-rows: masonry;
            gap: ${gap}px;
          }
          .masonry-fallback > * {
            position: static !important;
            width: auto !important;
            left: auto !important;
            top: auto !important;
          }
        }
      `}</style>
      
      {animated ? (
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => renderItem(item, index))}
        </AnimatePresence>
      ) : (
        items.map((item, index) => renderItem(item, index))
      )}
    </div>
  );
};

export default MasonryGrid;