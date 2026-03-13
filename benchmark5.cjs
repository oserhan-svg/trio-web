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


// OPTIMIZED - single searchable string
console.time('Optimized Single String Total (including setup)');
const normalizedData2 = data.map(item => ({
    ...item,
    searchString: [item.title, item.location, item.type, item.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
}));

let optimizedCount2 = 0;
for (const term of searches) {
    let filteredOptimized = normalizedData2.filter(l =>
        l.searchString.includes(term)
    );
    optimizedCount2 += filteredOptimized.length;
}
console.timeEnd('Optimized Single String Total (including setup)');


console.time('Optimized Single String (50 renders)');
let oCount3 = 0;
for(let i=0; i<50; i++) {
    for (const term of searches) {
        let filteredOptimized = normalizedData2.filter(l =>
            l.searchString.includes(term)
        );
        oCount3 += filteredOptimized.length;
    }
}
console.timeEnd('Optimized Single String (50 renders)');
