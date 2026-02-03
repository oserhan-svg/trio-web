const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// Fix for Render/Supabase IPv6 issues (ENETUNREACH)
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

// Configuration for the external database
// These values should be provided in the .env file
console.log('--- External DB Debug Info ---');
console.log('HOST:', process.env.EXTERNAL_DB_HOST || '(NOT SET - Defaulting to localhost)');
console.log('USER:', process.env.EXTERNAL_DB_USER || '(NOT SET)');
console.log('DB:', process.env.EXTERNAL_DB_NAME || '(NOT SET)');
console.log('PORT:', process.env.EXTERNAL_DB_PORT || '(NOT SET)');
console.log('SSL:', process.env.EXTERNAL_DB_SSL || '(NOT SET)');
console.log('------------------------------');

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
