import { performance } from 'perf_hooks';

// Simulate the old handleAmenityToggle
function toggleAmenityArray(amenities, amenityToToggle) {
    return amenities.includes(amenityToToggle)
        ? amenities.filter(a => a !== amenityToToggle)
        : [...amenities, amenityToToggle];
}

// Simulate the new handleAmenityToggle using Set
function toggleAmenitySet(amenitiesSet, amenityToToggle) {
    const newSet = new Set(amenitiesSet);
    if (newSet.has(amenityToToggle)) {
        newSet.delete(amenityToToggle);
    } else {
        newSet.add(amenityToToggle);
    }
    return newSet;
}

const ITERATIONS = 100000;
const AMENITIES_LIST = ['pool', 'garden', 'parking', 'sea-view', 'gym', 'sauna', 'balcony', 'elevator', 'security', 'playground', 'tennis-court', 'basketball-court', 'smart-home', 'fireplace', 'bbq'];
const initialAmenities = ['pool', 'parking', 'sauna', 'elevator', 'security'];

// Warmup
for (let i = 0; i < 1000; i++) {
    toggleAmenityArray(initialAmenities, 'gym');
    toggleAmenitySet(new Set(initialAmenities), 'gym');
}

// Benchmark Array
let arrayTime = 0;
for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    let current = initialAmenities;
    for (const amenity of AMENITIES_LIST) {
        current = toggleAmenityArray(current, amenity);
    }
    const end = performance.now();
    arrayTime += (end - start);
}

// Benchmark Set
let setTime = 0;
for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    let current = new Set(initialAmenities);
    for (const amenity of AMENITIES_LIST) {
        current = toggleAmenitySet(current, amenity);
    }
    const end = performance.now();
    setTime += (end - start);
}

console.log(`Array Implementation: ${arrayTime.toFixed(2)} ms`);
console.log(`Set Implementation: ${setTime.toFixed(2)} ms`);
console.log(`Speedup: ${(arrayTime / setTime).toFixed(2)}x`);
