import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getListingStatus } from './listingUtils.js';

describe('getListingStatus', () => {
    it('should correctly identify a sold listing', () => {
        const result = getListingStatus(0, '1000', 'Title', 'Description', 'sold');
        assert.deepStrictEqual(result, {
            isSold: true,
            isPassive: false,
            isNew: false,
            isFirsat: false,
            isPremium: false
        });
    });

    it('should correctly identify a passive listing', () => {
        const result = getListingStatus(0, '1000', 'Title', 'Description', 'passive');
        assert.deepStrictEqual(result, {
            isSold: false,
            isPassive: true,
            isNew: false,
            isFirsat: false,
            isPremium: false
        });
    });

    it('should correctly identify a new listing', () => {
        const recentId = Date.now() - 3 * 24 * 60 * 60 * 1000; // 3 days ago
        const result = getListingStatus(recentId, '1000', 'Title', 'Description', 'active');
        assert.deepStrictEqual(result, {
            isSold: false,
            isPassive: false,
            isNew: true,
            isFirsat: false,
            isPremium: false
        });
    });

    it('should not mark a 8-day old listing as new', () => {
        const oldId = Date.now() - 8 * 24 * 60 * 60 * 1000; // 8 days ago
        const result = getListingStatus(oldId, '1000', 'Title', 'Description', 'active');
        assert.deepStrictEqual(result, {
            isSold: false,
            isPassive: false,
            isNew: false,
            isFirsat: false,
            isPremium: true
        });
    });

    it('should correctly identify a fırsat listing based on price', () => {
        const oldId = Date.now() - 8 * 24 * 60 * 60 * 1000;
        const result = getListingStatus(oldId, 'Fırsat 1000', 'Title', 'Description', 'active');
        assert.deepStrictEqual(result, {
            isSold: false,
            isPassive: false,
            isNew: false,
            isFirsat: true,
            isPremium: false
        });
    });

    it('should correctly identify a fırsat listing based on title', () => {
        const oldId = Date.now() - 8 * 24 * 60 * 60 * 1000;
        const result = getListingStatus(oldId, '1000', 'fırsat Title', 'Description', 'active');
        assert.deepStrictEqual(result, {
            isSold: false,
            isPassive: false,
            isNew: false,
            isFirsat: true,
            isPremium: false
        });
    });

    it('should correctly identify a fırsat listing based on description', () => {
        const oldId = Date.now() - 8 * 24 * 60 * 60 * 1000;
        const result = getListingStatus(oldId, '1000', 'Title', 'This is a fırsat description', 'active');
        assert.deepStrictEqual(result, {
            isSold: false,
            isPassive: false,
            isNew: false,
            isFirsat: true,
            isPremium: false
        });
    });

    it('should correctly identify a premium listing', () => {
        const oldId = Date.now() - 8 * 24 * 60 * 60 * 1000;
        const result = getListingStatus(oldId, '1000', 'Title', 'Description', 'active');
        assert.deepStrictEqual(result, {
            isSold: false,
            isPassive: false,
            isNew: false,
            isFirsat: false,
            isPremium: true
        });
    });

    it('should not mark a listing as new or fırsat if it is sold', () => {
        const recentId = Date.now() - 3 * 24 * 60 * 60 * 1000;
        const result = getListingStatus(recentId, 'Fırsat 1000', 'Title', 'Description', 'sold');
        assert.deepStrictEqual(result, {
            isSold: true,
            isPassive: false,
            isNew: false,
            isFirsat: false,
            isPremium: false
        });
    });

    it('should not mark a listing as new or fırsat if it is passive', () => {
        const recentId = Date.now() - 3 * 24 * 60 * 60 * 1000;
        const result = getListingStatus(recentId, 'Fırsat 1000', 'Title', 'Description', 'passive');
        assert.deepStrictEqual(result, {
            isSold: false,
            isPassive: true,
            isNew: false,
            isFirsat: false,
            isPremium: false
        });
    });

    it('should handle null or undefined gracefully', () => {
        const oldId = Date.now() - 8 * 24 * 60 * 60 * 1000;
        const result = getListingStatus(oldId, null, undefined, null, 'active');
        assert.deepStrictEqual(result, {
            isSold: false,
            isPassive: false,
            isNew: false,
            isFirsat: false,
            isPremium: true
        });
    });
});
