const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');

// GET /api/transactions - Get recent transactions with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 25, status } = req.query;
    const offset = (page - 1) * limit;

    // BRK token address
    const BRK_TOKEN = '0x5b1869d9a4c187f2eaa108f3062412ecf0526b24';

    let queryText = `
      SELECT
        t.*,
        tt.value as token_value,
        tt.token_address,
        (SELECT COUNT(*) FROM token_transfers WHERE transaction_hash = t.hash) as transfer_count
      FROM transactions t
      LEFT JOIN token_transfers tt ON t.hash = tt.transaction_hash
        AND tt.token_address = '${BRK_TOKEN}'
        AND tt.token_id IS NULL
    `;
    let params = [];

    if (status !== undefined) {
      queryText += ` WHERE t.status = $1`;
      params.push(parseInt(status));
    }

    queryText += ` ORDER BY t.timestamp DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    let countQuery = 'SELECT COUNT(*) FROM transactions';
    if (status !== undefined) {
      countQuery += ' WHERE status = $1';
      var countResult = await query(countQuery, [parseInt(status)]);
    } else {
      var countResult = await query(countQuery);
    }

    const total = parseInt(countResult.rows[0].count);

    res.json({
      transactions: result.rows,
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

// GET /api/transactions/:hash - Get specific transaction by hash
router.get('/:hash', async (req, res) => {
  try {
    const { hash } = req.params;

    const txResult = await query(
      `SELECT t.*, b.timestamp as block_timestamp
       FROM transactions t
       JOIN blocks b ON t.block_number = b.number
       WHERE t.hash = $1`,
      [hash.toLowerCase()]
    );

    if (txResult.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const tx = txResult.rows[0];

    // Get logs
    const logsResult = await query(
      `SELECT * FROM transaction_logs
       WHERE transaction_hash = $1
       ORDER BY log_index`,
      [hash.toLowerCase()]
    );

    // Get token transfers
    const tokenTransfersResult = await query(
      `SELECT * FROM token_transfers
       WHERE transaction_hash = $1
       ORDER BY log_index`,
      [hash.toLowerCase()]
    );

    res.json({
      transaction: tx,
      logs: logsResult.rows,
      tokenTransfers: tokenTransfersResult.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/transactions/address/:address - Get transactions for an address
router.get('/address/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 25, type = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '(from_address = $1 OR to_address = $1)';
    if (type === 'sent') whereClause = 'from_address = $1';
    if (type === 'received') whereClause = 'to_address = $1';

    const result = await query(
      `SELECT * FROM transactions
       WHERE ${whereClause}
       ORDER BY timestamp DESC
       LIMIT $2 OFFSET $3`,
      [address.toLowerCase(), limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM transactions WHERE ${whereClause}`,
      [address.toLowerCase()]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      transactions: result.rows,
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

module.exports = router;
