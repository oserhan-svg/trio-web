import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { fetchPropertyDetail } from './api.js';

describe('fetchPropertyDetail', () => {
    let originalFetch;

    beforeEach(() => {
        originalFetch = global.fetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    test('should throw error when fetch response is not ok', async () => {
        global.fetch = async () => ({
            ok: false
        });

        await assert.rejects(
            fetchPropertyDetail('123'),
            new Error('İlan bulunamadı')
        );
    });

    test('should return data when fetch response is ok', async () => {
        const mockData = { id: '123', title: 'Test Property' };
        global.fetch = async () => ({
            ok: true,
            json: async () => mockData
        });

        const result = await fetchPropertyDetail('123');
        assert.deepEqual(result, mockData);
    });
});
