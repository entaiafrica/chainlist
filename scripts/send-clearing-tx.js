#!/usr/bin/env node
require('dotenv').config({ path: '../relayer/.env' });
const { ethers } = require('ethers');

const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const PRIVATE_KEY = process.env.PLATFORM_PRIVATE_KEY;

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

async function sendClearingTx() {
    console.log('Sending clearing transaction...');
    console.log('Wallet:', wallet.address);

    // Get current nonce
    const nonce = await provider.getTransactionCount(wallet.address, 'latest');
    console.log('Current nonce:', nonce);

    // Send self-transaction with explicit nonce
    const tx = {
        to: wallet.address,
        value: 0,
        gasLimit: 21000,
        gasPrice: 0,
        nonce: nonce
    };

    console.log('Sending transaction:', tx);
    const txResponse = await wallet.sendTransaction(tx);
    console.log('Transaction sent:', txResponse.hash);
    console.log('Waiting for confirmation...');

    const receipt = await txResponse.wait();
    console.log('Transaction mined in block:', receipt.blockNumber);
    console.log('Status:', receipt.status === 1 ? 'SUCCESS' : 'FAILED');
}

sendClearingTx().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
