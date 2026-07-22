const { ethers } = require("hardhat");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("ACTIVATE STEELDALE MALL - Property Manager Pays Deposit");
    console.log("=".repeat(80));

    const [propertyManager] = await ethers.getSigners();
    console.log("\nProperty Manager account:", propertyManager.address);

    // Contract addresses
    const marketplaceAddress = process.env.MARKETPLACE_ADDRESS || "0x7a25b476972ab363e116ecb9b8bae90aadc058f4";
    const brkTokenAddress = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";

    // Token ID from environment variable
    const tokenId = process.env.TOKEN_ID;

    if (!tokenId) {
        console.log("\n❌ ERROR: TOKEN_ID not provided");
        console.log("Usage: TOKEN_ID=X PRIVATE_KEY=xxx npx hardhat run scripts/activateSteeldaleMall.js --network besu");
        return;
    }

    const marketplace = await ethers.getContractAt("BrickMarketplace", marketplaceAddress);
    const brkToken = await ethers.getContractAt("IERC20", brkTokenAddress);

    console.log("\n" + "=".repeat(80));
    console.log("STEP 1: Verify Property Status");
    console.log("=".repeat(80));

    const propertyData = await marketplace.properties(tokenId);
    const expectedBuyer = await marketplace.propertyBuyer(tokenId);

    console.log("Token ID:", tokenId);
    console.log("Property Status:", propertyData.status); // 0=PENDING, 1=ACTIVE, 2=FUNDED
    console.log("Total Bricks:", propertyData.totalBricks.toString());
    console.log("Deposit Amount Required:", ethers.utils.formatEther(propertyData.depositAmount), "BRK");
    console.log("Expected Property Manager:", expectedBuyer);
    console.log("Current Account:", propertyManager.address);

    if (propertyData.status !== 0) {
        console.log("\n⚠️  WARNING: Property is not in PENDING status");
        console.log("Current status:", propertyData.status === 1 ? "ACTIVE" : propertyData.status === 2 ? "FUNDED" : "OTHER");
        return;
    }

    if (expectedBuyer.toLowerCase() !== propertyManager.address.toLowerCase()) {
        console.log("\n❌ ERROR: Current account is not the designated property manager");
        console.log("Please use the property manager's private key");
        return;
    }

    console.log("\n" + "=".repeat(80));
    console.log("STEP 2: Check BRK Balance");
    console.log("=".repeat(80));

    const depositAmount = propertyData.depositAmount;
    const balance = await brkToken.balanceOf(propertyManager.address);

    console.log("Property Manager BRK Balance:", ethers.utils.formatEther(balance), "BRK");
    console.log("Required Deposit:", ethers.utils.formatEther(depositAmount), "BRK");

    if (balance.lt(depositAmount)) {
        console.log("\n❌ ERROR: Insufficient BRK balance!");
        console.log("Need", ethers.utils.formatEther(depositAmount), "BRK");
        console.log("Have", ethers.utils.formatEther(balance), "BRK");
        console.log("\nTo mint BRK tokens to this address, run:");
        console.log(`node scripts/mintBRK.js ${propertyManager.address} ${ethers.utils.formatEther(depositAmount)}`);
        return;
    }

    console.log("\n" + "=".repeat(80));
    console.log("STEP 3: Approve Marketplace to Spend BRK");
    console.log("=".repeat(80));

    const approvalTx = await brkToken.approve(marketplaceAddress, depositAmount);
    await approvalTx.wait();
    console.log("✓ Approved", ethers.utils.formatEther(depositAmount), "BRK for deposit");

    console.log("\n" + "=".repeat(80));
    console.log("STEP 4: Pay Deposit and Activate Property");
    console.log("=".repeat(80));

    console.log("Calling payDeposit for token ID:", tokenId);
    console.log("This will mint:");
    console.log("  - 24,000,000 bricks to Property Manager (10% stake)");
    console.log("  - 216,000,000 bricks to Trust Wallet (90% for community investors)");

    const tx = await marketplace.payDeposit(tokenId);
    const receipt = await tx.wait();

    console.log("✓ Deposit paid successfully!");
    console.log("Transaction hash:", receipt.transactionHash);

    console.log("\n" + "=".repeat(80));
    console.log("STEP 5: Verify Property Activation");
    console.log("=".repeat(80));

    const updatedPropertyData = await marketplace.properties(tokenId);
    const propertyManagerBalance = await marketplace.balanceOf(propertyManager.address, tokenId);
    const trustWallet = await marketplace.trustWallet();
    const trustWalletBalance = await marketplace.balanceOf(trustWallet, tokenId);

    console.log("Updated Property Status:", updatedPropertyData.status); // Should be 1 (ACTIVE)
    console.log("Property Manager Bricks:", propertyManagerBalance.toString());
    console.log("Trust Wallet Bricks:", trustWalletBalance.toString());
    console.log("Bricks Available for Sale:", updatedPropertyData.bricksAvailable.toString());

    console.log("\n" + "=".repeat(80));
    console.log("🎉 SUCCESS - Steeldale Mall Activated!");
    console.log("=".repeat(80));
    console.log("Property: Steeldale Mall Shopping Centre");
    console.log("Token ID:", tokenId);
    console.log("Status: ACTIVE (investors can now purchase bricks)");
    console.log("\n💰 Brick Distribution:");
    console.log("  Property Manager (10%):", propertyManagerBalance.toString(), "bricks");
    console.log("  Community Investors (90%):", trustWalletBalance.toString(), "bricks");
    console.log("\n📊 Returns Distribution:");
    console.log("  Property Manager earns: 10% of mortgage income (via brick ownership)");
    console.log("  Community investors earn: 90% of mortgage income");
    console.log("  Platform fee: 10% (handled by PaymentDistributor)");
    console.log("\n🔗 Trust Wallet:", trustWallet);
    console.log("OTP Period: 180 days from now");
    console.log("\n📋 Next Steps:");
    console.log("1. Bricks are now available for community investors to purchase");
    console.log("2. Investors can buy bricks via the marketplace UI");
    console.log("3. Once all bricks are sold, property status becomes FUNDED");
    console.log("4. Monthly rental payments will be distributed to all brick holders");
    console.log("=".repeat(80));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
