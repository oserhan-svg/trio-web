import { performance } from 'perf_hooks';

const NUM_ITEMS = 10000;
const NUM_FAVORITES = 500;

// Create dummy data
const filtered = Array.from({ length: NUM_ITEMS }, (_, i) => ({
    id: `id_${i}`,
    title: `Listing ${i}`,
    priceNumeric: 1000 + i,
}));

const favorites = Array.from({ length: NUM_FAVORITES }, (_, i) => `id_${Math.floor(Math.random() * NUM_ITEMS)}`);

function runArrayIncludes() {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
        filtered.map(item => ({
            ...item,
            isFavorite: favorites.includes(item.id)
        }));
    }
    return performance.now() - start;
}

function runSetHas() {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
        const favoritesSet = new Set(favorites);
        filtered.map(item => ({
            ...item,
            isFavorite: favoritesSet.has(item.id)
        }));
    }
    return performance.now() - start;
}

console.log("Warming up...");
runArrayIncludes();
runSetHas();

console.log("Running benchmarks...");
const timeArray = runArrayIncludes();
const timeSet = runSetHas();

console.log(`Array includes (Baseline): ${timeArray.toFixed(2)} ms`);
console.log(`Set has (Optimized): ${timeSet.toFixed(2)} ms`);
console.log(`Improvement: ${((timeArray - timeSet) / timeArray * 100).toFixed(2)}%`);
