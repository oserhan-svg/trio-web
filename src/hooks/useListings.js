import { useState, useMemo, useCallback, useEffect } from 'react';
import config from '../config';

// Simple in-memory cache to store API responses
let listingsCache = null;
let lastFetchTime = 0;

const useListings = () => {
    const [listings, setListings] = useState(listingsCache || []);
    const [loading, setLoading] = useState(!listingsCache);
    const [error, setError] = useState(null);

    // Load initial filters from localStorage or use defaults
    const [filters, setFilters] = useState(() => {
        try {
            const savedFilters = localStorage.getItem('trio_filters');
            return savedFilters ? JSON.parse(savedFilters) : {
                searchTerm: '',
                category: '',
                bedrooms: '',
                priceMin: 0,
                priceMax: 50000000,
                amenities: []
            };
        } catch (e) {
            console.error('Failed to parse filters from localStorage', e);
            return { searchTerm: '', category: '', bedrooms: '', priceMin: 0, priceMax: 50000000, amenities: [] };
        }
    });

    const [favorites, setFavorites] = useState(() => {
        try {
            const savedFavorites = localStorage.getItem('trio_favorites');
            return savedFavorites ? JSON.parse(savedFavorites) : [];
        } catch (e) {
            console.error('Failed to parse favorites from localStorage', e);
            return [];
        }
    });

    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    const [isFiltering, setIsFiltering] = useState(false);

    // Fetch listings from API with caching
    const fetchListings = async (force = false) => {
        const now = Date.now();

        // Return cached data if it's fresh enough and not forced
        if (!force && listingsCache && (now - lastFetchTime < config.CACHE_DURATION_MS)) {
            setLoading(false);
            setListings(listingsCache);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${config.API_BASE_URL}/listings`);
            if (!response.ok) throw new Error('İlanlar yüklenirken bir hata oluştu');
            const data = await response.json();

            // Pre-calculate numeric price for efficient filtering
            const normalizedData = data.map(item => ({
                ...item,
                priceNumeric: parseInt(item.price?.split(',')[0]?.replace(/[^\d]/g, '')) || 0
            }));

            // Update cache
            listingsCache = normalizedData;
            lastFetchTime = now;

            setListings(normalizedData);
            setError(null);
        } catch (err) {
            console.error('Error fetching listings:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch only if not already loading/data present (optimization)
        if (!listingsCache) {
            fetchListings();
        } else {
            // If we have cache, ensuring state is synced
            setListings(listingsCache);
            setLoading(false);
        }
    }, []);

    const refreshCache = useCallback(() => {
        return fetchListings(true);
    }, []);

    // Persist filters to localStorage
    useEffect(() => {
        localStorage.setItem('trio_filters', JSON.stringify(filters));

        setIsFiltering(true);
        const handler = setTimeout(() => {
            setDebouncedFilters(filters);
            setIsFiltering(false);
        }, 300);

        return () => clearTimeout(handler);
    }, [filters]);

    // Persist favorites to localStorage
    useEffect(() => {
        localStorage.setItem('trio_favorites', JSON.stringify(favorites));
    }, [favorites]);

    // Memoize filtered listings using debounced filters
    const filteredListings = useMemo(() => {
        let filtered = listings;
        const searchTermLower = debouncedFilters.searchTerm?.toLowerCase();
        const categoryFilter = debouncedFilters.category;
        const bedroomsFilter = debouncedFilters.bedrooms;
        const priceMaxFilter = debouncedFilters.priceMax;
        const amenitiesLower = debouncedFilters.amenities?.map(a => a.toLowerCase()) || [];

        // Keyword/Search filter
        if (searchTermLower) {
            filtered = filtered.filter(l =>
                l.title?.toLowerCase().includes(searchTermLower) ||
                l.location?.toLowerCase().includes(searchTermLower) ||
                l.type?.toLowerCase().includes(searchTermLower) ||
                l.description?.toLowerCase().includes(searchTermLower)
            );
        }

        if (categoryFilter) {
            filtered = filtered.filter(l => l.category === categoryFilter);
        }

        if (bedroomsFilter) {
            filtered = filtered.filter(l =>
                l.description?.includes(bedroomsFilter) ||
                l.title?.includes(bedroomsFilter)
            );
        }

        if (priceMaxFilter) {
            filtered = filtered.filter(l => l.priceNumeric <= priceMaxFilter);
        }

        if (amenitiesLower.length > 0) {
            filtered = filtered.filter(l =>
                amenitiesLower.every(a => l.description?.toLowerCase().includes(a))
            );
        }

        // Map for favorites only on the filtered result
        return filtered.map(item => ({
            ...item,
            isFavorite: favorites.includes(item.id)
        }));
    }, [listings, debouncedFilters, favorites]);

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const toggleFavorite = useCallback((id) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    }, []);

    const resetFilters = useCallback(() => {
        const defaultFilters = {
            searchTerm: '',
            category: '',
            bedrooms: '',
            priceMin: 0,
            priceMax: 50000000,
            amenities: []
        };
        setFilters(defaultFilters);
    }, []);

    const updateListing = useCallback((id, updates) => {
        // Update local state
        setListings(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));

        // Update cache if it exists
        if (listingsCache) {
            listingsCache = listingsCache.map(item =>
                item.id === id ? { ...item, ...updates } : item
            );
        }
    }, []);

    const removeListing = useCallback((id) => {
        // Update local state
        setListings(prev => prev.filter(item => item.id !== id));

        // Update cache if it exists
        if (listingsCache) {
            listingsCache = listingsCache.filter(item => item.id !== id);
        }
    }, []);

    return {
        listings: filteredListings,
        allListings: listings, // Exposed for Admin
        refreshCache,          // Exposed for Admin
        updateListing,         // New: for optimistic updates
        removeListing,         // New: for optimistic deletions
        filters,
        favorites,
        handleFilterChange,
        toggleFavorite,
        resetFilters,
        isFiltering,
        loading,
        error,
        totalCount: filteredListings.length,
    };
};

export default useListings;
