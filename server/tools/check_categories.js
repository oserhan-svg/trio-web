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

async function checkCategories() {
    try {
        const client = await pool.connect();

        console.log('Fetching distinct category values...');
        const res = await client.query(`
            SELECT DISTINCT category, sub_category FROM properties
        `);
        console.log('Categories/SubCategories:', res.rows);

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkCategories();
