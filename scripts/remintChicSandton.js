const { ethers } = require("hardhat");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("REMINTING CHIC SANDTON APARTMENT - 2.8M NFTs");
    console.log("=".repeat(80));

    const [deployer] = await ethers.getSigners();
    console.log("\nMinting property with account:", deployer.address);

    // Contract addresses - UPDATE THESE AFTER REDEPLOYMENT
    const marketplaceAddress = process.env.MARKETPLACE_ADDRESS || "UPDATE_THIS";
    const brkTokenAddress = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";

    // IMPORTANT: UPDATE THIS WITH YOUR IPFS HASH
    const ipfsHash = process.env.IPFS_HASH || "UPDATE_THIS";
    const ipfsURI = `ipfs://${ipfsHash}`;

    console.log("\nUsing IPFS URI:", ipfsURI);

    const marketplace = await ethers.getContractAt("BrickMarketplace", marketplaceAddress);
    const brkToken = await ethers.getContractAt("IERC20", brkTokenAddress);

    console.log("\n" + "=".repeat(80));
    console.log("PROPERTY DETAILS");
    console.log("=".repeat(80));
    console.log("Name: Chic Sandton Apartment");
    console.log("Location: The Capital Empire, 177 Empire Pl, Sandhurst, Sandton, 2196");
    console.log("Total Value: R2,100,000 (mortgage)");
    console.log("Total Bricks: 2,800,000");
    console.log("Buyer Deposit (25%): 700,000 bricks");
    console.log("Investor Bricks (75%): 2,100,000 bricks");
    console.log("Price per Brick: 1 BRK (R1.00 on-chain)");
    console.log("Annual Yield: 7.2%");
    console.log("Monthly Payment: R18,050");

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
    const totalBricks = 2800000;
    const depositAmount = ethers.utils.parseUnits("700000", "ether");
    const buyerAddress = "0x6923ddaa0402be804cabf525e6a199772e025ba7";
    const otpPeriodDays = 90;

    console.log("Submitting property with:");
    console.log("  IPFS URI:", ipfsURI);
    console.log("  Total Bricks:", totalBricks.toLocaleString());
    console.log("  Price per Brick: 1 BRK");
    console.log("  Buyer Deposit Required:", ethers.utils.formatEther(depositAmount), "BRK");
    console.log("  Buyer Wallet:", buyerAddress);
    console.log("  OTP Period:", otpPeriodDays, "days");

    const tx = await marketplace.submitProperty(
        ipfsURI,
        totalBricks,
        pricePerBrick,
        depositAmount,
        buyerAddress,
        otpPeriodDays
    );

    const receipt = await tx.wait();
    console.log("✓ Property submitted successfully!");
    console.log("Transaction hash:", receipt.transactionHash);

    const event = receipt.events?.find(e => e.event === "PropertySubmitted");
    const tokenId = event?.args?.tokenId;

    console.log("\n" + "=".repeat(80));
    console.log("🎉 SUCCESS - Chic Sandton Apartment Reminted!");
    console.log("=".repeat(80));
    console.log("Property: Chic Sandton Apartment");
    console.log("Location: The Capital Empire, Sandton");
    console.log("Token ID:", tokenId?.toString() || "Check transaction logs");
    console.log("IPFS URI:", ipfsURI);
    console.log("Total Bricks Minted: 2,800,000");
    console.log("Status: PENDING (waiting for buyer deposit)");
    console.log("\nBuyer Wallet:", buyerAddress);
    console.log("Required Deposit: 700,000 bricks (700,000 BRK = R700,000)");
    console.log("Investor Bricks Available After Activation: 2,100,000");
    console.log("Price per Brick ON-CHAIN: 1 BRK (R1.00)");
    console.log("Price per Brick OFF-CHAIN: R1.05 (via card - includes 5% fee)");
    console.log("OTP Period: 90 days from activation");
    console.log("\nAll bricks will be minted to Trust Wallet:", await marketplace.trustWallet());
    console.log("=".repeat(80));

    console.log("\n📋 Next Steps:");
    console.log("1. Verify metadata in wallet (should show image and details)");
    console.log("2. Buyer must pay 700,000 BRK deposit to activate property");
    console.log("3. Run: PRIVATE_KEY=<buyer_key> npx hardhat run scripts/buyerPayDepositReal.js --network besu");
    console.log("=".repeat(80));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
