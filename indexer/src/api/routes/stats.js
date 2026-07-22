const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');
const { ethers } = require('ethers');

// GET /api/stats - Get blockchain statistics
router.get('/', async (req, res) => {
  try {
    // Get latest block
    const latestBlockResult = await query(
      `SELECT MAX(number) as latest_block FROM blocks`
    );
    const latestBlock = parseInt(latestBlockResult.rows[0].latest_block) || 0;

    // Get total transactions
    const totalTxResult = await query(
      `SELECT COUNT(*) as total FROM transactions`
    );
    const totalTransactions = parseInt(totalTxResult.rows[0].total);

    // Get transactions today
    const todayStart = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
    const txTodayResult = await query(
      `SELECT COUNT(*) as count FROM transactions WHERE timestamp >= $1`,
      [todayStart]
    );
    const txToday = parseInt(txTodayResult.rows[0].count);

    // Get total blocks
    const totalBlocksResult = await query(
      `SELECT COUNT(*) as total FROM blocks`
    );
    const totalBlocks = parseInt(totalBlocksResult.rows[0].total);

    // Calculate average block time (last 100 blocks)
    let avgBlockTime = '5.0';
    try {
      const avgBlockTimeResult = await query(
        `SELECT AVG(time_diff) as avg_time FROM (
           SELECT timestamp - LAG(timestamp) OVER (ORDER BY number) as time_diff
           FROM (
             SELECT number, timestamp FROM blocks
             ORDER BY number DESC
             LIMIT 100
           ) AS recent_blocks
         ) AS diffs WHERE time_diff IS NOT NULL`
      );
      avgBlockTime = avgBlockTimeResult.rows[0]?.avg_time
        ? parseFloat(avgBlockTimeResult.rows[0].avg_time).toFixed(1)
        : '5.0';
    } catch (error) {
      console.error('Error calculating avg block time:', error.message);
      avgBlockTime = '5.0';
    }

    // Calculate sync progress (assuming target is current block)
    const syncProgress = latestBlock > 0 ? 100 : 0;

    // Get peer count from RPC
    let peerCount = 0;
    try {
      const provider = new ethers.JsonRpcProvider('https://rpc.firstbrick.cloud');
      const peerCountHex = await provider.send('net_peerCount', []);
      peerCount = parseInt(peerCountHex, 16);
    } catch (error) {
      console.error('Error fetching peer count:', error.message);
      peerCount = 0;
    }

    res.json({
      latestBlock,
      totalTransactions,
      txToday,
      totalBlocks,
      avgBlockTime,
      syncProgress,
      peerCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stats API error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
