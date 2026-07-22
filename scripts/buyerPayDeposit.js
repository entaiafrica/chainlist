const { ethers } = require("hardhat");

async function main() {
    console.log("\n" + "=".repeat(70));
    console.log("BUYER PAYING DEPOSIT - Chic Sandton Apartment");
    console.log("=".repeat(70));

    // Configuration
    const marketplaceAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Update after deployment
    const brkTokenAddress = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";
    const buyerAddress = "0x6923ddaa0402be804cabf525e6a199772e025ba7";
    const tokenId = 1; // Token ID for Chic Sandton Apartment

    // Get deployer for impersonation
    const [deployer] = await ethers.getSigners();

    console.log("\n📋 Transaction Details:");
    console.log("  Property: Chic Sandton Apartment");
    console.log("  Location: The Capital Empire, Sandton");
    console.log("  Token ID:", tokenId);
    console.log("  Buyer Wallet:", buyerAddress);
    console.log("  Deployer (for gas):", deployer.address);

    // Get contracts
    const marketplace = await ethers.getContractAt("BrickMarketplace", marketplaceAddress);
    const brkToken = await ethers.getContractAt("IERC20", brkTokenAddress);

    // Check property exists
    const propertyData = await marketplace.getPropertyData(tokenId);
    console.log("\n✓ Property found");
    console.log("  Total Bricks:", propertyData.totalBricks.toString());
    console.log("  Available Bricks:", propertyData.bricksAvailable.toString());
    console.log("  Price per Brick:", ethers.utils.formatEther(propertyData.pricePerBrick), "BRK");
    console.log("  Deposit Required:", ethers.utils.formatEther(propertyData.depositAmount), "BRK");
    console.log("  Status:", propertyData.status === 0 ? "PENDING" : propertyData.status === 1 ? "ACTIVE" : "OTHER");

    // Check if deposit already paid
    const existingBuyer = await marketplace.getBuyer(tokenId);
    if (existingBuyer !== ethers.constants.AddressZero) {
        console.log("\n⚠️  WARNING: Deposit already paid by:", existingBuyer);
        console.log("Only one buyer can pay deposit per property");
        return;
    }

    console.log("\n" + "=".repeat(70));
    console.log("STEP 1: Impersonate Buyer Wallet & Fund with Gas");
    console.log("=".repeat(70));

    // Impersonate buyer wallet for Hardhat testing
    await ethers.provider.send("hardhat_impersonateAccount", [buyerAddress]);
    const buyer = await ethers.getSigner(buyerAddress);
    console.log("✓ Impersonating buyer wallet:", buyerAddress);

    // Fund buyer with ETH for gas
    await deployer.sendTransaction({
        to: buyerAddress,
        value: ethers.utils.parseEther("1.0")
    });
    console.log("✓ Sent 1 ETH to buyer for gas fees");

    console.log("\n" + "=".repeat(70));
    console.log("STEP 2: Transfer BRK to Buyer");
    console.log("=".repeat(70));

    const buyerBalance = await brkToken.balanceOf(buyerAddress);
    console.log("Current buyer BRK balance:", ethers.utils.formatEther(buyerBalance), "BRK");

    if (buyerBalance.lt(propertyData.depositAmount)) {
        console.log("⚠️  Insufficient balance! Transferring", ethers.utils.formatEther(propertyData.depositAmount), "BRK to buyer...");
        await brkToken.connect(deployer).transfer(buyerAddress, propertyData.depositAmount);
        console.log("✓ Transferred", ethers.utils.formatEther(propertyData.depositAmount), "BRK to buyer");
    } else {
        console.log("✓ Buyer already has sufficient BRK balance");
    }

    console.log("\n" + "=".repeat(70));
    console.log("STEP 3: Approve BRK Tokens");
    console.log("=".repeat(70));

    const buyerBrkContract = brkToken.connect(buyer);
    let approveTx = await buyerBrkContract.approve(marketplaceAddress, propertyData.depositAmount);
    await approveTx.wait();
    console.log("✓ Approved", ethers.utils.formatEther(propertyData.depositAmount), "BRK");

    console.log("\n" + "=".repeat(70));
    console.log("STEP 4: Pay Deposit");
    console.log("=".repeat(70));

    const buyerMarketplace = marketplace.connect(buyer);
    let depositTx = await buyerMarketplace.payDeposit(tokenId);
    let receipt = await depositTx.wait();
    console.log("✓ Deposit paid! Transaction:", receipt.transactionHash);

    // Check results
    const newBuyer = await marketplace.getBuyer(tokenId);
    const buyerNFTBalance = await marketplace.balanceOf(buyerAddress, tokenId);
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
