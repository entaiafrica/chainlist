const { ethers } = require("hardhat");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("MINTING CHIC SANDTON APARTMENT - 2.8M NFTs");
    console.log("=".repeat(80));

    const [deployer] = await ethers.getSigners();
    console.log("\nMinting property with account:", deployer.address);

    // Contract addresses (update these after deployment)
    const marketplaceAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const brkTokenAddress = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";

    // Get contract instances
    const marketplace = await ethers.getContractAt("BrickMarketplace", marketplaceAddress);
    const brkToken = await ethers.getContractAt("IERC20", brkTokenAddress);

    // Property data for Chic Sandton Apartment
    const propertyMetadata = {
        name: "Chic Sandton Apartment",
        description: "A stunning 2-bedroom, 2-bathroom apartment in the heart of Sandton. This modern unit boasts high-end finishes, an open-plan living area, and a balcony with city views. The complex includes a pool, gym, and 24-hour security.",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2940&auto=format&fit=crop",
        external_url: "https://facebrick.com/property/chic-sandton-apartment",
        attributes: [
            { trait_type: "Property Type", value: "Apartment" },
            { trait_type: "Total Value", value: "R2,800,000" },
            { trait_type: "Annual Yield", value: "7.2%" },
            { trait_type: "Risk Rating", value: "Low" },
            { trait_type: "Bedrooms", display_type: "number", value: 2 },
            { trait_type: "Bathrooms", display_type: "number", value: 2 },
            { trait_type: "Year Built", display_type: "number", value: 2018 },
            { trait_type: "Location", value: "Sandton, Johannesburg" }
        ],
        properties: {
            propertyAddress: "The Capital Empire, 177 Empire Pl, Sandhurst, Sandton, 2196",
            gps: "-26.1035, 28.0497",
            totalBricks: 2800000,
            bricksForBuyer: 700000,
            bricksForInvestors: 2100000,
            pricePerBrick: "1.00 BRK",
            mortgageAmount: 2100000,
            interestRate: 8.5,
            monthlyPayment: 18050,
            mortgageTerm: 20,
            downPayment: 700000,
            annualYield: 7.2,
            propertyAppreciation: 4.5,
            expectedTotalReturn: 11.7,
            images: [
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2940&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1600585152915-d208bec867a1?q=80&w=2872&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1600607687939-ce8a6a25118c?q=80&w=2940&auto=format&fit=crop"
            ]
        }
    };

    console.log("\n" + "=".repeat(80));
    console.log("PROPERTY DETAILS");
    console.log("=".repeat(80));
    console.log("Name:", propertyMetadata.name);
    console.log("Location:", propertyMetadata.properties.propertyAddress);
    console.log("Total Value: R" + propertyMetadata.properties.mortgageAmount.toLocaleString() + " (mortgage)");
    console.log("Total Bricks:", propertyMetadata.properties.totalBricks.toLocaleString());
    console.log("Buyer Deposit (25%):", propertyMetadata.properties.bricksForBuyer.toLocaleString(), "bricks");
    console.log("Investor Bricks (75%):", propertyMetadata.properties.bricksForInvestors.toLocaleString(), "bricks");
    console.log("Price per Brick: 1 BRK (R1.00 on-chain)");
    console.log("Annual Yield:", propertyMetadata.properties.annualYield + "%");
    console.log("Monthly Payment: R" + propertyMetadata.properties.monthlyPayment.toLocaleString());

    // For demo, we'll use a placeholder IPFS URI
    // In production, upload metadata JSON to IPFS first
    const ipfsURI = "ipfs://QmDemoChicSandtonApartment/metadata.json";

    console.log("\n" + "=".repeat(80));
    console.log("STEP 1: Approve 1000 BRK Listing Fee");
    console.log("=".repeat(80));
    const listingFee = ethers.utils.parseUnits("1000", "ether");

    // Check deployer's BRK balance
    const balance = await brkToken.balanceOf(deployer.address);
    console.log("Deployer BRK balance:", ethers.utils.formatEther(balance), "BRK");

    if (balance.lt(listingFee)) {
        console.log("\n⚠️  WARNING: Insufficient BRK balance!");
        console.log("Need 1000 BRK but only have", ethers.utils.formatEther(balance), "BRK");
        console.log("Please ensure the deployer has at least 1000 BRK tokens");
        return;
    }

    const approvalTx = await brkToken.approve(marketplaceAddress, listingFee);
    await approvalTx.wait();
    console.log("✓ Approved 1000 BRK for listing fee");

    console.log("\n" + "=".repeat(80));
    console.log("STEP 2: Submit Property to Marketplace");
    console.log("=".repeat(80));

    // Property parameters for submitProperty()
    const pricePerBrick = ethers.utils.parseUnits("1.0", "ether"); // 1 BRK per brick ON-CHAIN
    const totalBricks = 2800000; // 2.8M bricks
    const depositAmount = ethers.utils.parseUnits("700000", "ether"); // 700K BRK (25% deposit)
    const buyerAddress = "0x6923ddaa0402be804cabf525e6a199772e025ba7";
    const otpPeriodDays = 90; // 90-day funding period

    console.log("Submitting property with:");
    console.log("  Total Bricks:", totalBricks.toLocaleString());
    console.log("  Price per Brick: 1 BRK");
    console.log("  Buyer Deposit Required:", ethers.utils.formatEther(depositAmount), "BRK");
    console.log("  Buyer Wallet:", buyerAddress);
    console.log("  OTP Period:", otpPeriodDays, "days");

    // NOTE: Users pay R1.05 via card (off-chain) but get 1 BRK token per R1.05
    // On-chain: 1 BRK = 1 brick (no conversion needed)

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

    // Get the token ID from the event
    const event = receipt.events?.find(e => e.event === "PropertySubmitted");
    const tokenId = event?.args?.tokenId;

    console.log("\n" + "=".repeat(80));
    console.log("🎉 SUCCESS - Chic Sandton Apartment Minted!");
    console.log("=".repeat(80));
    console.log("Property: Chic Sandton Apartment");
    console.log("Location: The Capital Empire, Sandton");
    console.log("Token ID:", tokenId?.toString() || "Check transaction logs");
    console.log("Total Bricks Minted:", totalBricks.toLocaleString());
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
    console.log("1. Buyer must pay 700,000 BRK deposit to activate property (25% down payment)");
    console.log("2. Run buyer deposit script: npx hardhat run scripts/buyerPayDeposit.js");
    console.log("3. Property status changes PENDING → ACTIVE");
    console.log("4. Investors buy BRK tokens (R1.05 via card → 1 BRK), then buy bricks (100 BRK = 100 bricks)");
    console.log("5. When all 2.1M investor bricks sold → FUNDED → Monthly payments start");
    console.log("=".repeat(80));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
