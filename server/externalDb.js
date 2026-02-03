const { Pool } = require('pg');
require('dotenv').config();

// Configuration for the external database
// These values should be provided in the .env file
const externalDbConfig = {
    user: process.env.EXTERNAL_DB_USER,
    host: process.env.EXTERNAL_DB_HOST,
    database: process.env.EXTERNAL_DB_NAME,
    password: process.env.EXTERNAL_DB_PASSWORD,
    port: process.env.EXTERNAL_DB_PORT,
    ssl: process.env.EXTERNAL_DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

// Create a new pool for the external database
// This is a placeholder; if using MySQL or MSSQL, the driver and config would change.
const externalPool = new Pool(externalDbConfig);

// Helper function to query the external database
const queryExternal = async (text, params) => {
    try {
        const start = Date.now();
        const res = await externalPool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed external query', { text, duration, rows: res.rowCount });
        return res;
    } catch (err) {
        console.error('Error executing query on external DB', err);
        throw err;
    }
};

module.exports = {
    queryExternal,
    externalPool
};
