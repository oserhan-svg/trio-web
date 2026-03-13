import { performance } from 'perf_hooks';

// Simulate the old handleAmenityToggle inside setFilters
function toggleAmenityOld(filters, amenityToToggle) {
    const newAmenities = filters.amenities.includes(amenityToToggle)
        ? filters.amenities.filter(a => a !== amenityToToggle)
        : [...filters.amenities, amenityToToggle];
    return { ...filters, amenities: newAmenities };
}

// Simulate the new handleAmenityToggle using Set
function toggleAmenityNewSet(filters, amenityToToggle) {
    const newAmenitiesSet = new Set(filters.amenities);
    if (newAmenitiesSet.has(amenityToToggle)) {
        newAmenitiesSet.delete(amenityToToggle);
    } else {
        newAmenitiesSet.add(amenityToToggle);
    }
    return { ...filters, amenities: Array.from(newAmenitiesSet) };
}

const ITERATIONS = 100000;
const AMENITIES_LIST = ['pool', 'garden', 'parking', 'sea-view', 'gym', 'sauna', 'balcony', 'elevator', 'security', 'playground', 'tennis-court', 'basketball-court', 'smart-home', 'fireplace', 'bbq'];
const initialFilters = { amenities: ['pool', 'parking', 'sauna', 'elevator', 'security'] };

// Warmup
for (let i = 0; i < 1000; i++) {
    toggleAmenityOld(initialFilters, 'gym');
    toggleAmenityNewSet(initialFilters, 'gym');
}

// Benchmark Old Array Method
let arrayTime = 0;
for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    let current = initialFilters;
    for (const amenity of AMENITIES_LIST) {
        current = toggleAmenityOld(current, amenity);
    }
    const end = performance.now();
    arrayTime += (end - start);
}

// Benchmark New Set Method
let setTime = 0;
for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    let current = initialFilters;
    for (const amenity of AMENITIES_LIST) {
        current = toggleAmenityNewSet(current, amenity);
    }
    const end = performance.now();
    setTime += (end - start);
}

console.log(`Array Implementation: ${arrayTime.toFixed(2)} ms`);
console.log(`Set Implementation: ${setTime.toFixed(2)} ms`);
console.log(`Speedup: ${(arrayTime / setTime).toFixed(2)}x`);
