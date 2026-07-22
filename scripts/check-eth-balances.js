const { ethers } = require("hardhat");

async function main() {
    console.log("\n⛽ CHECKING ETH BALANCES\n");
    console.log("=".repeat(70));

    const platformWallet = "0x8da6CE40Bf4F1c5333D7316e789c755384c290d5";

    // Check platform wallet
    const platformBalance = await ethers.provider.getBalance(platformWallet);
    console.log("\n🎯 Platform Wallet:", platformWallet);
    console.log("   ETH Balance:", ethers.utils.formatEther(platformBalance));

    // Check hardhat default accounts
    const signers = await ethers.getSigners();
    console.log("\n📋 Hardhat Accounts:");

    if (signers.length === 0) {
        console.log("   No accounts configured in hardhat (needs PRIVATE_KEY in .env)");
    }

    for (let i = 0; i < Math.min(5, signers.length); i++) {
        const signer = signers[i];
        const address = await signer.getAddress();
        const balance = await signer.getBalance();
        console.log(`   [${i}] ${address}: ${ethers.utils.formatEther(balance)} ETH`);
    }

    // Check buyer accounts
    const buyer1 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const buyer2 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

    const buyer1Balance = await ethers.provider.getBalance(buyer1);
    const buyer2Balance = await ethers.provider.getBalance(buyer2);

    console.log("\n👥 Buyer Accounts:");
    console.log(`   Buyer 1: ${buyer1}`);
    console.log(`      ETH: ${ethers.utils.formatEther(buyer1Balance)}`);
    console.log(`   Buyer 2: ${buyer2}`);
    console.log(`      ETH: ${ethers.utils.formatEther(buyer2Balance)}`);

    console.log("\n" + "=".repeat(70));
    console.log("RECOMMENDATIONS:");
    console.log("=".repeat(70));

    if (platformBalance.eq(0)) {
        console.log("\n❌ Platform wallet needs ETH for gas!");
        console.log("\n📝 TO FIX:");
        console.log("   1. Open MetaMask");
        console.log("   2. Make sure you're on Loyalty Rewards Chain");
        console.log("   3. Send 1-2 ETH to:", platformWallet);
        console.log("\n   OR use this command from an account with ETH:");
        console.log(`   eth.sendTransaction({from: eth.accounts[0], to: "${platformWallet}", value: web3.toWei(1, "ether")})`);
    } else {
        console.log("\n✅ Platform wallet has ETH!");
        console.log("   Can proceed with funding buyers.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
