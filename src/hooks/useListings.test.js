import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useListings from './useListings';
import config from '../config';

// Mock config to avoid undefined errors
vi.mock('../config', () => ({
    default: {
        API_BASE_URL: 'http://localhost:3000/api',
        CACHE_DURATION_MS: 60000,
    }
}));

describe('useListings hook - localStorage parsing', () => {
    let originalConsoleError;

    beforeEach(() => {
        // Clear localStorage
        localStorage.clear();

        // Mock fetch to prevent actual network requests during hook mount
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            })
        );

        // Spy on console.error to avoid test noise and check if it was called
        originalConsoleError = console.error;
        console.error = vi.fn();
    });

    afterEach(() => {
        // Restore mocks
        vi.restoreAllMocks();
        console.error = originalConsoleError;
        localStorage.clear();
    });

    it('should use default filters when localStorage is empty', () => {
        const { result } = renderHook(() => useListings());

        expect(result.current.filters).toEqual({
            searchTerm: '',
            category: '',
            bedrooms: '',
            priceMin: 0,
            priceMax: 50000000,
            amenities: []
        });
        expect(console.error).not.toHaveBeenCalled();
    });

    it('should parse and use valid filters from localStorage', () => {
        const savedFilters = {
            searchTerm: 'Villa',
            category: 'residential',
            bedrooms: '3',
            priceMin: 100000,
            priceMax: 500000,
            amenities: ['pool']
        };
        localStorage.setItem('trio_filters', JSON.stringify(savedFilters));

        const { result } = renderHook(() => useListings());

        expect(result.current.filters).toEqual(savedFilters);
        expect(console.error).not.toHaveBeenCalled();
    });

    it('should catch JSON.parse error, log it, and use default filters when localStorage has invalid data', () => {
        // Set invalid JSON in localStorage
        localStorage.setItem('trio_filters', 'invalid-json-{data');

        const { result } = renderHook(() => useListings());

        // Should fall back to default filters
        expect(result.current.filters).toEqual({
            searchTerm: '',
            category: '',
            bedrooms: '',
            priceMin: 0,
            priceMax: 50000000,
            amenities: []
        });

        // Verify console.error was called with the right message
        expect(console.error).toHaveBeenCalledWith(
            'Failed to parse filters from localStorage',
            expect.any(SyntaxError)
        );
    });
});
