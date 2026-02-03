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

async function checkAnyImages() {
    try {
        const client = await pool.connect();

        console.log('--- Checking Any Images ---');

        // Count ANY listings with images
        const res = await client.query(`
            SELECT count(*) 
            FROM properties 
            WHERE array_length(images, 1) > 0
        `);
        console.log(`Total Listings with Images: ${res.rows[0].count}`);

        // Show a sample if exists
        if (parseInt(res.rows[0].count) > 0) {
            const sample = await client.query(`
                SELECT images FROM properties 
                WHERE array_length(images, 1) > 0 LIMIT 1
            `);
            console.log('Sample Image Array:', JSON.stringify(sample.rows[0].images));
        }

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkAnyImages();
