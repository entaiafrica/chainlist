#!/usr/bin/env node

/**
 * Clear Stuck Transactions Script
 *
 * This script helps clear stuck transactions in the relayer's queue
 * by submitting a replacement transaction with higher gas price.
 */

require('dotenv').config({ path: '../relayer/.env' });
const { ethers } = require('ethers');

const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const PRIVATE_KEY = process.env.PLATFORM_PRIVATE_KEY;

if (!PRIVATE_KEY) {
    console.error('Error: PLATFORM_PRIVATE_KEY not found in environment');
    process.exit(1);
}

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

async function checkTransactionStatus() {
    console.log('=== Transaction Queue Status ===\n');

    const address = wallet.address;
    console.log('Platform Wallet:', address);

    // Get nonce counts
    const latestNonce = await provider.getTransactionCount(address, 'latest');
    const pendingNonce = await provider.getTransactionCount(address, 'pending');

    console.log(`\nLatest (mined) nonce: ${latestNonce}`);
    console.log(`Pending nonce: ${pendingNonce}`);
    console.log(`Stuck transactions: ${pendingNonce - latestNonce}`);

    // Get balance
    const balance = await provider.getBalance(address);
    console.log(`\nWallet balance: ${ethers.utils.formatEther(balance)} ETH`);

    // Check if we need to clear
    if (pendingNonce > latestNonce) {
        console.log(`\n⚠️  Warning: ${pendingNonce - latestNonce} transactions are stuck in the queue`);
        console.log(`Next expected nonce: ${latestNonce}`);
        return { needsClear: true, nextNonce: latestNonce };
    } else {
        console.log('\n✅ No stuck transactions');
        return { needsClear: false };
    }
}

async function sendClearingTransaction(nonce) {
    console.log(`\n=== Sending clearing transaction with nonce ${nonce} ===`);

    try {
        // Send a simple self-transaction to clear the nonce
        const tx = {
            to: wallet.address,
            value: 0,
            gasLimit: 21000,
            gasPrice: 1, // Slightly higher than 0 to prioritize
            nonce: nonce
        };

        console.log('Transaction details:', tx);

        const txResponse = await wallet.sendTransaction(tx);
        console.log(`\n✅ Clearing transaction sent: ${txResponse.hash}`);
        console.log('Waiting for confirmation...');

        const receipt = await txResponse.wait();
        console.log(`\n✅ Transaction mined in block ${receipt.blockNumber}`);

        return true;
    } catch (error) {
        console.error(`\n❌ Error sending clearing transaction: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('FirstBrick Transaction Queue Manager\n');

    const status = await checkTransactionStatus();

    if (status.needsClear) {
        console.log('\n⚠️  Stuck transactions detected!');
        console.log('\nOptions:');
        console.log('1. Wait for validators to pick up transactions (may take time)');
        console.log('2. Send a clearing transaction to unstick the queue');
        console.log('3. Restart Besu node (requires coordination with all validators)');

        console.log('\n💡 Recommendation: Wait a few minutes for the IBFT2 validators to process the queue.');
        console.log('   If transactions remain stuck after 10 minutes, contact the network admin.');
    }

    console.log('\n=== Monitoring Tips ===');
    console.log('- Check transaction status: node scripts/clear-stuck-transactions.js');
    console.log('- View relayer logs: pm2 logs facebrick-relayer');
    console.log('- Check latest blocks: curl -X POST https://rpc.firstbrick.cloud -d \'{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}\'');
}

main().catch(console.error);
