const { performance } = require('perf_hooks');

// Generate mock data
const generateMockListings = (count) => {
    const listings = [];
    for (let i = 0; i < count; i++) {
        listings.push({
            id: i,
            priceNumber: Math.random() * 1000000 + 300000,
            district: ['Kadıköy', 'Beşiktaş', 'Şişli', 'Üsküdar', 'Maltepe'][Math.floor(Math.random() * 5)],
            listing_type: ['sale', 'rent'][Math.floor(Math.random() * 2)],
            category: ['satilik-konut', 'kiralik-konut', 'satilik-arsa'][Math.floor(Math.random() * 3)],
            rooms: ['1+1', '2+1', '3+1', '4+1', '5+', '6+2'][Math.floor(Math.random() * 6)]
        });
    }
    return listings;
};

const allListings = generateMockListings(100000); // 100,000 listings

const minPrice = '500000';
const maxPrice = '1200000';
const district = 'Kadıköy';
const listing_type = 'sale';
const category = 'satilik-konut';
const rooms = '3+1';

function originalFilter() {
    let filtered = allListings;
    if (minPrice) filtered = filtered.filter(x => x.priceNumber >= parseFloat(minPrice));
    if (maxPrice) filtered = filtered.filter(x => x.priceNumber <= parseFloat(maxPrice));
    if (district) filtered = filtered.filter(x => x.district.toLowerCase().includes(district.toLowerCase()));
    if (listing_type) filtered = filtered.filter(x => x.listing_type === listing_type);
    if (category) filtered = filtered.filter(x => x.category === category);
    if (rooms) {
        if (rooms === '5+') {
            filtered = filtered.filter(x => {
                const r = parseInt(x.rooms);
                return !isNaN(r) && r >= 5;
            });
        } else {
            filtered = filtered.filter(x => x.rooms && x.rooms.startsWith(rooms));
        }
    }
    return filtered.length;
}

function optimizedFilter() {
    let filtered = allListings;

    const minP = minPrice ? parseFloat(minPrice) : null;
    const maxP = maxPrice ? parseFloat(maxPrice) : null;
    const distLower = district ? district.toLowerCase() : null;

    filtered = allListings.filter(x => {
        if (minP !== null && x.priceNumber < minP) return false;
        if (maxP !== null && x.priceNumber > maxP) return false;
        if (distLower !== null && !x.district.toLowerCase().includes(distLower)) return false;
        if (listing_type && x.listing_type !== listing_type) return false;
        if (category && x.category !== category) return false;

        if (rooms) {
            if (rooms === '5+') {
                const r = parseInt(x.rooms);
                if (isNaN(r) || r < 5) return false;
            } else {
                if (!x.rooms || !x.rooms.startsWith(rooms)) return false;
            }
        }

        return true;
    });

    return filtered.length;
}

const measure = (name, fn) => {
    // Warmup
    for(let i=0; i<10; i++) fn();

    let total = 0;
    const iterations = 100;
    for(let i=0; i<iterations; i++) {
        const start = performance.now();
        fn();
        total += performance.now() - start;
    }
    console.log(`${name}: ${total / iterations} ms`);
}

console.log("Results original:", originalFilter());
console.log("Results optimized:", optimizedFilter());

measure('Original', originalFilter);
measure('Optimized', optimizedFilter);
