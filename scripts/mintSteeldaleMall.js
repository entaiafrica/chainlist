const { ethers } = require("hardhat");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("MINTING STEELDALE MALL - 240M NFTs (Commercial Property)");
    console.log("=".repeat(80));

    const [deployer] = await ethers.getSigners();
    console.log("\nMinting property with account:", deployer.address);

    // Contract addresses
    const marketplaceAddress = process.env.MARKETPLACE_ADDRESS || "0x7a25b476972ab363e116ecb9b8bae90aadc058f4";
    const brkTokenAddress = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";

    // IMPORTANT: UPDATE THIS WITH YOUR IPFS HASH
    const ipfsHash = process.env.IPFS_HASH || "UPDATE_THIS";
    const ipfsURI = `https://rpc.entailabs.com/ipfs/${ipfsHash}`;

    console.log("\nUsing IPFS URI:", ipfsURI);

    const marketplace = await ethers.getContractAt("BrickMarketplace", marketplaceAddress);
    const brkToken = await ethers.getContractAt("IERC20", brkTokenAddress);

    console.log("\n" + "=".repeat(80));
    console.log("PROPERTY DETAILS - STEELDALE MALL");
    console.log("=".repeat(80));
    console.log("Name: Steeldale Mall, Johannesburg");
    console.log("Type: Commercial - Shopping Centre");
    console.log("Location: 9 Linroy St, Steeledale, Johannesburg");
    console.log("GLA: 29,327m²");
    console.log("Total Value: R240,000,000");
    console.log("Total Bricks: 240,000,000");
    console.log("Property Manager Stake (10%): 24,000,000 bricks");
    console.log("Community Investor Bricks (90%): 216,000,000 bricks");
    console.log("Price per Brick: 1 BRK (R1.00 on-chain)");
    console.log("Annual Income: R30.1M");
    console.log("Net Yield: 12.5%");
    console.log("Monthly Income: R2,508,333");
    console.log("Occupancy: 95%");
    console.log("Major Tenants: Pick n Pay, Dischem, Pepkor, KFC, Sasol");

    console.log("\n" + "=".repeat(80));
    console.log("STEP 1: Approve 1000 BRK Listing Fee");
    console.log("=".repeat(80));
    const listingFee = ethers.utils.parseUnits("1000", "ether");

    const balance = await brkToken.balanceOf(deployer.address);
    console.log("Deployer BRK balance:", ethers.utils.formatEther(balance), "BRK");

    if (balance.lt(listingFee)) {
        console.log("\n⚠️  WARNING: Insufficient BRK balance!");
        console.log("Need 1000 BRK but only have", ethers.utils.formatEther(balance), "BRK");
        return;
    }

    const approvalTx = await brkToken.approve(marketplaceAddress, listingFee);
    await approvalTx.wait();
    console.log("✓ Approved 1000 BRK for listing fee");

    console.log("\n" + "=".repeat(80));
    console.log("STEP 2: Submit Property to Marketplace");
    console.log("=".repeat(80));

    const pricePerBrick = ethers.utils.parseUnits("1.0", "ether");
    const totalBricks = 240000000;
    const depositAmount = ethers.utils.parseUnits("24000000", "ether"); // 10% stake for property manager
    const propertyManagerAddress = "0x4f4f05360a3863a321a7dc9605f2b39a52a109de";
    const otpPeriodDays = 180; // 6 months

    console.log("Submitting property with:");
    console.log("  IPFS URI:", ipfsURI);
    console.log("  Total Bricks:", totalBricks.toLocaleString());
    console.log("  Price per Brick: 1 BRK");
    console.log("  Property Manager Deposit Required:", ethers.utils.formatEther(depositAmount), "BRK (10% stake)");
    console.log("  Property Manager Wallet:", propertyManagerAddress);
    console.log("  OTP Period:", otpPeriodDays, "days (6 months)");

    const tx = await marketplace.submitProperty(
        ipfsURI,
        totalBricks,
        pricePerBrick,
        depositAmount,
        propertyManagerAddress,
        otpPeriodDays
    );

    const receipt = await tx.wait();
    console.log("✓ Property submitted successfully!");
    console.log("Transaction hash:", receipt.transactionHash);

    const event = receipt.events?.find(e => e.event === "PropertySubmitted");
    const tokenId = event?.args?.tokenId;

    console.log("\n" + "=".repeat(80));
    console.log("🎉 SUCCESS - Steeldale Mall Property Submitted!");
    console.log("=".repeat(80));
    console.log("Property: Steeldale Mall Shopping Centre");
    console.log("Location: Steeledale, Johannesburg");
    console.log("Token ID:", tokenId?.toString() || "Check transaction logs");
    console.log("IPFS URI:", ipfsURI);
    console.log("Total Bricks Submitted: 240,000,000");
    console.log("Status: PENDING (waiting for property manager deposit)");
    console.log("\nProperty Manager Wallet:", propertyManagerAddress);
    console.log("Required Deposit: 24,000,000 bricks (24,000,000 BRK = R24,000,000)");
    console.log("This represents 10% stake in the property");
    console.log("\nCommunity Investor Bricks Available After Activation: 216,000,000 (90%)");
    console.log("Price per Brick ON-CHAIN: 1 BRK (R1.00)");
    console.log("Price per Brick OFF-CHAIN: R1.05 (via card - includes 5% fee)");
    console.log("OTP Period: 180 days from activation (Dec 2025 - June 2026)");
    console.log("\nAll bricks will be minted to Trust Wallet:", await marketplace.trustWallet());
    console.log("Trust Wallet (Community Owned):", "0x361ba631152be934ef5d6e1670a177ecef9458b6");
    console.log("=".repeat(80));

    console.log("\n📋 Next Steps:");
    console.log("1. Verify metadata displays correctly in wallet");
    console.log("2. Mint 24M BRK tokens to property manager if needed:");
    console.log("   node scripts/mintBRK.js 0x4f4f05360a3863a321a7dc9605f2b39a52a109de 24000000");
    console.log("3. Property manager must pay 24M BRK deposit to activate property:");
    console.log("   PRIVATE_KEY=<property_manager_key> TOKEN_ID=" + (tokenId?.toString() || "X") + " \\");
    console.log("   npx hardhat run scripts/activateSteeldaleMall.js --network besu");
    console.log("\n💡 Note: Property manager receives 10% stake (24M bricks) and earns 10% of mortgage income");
    console.log("   Community investors get 90% stake (216M bricks) and 90% of mortgage income");
    console.log("=".repeat(80));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
