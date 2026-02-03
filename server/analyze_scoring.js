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

async function analyzePrices() {
    try {
        const client = await pool.connect();

        console.log('--- Analyzing Sahibinden Listings ---');

        // Count count
        const countRes = await client.query(`
            SELECT COUNT(*) FROM properties 
            WHERE seller_type = 'owner' AND status = 'active'
        `);
        console.log(`Total 'Sahibinden' Active Listings: ${countRes.rows[0].count}`);

        // Sample Price stats by district/category
        const statsRes = await client.query(`
            SELECT 
                category,
                district,
                COUNT(*) as count,
                AVG(price::numeric) as avg_price,
                AVG(size_m2::numeric) as avg_size,
                AVG(price::numeric / NULLIF(size_m2::numeric, 0)) as avg_unit_price
            FROM properties
            WHERE seller_type = 'owner' AND status = 'active' AND size_m2 > 0
            GROUP BY category, district
            HAVING COUNT(*) > 2
            ORDER BY category, avg_unit_price ASC
            LIMIT 20
        `);

        console.log('\n--- Average Unit Prices (Price/m2) by Region ---');
        statsRes.rows.forEach(r => {
            console.log(`${r.category} | ${r.district}: ${parseFloat(r.avg_unit_price).toFixed(2)} TL/m2 (Sample: ${r.count})`);
        });

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

analyzePrices();
