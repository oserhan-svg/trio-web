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

async function checkColumnType() {
    try {
        const client = await pool.connect();
        const res = await client.query(`
            SELECT data_type, udt_name
            FROM information_schema.columns 
            WHERE table_name = 'properties' AND column_name = 'images'
        `);
        console.log('Column Type:', res.rows[0]);
        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkColumnType();
