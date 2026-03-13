import { test, describe } from 'node:test';
import assert from 'node:assert';
import { formatRooms } from './listingUtils.js';

describe('formatRooms', () => {
    test('should extract rooms from description', () => {
        assert.strictEqual(formatRooms('Spacious 3+1 apartment in city center', 'Beautiful Apartment'), '3+1');
    });

    test('should extract rooms from title if description lacks it', () => {
        assert.strictEqual(formatRooms('Spacious apartment in city center', 'Beautiful 2+1 Apartment'), '2+1');
    });

    test('should prioritize description over title when both have room format', () => {
        assert.strictEqual(formatRooms('Spacious 3+1 apartment', 'Beautiful 2+1 Apartment'), '3+1');
    });

    test('should handle null/undefined inputs', () => {
        assert.strictEqual(formatRooms(null, null), '---');
        assert.strictEqual(formatRooms(undefined, undefined), '---');
    });

    test('should handle empty strings', () => {
        assert.strictEqual(formatRooms('', ''), '---');
    });

    test('should return "---" for malformed inputs without exact match', () => {
        assert.strictEqual(formatRooms('3 rooms', '2 bedrooms'), '---');
        assert.strictEqual(formatRooms('3+ 1', '2 +1'), '---');
    });

    test('should extract correctly when only description is provided', () => {
        assert.strictEqual(formatRooms('Spacious 4+2 villa'), '4+2');
    });

    test('should extract correctly when only title is provided', () => {
        assert.strictEqual(formatRooms(undefined, 'Cozy 1+0 studio'), '1+0');
        assert.strictEqual(formatRooms(null, 'Cozy 1+0 studio'), '1+0');
    });

    test('should extract rooms from multi-digit formats', () => {
        assert.strictEqual(formatRooms('Large 10+2 mansion', 'Mansion'), '10+2');
    });
});
