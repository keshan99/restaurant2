const { Pool } = require('pg');
require('dotenv').config();

// One pool, default max 10 connections (pg default). Set max via POOL_MAX in .env if needed.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: process.env.POOL_MAX ? parseInt(process.env.POOL_MAX, 10) : 10,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : undefined,
});

function isNetworkError(err) {
    const code = err && (err.code || err.errno);
    return code === 'ENOTFOUND' || code === 'ETIMEDOUT' || code === 'ECONNREFUSED' || code === -3008;
}

let networkErrorLogged = false;
function logNetworkErrorOnce() {
    if (networkErrorLogged) return;
    networkErrorLogged = true;
    console.error('\n*** Database unreachable (ENOTFOUND / network) ***');
    console.error('Check: 1) Internet  2) Supabase project not paused (Dashboard → Restore)  3) .env DATABASE_URL\n');
}

async function query(text, params) {
    try {
        return await pool.query(text, params);
    } catch (err) {
        if (isNetworkError(err)) logNetworkErrorOnce();
        throw err;
    }
}

module.exports = {
    query,
    pool,
    isNetworkError,
    logNetworkErrorOnce,
};
