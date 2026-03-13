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
const searchTermLower = 'a';

console.time('Baseline (on-the-fly toLowerCase)');
let filteredBaseline = data.filter(l =>
    l.title?.toLowerCase().includes(searchTermLower) ||
    l.location?.toLowerCase().includes(searchTermLower) ||
    l.type?.toLowerCase().includes(searchTermLower) ||
    l.description?.toLowerCase().includes(searchTermLower)
);
console.timeEnd('Baseline (on-the-fly toLowerCase)');

console.time('Pre-computing lower case');
const normalizedData = data.map(item => ({
    ...item,
    titleLower: item.title?.toLowerCase(),
    locationLower: item.location?.toLowerCase(),
    typeLower: item.type?.toLowerCase(),
    descriptionLower: item.description?.toLowerCase()
}));
console.timeEnd('Pre-computing lower case');

console.time('Optimized (pre-computed toLowerCase)');
let filteredOptimized = normalizedData.filter(l =>
    l.titleLower?.includes(searchTermLower) ||
    l.locationLower?.includes(searchTermLower) ||
    l.typeLower?.includes(searchTermLower) ||
    l.descriptionLower?.includes(searchTermLower)
);
console.timeEnd('Optimized (pre-computed toLowerCase)');

console.log(`Baseline count: ${filteredBaseline.length}, Optimized count: ${filteredOptimized.length}`);
