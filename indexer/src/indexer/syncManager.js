const { provider, EVENT_SIGNATURES, CONTRACTS } = require('../config/blockchain');
const { query, transaction, getSyncStatus, updateSyncStatus } = require('../config/database');
const { ethers } = require('ethers');

class SyncManager {
  constructor() {
    this.BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 100;
    this.isRunning = false;
    this.stats = {
      blocksProcessed: 0,
      transactionsProcessed: 0,
      startTime: null,
      currentBlock: 0,
    };
  }

  async start() {
    if (this.isRunning) {
      console.log('Sync already running');
      return;
    }

    console.log('🚀 Starting blockchain indexer...');
    this.isRunning = true;
    this.stats.startTime = Date.now();

    try {
      // Get current state
      const syncStatus = await getSyncStatus();
      const currentBlock = await provider.getBlockNumber();
      const lastSynced = parseInt(syncStatus.last_synced_block) || 0;

      console.log(`\n📊 Sync Status:`);
      console.log(`   Last synced block: ${lastSynced.toLocaleString()}`);
      console.log(`   Current block: ${currentBlock.toLocaleString()}`);
      console.log(`   Blocks to sync: ${(currentBlock - lastSynced).toLocaleString()}\n`);

      // Historical sync
      if (lastSynced < currentBlock) {
        await this.historicalSync(lastSynced + 1, currentBlock);
      }

      // Real-time sync
      await this.realtimeSync();

    } catch (error) {
      console.error('❌ Sync error:', error);
      await updateSyncStatus(this.stats.currentBlock, 'error', error.message);
      this.isRunning = false;
    }
  }

  async historicalSync(fromBlock, toBlock) {
    console.log(`📚 Starting historical sync: blocks ${fromBlock} to ${toBlock}`);

    for (let i = fromBlock; i <= toBlock; i += this.BATCH_SIZE) {
      const endBlock = Math.min(i + this.BATCH_SIZE - 1, toBlock);

      try {
        await this.processBatch(i, endBlock);

        // Update progress
        const progress = ((endBlock - fromBlock + 1) / (toBlock - fromBlock + 1)) * 100;
        const blocksPerSec = this.stats.blocksProcessed / ((Date.now() - this.stats.startTime) / 1000);

        console.log(`   ✓ Synced blocks ${i}-${endBlock} (${progress.toFixed(2)}% complete, ${blocksPerSec.toFixed(1)} blocks/sec)`);

        await updateSyncStatus(endBlock, 'syncing');
        this.stats.currentBlock = endBlock;

      } catch (error) {
        console.error(`   ✗ Error processing batch ${i}-${endBlock}:`, error.message);
        await updateSyncStatus(endBlock, 'error', error.message);
        throw error;
      }
    }

    console.log(`\n✅ Historical sync complete!`);
    console.log(`   Total blocks: ${this.stats.blocksProcessed.toLocaleString()}`);
    console.log(`   Total transactions: ${this.stats.transactionsProcessed.toLocaleString()}`);
  }

  async processBatch(startBlock, endBlock) {
    // Fetch blocks in parallel
    const blockPromises = [];
    for (let blockNum = startBlock; blockNum <= endBlock; blockNum++) {
      blockPromises.push(provider.getBlock(blockNum, true)); // true = include transactions
    }

    const blocks = await Promise.all(blockPromises);

    // Process blocks sequentially in a transaction
    await transaction(async (client) => {
      for (const block of blocks) {
        if (block) {
          await this.processBlock(block, client);
        }
      }
    });
  }

  async processBlock(block, client) {
    // Insert block
    await client.query(
      `INSERT INTO blocks (number, hash, parent_hash, timestamp, miner, gas_used, gas_limit, transaction_count, base_fee_per_gas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (number) DO NOTHING`,
      [
        block.number,
        block.hash,
        block.parentHash,
        block.timestamp,
        block.miner.toLowerCase(),
        block.gasUsed.toString(),
        block.gasLimit.toString(),
        block.transactions?.length || 0,
        block.baseFeePerGas?.toString() || '0',
      ]
    );

    this.stats.blocksProcessed++;

    // Process transactions
    if (block.transactions && block.transactions.length > 0) {
      for (const txHash of block.transactions) {
        try {
          const tx = await provider.getTransaction(txHash);
          const receipt = await provider.getTransactionReceipt(txHash);
          if (tx && receipt) {
            await this.processTransaction(tx, receipt, block, client);
          }
        } catch (error) {
          console.error(`     ✗ Error processing tx ${txHash}:`, error.message);
        }
      }
    }
  }

