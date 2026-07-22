-- FirstBrick Explorer Database Schema
-- Complete blockchain indexing for transactions, blocks, addresses, and tokens

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Blocks table: stores all block headers and metadata
CREATE TABLE IF NOT EXISTS blocks (
    id SERIAL PRIMARY KEY,
    number BIGINT UNIQUE NOT NULL,
    hash VARCHAR(66) UNIQUE NOT NULL,
    parent_hash VARCHAR(66) NOT NULL,
    timestamp BIGINT NOT NULL,
    miner VARCHAR(42) NOT NULL,
    gas_used NUMERIC(78) NOT NULL,
    gas_limit NUMERIC(78) NOT NULL,
    transaction_count INTEGER DEFAULT 0,
    base_fee_per_gas NUMERIC(78),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blocks_number ON blocks(number DESC);
CREATE INDEX IF NOT EXISTS idx_blocks_hash ON blocks(hash);
CREATE INDEX IF NOT EXISTS idx_blocks_timestamp ON blocks(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_blocks_miner ON blocks(miner);

-- Transactions table: stores all transaction data
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    block_hash VARCHAR(66) NOT NULL,
    transaction_index INTEGER NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42),
    value NUMERIC(78) NOT NULL DEFAULT 0,
    gas_price NUMERIC(78),
    gas_used NUMERIC(78),
    gas_limit NUMERIC(78) NOT NULL,
    nonce INTEGER NOT NULL,
    input_data TEXT,
    status INTEGER NOT NULL,
    timestamp BIGINT NOT NULL,
    contract_address VARCHAR(42),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (block_number) REFERENCES blocks(number) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tx_hash ON transactions(hash);
CREATE INDEX IF NOT EXISTS idx_tx_block ON transactions(block_number DESC);
CREATE INDEX IF NOT EXISTS idx_tx_from ON transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_tx_to ON transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_tx_timestamp ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_tx_status ON transactions(status);

-- Transaction logs (events): stores all event logs from transactions
CREATE TABLE IF NOT EXISTS transaction_logs (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    log_index INTEGER NOT NULL,
    address VARCHAR(42) NOT NULL,
    topic0 VARCHAR(66),
    topic1 VARCHAR(66),
    topic2 VARCHAR(66),
    topic3 VARCHAR(66),
    data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(transaction_hash, log_index),
    FOREIGN KEY (transaction_hash) REFERENCES transactions(hash) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_logs_tx ON transaction_logs(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_logs_address ON transaction_logs(address);
CREATE INDEX IF NOT EXISTS idx_logs_topic0 ON transaction_logs(topic0);
CREATE INDEX IF NOT EXISTS idx_logs_block ON transaction_logs(block_number DESC);

-- Addresses table: tracks all addresses and their activity
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    address VARCHAR(42) UNIQUE NOT NULL,
    is_contract BOOLEAN DEFAULT FALSE,
    first_seen_block BIGINT,
    last_seen_block BIGINT,
    transaction_count INTEGER DEFAULT 0,
    total_received NUMERIC(78) DEFAULT 0,
    total_sent NUMERIC(78) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_addresses_address ON addresses(address);
CREATE INDEX IF NOT EXISTS idx_addresses_is_contract ON addresses(is_contract);
CREATE INDEX IF NOT EXISTS idx_addresses_tx_count ON addresses(transaction_count DESC);

-- Token transfers: tracks all ERC20 and ERC1155 transfers
CREATE TABLE IF NOT EXISTS token_transfers (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    log_index INTEGER NOT NULL,
    token_address VARCHAR(42) NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    token_id NUMERIC(78),
    value NUMERIC(78) NOT NULL,
    token_type VARCHAR(10) NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_hash) REFERENCES transactions(hash) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_token_transfers_tx ON token_transfers(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_token_transfers_token ON token_transfers(token_address);
CREATE INDEX IF NOT EXISTS idx_token_transfers_from ON token_transfers(from_address);
CREATE INDEX IF NOT EXISTS idx_token_transfers_to ON token_transfers(to_address);
CREATE INDEX IF NOT EXISTS idx_token_transfers_block ON token_transfers(block_number DESC);
CREATE INDEX IF NOT EXISTS idx_token_transfers_timestamp ON token_transfers(timestamp DESC);

-- Token holders: current holder balances (updated by transfers)
CREATE TABLE IF NOT EXISTS token_holders (
    id SERIAL PRIMARY KEY,
    token_address VARCHAR(42) NOT NULL,
    holder_address VARCHAR(42) NOT NULL,
    token_id NUMERIC(78),
    balance NUMERIC(78) NOT NULL DEFAULT 0,
    last_updated_block BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(token_address, holder_address, token_id)
);

CREATE INDEX IF NOT EXISTS idx_holders_token ON token_holders(token_address);
CREATE INDEX IF NOT EXISTS idx_holders_address ON token_holders(holder_address);
CREATE INDEX IF NOT EXISTS idx_holders_balance ON token_holders(balance DESC);
CREATE INDEX IF NOT EXISTS idx_holders_token_id ON token_holders(token_address, token_id);

-- Properties: FirstBrick property metadata
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    token_id NUMERIC(78) UNIQUE NOT NULL,
    total_bricks NUMERIC(78) NOT NULL,
    bricks_available NUMERIC(78) NOT NULL,
    price_per_brick NUMERIC(78) NOT NULL,
    deposit_amount NUMERIC(78) NOT NULL,
    otp_deadline BIGINT NOT NULL,
    status INTEGER NOT NULL,
    buyer VARCHAR(42),
    trust_wallet VARCHAR(42),
    investor_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_properties_token_id ON properties(token_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_buyer ON properties(buyer);

-- Sync status: tracks indexer progress
CREATE TABLE IF NOT EXISTS sync_status (
    id INTEGER PRIMARY KEY DEFAULT 1,
    last_synced_block BIGINT NOT NULL DEFAULT 0,
    last_sync_timestamp TIMESTAMP,
    sync_state VARCHAR(20) NOT NULL DEFAULT 'idle',
    error_message TEXT,
    blocks_per_second NUMERIC(10,2),
    estimated_completion TIMESTAMP,
    CHECK (id = 1)
);

-- Insert initial sync status
INSERT INTO sync_status (id, last_synced_block, sync_state)
VALUES (1, 0, 'idle')
ON CONFLICT (id) DO NOTHING;

-- Create view for recent activity
CREATE OR REPLACE VIEW recent_activity AS
SELECT
    'transaction' as type,
    t.hash as identifier,
    t.from_address,
    t.to_address,
    t.value,
    t.timestamp,
    t.block_number
FROM transactions t
ORDER BY t.timestamp DESC
LIMIT 100;

-- Create view for top token holders
CREATE OR REPLACE VIEW top_token_holders AS
SELECT
    th.token_address,
    th.holder_address,
    th.token_id,
    th.balance,
    th.updated_at
FROM token_holders th
WHERE th.balance > 0
ORDER BY th.token_address, th.balance DESC;

-- Grant permissions to explorer_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO explorer_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO explorer_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO explorer_user;
