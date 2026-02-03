const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1' ? { rejectUnauthorized: false } : false
});

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

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

// Try to find listings.json in multiple possible locations
function findListingsFile() {
    const commonPaths = [
        path.join(__dirname, '../src/data/listings.json'),
        path.join(__dirname, './listings.json'),
        path.join(__dirname, '../../src/data/listings.json')
    ];

    for (const p of commonPaths) {
        if (fs.existsSync(p)) return p;
    }
    return null;
}

async function setup() {
    try {
        console.log('🔌 Connecting to database...');

        // 1. Create Tables
        console.log('🛠 Creating tables...');
        await pool.query(SCHEMA);
        console.log('✅ Tables created successfully.');

        // 2. Seed Data
        const listingsPath = findListingsFile();
        if (!listingsPath) {
            console.warn('⚠️ Listings data file not found. Skipping seed.');
            return;
        }

        console.log(`📂 Found listings data at: ${listingsPath}`);
        const data = JSON.parse(fs.readFileSync(listingsPath, 'utf8'));
        console.log(`🌱 Seeding ${data.length} listings...`);

        for (const item of data) {
            const query = `
                INSERT INTO listings (
                    id, title, price, description, full_description, 
                    image_url, category, location, type, gallery, 
                    status, specs, features
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    price = EXCLUDED.price,
                    description = EXCLUDED.description,
                    full_description = EXCLUDED.full_description,
                    image_url = EXCLUDED.image_url,
                    category = EXCLUDED.category,
                    location = EXCLUDED.location,
                    type = EXCLUDED.type,
                    gallery = EXCLUDED.gallery,
                    status = EXCLUDED.status,
                    specs = EXCLUDED.specs,
                    features = EXCLUDED.features;
            `;

            const values = [
                String(item.id),
                item.title,
                item.price,
                item.description,
                item.fullDescription || item.description,
                item.imageUrl,
                item.category,
                item.location,
                item.type,
                JSON.stringify(item.gallery || []),
                item.status || 'active',
                JSON.stringify(item.specs || {}),
                JSON.stringify(item.features || [])
            ];

            await pool.query(query, values);
        }

        console.log('✨ Database setup completed successfully!');
    } catch (error) {
        console.error('❌ Setup failed:', error);
    } finally {
        await pool.end();
        process.exit();
    }
}

setup();