  async processTransaction(tx, receipt, block, client) {
    // Insert transaction
    await client.query(
      `INSERT INTO transactions (
        hash, block_number, block_hash, transaction_index,
        from_address, to_address, value, gas_price, gas_used,
        gas_limit, nonce, input_data, status, timestamp, contract_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (hash) DO NOTHING`,
      [
        tx.hash,
        block.number,
        block.hash,
        tx.index,
        tx.from.toLowerCase(),
        tx.to?.toLowerCase() || null,
        tx.value.toString(),
        tx.gasPrice?.toString() || '0',
        receipt.gasUsed.toString(),
        tx.gasLimit.toString(),
        tx.nonce,
        tx.data || '0x',
        receipt.status,
        block.timestamp,
        receipt.contractAddress?.toLowerCase() || null,
      ]
    );

    this.stats.transactionsProcessed++;

    // Process logs (events)
    if (receipt.logs && receipt.logs.length > 0) {
      for (const log of receipt.logs) {
        await this.processLog(log, tx, block, client);
      }
    }

    // Update address records
    await this.updateAddress(tx.from, block.number, client);
    if (tx.to) {
      await this.updateAddress(tx.to, block.number, client);
    }
  }

  async processLog(log, tx, block, client) {
    // Insert log
    await client.query(
      `INSERT INTO transaction_logs (
        transaction_hash, block_number, log_index, address,
        topic0, topic1, topic2, topic3, data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (transaction_hash, log_index) DO NOTHING`,
      [
        tx.hash,
        block.number,
        log.index,
        log.address.toLowerCase(),
        log.topics[0] || null,
        log.topics[1] || null,
        log.topics[2] || null,
        log.topics[3] || null,
        log.data || '0x',
      ]
    );

    // Parse known events (ERC20/ERC1155 transfers)
    await this.parseEvent(log, tx, block, client);
  }

  async parseEvent(log, tx, block, client) {
    const topic0 = log.topics[0];

    // ERC20 Transfer
    if (topic0 === EVENT_SIGNATURES.TRANSFER && log.topics.length === 3) {
      const from = ethers.getAddress('0x' + log.topics[1].slice(26));
      const to = ethers.getAddress('0x' + log.topics[2].slice(26));
      const value = ethers.getBigInt(log.data);

      await client.query(
        `INSERT INTO token_transfers (
          transaction_hash, block_number, log_index, token_address,
          from_address, to_address, value, token_type, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [tx.hash, block.number, log.index, log.address.toLowerCase(),
         from.toLowerCase(), to.toLowerCase(), value.toString(), 'ERC20', block.timestamp]
      );

      // Update holder balances
      await this.updateTokenBalance(log.address, from, null, value * -1n, block.number, client);
      await this.updateTokenBalance(log.address, to, null, value, block.number, client);
    }

    // ERC1155 TransferSingle
    if (topic0 === EVENT_SIGNATURES.TRANSFER_SINGLE) {
      const from = ethers.getAddress('0x' + log.topics[2].slice(26));
      const to = ethers.getAddress('0x' + log.topics[3].slice(26));
      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(['uint256', 'uint256'], log.data);
      const tokenId = decoded[0];
      const value = decoded[1];

      await client.query(
        `INSERT INTO token_transfers (
          transaction_hash, block_number, log_index, token_address,
          from_address, to_address, token_id, value, token_type, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [tx.hash, block.number, log.index, log.address.toLowerCase(),
         from.toLowerCase(), to.toLowerCase(), tokenId.toString(), value.toString(), 'ERC1155', block.timestamp]
      );

      // Update holder balances
      await this.updateTokenBalance(log.address, from, tokenId, value * -1n, block.number, client);
      await this.updateTokenBalance(log.address, to, tokenId, value, block.number, client);
    }
  }

  async updateAddress(address, blockNumber, client) {
    await client.query(
      `INSERT INTO addresses (address, first_seen_block, last_seen_block, transaction_count)
       VALUES ($1, $2, $2, 1)
       ON CONFLICT (address) DO UPDATE SET
         last_seen_block = $2,
         transaction_count = addresses.transaction_count + 1`,
      [address.toLowerCase(), blockNumber]
    );
  }

  async updateTokenBalance(tokenAddress, holderAddress, tokenId, valueDelta, blockNumber, client) {
    const result = await client.query(
      `INSERT INTO token_holders (token_address, holder_address, token_id, balance, last_updated_block)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (token_address, holder_address, token_id) DO UPDATE SET
         balance = GREATEST(0, token_holders.balance + $4),
         last_updated_block = $5,
         updated_at = NOW()
       RETURNING balance`,
      [tokenAddress.toLowerCase(), holderAddress.toLowerCase(), tokenId?.toString() || null, valueDelta.toString(), blockNumber]
    );
  }

  async realtimeSync() {
    console.log('\n🔄 Starting real-time sync...\n');

    provider.on('block', async (blockNumber) => {
      try {
        console.log(`   📦 New block: ${blockNumber}`);
        const block = await provider.getBlock(blockNumber, true);
        if (block) {
          await transaction(async (client) => {
            await this.processBlock(block, client);
          });
          await updateSyncStatus(blockNumber, 'syncing');
        }
      } catch (error) {
        console.error(`   ✗ Error processing new block ${blockNumber}:`, error.message);
      }
    });
  }

  async stop() {
    this.isRunning = false;
    provider.removeAllListeners('block');
    console.log('\n⏸️  Indexer stopped');
  }
}

module.exports = SyncManager;
