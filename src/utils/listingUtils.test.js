import test from 'node:test';
import assert from 'node:assert';
import { extractNumber } from './listingUtils.js';

test('extractNumber', async (t) => {
    await t.test('extracts a simple number', () => {
        const text = "123 meters";
        const regex = /\d+/;
        assert.strictEqual(extractNumber(text, regex), "123");
    });

    await t.test('returns null if no match', () => {
        const text = "no numbers here";
        const regex = /\d+/;
        assert.strictEqual(extractNumber(text, regex), null);
    });

    await t.test('handles null/undefined text gracefully', () => {
        const regex = /\d+/;
        assert.strictEqual(extractNumber(null, regex), null);
        assert.strictEqual(extractNumber(undefined, regex), null);
    });

    await t.test('extracts multiple groups according to regex', () => {
        const text = "Rooms: 3+1";
        const regex = /(\d+)\+(\d+)/;
        assert.strictEqual(extractNumber(text, regex), "3+1");
    });
});
