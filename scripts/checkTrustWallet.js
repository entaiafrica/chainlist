const { ethers } = require("hardhat");

async function main() {
    const marketplaceAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const tokenId = 1;

    const [deployer] = await ethers.getSigners();
    const marketplace = await ethers.getContractAt("BrickMarketplace", marketplaceAddress);

    const trustWallet = await marketplace.trustWallet();
    const buyerWallet = "0x6923DdaA0402bE804CAbF525e6a199772e025ba7";

    console.log("\n" + "=".repeat(70));
    console.log("NFT BALANCES FOR TOKEN ID 1 (Chic Sandton)");
    console.log("=".repeat(70));

    const trustBalance = await marketplace.balanceOf(trustWallet, tokenId);
    const buyerBalance = await marketplace.balanceOf(buyerWallet, tokenId);

    console.log("Trust Wallet:", trustWallet);
    console.log("  Balance:", trustBalance.toString(), "NFTs");

    console.log("\nBuyer Wallet:", buyerWallet);
    console.log("  Balance:", buyerBalance.toString(), "NFTs");

    console.log("\n" + "=".repeat(70));
    console.log("TOTAL MINTED:", trustBalance.add(buyerBalance).toString(), "NFTs");
    console.log("Expected: 2,800,000 NFTs");
    console.log("=".repeat(70));

    // Get property data
    const propertyData = await marketplace.getPropertyData(tokenId);
    console.log("\nProperty Status:", propertyData.status === 1 ? "ACTIVE" : "OTHER");
    console.log("Available for Investors:", propertyData.bricksAvailable.toString());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
