const { ethers } = require("hardhat");

async function main() {
    console.log("\n🔍 FINDING FUNDED ACCOUNTS ON HTTPS ENDPOINT\n");
    console.log("=".repeat(70));

    const provider = new ethers.providers.JsonRpcProvider("https://rpc.entailabs.com");

    // Check hardhat default accounts (first 10)
    const defaultMnemonic = "test test test test test test test test test test test junk";
    const hdNode = ethers.utils.HDNode.fromMnemonic(defaultMnemonic);

    console.log("Checking Hardhat default accounts...\n");

    let fundedAccounts = [];

    for (let i = 0; i < 10; i++) {
        const path = `m/44'/60'/0'/0/${i}`;
        const wallet = hdNode.derivePath(path);
        const balance = await provider.getBalance(wallet.address);

        if (balance.gt(0)) {
            console.log(`Account ${i}: ✅ ${wallet.address}`);
            console.log(`  Balance: ${ethers.utils.formatEther(balance)} ETH`);
            console.log(`  Private Key: ${wallet.privateKey}`);
            fundedAccounts.push({ index: i, address: wallet.address, balance, privateKey: wallet.privateKey });
        } else {
            console.log(`Account ${i}: ❌ ${wallet.address} (0 ETH)`);
        }
    }

    console.log("\n" + "=".repeat(70));

    if (fundedAccounts.length === 0) {
        console.log("❌ NO FUNDED ACCOUNTS FOUND!");
        console.log("\nThis means the HTTPS endpoint either:");
        console.log("1. Is a fresh blockchain with no funded accounts");
        console.log("2. Requires you to request funds from a faucet");
        console.log("3. Has funds in different accounts you control");
        console.log("\nYou need to:");
        console.log("- Fund this address: 0x8da6CE40Bf4F1c5333D7316e789c755384c290d5");
        console.log("- With at least 1 ETH");
        console.log("- On the HTTPS blockchain: https://rpc.entailabs.com");
    } else {
        console.log(`✅ Found ${fundedAccounts.length} funded account(s)!`);
        console.log("\nYou can use these to fund the platform wallet");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
