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

async function inspectRaw() {
    try {
        const client = await pool.connect();

        console.log('--- Raw Row Inspection ---');
        // Get one owner listing
        const res = await client.query(`
            SELECT * FROM properties 
            WHERE seller_type = 'owner' AND status = 'active' 
            LIMIT 1
        `);

        if (res.rows.length > 0) {
            console.log(JSON.stringify(res.rows[0], null, 2));
        } else {
            console.log('No active owner listings found (unexpected).');
        }

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

inspectRaw();
