const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');

// GET /api/addresses/:address - Get address details
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;

    const addressResult = await query(
      'SELECT * FROM addresses WHERE address = $1',
      [address.toLowerCase()]
    );

    if (addressResult.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const addressData = addressResult.rows[0];

    // Get transaction count
    const txCountResult = await query(
      `SELECT COUNT(*) as total,
              COUNT(CASE WHEN from_address = $1 THEN 1 END) as sent,
              COUNT(CASE WHEN to_address = $1 THEN 1 END) as received
       FROM transactions
       WHERE from_address = $1 OR to_address = $1`,
      [address.toLowerCase()]
    );

    // Get token holdings (using aggregated view)
    const tokensResult = await query(
      `SELECT * FROM token_balances
       WHERE holder_address = $1
       ORDER BY balance DESC`,
      [address.toLowerCase()]
    );

    res.json({
      address: addressData,
      stats: txCountResult.rows[0],
      tokens: tokensResult.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/addresses/:address/transactions - Get transactions for address
router.get('/:address/transactions', async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 25, type = 'all' } = req.query;
    const offset = (page - 1) * limit;

    // BRK token address
    const BRK_TOKEN = '0x5b1869d9a4c187f2eaa108f3062412ecf0526b24';

    let whereClause = '(t.from_address = $1 OR t.to_address = $1)';
    if (type === 'sent') whereClause = 't.from_address = $1';
    if (type === 'received') whereClause = 't.to_address = $1';

    // Get transactions with token transfer amounts
    const result = await query(
      `SELECT
        t.*,
        tt.value as token_value,
        tt.token_address,
        tt.token_id,
        (SELECT COUNT(*) FROM token_transfers WHERE transaction_hash = t.hash) as transfer_count
       FROM transactions t
       LEFT JOIN token_transfers tt ON t.hash = tt.transaction_hash
         AND tt.token_address = '${BRK_TOKEN}'
         AND tt.token_id IS NULL
       WHERE ${whereClause}
       ORDER BY t.timestamp DESC
       LIMIT $2 OFFSET $3`,
      [address.toLowerCase(), limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM transactions t WHERE ${whereClause}`,
      [address.toLowerCase()]
    );

    res.json({
      transactions: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/addresses/:address/tokens - Get token holdings
router.get('/:address/tokens', async (req, res) => {
  try {
    const { address } = req.params;

    const result = await query(
      `SELECT * FROM token_balances
       WHERE holder_address = $1
       ORDER BY balance DESC`,
      [address.toLowerCase()]
    );

    res.json({
      tokens: result.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
