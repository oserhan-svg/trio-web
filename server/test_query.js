const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

async function run() {
    try {
        const countResult = await pool.query('SELECT COUNT(*) FROM listings');
        console.log(countResult.rows[0]);
    } catch(err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
run();
