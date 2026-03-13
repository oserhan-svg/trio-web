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

// We simulate 10 search operations
const searches = ['a', 'b', 'c', 'd', 'e', 'f', '1', '2', '3', '4'];

console.time('Baseline (on-the-fly toLowerCase)');
let baselineCount = 0;
for (const term of searches) {
    let filteredBaseline = data.filter(l =>
        l.title?.toLowerCase().includes(term) ||
        l.location?.toLowerCase().includes(term) ||
        l.type?.toLowerCase().includes(term) ||
        l.description?.toLowerCase().includes(term)
    );
    baselineCount += filteredBaseline.length;
}
console.timeEnd('Baseline (on-the-fly toLowerCase)');


console.time('Optimized (with pre-computation)');
const normalizedData = data.map(item => ({
    ...item,
    searchableText: `${item.title || ''} ${item.location || ''} ${item.type || ''} ${item.description || ''}`.toLowerCase()
}));

let optimizedCount = 0;
for (const term of searches) {
    let filteredOptimized = normalizedData.filter(l =>
        l.searchableText.includes(term)
    );
    optimizedCount += filteredOptimized.length;
}
console.timeEnd('Optimized (with pre-computation)');

console.log(`Baseline count: ${baselineCount}, Optimized count: ${optimizedCount}`);
