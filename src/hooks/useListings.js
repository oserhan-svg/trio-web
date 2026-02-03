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

        // Keyword/Search filter
        if (debouncedFilters.searchTerm) {
            const term = debouncedFilters.searchTerm.toLowerCase();
            filtered = filtered.filter(l =>
                l.title?.toLowerCase().includes(term) ||
                l.location?.toLowerCase().includes(term) ||
                l.type?.toLowerCase().includes(term) ||
                l.description?.toLowerCase().includes(term)
            );
        }

        if (debouncedFilters.category) {
            filtered = filtered.filter(l => l.category === debouncedFilters.category);
        }

        if (debouncedFilters.bedrooms) {
            filtered = filtered.filter(l =>
                l.description?.includes(debouncedFilters.bedrooms) ||
                l.title?.includes(debouncedFilters.bedrooms)
            );
        }

        if (debouncedFilters.priceMax) {
            filtered = filtered.filter(l => l.priceNumeric <= debouncedFilters.priceMax);
        }

        if (debouncedFilters.amenities?.length > 0) {
            filtered = filtered.filter(l =>
                debouncedFilters.amenities.every(a => l.description?.toLowerCase().includes(a.toLowerCase()))
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
