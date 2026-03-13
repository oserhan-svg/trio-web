import { performance } from 'perf_hooks';
import fs from 'fs';

// This benchmark simulates the handleAmenityToggle function
// For the baseline, we'll use the Array implementation
// Once updated, we'll uncomment the new implementation.

// Data
const AMENITIES_LIST = ['pool', 'garden', 'parking', 'sea-view', 'gym', 'sauna', 'balcony', 'elevator', 'security', 'playground', 'tennis-court', 'basketball-court', 'smart-home', 'fireplace', 'bbq'];
const initialAmenities = ['pool', 'parking', 'sauna', 'elevator', 'security'];
const ITERATIONS = 200000;

function toggleAmenityOld(filters, amenity) {
    const newAmenities = filters.amenities.includes(amenity)
        ? filters.amenities.filter(a => a !== amenity)
        : [...filters.amenities, amenity];
    return { ...filters, amenities: newAmenities };
}

function toggleAmenityNew(filters, amenity) {
    const amenitiesSet = new Set(filters.amenities);
    if (amenitiesSet.has(amenity)) {
        amenitiesSet.delete(amenity);
    } else {
        amenitiesSet.add(amenity);
    }
    return { ...filters, amenities: Array.from(amenitiesSet) };
}

// Check which implementation is in the actual file by reading it
const code = fs.readFileSync('./src/components/Filters/FilterSidebar.jsx', 'utf8');
const isUsingSet = code.includes('new Set(prev.amenities)');

const toggleFn = isUsingSet ? toggleAmenityNew : toggleAmenityOld;

console.log(`Running benchmark with ${isUsingSet ? 'Set' : 'Array'} implementation...`);

// Warmup
let warmupFilters = { amenities: initialAmenities };
for (let i = 0; i < 5000; i++) {
    for (const am of AMENITIES_LIST) {
        warmupFilters = toggleFn(warmupFilters, am);
    }
}

// Benchmark
let totalTime = 0;
let filters = { amenities: initialAmenities };

const start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    for (const am of AMENITIES_LIST) {
        filters = toggleFn(filters, am);
    }
}
const end = performance.now();
totalTime = end - start;

console.log(`Total time for ${ITERATIONS} iterations (15 toggles each): ${totalTime.toFixed(2)} ms`);
