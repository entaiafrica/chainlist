const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'explorer_db',
  user: process.env.DB_USER || 'explorer_user',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✓ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

// Query helper function
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`Slow query (${duration}ms):`, text.substring(0, 100));
    }
    return res;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

// Transaction helper
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Get sync status
async function getSyncStatus() {
  const result = await query('SELECT * FROM sync_status WHERE id = 1');
  return result.rows[0];
}

// Update sync status
async function updateSyncStatus(blockNumber, state = 'syncing', errorMessage = null) {
  await query(
    `UPDATE sync_status
     SET last_synced_block = $1,
         last_sync_timestamp = NOW(),
         sync_state = $2,
         error_message = $3
     WHERE id = 1`,
    [blockNumber, state, errorMessage]
  );
}

module.exports = {
  pool,
  query,
  transaction,
  getSyncStatus,
  updateSyncStatus,
};
