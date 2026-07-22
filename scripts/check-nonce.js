const { ethers } = require("hardhat");

async function main() {
    const address = '0x8da6CE40Bf4F1c5333D7316e789c755384c290d5';
    const nonce = await ethers.provider.getTransactionCount(address);
    const pendingNonce = await ethers.provider.getTransactionCount(address, 'pending');
    
    console.log('Account:', address);
    console.log('Current nonce:', nonce);
    console.log('Pending nonce:', pendingNonce);
    
    if (nonce !== pendingNonce) {
        console.log('\n⚠️  Warning: Pending transactions detected!');
    } else {
        console.log('\n✅ No pending transactions');
    }
}

main().catch(console.error);
