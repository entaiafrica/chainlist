const { ethers } = require("hardhat");

async function main() {
    console.log("\n" + "=".repeat(70));
    console.log("BUYER PAYING DEPOSIT - Chic Sandton Apartment");
    console.log("=".repeat(70));

    // Configuration
    const marketplaceAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F"; // Updated after redeployment
    const brkTokenAddress = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";
    const buyerPrivateKey = "0xd30cf28dd2ff74e1f85e9d398b39c6ae333f1b4c131e4558edeb2de8446e9b44";
    const tokenId = 1; // Token ID for Chic Sandton Apartment

    // Connect with actual buyer wallet
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const buyerWallet = new ethers.Wallet(buyerPrivateKey, provider);

    console.log("\n📋 Transaction Details:");
    console.log("  Property: Chic Sandton Apartment");
    console.log("  Location: The Capital Empire, Sandton");
    console.log("  Token ID:", tokenId);
    console.log("  Buyer Wallet:", buyerWallet.address);

    // Get contracts
    const marketplace = await ethers.getContractAt("BrickMarketplace", marketplaceAddress, buyerWallet);
    const brkToken = await ethers.getContractAt("IERC20", brkTokenAddress, buyerWallet);

    // Check property exists
    const propertyData = await marketplace.getPropertyData(tokenId);
    console.log("\n✓ Property found");
    console.log("  Total Bricks:", propertyData.totalBricks.toString());
    console.log("  Available Bricks:", propertyData.bricksAvailable.toString());
    console.log("  Price per Brick:", ethers.utils.formatEther(propertyData.pricePerBrick), "BRK");
    console.log("  Deposit Required:", ethers.utils.formatEther(propertyData.depositAmount), "BRK");
    console.log("  Status:", propertyData.status === 0 ? "PENDING" : propertyData.status === 1 ? "ACTIVE" : "OTHER");

    // Check if deposit already paid (by checking if buyer has NFTs and status is not PENDING)
    const buyerNFTCheck = await marketplace.balanceOf(buyerWallet.address, tokenId);
    if (buyerNFTCheck.gt(0) || propertyData.status !== 0) {
        console.log("\n⚠️  WARNING: Deposit already paid!");
        console.log("Buyer NFT Balance:", buyerNFTCheck.toString());
        console.log("Property Status:", propertyData.status === 1 ? "ACTIVE" : "OTHER");
        return;
    }

    // Check buyer's BRK balance
    const buyerBalance = await brkToken.balanceOf(buyerWallet.address);
    console.log("\n💰 Buyer BRK Balance:", ethers.utils.formatEther(buyerBalance), "BRK");

    if (buyerBalance.lt(propertyData.depositAmount)) {
        console.log("\n⚠️  INSUFFICIENT BALANCE!");
        console.log("Required:", ethers.utils.formatEther(propertyData.depositAmount), "BRK");
        console.log("Current:", ethers.utils.formatEther(buyerBalance), "BRK");
        console.log("Shortage:", ethers.utils.formatEther(propertyData.depositAmount.sub(buyerBalance)), "BRK");
        console.log("\nPlease transfer", ethers.utils.formatEther(propertyData.depositAmount.sub(buyerBalance)), "BRK to buyer wallet first");
        return;
    }

    console.log("\n" + "=".repeat(70));
    console.log("STEP 1: Approve BRK Tokens");
    console.log("=".repeat(70));

    let approveTx = await brkToken.approve(marketplaceAddress, propertyData.depositAmount);
    await approveTx.wait();
    console.log("✓ Approved", ethers.utils.formatEther(propertyData.depositAmount), "BRK");

    console.log("\n" + "=".repeat(70));
    console.log("STEP 2: Pay Deposit");
    console.log("=".repeat(70));

    let depositTx = await marketplace.payDeposit(tokenId);
    let receipt = await depositTx.wait();
    console.log("✓ Deposit paid! Transaction:", receipt.transactionHash);

    // Check results
    const newBuyer = await marketplace.getBuyer(tokenId);
    const buyerNFTBalance = await marketplace.balanceOf(buyerWallet.address, tokenId);
    const updatedPropertyData = await marketplace.getPropertyData(tokenId);

    console.log("\n" + "=".repeat(70));
    console.log("✅ SUCCESS - DEPOSIT PAID & PROPERTY ACTIVATED!");
    console.log("=".repeat(70));
    console.log("Property: Chic Sandton Apartment");
    console.log("Location: The Capital Empire, Sandton");
    console.log("Token ID:", tokenId);
    console.log("Buyer:", newBuyer);
    console.log("Buyer's NFT Balance:", buyerNFTBalance.toString(), "bricks");
    console.log("Remaining Bricks for Investors:", updatedPropertyData.bricksAvailable.toString());
    console.log("Property Status:", updatedPropertyData.status === 1 ? "ACTIVE ✓" : "Status code: " + updatedPropertyData.status);
    console.log("\n💎 Buyer now owns", buyerNFTBalance.toString(), "NFTs (700,000 bricks)");
    console.log("🏦 Remaining", updatedPropertyData.bricksAvailable.toString(), "bricks available for investors");
    console.log("\n⚠️  IMPORTANT: Buyer will NOT receive monthly payments");
    console.log("Only investors receive the 90% payment distribution");
    console.log("Investor bricks: 2,100,000 (based on total investor pool)");
    console.log("\n📋 Next Steps:");
    console.log("1. Investors can now purchase bricks (minimum 100 bricks)");
    console.log("2. Price: 1 BRK per brick (users pay R1.05 via card for 1 BRK token)");
    console.log("3. OTP Period: 90 days to sell all 2,100,000 investor bricks");
    console.log("4. When fully funded → Monthly payments of R18,050 start");
    console.log("=".repeat(70));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
