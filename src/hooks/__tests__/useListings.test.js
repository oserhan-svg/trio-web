import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useListings from '../useListings.js';

describe('useListings removeListing', () => {
    it('should remove a listing from state', async () => {
        const { result } = renderHook(() => useListings());

        // Wait for fetch to complete and state to update
        await waitFor(() => {
            expect(result.current.allListings).toHaveLength(2);
        });

        // Remove listing with ID 1
        act(() => {
            result.current.removeListing(1);
        });

        // Check new state
        expect(result.current.allListings).toHaveLength(1);
        expect(result.current.allListings[0].id).toBe(2);
    });
});
