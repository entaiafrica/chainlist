const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection } = require('./config/blockchain');
const { getSyncStatus } = require('./config/database');
const SyncManager = require('./indexer/syncManager');

// Import routes
const blocksRouter = require('./api/routes/blocks');
const transactionsRouter = require('./api/routes/transactions');
const addressesRouter = require('./api/routes/addresses');
const tokensRouter = require('./api/routes/tokens');
const statsRouter = require('./api/routes/stats');

const app = express();
const PORT = process.env.API_PORT || 8550;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const syncStatus = await getSyncStatus();
    res.json({
      status: 'ok',
      service: 'FirstBrick Explorer API',
      sync: {
        lastBlock: syncStatus.last_synced_block,
        state: syncStatus.sync_state,
        lastSync: syncStatus.last_sync_timestamp,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// API Routes
app.use('/api/blocks', blocksRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/addresses', addressesRouter);
app.use('/api/tokens', tokensRouter);
app.use('/api/stats', statsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Initialize and start
async function start() {
  try {
    console.log('🚀 FirstBrick Explorer Indexer & API\n');

    // Test connections
    const rpcOk = await testConnection();
    if (!rpcOk) {
      throw new Error('RPC connection failed');
    }

    // Start API server
    app.listen(PORT, () => {
      console.log(`\n✓ API server listening on port ${PORT}`);
      console.log(`  http://localhost:${PORT}/health\n`);
    });

    // Start indexer
    const syncManager = new SyncManager();
    await syncManager.start();

  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

start();
