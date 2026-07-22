const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');

// GET /api/tokens/:address/holders - Get token holders with balances
router.get('/:address/holders', async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Get holders with aggregated balances
    const result = await query(
      `SELECT
        holder_address,
        token_id,
        balance,
        last_updated_block
       FROM token_balances
       WHERE token_address = $1
       ORDER BY balance DESC
       LIMIT $2 OFFSET $3`,
      [address.toLowerCase(), limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(DISTINCT holder_address) as count
       FROM token_balances
       WHERE token_address = $1`,
      [address.toLowerCase()]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      holders: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tokens/:address/transfers - Get token transfer history
router.get('/:address/transfers', async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 25, tokenId } = req.query;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'tt.token_address = $1';
    const params = [address.toLowerCase()];

    // Add tokenId filter if provided
    if (tokenId) {
      params.push(tokenId);
      whereClause += ` AND tt.token_id = $${params.length}`;
    }

    const result = await query(
      `SELECT
        tt.*,
        t.timestamp,
        t.status,
        b.number as block_number
       FROM token_transfers tt
       JOIN transactions t ON tt.transaction_hash = t.hash
       JOIN blocks b ON t.block_number = b.number
       WHERE ${whereClause}
       ORDER BY b.number DESC, tt.log_index DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM token_transfers tt WHERE ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      transfers: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tokens/:address/stats - Get token statistics
router.get('/:address/stats', async (req, res) => {
  try {
    const { address } = req.params;

    // Get total holders
    const holdersResult = await query(
      `SELECT COUNT(DISTINCT holder_address) as holder_count,
              SUM(balance) as total_supply
       FROM token_balances
       WHERE token_address = $1`,
      [address.toLowerCase()]
    );

    // Get total transfers
    const transfersResult = await query(
      `SELECT COUNT(*) as transfer_count FROM token_transfers WHERE token_address = $1`,
      [address.toLowerCase()]
    );

    // Get top holders
    const topHoldersResult = await query(
      `SELECT holder_address, balance
       FROM token_balances
       WHERE token_address = $1
       ORDER BY balance DESC
       LIMIT 10`,
      [address.toLowerCase()]
    );

    res.json({
      holderCount: parseInt(holdersResult.rows[0].holder_count),
      totalSupply: holdersResult.rows[0].total_supply,
      transferCount: parseInt(transfersResult.rows[0].transfer_count),
      topHolders: topHoldersResult.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
