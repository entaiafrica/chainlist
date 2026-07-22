const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Minting property with account:", deployer.address);

    // Contract addresses (update these after deployment)
    const marketplaceAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const brkTokenAddress = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";

    // Get contract instances
    const marketplace = await ethers.getContractAt("BrickMarketplace", marketplaceAddress);
    const brkToken = await ethers.getContractAt("IERC20", brkTokenAddress);

    // Property data for 789 Parkview Drive
    const propertyMetadata = {
        name: "789 Parkview Drive, Johannesburg",
        description: "2-bedroom townhouse in secure complex. Modern kitchen, spacious lounge, covered parking, and small garden. Close to schools and shopping.",
        image: "https://uploadcare.engelvoelkers.com/7dadc2df-2624-406a-a800-5abdd5d42c34/",
        external_url: "https://facebrick.com/property/789-parkview-drive-johannesburg",
        attributes: [
            { trait_type: "Property Type", value: "Townhouse" },
            { trait_type: "Total Value", value: "R800,000" },
            { trait_type: "Annual Yield", value: "11%" },
            { trait_type: "Risk Rating", value: "Low" },
            { trait_type: "Bedrooms", display_type: "number", value: 2 },
            { trait_type: "Bathrooms", display_type: "number", value: 1 },
            { trait_type: "Year Built", display_type: "number", value: 2010 }
        ],
        properties: {
            totalBricks: 800000,
            bricksToSell: 80000,
            pricePerBrick: "1.00 BRK",
            mortgageAmount: 640000,
            interestRate: 11.0,
            monthlyPayment: 9136,
            mortgageTerm: 15,
            downPayment: 160000,
            annualYield: 11.0,
            propertyAppreciation: 5.5,
            expectedTotalReturn: 16.5
        }
    };

    console.log("\n=== Property Details ===");
    console.log("Name:", propertyMetadata.name);
    console.log("Total Bricks:", propertyMetadata.properties.totalBricks);
    console.log("Price per Brick:", propertyMetadata.properties.pricePerBrick);
    console.log("Annual Yield:", propertyMetadata.properties.annualYield + "%");
    console.log("Monthly Payment: R" + propertyMetadata.properties.monthlyPayment);

    // For this demo, we'll use a simple JSON string as the metadata URI
    // In production, you would upload this to IPFS
    const metadataURI = JSON.stringify(propertyMetadata);
    console.log("\n=== Metadata ===");
    console.log("Metadata will be stored on-chain for demo purposes");
    console.log("In production, upload to IPFS first");

    // In a real scenario, you would:
    // 1. Upload metadata to IPFS using Pinata or similar
    // 2. Get the IPFS hash
    // 3. Use ipfs://QmXXXX... as the metadataURI

    // For demo, we'll use a placeholder IPFS URI
    const ipfsURI = "ipfs://QmDemo789ParkviewDrive/metadata.json";

    console.log("\n=== Step 1: Approve 1000 BRK Listing Fee ===");
    const listingFee = ethers.utils.parseUnits("1000", "ether");

    // Check deployer's BRK balance
    const balance = await brkToken.balanceOf(deployer.address);
    console.log("Deployer BRK balance:", ethers.utils.formatEther(balance), "BRK");

    if (balance.lt(listingFee)) {
        console.log("\n⚠️  WARNING: Insufficient BRK balance!");
        console.log("Need 1000 BRK but only have", ethers.utils.formatEther(balance), "BRK");
        console.log("Please ensure the deployer has at least 1000 BRK tokens");
        console.log("\nYou can skip the approval and listing if this is just a test");
        return;
    }

    const approvalTx = await brkToken.approve(marketplaceAddress, listingFee);
    await approvalTx.wait();
    console.log("✓ Approved 1000 BRK for listing fee");

    console.log("\n=== Step 2: List Property on Marketplace ===");
    const pricePerBrick = ethers.utils.parseUnits("1.0", "ether"); // 1.00 BRK per brick
    const totalBricks = 800000; // 800,000 bricks

    const tx = await marketplace.listProperty(
        ipfsURI,
        totalBricks,
        pricePerBrick
    );

    const receipt = await tx.wait();
    console.log("✓ Property listed successfully!");
    console.log("Transaction hash:", receipt.transactionHash);

    // Get the token ID from the event
    const event = receipt.events?.find(e => e.event === "PropertyListed");
    const tokenId = event?.args?.tokenId;

    console.log("\n" + "=".repeat(70));
    console.log("🎉 SUCCESS - 789 Parkview Drive Minted!");
    console.log("=".repeat(70));
    console.log("Token ID:", tokenId?.toString() || "Check transaction logs");
    console.log("Total Bricks Minted:", totalBricks.toLocaleString());
    console.log("Price per Brick: R1.00 (1 BRK)");
    console.log("All bricks minted to Trust Wallet:", await marketplace.trustWallet());
    console.log("\nInvestors can now buy bricks (minimum 100) with BRK tokens");
    console.log("Each purchase transfers actual ERC1155 NFTs from trust wallet");
    console.log("NFTs will be visible in MetaMask!");
    console.log("=".repeat(70));

    console.log("\n📋 Next Steps:");
    console.log("1. Update frontend to use token ID:", tokenId?.toString());
    console.log("2. Test buying bricks with MetaMask");
    console.log("3. Verify NFTs appear in MetaMask NFT gallery");
    console.log("4. Test payment distribution");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
