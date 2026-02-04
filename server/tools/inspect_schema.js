const { Pool } = require('pg');
require('dotenv').config();

// Use the environment variables or the connection string directly if you prefer
// For this script, we'll try to construct the config from env vars
// or allow user to edit this file temporarily for testing.

const config = {
    user: process.env.EXTERNAL_DB_USER || 'postgres',
    host: process.env.EXTERNAL_DB_HOST || 'db.uowppchdtgkhllopzzwn.supabase.co',
    database: process.env.EXTERNAL_DB_NAME || 'postgres',
    password: process.env.EXTERNAL_DB_PASSWORD, // MUST BE SET IN .env
    port: process.env.EXTERNAL_DB_PORT || 5432,
    ssl: { rejectUnauthorized: false } // Required for Supabase
};

console.log('Attempting to connect to:', { ...config, password: '****' });

const pool = new Pool(config);

async function inspectSchema() {
    try {
        console.log('Connecting...');
        const client = await pool.connect();
        console.log('Connected! Fetching tables...');

        // List public tables
        const resTables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);

        if (resTables.rows.length === 0) {
            console.log('No tables found in public schema.');
        } else {
            console.log('\n--- TABLES FOUND ---');
            for (const row of resTables.rows) {
                console.log(`- ${row.table_name}`);

                // For each table, get columns
                const resColumns = await client.query(`
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = $1
                    ORDER BY ordinal_position;
                `, [row.table_name]);

                resColumns.rows.forEach(col => {
                    console.log(`    * ${col.column_name} (${col.data_type})`);
                });
            }
        }

        client.release();
    } catch (err) {
        console.error('Connection failed:', err.message);
        console.error('Hint: Did you update the .env file with the EXTERNAL_DB_PASSWORD?');
    } finally {
        await pool.end();
    }
}

inspectSchema();
