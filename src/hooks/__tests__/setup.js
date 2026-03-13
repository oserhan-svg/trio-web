// Mock localStorage
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

// Mock fetch
globalThis.fetch = async () => ({
  ok: true,
  json: async () => [
    { id: 1, title: 'Listing 1', price: '100,00' },
    { id: 2, title: 'Listing 2', price: '200,00' }
  ]
});
