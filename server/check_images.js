const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.EXTERNAL_DB_USER,
    host: process.env.EXTERNAL_DB_HOST,
    database: process.env.EXTERNAL_DB_NAME,
    password: process.env.EXTERNAL_DB_PASSWORD,
    port: process.env.EXTERNAL_DB_PORT,
    ssl: { rejectUnauthorized: false }
});

async function checkImages() {
    try {
        const client = await pool.connect();

        console.log('--- Checking Image Availability ---');

        // Count listings with images
        const res = await client.query(`
            SELECT count(*) 
            FROM properties 
            WHERE seller_type = 'owner' 
            AND status = 'active'
            AND array_length(images, 1) > 0
        `);
        console.log(`Active Owner Listings with Images: ${res.rows[0].count}`);

        // Check total active owner listings
        const total = await client.query(`
            SELECT count(*) 
            FROM properties 
            WHERE seller_type = 'owner' 
            AND status = 'active'
        `);
        console.log(`Total Active Owner Listings: ${total.rows[0].count}`);

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkImages();
