const crypto = require('crypto');

// Generate mock data
const generateData = (count) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        title: crypto.randomBytes(16).toString('hex').toUpperCase(),
        location: crypto.randomBytes(8).toString('hex').toUpperCase(),
        type: crypto.randomBytes(4).toString('hex').toUpperCase(),
        description: crypto.randomBytes(64).toString('hex').toUpperCase(),
    }));
};

const data = generateData(100000);
const searches = ['a', 'b', 'c', 'd', 'e', 'f', '1', '2', '3', '4'];

// BASELINE
console.time('Baseline Total (including setup)');
const data1 = data.map(item => ({...item})); // simulate fetch & map

let baselineCount = 0;
for (const term of searches) {
    let filteredBaseline = data1.filter(l =>
        l.title?.toLowerCase().includes(term) ||
        l.location?.toLowerCase().includes(term) ||
        l.type?.toLowerCase().includes(term) ||
        l.description?.toLowerCase().includes(term)
    );
    baselineCount += filteredBaseline.length;
}
console.timeEnd('Baseline Total (including setup)');


// OPTIMIZED - only pre-compute lowercases
console.time('Optimized Total (including setup)');
const normalizedData = data.map(item => ({
    ...item,
    titleLower: item.title?.toLowerCase(),
    locationLower: item.location?.toLowerCase(),
    typeLower: item.type?.toLowerCase(),
    descriptionLower: item.description?.toLowerCase()
}));

let optimizedCount = 0;
for (const term of searches) {
    let filteredOptimized = normalizedData.filter(l =>
        l.titleLower?.includes(term) ||
        l.locationLower?.includes(term) ||
        l.typeLower?.includes(term) ||
        l.descriptionLower?.includes(term)
    );
    optimizedCount += filteredOptimized.length;
}
console.timeEnd('Optimized Total (including setup)');

// REALISTIC REACT USE CASE (many render cycles with same data)
console.time('Baseline (50 renders)');
let bCount2 = 0;
for(let i=0; i<50; i++) {
    for (const term of searches) {
        let filteredBaseline = data1.filter(l =>
            l.title?.toLowerCase().includes(term) ||
            l.location?.toLowerCase().includes(term) ||
            l.type?.toLowerCase().includes(term) ||
            l.description?.toLowerCase().includes(term)
        );
        bCount2 += filteredBaseline.length;
    }
}
console.timeEnd('Baseline (50 renders)');

console.time('Optimized (50 renders)');
let oCount2 = 0;
for(let i=0; i<50; i++) {
    for (const term of searches) {
        let filteredOptimized = normalizedData.filter(l =>
            l.titleLower?.includes(term) ||
            l.locationLower?.includes(term) ||
            l.typeLower?.includes(term) ||
            l.descriptionLower?.includes(term)
        );
        oCount2 += filteredOptimized.length;
    }
}
console.timeEnd('Optimized (50 renders)');


console.log(`Baseline count: ${baselineCount}, Optimized count: ${optimizedCount}`);
