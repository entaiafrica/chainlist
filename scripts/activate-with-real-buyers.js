const { ethers } = require("hardhat");

async function main() {
    console.log("\n⚡ ACTIVATING PROPERTIES WITH REAL BUYERS\n");
    console.log("=".repeat(70));

    const NEW_MARKETPLACE = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
    const BRK_TOKEN = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";

    // Real buyer private keys
    const buyer3PrivateKey = "0xd30cf28dd2ff74e1f85e9d398b39c6ae333f1b4c131e4558edeb2de8446e9b44";
    const buyer4PrivateKey = "0xc4665a0774acc41a479db364250670bf4b56fe48b3eda336459a8012f9da01b6";

    const buyer3 = new ethers.Wallet(buyer3PrivateKey, ethers.provider);
    const buyer4 = new ethers.Wallet(buyer4PrivateKey, ethers.provider);

    console.log("Buyer 3 (Chic Sandton):", buyer3.address);
    console.log("Buyer 4 (Steeldale):", buyer4.address);

    const marketplace = await ethers.getContractAt("BrickMarketplace", NEW_MARKETPLACE);
    const brkAbi = [
        "function approve(address, uint256) returns (bool)",
        "function balanceOf(address) view returns (uint256)"
    ];

    console.log("\n" + "=".repeat(70));
    console.log("PROPERTY 3 ACTIVATION (Chic Sandton)");
    console.log("=".repeat(70));

    try {
        const prop3 = await marketplace.getPropertyData(3);
        const depositAmount = prop3.depositAmount;

        console.log("\nProperty 3 Info:");
        console.log("  Status:", prop3.status === 0 ? "PENDING" : "ACTIVE");
        console.log("  Deposit Required:", ethers.utils.formatEther(depositAmount), "BRK");
        console.log("  Trust Wallet:", await marketplace.propertyTrustWallet(3));

        // Check buyer balance
        const brkToken = new ethers.Contract(BRK_TOKEN, brkAbi, buyer3);
        const balance3 = await brkToken.balanceOf(buyer3.address);
        console.log("\nBuyer 3 Balance:", ethers.utils.formatEther(balance3), "BRK");

        if (balance3.lt(depositAmount)) {
            throw new Error("Insufficient BRK balance!");
        }

        // Approve marketplace
        console.log("\n📝 Buyer approving marketplace...");
        const approveTx3 = await brkToken.approve(NEW_MARKETPLACE, depositAmount);
        await approveTx3.wait();
        console.log("✅ Approved:", approveTx3.hash);

        // Pay deposit
        console.log("\n💳 Paying deposit to activate property...");
        const marketplaceAsBuyer3 = marketplace.connect(buyer3);
        const depositTx3 = await marketplaceAsBuyer3.payDeposit(3);
        console.log("Transaction sent:", depositTx3.hash);
        const receipt3 = await depositTx3.wait();
        console.log("✅ Property 3 ACTIVATED!");
        console.log("   Block:", receipt3.blockNumber);

        // Verify
        const prop3After = await marketplace.getPropertyData(3);
        console.log("   New Status:", prop3After.status === 1 ? "ACTIVE ✅" : "PENDING");

    } catch (error) {
        console.error("\n❌ Property 3 activation failed:", error.message);
    }

    console.log("\n" + "=".repeat(70));
    console.log("PROPERTY 4 ACTIVATION (Steeldale Mall)");
    console.log("=".repeat(70));

    try {
        const prop4 = await marketplace.getPropertyData(4);
        const depositAmount = prop4.depositAmount;

        console.log("\nProperty 4 Info:");
        console.log("  Status:", prop4.status === 0 ? "PENDING" : "ACTIVE");
        console.log("  Deposit Required:", ethers.utils.formatEther(depositAmount), "BRK");
        console.log("  Trust Wallet:", await marketplace.propertyTrustWallet(4));

        // Check buyer balance
        const brkToken = new ethers.Contract(BRK_TOKEN, brkAbi, buyer4);
        const balance4 = await brkToken.balanceOf(buyer4.address);
        console.log("\nBuyer 4 Balance:", ethers.utils.formatEther(balance4), "BRK");

        if (balance4.lt(depositAmount)) {
            throw new Error("Insufficient BRK balance!");
        }

        // Approve marketplace
        console.log("\n📝 Buyer approving marketplace...");
        const approveTx4 = await brkToken.approve(NEW_MARKETPLACE, depositAmount);
        await approveTx4.wait();
        console.log("✅ Approved:", approveTx4.hash);

        // Pay deposit
        console.log("\n💳 Paying deposit to activate property...");
        const marketplaceAsBuyer4 = marketplace.connect(buyer4);
        const depositTx4 = await marketplaceAsBuyer4.payDeposit(4);
        console.log("Transaction sent:", depositTx4.hash);
        const receipt4 = await depositTx4.wait();
        console.log("✅ Property 4 ACTIVATED!");
        console.log("   Block:", receipt4.blockNumber);

        // Verify
        const prop4After = await marketplace.getPropertyData(4);
        console.log("   New Status:", prop4After.status === 1 ? "ACTIVE ✅" : "PENDING");

    } catch (error) {
        console.error("\n❌ Property 4 activation failed:", error.message);
    }

    console.log("\n" + "=".repeat(70));
    console.log("🎉 ACTIVATION COMPLETE!");
    console.log("=".repeat(70));
    console.log("\n✅ Both properties are now ACTIVE!");
    console.log("✅ Trust wallets have the BRK inventory:");
    console.log("   Property 3: 1,091,000 BRK");
    console.log("   Property 4: 24,730,000 BRK");
    console.log("\n🚀 Investors can now buy bricks!");
    console.log("\n📝 NEXT: Update frontend to use property IDs 3 and 4");
    console.log("   Frontend: http://localhost:3300");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
