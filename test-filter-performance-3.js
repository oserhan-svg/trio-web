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
    // If we store a Set in state, or only use it internally
    // Let's assume we store array in state, but use set for faster toggle logic
    // Actually, Array.indexOf/includes vs Set creation overhead.

    // Instead of instantiating a Set on every render, we could store it as a Set if React allows.
    // However, React state should be immutable, Set mutation is not recommended.
    // So we would need to clone it.
    const newSet = new Set(filters.amenities);
    if (newSet.has(amenityToToggle)) {
        newSet.delete(amenityToToggle);
    } else {
        newSet.add(amenityToToggle);
    }
    return { ...filters, amenities: [...newSet] };
}

// What if we keep it as a Set in the state instead?
function toggleAmenityStateAsSet(filters, amenityToToggle) {
    const newAmenitiesSet = new Set(filters.amenitiesSet);
    if (newAmenitiesSet.has(amenityToToggle)) {
        newAmenitiesSet.delete(amenityToToggle);
    } else {
        newAmenitiesSet.add(amenityToToggle);
    }
    return { ...filters, amenitiesSet: newAmenitiesSet };
}


const ITERATIONS = 100000;
const AMENITIES_LIST = ['pool', 'garden', 'parking', 'sea-view', 'gym', 'sauna', 'balcony', 'elevator', 'security', 'playground', 'tennis-court', 'basketball-court', 'smart-home', 'fireplace', 'bbq'];

const initialFiltersArray = { amenities: ['pool', 'parking', 'sauna', 'elevator', 'security'] };
const initialFiltersSet = { amenitiesSet: new Set(['pool', 'parking', 'sauna', 'elevator', 'security']) };

// Warmup
for (let i = 0; i < 1000; i++) {
    toggleAmenityOld(initialFiltersArray, 'gym');
    toggleAmenityNewSet(initialFiltersArray, 'gym');
    toggleAmenityStateAsSet(initialFiltersSet, 'gym');
}

// Benchmark Old Array Method
let arrayTime = 0;
for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    let current = initialFiltersArray;
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
    let current = initialFiltersArray;
    for (const amenity of AMENITIES_LIST) {
        current = toggleAmenityNewSet(current, amenity);
    }
    const end = performance.now();
    setTime += (end - start);
}

// Benchmark State As Set Method
let stateSetTime = 0;
for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    let current = initialFiltersSet;
    for (const amenity of AMENITIES_LIST) {
        current = toggleAmenityStateAsSet(current, amenity);
    }
    const end = performance.now();
    stateSetTime += (end - start);
}

console.log(`Array Implementation: ${arrayTime.toFixed(2)} ms`);
console.log(`Set Implementation (clone): ${setTime.toFixed(2)} ms`);
console.log(`Set Implementation (state as set): ${stateSetTime.toFixed(2)} ms`);
console.log(`Speedup (state as set vs array): ${(arrayTime / stateSetTime).toFixed(2)}x`);
