import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateUnitPrice } from './listingUtils.js';

describe('calculateUnitPrice', () => {
    const testCases = [
        {
            name: 'Happy path: Area in description',
            price: '1.200.000 TL',
            description: 'Beautiful 120m2 apartment',
            title: 'Apartment',
            expected: '₺10.000 / m²'
        },
        {
            name: 'Happy path: Area in title, not in description',
            price: '1.200.000 TL',
            description: 'Beautiful apartment',
            title: '120m2 Apartment',
            expected: '₺10.000 / m²'
        },
        {
            name: 'Area in description with space before "m"',
            price: '1.200.000 TL',
            description: 'Beautiful 120 m2 apartment',
            title: 'Apartment',
            expected: '₺10.000 / m²'
        },
        {
            name: 'Area found in both, uses description first',
            price: '1.200.000 TL',
            description: 'Beautiful 120m2 apartment',
            title: '150m2 Apartment',
            expected: '₺10.000 / m²'
        },
        {
            name: 'Division by zero: No area found',
            price: '1.200.000 TL',
            description: 'Beautiful apartment',
            title: 'Apartment',
            expected: null
        },
        {
            name: 'Division by zero: Area evaluates to 0',
            price: '1.200.000 TL',
            description: 'Beautiful 0m2 apartment',
            title: 'Apartment',
            expected: null
        },
        {
            name: 'Invalid price',
            price: 'Invalid Price',
            description: '120m2',
            title: 'Apartment',
            expected: null
        },
        {
            name: 'Missing price',
            price: null,
            description: '120m2',
            title: 'Apartment',
            expected: null
        },
        {
            name: 'Missing description and title',
            price: '1.200.000 TL',
            description: null,
            title: null,
            expected: null
        },
        {
            name: 'Fractional result uses Math.floor',
            price: '1.000.000 TL',
            description: '3m2',
            title: 'Apartment',
            expected: '₺333.333 / m²'
        },
        {
            name: 'Large numbers with proper tr-TR formatting',
            price: '15.000.000 TL',
            description: '120m2',
            title: 'Apartment',
            expected: '₺125.000 / m²'
        }
    ];

    for (const tc of testCases) {
        it(`should handle ${tc.name}`, () => {
            const result = calculateUnitPrice(tc.price, tc.description, tc.title);
            assert.strictEqual(result, tc.expected);
        });
    }
});
