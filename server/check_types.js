const { Pool } = require('pg');
require('dotenv').config();

const config = {
    user: process.env.EXTERNAL_DB_USER,
    host: process.env.EXTERNAL_DB_HOST,
    database: process.env.EXTERNAL_DB_NAME,
    password: process.env.EXTERNAL_DB_PASSWORD,
    port: process.env.EXTERNAL_DB_PORT,
    ssl: { rejectUnauthorized: false }
};

const pool = new Pool(config);

async function checkSellerTypes() {
    try {
        const client = await pool.connect();

        console.log('Fetching distinct seller_type values...');
        const res = await client.query(`
            SELECT DISTINCT seller_type FROM properties
        `);

        console.log('Values:', res.rows.map(r => r.seller_type));

        console.log('Fetching distinct listing_type values...');
        const resType = await client.query(`
            SELECT DISTINCT listing_type FROM properties
        `);
        console.log('Listing Types:', resType.rows.map(r => r.listing_type));

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkSellerTypes();
