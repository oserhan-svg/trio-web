import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useListings from '../useListings.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
}

describe('useListings', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    localStorageMock.clear();
    // Reset vi mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('handles 429 error correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429
    });

    const { result } = renderHook(() => useListings());

    // Wait for the initial fetch to complete
    await waitFor(() => {
        expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Çok fazla istek gönderildi. Lütfen bir süre bekleyin.');
  });

  it('handles 403 error correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403
    });

    const { result } = renderHook(() => useListings());

    await waitFor(() => {
        expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Erişim engellendi (CORS veya Güvenlik).');
  });

  it('handles 500 error correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500
    });

    const { result } = renderHook(() => useListings());

    await waitFor(() => {
        expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Sunucu hatası. Teknik ekip bilgilendirildi.');
  });

  it('handles general error correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404
    });

    const { result } = renderHook(() => useListings());

    await waitFor(() => {
        expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('İlanlar yüklenirken bir hata oluştu');
  });

  it('handles network error correctly', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useListings());

    await waitFor(() => {
        expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
  });
});
