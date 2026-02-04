/**
 * PerformanceMonitor utility to track Core Web Vitals with defensive checks
 */
export const initPerformanceMonitoring = () => {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
        console.warn('[Performance] PerformanceObserver not supported.');
        return;
    }

    const logMetric = (name, value, id) => {
        try {
            console.log(`[Performance] ${name}:`, {
                value: Math.round(value * 100) / 100,
                id,
                timestamp: new Date().toISOString()
            });
        } catch {
            // Silently fail logging
        }
    };

    try {
        // Tracking LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            logMetric('LCP', lastEntry.startTime, lastEntry.id);
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // Tracking FID (First Input Delay)
        const fidObserver = new PerformanceObserver((entryList) => {
            entryList.getEntries().forEach((entry) => {
                logMetric('FID', entry.processingStart - entry.startTime, entry.name);
            });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });

        // Tracking CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    logMetric('CLS', clsValue, entry.name);
                }
            }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });

        console.log('[Performance] Monitoring initialized successfully.');
    } catch (error) {
        console.error('[Performance] Initialization failed:', error);
    }
};

/**
 * Hook to use performance metrics in components if needed
 */
export const usePerformanceMetrics = () => {
    return {};
};
