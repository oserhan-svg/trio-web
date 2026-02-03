import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Standard virtualization hook for a fixed-height item grid
 */
export const useVirtualGrid = (items, {
    rowHeight = 450,
    columnCount = 3,
    overscan = 4,
    containerRef
} = {}) => {
    const [scrollTop, setScrollTop] = useState(window.scrollY);
    const [containerHeight, setContainerHeight] = useState(window.innerHeight);

    const rowCount = Math.ceil(items.length / columnCount);
    const totalHeight = rowCount * rowHeight;

    useEffect(() => {
        const handleScroll = () => {
            // Use requestAnimationFrame for smoother updates and to avoid mid-frame inconsistencies
            requestAnimationFrame(() => {
                setScrollTop(window.scrollY);
            });
        };

        const handleResize = () => {
            setContainerHeight(window.innerHeight);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const virtualItems = useMemo(() => {
        const container = containerRef.current;
        if (!container) return [];

        // Get actual vertical offset of the grid container
        const gridOffsetTop = container.getBoundingClientRect().top + window.scrollY;

        // Calculate which row is currently at the top of the viewport
        const relativeScrollTop = Math.max(0, scrollTop - gridOffsetTop);

        // Render rows before and after the viewport based on overscan
        const startRow = Math.max(0, Math.floor(relativeScrollTop / rowHeight) - overscan);
        const renderedRowsCount = Math.ceil(containerHeight / rowHeight);
        const endRow = Math.min(rowCount, startRow + renderedRowsCount + (overscan * 2));

        const visibleItems = [];
        for (let row = startRow; row < endRow; row++) {
            for (let col = 0; col < columnCount; col++) {
                const index = row * columnCount + col;
                if (index < items.length) {
                    visibleItems.push({
                        item: items[index],
                        index,
                        style: {
                            position: 'absolute',
                            top: `${row * rowHeight}px`, // Use explicit TOP instead of transform
                            left: `${(col / columnCount) * 100}%`,
                            width: `${(1 / columnCount) * 100}%`,
                            height: `${rowHeight}px`,
                            padding: '10px'
                        }
                    });
                }
            }
        }
        return visibleItems;
    }, [items, scrollTop, containerHeight, rowHeight, columnCount, overscan, rowCount, containerRef]);

    return {
        virtualItems,
        totalHeight
    };
};
