const { ethers } = require('ethers');
require('dotenv').config();

// Initialize provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://rpc.firstbrick.cloud');

// Contract addresses
const CONTRACTS = {
  MARKETPLACE: process.env.MARKETPLACE_ADDRESS || '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B',
  BRK_TOKEN: process.env.BRK_TOKEN_ADDRESS || '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24',
  FORWARDER: process.env.FORWARDER_ADDRESS || '0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab',
};

// Contract ABIs (minimal for event parsing)
const ABIS = {
  ERC20_TRANSFER: 'event Transfer(address indexed from, address indexed to, uint256 value)',
  ERC1155_TRANSFER_SINGLE: 'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
  ERC1155_TRANSFER_BATCH: 'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)',
};

// Event signatures (topic0)
const EVENT_SIGNATURES = {
  TRANSFER: ethers.id('Transfer(address,address,uint256)'),
  TRANSFER_SINGLE: ethers.id('TransferSingle(address,address,address,uint256,uint256)'),
  TRANSFER_BATCH: ethers.id('TransferBatch(address,address,address,uint256[],uint256[])'),
};

// Test RPC connection
async function testConnection() {
  try {
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    console.log('✓ RPC connected');
    console.log(`  Network: ${network.name} (chainId: ${network.chainId})`);
    console.log(`  Latest block: ${blockNumber.toLocaleString()}`);
    return true;
  } catch (error) {
    console.error('✗ RPC connection failed:', error.message);
    return false;
  }
}

module.exports = {
  provider,
  CONTRACTS,
  ABIS,
  EVENT_SIGNATURES,
  testConnection,
};
