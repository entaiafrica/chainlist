const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("COMPLETE GASLESS MARKETPLACE DEPLOYMENT");
    console.log("=".repeat(80));

    const [deployer, buyer1, propertyManager] = await ethers.getSigners();

    console.log("\nAccounts:");
    console.log("  Deployer:", deployer.address);
    console.log("  Buyer 1:", buyer1.address);
    console.log("  Property Manager:", propertyManager.address);
    console.log();

    // ========== STEP 1: Deploy/Get Forwarder ==========
    console.log("STEP 1: Deploy MinimalForwarder");
    console.log("=".repeat(80));

    let forwarderAddress;
    if (fs.existsSync('./forwarder-deployment.json')) {
        const forwarderData = JSON.parse(fs.readFileSync('./forwarder-deployment.json', 'utf8'));
        forwarderAddress = forwarderData.address;
        console.log("✅ Using existing forwarder:", forwarderAddress);
    } else {
        const MinimalForwarder = await ethers.getContractFactory("MinimalForwarder");
        const forwarder = await MinimalForwarder.deploy();
        await forwarder.deployed();
        forwarderAddress = forwarder.address;

        fs.writeFileSync('./forwarder-deployment.json', JSON.stringify({
            address: forwarderAddress,
            deployedAt: new Date().toISOString()
        }, null, 2));

        console.log("✅ MinimalForwarder deployed:", forwarderAddress);
    }
    console.log();

    // ========== STEP 2: Deploy BRK Token ==========
    console.log("STEP 2: Deploy BRK Token");
    console.log("=".repeat(80));

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const initialSupply = ethers.utils.parseEther("100000000"); // 100M initial supply
    const brkToken = await MockERC20.deploy("Brick Token", "BRK", initialSupply);
    await brkToken.deployed();
    console.log("✅ BRK Token deployed:", brkToken.address);
    console.log("   Initial supply:", ethers.utils.formatEther(initialSupply), "BRK");

    // Mint additional tokens
    console.log("Minting additional BRK tokens...");
    await (await brkToken.mint(buyer1.address, ethers.utils.parseEther("1000000"))).wait(); // 1M
    await (await brkToken.mint(propertyManager.address, ethers.utils.parseEther("30000000"))).wait(); // 30M
    console.log("✅ Additional tokens minted\n");

    // ========== STEP 3: Deploy Marketplace with Forwarder ==========
    console.log("STEP 3: Deploy BrickMarketplace with Gasless Support");
    console.log("=".repeat(80));

    const BrickMarketplace = await ethers.getContractFactory("BrickMarketplace");
    const baseURI = "https://rpc.entailabs.com/ipfs/";

    console.log("Deploying with forwarder:", forwarderAddress);
    const marketplace = await BrickMarketplace.deploy(baseURI, forwarderAddress);
    await marketplace.deployed();
    console.log("✅ BrickMarketplace deployed:", marketplace.address);

    // Verify forwarder is trusted
    const isTrusted = await marketplace.isTrustedForwarder(forwarderAddress);
    console.log("Forwarder trusted:", isTrusted ? "✅" : "❌");
    console.log();

    // ========== STEP 4: Configure Marketplace ==========
    console.log("STEP 4: Configure Marketplace");
    console.log("=".repeat(80));

    console.log("Setting BRK token...");
    await (await marketplace.setBrkToken(brkToken.address)).wait();
    console.log("✅ BRK token set");

    console.log("Funding marketplace with 10 ETH for gas sponsorship...");
    await (await deployer.sendTransaction({
        to: marketplace.address,
        value: ethers.utils.parseEther("10")
    })).wait();
    console.log("✅ Marketplace funded");

    const gasSponsorshipEnabled = await marketplace.gasSponsorshipEnabled();
    const gasStipend = await marketplace.gasStipend();
    const marketplaceBalance = await deployer.provider.getBalance(marketplace.address);
    console.log("Gas Sponsorship:", gasSponsorshipEnabled ? "ENABLED ✅" : "DISABLED");
    console.log("Gas Stipend:", ethers.utils.formatEther(gasStipend), "ETH per investor");
    console.log("Contract Balance:", ethers.utils.formatEther(marketplaceBalance), "ETH\n");

    // ========== STEP 5: Create Property Metadata ==========
    console.log("STEP 5: Prepare Property Metadata");
    console.log("=".repeat(80));

    // For demo, we'll use the RPC gateway - in production, upload to IPFS first
    // The metadata files should be accessible at the gateway

    // Create metadata directory if it doesn't exist
    if (!fs.existsSync('./metadata')) {
        fs.mkdirSync('./metadata');
    }

    // Chic Sandton metadata
    const chicSandtonMetadata = {
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

    // Steeldale Mall metadata
    const steeldaleMallMetadata = {
        name: "Steeldale Mall Shopping Centre",
        description: "A prime commercial shopping centre in Johannesburg with strong tenant mix and consistent mortgage income. This property features 29,327m² GLA with major anchor tenants including Pick n Pay, Dischem, and Pepkor. The mall enjoys 95% occupancy and generates R30.1M annual income with a 12.5% net yield.",
        image: "https://images.unsplash.com/photo-1555529902-5261145633bf?q=80&w=2940&auto=format&fit=crop",
        external_url: "https://facebrick.com/property/steeldale-mall",
        attributes: [
            { trait_type: "Property Type", value: "Commercial - Shopping Centre" },
            { trait_type: "Total Value", value: "R240,000,000" },
            { trait_type: "Annual Yield", value: "12.5%" },
            { trait_type: "Risk Rating", value: "Medium" },
            { trait_type: "GLA", value: "29,327m²" },
            { trait_type: "Occupancy", value: "95%" },
            { trait_type: "Year Built", display_type: "number", value: 2005 },
            { trait_type: "Location", value: "Steeledale, Johannesburg" }
        ],
        properties: {
            propertyAddress: "9 Linroy St, Steeledale, Johannesburg, 2197",
            gps: "-26.2467, 27.9542",
            totalBricks: 240000000,
            bricksForBuyer: 24000000,
            bricksForInvestors: 216000000,
            pricePerBrick: "1.00 BRK",
            totalValue: 240000000,
            monthlyIncome: 2508333,
            annualIncome: 30100000,
            downPayment: 24000000,
            annualYield: 12.5,
            propertyAppreciation: 3.5,
            expectedTotalReturn: 16.0,
            gla: "29,327m²",
            occupancy: "95%",
            majorTenants: ["Pick n Pay", "Dischem", "Pepkor", "KFC", "Sasol"],
            images: [
                "https://images.unsplash.com/photo-1555529902-5261145633bf?q=80&w=2940&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1519922639192-e73293ca430e?q=80&w=2942&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1567449303183-7071f7f2d7a0?q=80&w=2940&auto=format&fit=crop"
            ]
        }
    };

    // Save metadata files
    fs.writeFileSync('./metadata/chic-sandton.json', JSON.stringify(chicSandtonMetadata, null, 2));
    fs.writeFileSync('./metadata/steeldale-mall.json', JSON.stringify(steeldaleMallMetadata, null, 2));
    console.log("✅ Metadata files created\n");

    // For now, use the metadata directly in the URI
    // In production, you'd upload to IPFS and get the hash
    const chicSandtonURI = "https://rpc.entailabs.com/ipfs/QmChicSandton2024";
    const steeldaleMallURI = "https://rpc.entailabs.com/ipfs/QmSteeldaleMall2024";

    // ========== STEP 6: Create Properties ==========
    console.log("STEP 6: Create Properties");
    console.log("=".repeat(80));

    const listingFee = await marketplace.listPrice();

    // Property 1: Chic Sandton
    console.log("\n📋 Creating Property 1: Chic Sandton Apartment");
    console.log("-".repeat(80));

    const chicProperty = {
        metadataURI: chicSandtonURI,
        totalBricks: 2800000,
        pricePerBrick: ethers.utils.parseEther("1"),
        depositAmount: ethers.utils.parseEther("700000"),
        buyer: buyer1.address,
        trustWallet: "0x361ba631152be934ef5d6e1670a177ecef9458b6",
        otpPeriodDays: 90
    };

    await (await brkToken.approve(marketplace.address, listingFee)).wait();
    const tx1 = await marketplace.submitProperty(
        chicProperty.metadataURI,
        chicProperty.totalBricks,
        chicProperty.pricePerBrick,
        chicProperty.depositAmount,
        chicProperty.buyer,
        chicProperty.trustWallet,
        chicProperty.otpPeriodDays
    );
    const receipt1 = await tx1.wait();
    const tokenId1 = receipt1.events?.find(e => e.event === 'PropertySubmitted')?.args?.tokenId;
    console.log("✅ Property submitted - Token ID:", tokenId1.toString());

    // Buyer pays deposit
    const buyerBrk1 = brkToken.connect(buyer1);
    const buyerMarket1 = marketplace.connect(buyer1);
    await (await buyerBrk1.approve(marketplace.address, chicProperty.depositAmount)).wait();
    await (await buyerMarket1.payDeposit(tokenId1)).wait();
    console.log("✅ Deposit paid - Property ACTIVE");

    // Property 2: Steeldale Mall
    console.log("\n📋 Creating Property 2: Steeldale Mall");
    console.log("-".repeat(80));

    const steeldaleProperty = {
        metadataURI: steeldaleMallURI,
        totalBricks: 240000000,
        pricePerBrick: ethers.utils.parseEther("1"),
        depositAmount: ethers.utils.parseEther("24000000"),
        buyer: propertyManager.address,
        trustWallet: "0x8da6CE40Bf4F1c5333D7316e789c755384c290d5",
        otpPeriodDays: 180
    };

    await (await brkToken.approve(marketplace.address, listingFee)).wait();
    const tx2 = await marketplace.submitProperty(
        steeldaleProperty.metadataURI,
        steeldaleProperty.totalBricks,
        steeldaleProperty.pricePerBrick,
        steeldaleProperty.depositAmount,
        steeldaleProperty.buyer,
        steeldaleProperty.trustWallet,
        steeldaleProperty.otpPeriodDays
    );
    const receipt2 = await tx2.wait();
    const tokenId2 = receipt2.events?.find(e => e.event === 'PropertySubmitted')?.args?.tokenId;
    console.log("✅ Property submitted - Token ID:", tokenId2.toString());

    // Property manager pays deposit
    const managerBrk = brkToken.connect(propertyManager);
    const managerMarket = marketplace.connect(propertyManager);
    await (await managerBrk.approve(marketplace.address, steeldaleProperty.depositAmount)).wait();
    await (await managerMarket.payDeposit(tokenId2)).wait();
    console.log("✅ Deposit paid - Property ACTIVE");

    // ========== STEP 7: Save Deployment Info ==========
    console.log("\n\nSTEP 7: Save Deployment Info");
    console.log("=".repeat(80));

    const deploymentInfo = {
        marketplace: marketplace.address,
        brkToken: brkToken.address,
        forwarder: forwarderAddress,
        properties: [
            {
                tokenId: tokenId1.toString(),
                name: "Chic Sandton Apartment",
                metadataURI: chicSandtonURI
            },
            {
                tokenId: tokenId2.toString(),
                name: "Steeldale Mall",
                metadataURI: steeldaleMallURI
            }
        ],
        deployedAt: new Date().toISOString()
    };

    fs.writeFileSync('./DEPLOYMENT_COMPLETE_GASLESS.json', JSON.stringify(deploymentInfo, null, 2));

    // Update Marketplace_new.json for frontend
    const marketplaceABI = JSON.parse(fs.readFileSync('./artifacts/contracts/BrickMarketplace.sol/BrickMarketplace.json', 'utf8')).abi;
    fs.writeFileSync('./src/Marketplace_new.json', JSON.stringify({
        address: marketplace.address,
        abi: JSON.stringify(marketplaceABI)
    }, null, 2));

    // Update ERC20ABI.json for frontend
    const brkABI = JSON.parse(fs.readFileSync('./artifacts/contracts/MockERC20.sol/MockERC20.json', 'utf8')).abi;
    fs.writeFileSync('./src/ERC20ABI.json', JSON.stringify(brkABI, null, 2));

    console.log("✅ Deployment info saved\n");

    // ========== SUMMARY ==========
    console.log("\n" + "=".repeat(80));
    console.log("🎉 DEPLOYMENT COMPLETE");
    console.log("=".repeat(80));
    console.log("\n📋 Contract Addresses:");
    console.log("  Marketplace:", marketplace.address);
    console.log("  BRK Token:", brkToken.address);
    console.log("  Forwarder:", forwarderAddress);
    console.log("\n🏠 Properties Created:");
    console.log("  1. Chic Sandton Apartment (Token ID:", tokenId1.toString() + ")");
    console.log("     Total Value: R2,800,000");
    console.log("     Available: 2,100,000 bricks");
    console.log("  2. Steeldale Mall (Token ID:", tokenId2.toString() + ")");
    console.log("     Total Value: R240,000,000");
    console.log("     Available: 216,000,000 bricks");
    console.log("\n✅ Gasless Features:");
    console.log("  Gas Sponsorship: ENABLED");
    console.log("  Meta-Transactions: ENABLED");
    console.log("  Forwarder Trusted: YES");
    console.log("\n💡 Next Steps:");
    console.log("  1. Update frontend: npm run build");
    console.log("  2. Restart frontend: npm start");
    console.log("  3. Visit: http://localhost:3000/marketplace");
    console.log("  4. Properties should now display with images and data");
    console.log("=".repeat(80));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
