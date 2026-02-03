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

const { Pool } = require('pg');
const dns = require('dns').promises;
require('dotenv').config();

// Configuration for the external database
console.log('--- External DB Debug Info ---');
console.log('HOST:', process.env.EXTERNAL_DB_HOST || '(NOT SET)');
console.log('USER:', process.env.EXTERNAL_DB_USER || '(NOT SET)');
console.log('DB:', process.env.EXTERNAL_DB_NAME || '(NOT SET)');
console.log('PORT:', process.env.EXTERNAL_DB_PORT || '(NOT SET)');
console.log('SSL:', process.env.EXTERNAL_DB_SSL || '(NOT SET)');
console.log('------------------------------');

let pool = null;

async function getPool() {
    if (pool) return pool;

    let host = process.env.EXTERNAL_DB_HOST;

    // Manual IPv4 Resolution to bypass ENETUNREACH
    try {
        console.log(`Resolving DNS for ${host}...`);
        const resolver = await dns.resolve4(host);
        if (resolver && resolver.length > 0) {
            console.log(`Resolved ${host} to ${resolver[0]}`);
            host = resolver[0];
        }
    } catch (e) {
        console.error('DNS Resolution failed, using original host:', e.message);
    }

    const config = {
        user: process.env.EXTERNAL_DB_USER,
        host: host,
        database: process.env.EXTERNAL_DB_NAME,
        password: process.env.EXTERNAL_DB_PASSWORD,
        port: process.env.EXTERNAL_DB_PORT,
        ssl: process.env.EXTERNAL_DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    };

    pool = new Pool(config);
    return pool;
}

// Helper function to query the external database
const queryExternal = async (text, params) => {
    try {
        const p = await getPool();
        const start = Date.now();
        const res = await p.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed external query', { text, duration, rows: res.rowCount });
        return res;
    } catch (err) {
        console.error('Error executing query on external DB', err);
        throw err;
    }
};

module.exports = {
    queryExternal
};
