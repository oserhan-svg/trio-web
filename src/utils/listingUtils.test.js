import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNumericPrice } from './listingUtils.js';

test('parseNumericPrice', async (t) => {
    await t.test('parses standard Turkish price formats', () => {
        assert.equal(parseNumericPrice('5.500.000 TL'), 5500000);
        assert.equal(parseNumericPrice('12.345 ₺'), 12345);
        assert.equal(parseNumericPrice('987,654 TL'), 987);
    });

    await t.test('handles decimal commas by dropping the decimal part', () => {
        assert.equal(parseNumericPrice('5.500.000,00 TL'), 5500000);
        assert.equal(parseNumericPrice('1.234,56'), 1234);
    });

    await t.test('handles strings with only numbers', () => {
        assert.equal(parseNumericPrice('1000000'), 1000000);
        assert.equal(parseNumericPrice('0'), 0);
    });

    await t.test('returns 0 for falsy inputs', () => {
        assert.equal(parseNumericPrice(null), 0);
        assert.equal(parseNumericPrice(undefined), 0);
        assert.equal(parseNumericPrice(''), 0);
    });

    await t.test('returns 0 for strings without digits', () => {
        assert.equal(parseNumericPrice('Fiyat Belirtilmemiş'), 0);
        assert.equal(parseNumericPrice('TL'), 0);
    });
});
