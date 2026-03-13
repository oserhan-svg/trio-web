import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice } from './listingUtils.js';

test('formatPrice formatting', async (t) => {
    await t.test('handles standard price with ,00', () => {
        assert.strictEqual(formatPrice('5.500.000,00 TL'), '5.500.000 TL');
        assert.strictEqual(formatPrice('1.250,00'), '1.250');
    });

    await t.test('handles falsy values', () => {
        assert.strictEqual(formatPrice(null), '---');
        assert.strictEqual(formatPrice(undefined), '---');
        assert.strictEqual(formatPrice(''), '---');
    });

    await t.test('does not remove ,00 if it is part of a larger number sequence', () => {
        assert.strictEqual(formatPrice('5.500,000 TL'), '5.500,000 TL');
    });

    await t.test('handles prices without ,00', () => {
        assert.strictEqual(formatPrice('5.500.000 TL'), '5.500.000 TL');
        assert.strictEqual(formatPrice('100'), '100');
    });
});
