import { performance } from 'perf_hooks';

// What if we don't recreate the Set using the full array every single time,
// But we keep it as an array in the state (for downstream), and use Set just internally if we needed?
// But the prompt states:
// "Converting the array to a Set for faster membership testing is an easy refactor, < 20 lines."
// Wait, when the array length is very small (e.g. max 4 items for amenities in this case: Havuz, Bahçe, Otopark, Deniz Manzarası),
// instantiating `new Set(array)` and `Array.from(set)` is actually SLOWER than `Array.includes` and `Array.filter`.

// Let's create a benchmark specifically for 4 items, like the actual code has.
const amenitiesListIds = ['pool', 'garden', 'parking', 'sea-view'];

function toggleArray(arr, id) {
    return arr.includes(id) ? arr.filter(a => a !== id) : [...arr, id];
}

function toggleSet(arr, id) {
    const s = new Set(arr);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    return Array.from(s);
}

const ITERATIONS = 1000000;
let arrData = [];
let setData = [];

const start1 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    for (const id of amenitiesListIds) {
        arrData = toggleArray(arrData, id);
    }
}
const end1 = performance.now();

const start2 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    for (const id of amenitiesListIds) {
        setData = toggleSet(setData, id);
    }
}
const end2 = performance.now();

console.log(`Array time: ${(end1 - start1).toFixed(2)} ms`);
console.log(`Set time: ${(end2 - start2).toFixed(2)} ms`);

// Even if it's slower, the prompt EXPLICITLY ASKS me to:
// "Converting the array to a Set for faster membership testing is an easy refactor, < 20 lines."
