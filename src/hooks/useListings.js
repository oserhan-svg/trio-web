import { useState, useMemo, useCallback, useEffect } from 'react';
import config from '../config';

// Simple in-memory cache to store API responses
let listingsCache = null;

const useListings = () => {
    const [listings, setListings] = useState(listingsCache || []);
    const [loading, setLoading] = useState(!listingsCache);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);

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
    const fetchListings = useCallback(async (currentPage, currentLimit, activeFilters) => {
        try {
            setLoading(true);

            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: currentLimit,
            });

            if (activeFilters.searchTerm) queryParams.append('searchTerm', activeFilters.searchTerm);
            if (activeFilters.category) queryParams.append('category', activeFilters.category);
            if (activeFilters.bedrooms) queryParams.append('bedrooms', activeFilters.bedrooms);
            if (activeFilters.priceMax && activeFilters.priceMax < 50000000) queryParams.append('priceMax', activeFilters.priceMax);
            if (activeFilters.amenities && activeFilters.amenities.length > 0) queryParams.append('amenities', activeFilters.amenities.join(','));

            const response = await fetch(`${config.API_BASE_URL}/listings?${queryParams.toString()}`);

            if (!response.ok) {
                if (response.status === 429) throw new Error('Çok fazla istek gönderildi. Lütfen bir süre bekleyin.');
                if (response.status === 403) throw new Error('Erişim engellendi (CORS veya Güvenlik).');
                if (response.status === 500) throw new Error('Sunucu hatası. Teknik ekip bilgilendirildi.');
                throw new Error('İlanlar yüklenirken bir hata oluştu');
            }

            const json = await response.json();
            const data = json.data || [];

            if (json.pagination) {
                setTotalPages(json.pagination.totalPages);
                setTotalItems(json.pagination.total);
            }

            // Pre-calculate numeric price for efficient filtering
            const normalizedData = data.map(item => ({
                ...item,
                priceNumeric: parseInt(item.price?.split(',')[0]?.replace(/[^\d]/g, '')) || 0
            }));

            // Update cache
            listingsCache = normalizedData;

            setListings(normalizedData);
            setError(null);
        } catch (err) {
            console.error('Error fetching listings:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []); // Removed unused dependencies page, limit, debouncedFilters

    useEffect(() => {
        // Reset to page 1 when filters change (debouncedFilters update)
        setPage(1);
    }, [debouncedFilters]);

    useEffect(() => {
        fetchListings(page, limit, debouncedFilters);
    }, [page, limit, debouncedFilters, fetchListings]);

    const refreshCache = useCallback(() => {
        return fetchListings(page, limit, debouncedFilters);
    }, [fetchListings, page, limit, debouncedFilters]);

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

    // Map for favorites only on the fetched result (filtering is now backend-side)
    const filteredListings = useMemo(() => {
        return listings.map(item => ({
            ...item,
            isFavorite: favorites.includes(item.id)
        }));
    }, [listings, favorites]);

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
        totalCount: totalItems,
        page,
        setPage,
        totalPages,
        limit,
        setLimit,
    };
};

export default useListings;
