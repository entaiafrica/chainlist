const { ethers } = require("hardhat");

async function main() {
    const marketplaceAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const tokenId = 1;

    const [deployer] = await ethers.getSigners();
    const marketplace = await ethers.getContractAt("BrickMarketplace", marketplaceAddress);

    const propertyData = await marketplace.getPropertyData(tokenId);
    const buyer = await marketplace.getBuyer(tokenId);
    const trustWallet = await marketplace.trustWallet();

    console.log("\n" + "=".repeat(70));
    console.log("CHIC SANDTON APARTMENT - PROPERTY STATUS");
    console.log("=".repeat(70));
    console.log("Token ID:", tokenId);
    console.log("Total Bricks:", propertyData.totalBricks.toString());
    console.log("Available Bricks:", propertyData.bricksAvailable.toString());
    console.log("Price per Brick:", ethers.utils.formatEther(propertyData.pricePerBrick), "BRK");
    console.log("Deposit Amount:", ethers.utils.formatEther(propertyData.depositAmount), "BRK");

    const statusNames = ["PENDING", "ACTIVE", "FUNDED", "FAILED", "CLOSED"];
    console.log("Status:", statusNames[propertyData.status] || "UNKNOWN");

    console.log("\n" + "=".repeat(70));
    console.log("OWNERSHIP");
    console.log("=".repeat(70));
    console.log("Buyer:", buyer);
    console.log("Trust Wallet:", trustWallet);

    // Check NFT balances
    const buyerBalance = await marketplace.balanceOf(buyer, tokenId);
    const trustBalance = await marketplace.balanceOf(trustWallet, tokenId);

    console.log("\nBuyer NFT Balance:", buyerBalance.toString(), "bricks");
    console.log("Trust Wallet NFT Balance:", trustBalance.toString(), "bricks");

    console.log("\n" + "=".repeat(70));
    console.log("SUMMARY");
    console.log("=".repeat(70));

    if (propertyData.status === 1) {
        console.log("✅ Property is ACTIVE - Investors can buy bricks!");
        console.log("Available for investors:", propertyData.bricksAvailable.toString(), "bricks");
    } else if (propertyData.status === 0) {
        console.log("⏳ Property is PENDING - Waiting for buyer deposit");
    } else if (propertyData.status === 2) {
        console.log("✅ Property is FUNDED - All bricks sold!");
    }

    console.log("=".repeat(70));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
