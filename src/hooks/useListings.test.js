import { describe, it } from 'node:test';
import assert from 'node:assert';
import { renderHook, act } from '@testing-library/react';

// setup env
import.meta.env = { VITE_API_BASE_URL: 'http://test' };

// Setup dom
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: "http://localhost" });
global.window = dom.window;
global.document = dom.window.document;
// global.navigator is read-only in Node 22+

global.localStorage = {
  getItem: () => null,
  setItem: () => null,
  removeItem: () => null,
  clear: () => null,
};

global.matchMedia = global.matchMedia || function () {
    return {
        matches: false,
        addListener: function () { },
        removeListener: function () { }
    };
};

import useListings from './useListings.js';

describe('useListings hook - updateListing', () => {
  it('updates local state and listingsCache correctly', async () => {
    // mock fetch
    global.fetch = () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, title: 'Listing 1', price: '100,000' },
        { id: 2, title: 'Listing 2', price: '200,000' }
      ])
    });

    const { result, unmount } = renderHook(() => useListings());

    // initially fetching
    await act(async () => {
       await new Promise(r => setTimeout(r, 100)); // wait for fetch
    });

    // Check initial state
    assert.strictEqual(result.current.listings.length, 2);
    assert.strictEqual(result.current.listings[0].title, 'Listing 1');

    // Update listing
    act(() => {
      result.current.updateListing(1, { title: 'Listing 1 Updated', price: '150,000' });
    });

    // Check updated state
    assert.strictEqual(result.current.listings[0].title, 'Listing 1 Updated');
    assert.strictEqual(result.current.listings[0].price, '150,000');
    // Ensure the other listing is not modified
    assert.strictEqual(result.current.listings[1].title, 'Listing 2');

    // Unmount current hook to prevent memory leaks/interference
    unmount();

    // Render a new hook instance to verify that listingsCache was actually updated.
    // The new instance will initialize with listingsCache instead of fetching.
    const { result: newResult } = renderHook(() => useListings());

    // Check the cache-based initial state
    assert.strictEqual(newResult.current.listings.length, 2);
    assert.strictEqual(newResult.current.listings[0].title, 'Listing 1 Updated', 'listingsCache should have been updated');
    assert.strictEqual(newResult.current.listings[0].price, '150,000', 'listingsCache should have been updated');
    assert.strictEqual(newResult.current.listings[1].title, 'Listing 2', 'Unrelated items in listingsCache should be unaffected');
  });
});
