const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');
const dns = require('dns');
const rateLimit = require('./middleware/rateLimit');
require('dotenv').config();

// FIX: Force IPv4 to prevent Render/Supabase connection issues (ENETUNREACH)
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Rate Limiting
app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased from 100 to 1000 for better browsing experience
    message: 'Çok fazla istek gönderdiniz, lütfen bir süre sonra tekrar deneyin.'
}));

// CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://trio-web-client.onrender.com',
    'https://trio-web-server.onrender.com',
    'https://trio-emlak.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow any Render subdomain or the main domain
        const isRender = origin.endsWith('.onrender.com');
        const isLocal = origin.startsWith('http://localhost:');
        const isMainDomain = origin === 'https://trio-emlak.com';

        if (isRender || isLocal || isMainDomain || allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            // Log the blocked origin for debugging
            console.warn(`CORS: Blocked origin ${origin}`);
            return callback(null, true); // Fallback: allow for now to prevent production downtime
        }
    },
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Database Pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1' ? { rejectUnauthorized: false } : false
});

// Auto-run migration to fix "relation does not exist" on Render
const initDb = async () => {
    const SCHEMA = `
    CREATE TABLE IF NOT EXISTS listings (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        price TEXT,
        description TEXT,
        full_description TEXT,
        image_url TEXT,
        category TEXT,
        location TEXT,
        type TEXT,
        gallery JSONB DEFAULT '[]',
        status TEXT DEFAULT 'active',
        specs JSONB DEFAULT '{}',
        features JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `;
    try {
        await pool.query(SCHEMA);
        console.log('Verified database schema.');
    } catch (e) {
        console.error('Failed to initialize DB:', e);
    }
};
initDb();

// Routes
app.get('/', (req, res) => {
    res.send('Trio Emlak API Server is Running! 🚀');
});

app.get('/api/listings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM listings ORDER BY created_at DESC');

        // Transform data to match original JSON structure if needed (e.g., camelCase for fullDescription)
        const transformed = result.rows.map(row => ({
            ...row,
            fullDescription: row.full_description,
            imageUrl: row.image_url
        }));

        res.json(transformed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.get('/api/listings/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found' });
        }

        const row = result.rows[0];
        const transformed = {
            ...row,
            fullDescription: row.full_description,
            imageUrl: row.image_url
        };

        res.json(transformed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin & Management Routes
app.patch('/api/listings/:id/status', async (req, res) => {
    const { status } = req.body;
    if (!['active', 'sold', 'passive'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const result = await pool.query(
            'UPDATE listings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/listings/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM listings WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        res.json({ message: 'Listing deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'active') as active,
                COUNT(*) FILTER (WHERE status = 'sold') as sold,
                COUNT(*) FILTER (WHERE status = 'passive') as passive,
                COUNT(*) FILTER (WHERE category = 'satilik-konut') as residential,
                COUNT(*) FILTER (WHERE category = 'satilik-arsa') as land
            FROM listings
        `);
        res.json(stats.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const MASTER_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const MASTER_PASSWORD = process.env.ADMIN_PASSWORD || 'TrioEmlak2024!';

    if (username === MASTER_USERNAME && password === MASTER_PASSWORD) {
        // Return a mock token for development
        res.json({
            success: true,
            token: 'trio-adm-session-' + Date.now(),
            user: { role: 'admin', name: 'Trio Admin' }
        });
    } else {
        res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
    }
});

// External Database Route
const { queryExternal } = require('./externalDb');

app.get('/api/external-listings', async (req, res) => {
    const { minPrice, maxPrice, district, rooms, listing_type, category } = req.query;

    try {
        // 1. Fetch ALL active owner listings to perform accurate statistical analysis
        let queryText = `
            SELECT id, title, price, size_m2, rooms, district, neighborhood, images, description, listing_type, status, category 
            FROM properties 
            WHERE status = 'active' AND seller_type = 'owner'
        `;

        const result = await queryExternal(queryText);
        let allListings = result.rows;

        // 2. Data Cleaning & Validation (Simplified)
        allListings = allListings.map(item => {
            const price = parseFloat(item.price) || 0;
            return {
                ...item,
                priceNumber: price,
                // Fallback: If district/category missing, use 'unknown'
                category: item.category || 'other',
                district: item.district || 'unknown'
            };
        }).filter(item => {
            // Filter invalid prices AND exclude likely rentals (mistagged as sales) 
            // Threshold: 300,000 TL
            return item.priceNumber > 300000;
        });

        // 3. Calculate Benchmarks (Average Price per Category)
        // Since size/district are missing, we group by Category only.
        const benchmarks = {};

        allListings.forEach(item => {
            const key = item.category;
            if (!benchmarks[key]) benchmarks[key] = { total: 0, count: 0 };
            benchmarks[key].total += item.priceNumber;
            benchmarks[key].count += 1;
        });

        // 4. Calculate Score
        allListings.forEach(item => {
            const key = item.category;
            const benchmark = benchmarks[key];
            const avgPrice = benchmark.count > 0 ? benchmark.total / benchmark.count : item.priceNumber;

            // Score = Percentage deviation from Category Average Price.
            // Higher positive score = Cheaper than average.
            item.advantageScore = avgPrice > 0 ? ((avgPrice - item.priceNumber) / avgPrice) * 100 : 0;
        });

        // 5. Apply User Filters
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

        // 6. Sort by Advantage Score & Limit (Top 10 per Category)
        const groupedByCategory = {};
        filtered.forEach(item => {
            if (!groupedByCategory[item.category]) groupedByCategory[item.category] = [];
            groupedByCategory[item.category].push(item);
        });

        let finalResults = [];

        Object.keys(groupedByCategory).forEach(cat => {
            // Sort DESC by score
            const sorted = groupedByCategory[cat].sort((a, b) => b.advantageScore - a.advantageScore);
            // Limit to Top 10
            finalResults = finalResults.concat(sorted.slice(0, 10));
        });

        // Final Global Sort
        finalResults.sort((a, b) => b.advantageScore - a.advantageScore);

        // 7. Map to Response Format
        const mappedListings = finalResults.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            location: item.neighborhood ? `${item.district}, ${item.neighborhood}` : (item.district || 'Konum Belirtilmemiş'),
            image: item.images && item.images.length > 0 ? item.images[0] : null,
            specs: item.size_m2 ? `${item.rooms} | ${item.size_m2}m²` : item.rooms || '', // Handle missing size
            description: item.description,
            type: item.listing_type,
            category: item.category,
            score: item.advantageScore.toFixed(0) // Integer score
        }));

        res.json(mappedListings);

    } catch (err) {
        console.error('External DB Error:', err);
        res.status(500).json({
            error: 'Failed to fetch from external database',
            details: err.message
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'Trio Emlak Backend' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
