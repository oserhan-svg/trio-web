import { performance } from 'perf_hooks';

const AMENITIES_LIST = ['pool', 'garden', 'parking', 'sea-view', 'gym', 'sauna', 'balcony', 'elevator', 'security', 'playground', 'tennis-court', 'basketball-court', 'smart-home', 'fireplace', 'bbq'];
const initialAmenities = ['pool', 'parking', 'sauna', 'elevator', 'security'];
const ITERATIONS = 200000;

function toggleAmenityNew(filters, amenity) {
    const amenitiesSet = new Set(filters.amenities);
    if (amenitiesSet.has(amenity)) {
        amenitiesSet.delete(amenity);
    } else {
        amenitiesSet.add(amenity);
    }
    return { ...filters, amenities: amenitiesSet };
}


// Warmup
let warmupFilters = { amenities: new Set(initialAmenities) };
for (let i = 0; i < 5000; i++) {
    for (const am of AMENITIES_LIST) {
        warmupFilters = toggleAmenityNew(warmupFilters, am);
    }
}

// Benchmark
let totalTime = 0;
let filters = { amenities: new Set(initialAmenities) };

const start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    for (const am of AMENITIES_LIST) {
        filters = toggleAmenityNew(filters, am);
    }
}
const end = performance.now();
totalTime = end - start;

console.log(`Total time for ${ITERATIONS} iterations (15 toggles each) with Set in State: ${totalTime.toFixed(2)} ms`);
