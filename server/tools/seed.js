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
});

const LISTINGS_PATH = path.join(__dirname, '../src/data/listings.json');

async function seed() {
    try {
        const data = JSON.parse(fs.readFileSync(LISTINGS_PATH, 'utf8'));
        console.log(`Starting migration of ${data.length} listings...`);

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

        console.log('✓ Migration completed successfully!');
    } catch (error) {
        console.error('✗ Migration error:', error);
    } finally {
        await pool.end();
    }
}

seed();
