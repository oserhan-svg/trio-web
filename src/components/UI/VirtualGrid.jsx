import { useRef, useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useVirtualGrid } from '../../hooks/useVirtualGrid';

/**
 * VirtualGrid component for high-performance list rendering
 * Simplified to avoid layout conflicts with virtualization
 */
const VirtualGrid = memo(({ items, renderItem, rowHeight = 480, overscan = 3, viewMode = 'grid' }) => {
    const containerRef = useRef(null);
    const [columnCount, setColumnCount] = useState(viewMode === 'grid' ? 3 : 1);

    useEffect(() => {
        const updateColumns = () => {
            if (viewMode === 'list') {
                setColumnCount(1);
                return;
            }

            const width = window.innerWidth;
            if (width < 640) setColumnCount(1);
            else if (width < 1024) setColumnCount(2);
            else setColumnCount(3);
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, [viewMode]);

    const { virtualItems, totalHeight } = useVirtualGrid(items, {
        rowHeight,
        columnCount,
        overscan,
        containerRef
    });

    return (
        <div
            ref={containerRef}
            className="virtual-grid-container"
            style={{
                position: 'relative',
                width: '100%',
                height: `${totalHeight}px`,
                minHeight: '600px',
                overflow: 'visible' // Ensure cards can slightly overflow their containers for shadow etc
            }}
        >
            <AnimatePresence>
                {virtualItems.map(({ item, index, style }) => (
                    <motion.div
                        key={item.id || `fallback-${index}`}
                        style={{
                            ...style,
                            boxSizing: 'border-box'
                        }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderItem(item)}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
});

VirtualGrid.propTypes = {
    items: PropTypes.array.isRequired,
    renderItem: PropTypes.func.isRequired,
    rowHeight: PropTypes.number,
    overscan: PropTypes.number
};

VirtualGrid.displayName = 'VirtualGrid';

export default VirtualGrid;
