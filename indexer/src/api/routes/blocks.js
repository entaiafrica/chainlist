const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');

// GET /api/blocks - Get recent blocks with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 25 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT * FROM blocks
       ORDER BY number DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) FROM blocks');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      blocks: result.rows,
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

// GET /api/blocks/:number - Get specific block by number
router.get('/:number', async (req, res) => {
  try {
    const { number } = req.params;

    const blockResult = await query(
      'SELECT * FROM blocks WHERE number = $1',
      [number]
    );

    if (blockResult.rows.length === 0) {
      return res.status(404).json({ error: 'Block not found' });
    }

    const block = blockResult.rows[0];

    // Get transactions in this block
    const txResult = await query(
      `SELECT hash, from_address, to_address, value, status
       FROM transactions
       WHERE block_number = $1
       ORDER BY transaction_index`,
      [number]
    );

    res.json({
      block,
      transactions: txResult.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/blocks/hash/:hash - Get block by hash
router.get('/hash/:hash', async (req, res) => {
  try {
    const { hash } = req.params;

    const result = await query(
      'SELECT * FROM blocks WHERE hash = $1',
      [hash.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Block not found' });
    }

    res.json({ block: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/blocks/latest - Get latest block number
router.get('/latest', async (req, res) => {
  try {
    const result = await query(
      'SELECT number FROM blocks ORDER BY number DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.json({ latestBlock: 0 });
    }

    res.json({ latestBlock: result.rows[0].number });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
