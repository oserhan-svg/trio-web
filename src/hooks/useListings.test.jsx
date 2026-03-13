import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useListings from './useListings';

// Mock config
vi.mock('../config', () => ({
    default: {
        API_BASE_URL: 'http://localhost:3000/api',
        CACHE_DURATION_MS: 300000,
    }
}));

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
            store[key] = value.toString();
        },
        clear: () => {
            store = {};
        }
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useListings - filteredListings edge cases', () => {
    const mockData = [
        {
            id: 1,
            title: 'Luxury Villa with Pool',
            location: 'Istanbul',
            type: 'Villa',
            description: 'Beautiful 4+1 villa. Amenities: pool, gym, wifi.',
            category: 'sale',
            price: '10,000,000 TL',
        },
        {
            id: 2,
            title: 'Cozy Apartment in City Center',
            location: 'Ankara',
            type: 'Apartment',
            description: 'Modern 2+1 apartment. Amenities: wifi, parking.',
            category: 'rent',
            price: '15,000 TL',
        },
        {
            id: 3,
            title: 'Spacious Office Space',
            location: 'Izmir',
            type: 'Office',
            description: 'Open plan office with sea view. Amenities: elevator, parking.',
            category: 'rent',
            price: '25,000 TL',
        },
        {
            id: 4,
            title: 'Empty Description Property',
            location: 'Bursa',
            type: 'House',
            description: '',
            category: 'sale',
            price: '5,000,000 TL',
        },
        {
            id: 5,
            title: 'Missing Type Property',
            location: 'Antalya',
            category: 'sale',
            price: '7,500,000 TL',
            description: 'Has pool.',
        }
    ];

    beforeEach(() => {
        window.localStorage.clear();
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockData),
            })
        );
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        vi.useRealTimers();
    });

    it('should initialize with all listings', async () => {
        const { result } = renderHook(() => useListings());

        vi.advanceTimersByTime(350); await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // if the module cache wasn't cleared, it might fetch from an earlier test.
        // to be sure, we can trigger refresh
        await act(async () => {
             await result.current.refreshCache();
        });

        expect(result.current.listings.length).toBe(5);
        expect(result.current.allListings.length).toBe(5);
        expect(result.current.totalCount).toBe(5);
    });

    it('should filter by search term (case-insensitive)', async () => {
        const { result } = renderHook(() => useListings());
        await act(async () => {
             await result.current.refreshCache();
        });

        // Filter by title
        act(() => {
            result.current.handleFilterChange({ searchTerm: 'villa' });
        });

        vi.advanceTimersByTime(350); await waitFor(() => {
            expect(result.current.isFiltering).toBe(false);
        });
        expect(result.current.listings.length).toBe(1);
        expect(result.current.listings[0].id).toBe(1);

        // Filter by location
        act(() => {
            result.current.handleFilterChange({ searchTerm: 'izmir' });
        });

        vi.advanceTimersByTime(350); await waitFor(() => {
            expect(result.current.isFiltering).toBe(false);
        });
        expect(result.current.listings.length).toBe(1);
        expect(result.current.listings[0].id).toBe(3);

        // Filter by description
        act(() => {
            result.current.handleFilterChange({ searchTerm: 'has pool' });
        });

        vi.advanceTimersByTime(350); await waitFor(() => {
            expect(result.current.isFiltering).toBe(false);
        });
        expect(result.current.listings.length).toBe(1);
        expect(result.current.listings[0].id).toBe(5);

        // Filter by type
        act(() => {
            result.current.handleFilterChange({ searchTerm: 'house' });
        });

        vi.advanceTimersByTime(350); await waitFor(() => {
            expect(result.current.isFiltering).toBe(false);
        });
        expect(result.current.listings.length).toBe(1);
        expect(result.current.listings[0].id).toBe(4);
    });

    it('should filter by category', async () => {
        const { result } = renderHook(() => useListings());
        await act(async () => {
             await result.current.refreshCache();
        });

        act(() => {
            result.current.handleFilterChange({ category: 'rent' });
        });

        vi.advanceTimersByTime(350); await waitFor(() => {
            expect(result.current.isFiltering).toBe(false);
        });

        expect(result.current.listings.length).toBe(2);
        expect(result.current.listings.every(l => l.category === 'rent')).toBe(true);
    });

    it('should filter by bedrooms in title or description', async () => {
        const { result } = renderHook(() => useListings());
        await act(async () => {
             await result.current.refreshCache();
        });

        act(() => {
            result.current.handleFilterChange({ bedrooms: '4+1' });
        });

        vi.advanceTimersByTime(350); await waitFor(() => {
            expect(result.current.isFiltering).toBe(false);
        });

        expect(result.current.listings.length).toBe(1);
        expect(result.current.listings[0].id).toBe(1);
    });

    it('should filter by priceMax', async () => {
        const { result } = renderHook(() => useListings());
        await act(async () => {
             await result.current.refreshCache();
        });

        act(() => {
            // The hook parses price via `parseInt(item.price?.split(',')[0]?.replace(/[^\d]/g, '')) || 0`
            // So "15,000 TL" becomes 15, "25,000 TL" becomes 25, "10,000,000 TL" becomes 10.
            // Price property #4 is "5,000,000 TL" (5), #5 is "7,500,000 TL" (7)
            result.current.handleFilterChange({ priceMax: 10 });
        });

        vi.advanceTimersByTime(350); await waitFor(() => {
            expect(result.current.isFiltering).toBe(false);
        });

        expect(result.current.listings.length).toBe(3);
        const ids = result.current.listings.map(l => l.id).sort();
        expect(ids).toEqual([1, 4, 5]); // 10, 5, 7 are <= 10
    });

    it('should filter by multiple amenities (case-insensitive)', async () => {
        const { result } = renderHook(() => useListings());
        await act(async () => {
             await result.current.refreshCache();
        });

        act(() => {
            result.current.handleFilterChange({ amenities: ['WiFi', 'PARKING'] });
        });

        vi.advanceTimersByTime(350); await waitFor(() => {
            expect(result.current.isFiltering).toBe(false);
        });

        expect(result.current.listings.length).toBe(1);
        expect(result.current.listings[0].id).toBe(2);
    });

    it('should apply multiple filters concurrently', async () => {
        const { result } = renderHook(() => useListings());
        await act(async () => {
             await result.current.refreshCache();
        });

        act(() => {
            result.current.handleFilterChange({
                category: 'sale',
                searchTerm: 'pool'
            });
        });

        vi.advanceTimersByTime(350); await waitFor(() => {
            expect(result.current.isFiltering).toBe(false);
        });

        // id 1 and id 5 both match category 'sale' and have 'pool' in description
        expect(result.current.listings.length).toBe(2);
        const ids = result.current.listings.map(l => l.id).sort();
        expect(ids).toEqual([1, 5]);
    });

    it('should handle edge cases with empty arrays and undefined values', async () => {
        const { result } = renderHook(() => useListings());
        await act(async () => {
             await result.current.refreshCache();
        });

        act(() => {
            result.current.handleFilterChange({
                searchTerm: '',
                category: '',
                bedrooms: '',
                priceMax: null,
                amenities: []
            });
        });

        vi.advanceTimersByTime(350); await waitFor(() => {
            expect(result.current.isFiltering).toBe(false);
        });

        expect(result.current.listings.length).toBe(5);
    });

    it('should handle listings with missing properties safely', async () => {
        const { result } = renderHook(() => useListings());
        await act(async () => {
             await result.current.refreshCache();
        });

        // Test with missing values filtering
        act(() => {
            result.current.handleFilterChange({
                searchTerm: 'Missing',
                amenities: ['pool']
            });
        });

        vi.advanceTimersByTime(350); await waitFor(() => {
            expect(result.current.isFiltering).toBe(false);
        });

        // id 5 has title "Missing Type Property" and description "Has pool."
        expect(result.current.listings.length).toBe(1);
        expect(result.current.listings[0].id).toBe(5);
    });
});
