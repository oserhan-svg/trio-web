import { test, describe, mock, afterEach, beforeEach } from 'node:test';
import assert from 'node:assert';
import { fetchPropertyDetail, prefetchProperty } from './api.js';
import config from '../config.js';

describe('api utility', () => {
    let originalFetch;

    beforeEach(() => {
        // Save the original fetch
        originalFetch = global.fetch;
    });

    afterEach(() => {
        // Restore fetch and reset mocks after each test
        global.fetch = originalFetch;
        mock.restoreAll();

        // Reset the cache for a clean state in the next test
        // This is a bit hacky because we don't have direct access to the cache map
        // but we can force fetch by using a unique id for each test or mocking Date.now
    });

    describe('fetchPropertyDetail', () => {
        test('should throw an error when response is not ok', async () => {
            // Mock fetch to return a non-ok response
            const mockFetch = mock.fn(async () => {
                return {
                    ok: false,
                    status: 404,
                    statusText: 'Not Found'
                };
            });
            global.fetch = mockFetch;

            const propertyId = 'error-test-id';

            // Assert that the function rejects with the expected error message
            await assert.rejects(
                () => fetchPropertyDetail(propertyId),
                (err) => {
                    assert.strictEqual(err.message, 'İlan bulunamadı');
                    return true;
                }
            );

            // Verify fetch was called with correct URL
            assert.strictEqual(mockFetch.mock.callCount(), 1);
            const callArgs = mockFetch.mock.calls[0].arguments;
            assert.strictEqual(callArgs[0], `${config.API_BASE_URL}/listings/${propertyId}`);
        });

        test('should fetch and return property data on success', async () => {
            const mockData = { id: 'success-test-id', title: 'Test Property' };

            // Mock fetch to return successful response
            const mockFetch = mock.fn(async () => {
                return {
                    ok: true,
                    json: async () => mockData
                };
            });
            global.fetch = mockFetch;

            const propertyId = 'success-test-id';
            const data = await fetchPropertyDetail(propertyId);

            assert.deepStrictEqual(data, mockData);
            assert.strictEqual(mockFetch.mock.callCount(), 1);
        });

        test('should return cached data if fresh', async () => {
            const mockData = { id: 'cache-test-id', title: 'Cache Property' };

            // Mock fetch to return successful response
            const mockFetch = mock.fn(async () => {
                return {
                    ok: true,
                    json: async () => mockData
                };
            });
            global.fetch = mockFetch;

            const propertyId = 'cache-test-id';

            // First call - should hit the mock fetch
            const data1 = await fetchPropertyDetail(propertyId);
            assert.deepStrictEqual(data1, mockData);
            assert.strictEqual(mockFetch.mock.callCount(), 1);

            // Second call - should return from cache, mock fetch count shouldn't increase
            const data2 = await fetchPropertyDetail(propertyId);
            assert.deepStrictEqual(data2, mockData);
            assert.strictEqual(mockFetch.mock.callCount(), 1); // Still 1
        });
    });
});
