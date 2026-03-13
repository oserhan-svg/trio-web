import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useListings from './useListings';

describe('useListings hook - localStorage parsing error', () => {
    let originalConsoleError;
    let mockConsoleError;

    beforeEach(() => {
        originalConsoleError = console.error;
        mockConsoleError = vi.fn();
        console.error = mockConsoleError;

        // Clean localStorage
        localStorage.clear();

        // Mock fetch to prevent network errors in test logs
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            })
        );
    });

    afterEach(() => {
        console.error = originalConsoleError;
        vi.restoreAllMocks();
    });

    it('should fallback to empty array for favorites when localStorage throws error', () => {
        // Mock localStorage.getItem using vi.spyOn to override its behavior
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
            if (key === 'trio_favorites') {
                throw new Error('Simulated localStorage error');
            }
            return null;
        });

        const { result } = renderHook(() => useListings());

        expect(result.current.favorites).toEqual([]);
        expect(mockConsoleError).toHaveBeenCalledWith(
            'Failed to parse favorites from localStorage',
            expect.any(Error)
        );

        getItemSpy.mockRestore();
    });

    it('should fallback to empty array for favorites when localStorage has invalid JSON', () => {
        localStorage.setItem('trio_favorites', 'invalid-json');

        const { result } = renderHook(() => useListings());

        expect(result.current.favorites).toEqual([]);
        expect(mockConsoleError).toHaveBeenCalledWith(
            'Failed to parse favorites from localStorage',
            expect.any(Error)
        );
    });

    it('should fallback to default filters when localStorage has invalid JSON', () => {
        localStorage.setItem('trio_filters', 'invalid-json');

        const { result } = renderHook(() => useListings());

        const expectedDefaultFilters = {
            searchTerm: '',
            category: '',
            bedrooms: '',
            priceMin: 0,
            priceMax: 50000000,
            amenities: []
        };

        expect(result.current.filters).toEqual(expectedDefaultFilters);
        expect(mockConsoleError).toHaveBeenCalledWith(
            'Failed to parse filters from localStorage',
            expect.any(Error)
        );
    });
});
