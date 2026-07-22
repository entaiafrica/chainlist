const { ethers } = require("hardhat");

async function main() {
    console.log("\n⛽ SENDING GAS TO PLATFORM WALLET\n");
    console.log("=".repeat(70));

    const platformWallet = "0x8da6CE40Bf4F1c5333D7316e789c755384c290d5";

    // Get available signers
    const signers = await ethers.getSigners();
    console.log("\nAvailable accounts:");

    let funder = null;
    let maxBalance = ethers.BigNumber.from(0);

    for (let i = 0; i < Math.min(10, signers.length); i++) {
        const signer = signers[i];
        const address = await signer.getAddress();
        const balance = await signer.getBalance();

        console.log(`  [${i}] ${address}: ${ethers.utils.formatEther(balance)} ETH`);

        if (balance.gt(maxBalance) && address.toLowerCase() !== platformWallet.toLowerCase()) {
            maxBalance = balance;
            funder = signer;
        }
    }

    if (!funder) {
        throw new Error("No account with ETH found!");
    }

    console.log("\n📤 Sending from:", await funder.getAddress());
    console.log("📥 Sending to:", platformWallet);

    // Check current platform wallet balance
    const currentBalance = await ethers.provider.getBalance(platformWallet);
    console.log("\nPlatform wallet current ETH:", ethers.utils.formatEther(currentBalance));

    // Send 1 ETH (enough for many transactions)
    const amountToSend = ethers.utils.parseEther("1.0");
    console.log("Amount to send:", ethers.utils.formatEther(amountToSend), "ETH");

    console.log("\n⏳ Sending transaction...");
    const tx = await funder.sendTransaction({
        to: platformWallet,
        value: amountToSend
    });

    console.log("Transaction hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");

    await tx.wait();
    console.log("✅ Transaction confirmed!");

    // Check new balance
    const newBalance = await ethers.provider.getBalance(platformWallet);
    console.log("\n📊 Platform wallet new balance:", ethers.utils.formatEther(newBalance), "ETH");

    console.log("\n" + "=".repeat(70));
    console.log("✅ GAS SENT SUCCESSFULLY!");
    console.log("=".repeat(70));
    console.log("\nNEXT STEPS:");
    console.log("1. Add platform wallet private key to .env:");
    console.log("   PRIVATE_KEY=your_private_key_here");
    console.log("\n2. Fund the buyer accounts:");
    console.log("   npx hardhat run scripts/fund-buyers.js --network loyalty");
    console.log("\n3. Activate properties:");
    console.log("   npx hardhat run scripts/activate-properties.js --network loyalty");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
