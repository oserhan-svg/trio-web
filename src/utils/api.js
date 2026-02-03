import config from '../config';

// Individual property cache
const propertyCache = new Map();
const lastPropertyFetchTimes = new Map();

/**
 * Utility for fetching and caching property details
 */
export const fetchPropertyDetail = async (id) => {
    const now = Date.now();
    const cached = propertyCache.get(String(id));
    const lastFetch = lastPropertyFetchTimes.get(String(id)) || 0;

    // Return cached if fresh
    if (cached && (now - lastFetch < config.CACHE_DURATION_MS)) {
        return cached;
    }

    try {
        const response = await fetch(`${config.API_BASE_URL}/listings/${id}`);
        if (!response.ok) throw new Error('İlan bulunamadı');
        const data = await response.json();

        // Update cache
        propertyCache.set(String(id), data);
        lastPropertyFetchTimes.set(String(id), now);

        return data;
    } catch (err) {
        throw err;
    }
};

/**
 * Prefetches property data into the cache
 */
export const prefetchProperty = (id) => {
    // Only prefetch if not already cached/fresh
    const now = Date.now();
    const lastFetch = lastPropertyFetchTimes.get(String(id)) || 0;

    if (!propertyCache.has(String(id)) || (now - lastFetch > config.CACHE_DURATION_MS)) {
        fetchPropertyDetail(id).catch(() => {
            // Silently fail prefetch to not disturb the UI
        });
    }
};
