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
    const [scrollTop, setScrollTop] = useState(typeof window !== 'undefined' ? window.scrollY : 0);
    const [containerHeight, setContainerHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 0);
    const [gridOffsetTop, setGridOffsetTop] = useState(0);

    const rowCount = Math.ceil(items.length / columnCount);
    const totalHeight = rowCount * rowHeight;

    // Measure container position
    useEffect(() => {
        if (containerRef.current) {
            setGridOffsetTop(containerRef.current.getBoundingClientRect().top + window.scrollY);
        }
    }, [containerRef]);

    useEffect(() => {
        const handleScroll = () => {
            requestAnimationFrame(() => {
                setScrollTop(window.scrollY);
            });
        };

        const handleResize = () => {
            setContainerHeight(window.innerHeight);
            if (containerRef.current) {
                setGridOffsetTop(containerRef.current.getBoundingClientRect().top + window.scrollY);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, [containerRef]);

    const virtualItems = useMemo(() => {
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
                            top: `${row * rowHeight}px`,
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
    }, [items, scrollTop, gridOffsetTop, containerHeight, rowHeight, columnCount, overscan, rowCount]);

    return {
        virtualItems,
        totalHeight
    };
};
