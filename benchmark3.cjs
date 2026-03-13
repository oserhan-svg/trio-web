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

console.time('Baseline Total (including setup)');
const data1 = data.map(item => ({...item})); // simulate fetching data

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


console.time('Optimized Total (including setup)');
const normalizedData = data.map(item => ({
    ...item,
    // Add pre-computed searchable string
    _searchStr: [item.title, item.location, item.type, item.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
}));

let optimizedCount = 0;
for (const term of searches) {
    let filteredOptimized = normalizedData.filter(l =>
        l._searchStr.includes(term)
    );
    optimizedCount += filteredOptimized.length;
}
console.timeEnd('Optimized Total (including setup)');

console.log(`Baseline count: ${baselineCount}, Optimized count: ${optimizedCount}`);
