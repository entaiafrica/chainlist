const { ethers } = require("hardhat");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("CREATING REAL PROPERTIES: Chic Sandton & Steeldale Mall");
    console.log("=".repeat(80));

    const [deployer, buyer1, propertyManager] = await ethers.getSigners();

    const MARKETPLACE = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

    console.log("\nDeployer:", deployer.address);
    console.log("Buyer 1:", buyer1.address);
    console.log("Property Manager:", propertyManager.address);
    console.log();

    const marketplace = await ethers.getContractAt("BrickMarketplace", MARKETPLACE);

    // Get the BRK token address from the marketplace
    const BRK_TOKEN = await marketplace.brkToken();
    console.log("BRK Token from marketplace:", BRK_TOKEN, "\n");

    const brkToken = await ethers.getContractAt("MockERC20", BRK_TOKEN);

    const listingFee = await marketplace.listPrice();
    console.log("Listing fee:", ethers.utils.formatEther(listingFee), "BRK\n");

    // Mint BRK tokens for deployer if needed
    const deployerBalance = await brkToken.balanceOf(deployer.address);
    if (deployerBalance.lt(ethers.utils.parseEther("10000"))) {
        console.log("Minting BRK tokens for deployer...");
        const mintTx = await brkToken.mint(deployer.address, ethers.utils.parseEther("1000000"));
        await mintTx.wait();
        console.log("✅ Minted 1M BRK\n");
    }

    // Mint BRK tokens for buyers
    console.log("Minting BRK tokens for buyers...");
    await (await brkToken.mint(buyer1.address, ethers.utils.parseEther("1000000"))).wait();
    await (await brkToken.mint(propertyManager.address, ethers.utils.parseEther("30000000"))).wait();
    console.log("✅ Buyers funded\n");

    // ========== PROPERTY 1: CHIC SANDTON APARTMENT ==========
    console.log("\n" + "=".repeat(80));
    console.log("PROPERTY 1: CHIC SANDTON APARTMENT");
    console.log("=".repeat(80));

    const chicSandton = {
        name: "Chic Sandton Apartment",
        metadataURI: "https://rpc.entailabs.com/ipfs/QmChicSandtonApartment123",
        totalBricks: 2800000, // R2.8M
        pricePerBrick: ethers.utils.parseEther("1"), // 1 BRK per brick
        depositAmount: ethers.utils.parseEther("700000"), // 25% deposit
        buyer: buyer1.address,
        trustWallet: "0x361ba631152be934ef5d6e1670a177ecef9458b6", // Trust wallet for this property
        otpPeriodDays: 90
    };

    console.log("Name:", chicSandton.name);
    console.log("Total Value: R2,800,000");
    console.log("Buyer Deposit (25%): R700,000");
    console.log("Investor Bricks (75%): 2,100,000");
    console.log("Buyer:", chicSandton.buyer);
    console.log("Trust Wallet:", chicSandton.trustWallet);
    console.log();

    // Approve and submit
    console.log("1️⃣  Approving listing fee...");
    await (await brkToken.approve(MARKETPLACE, listingFee)).wait();
    console.log("✅ Approved\n");

    console.log("2️⃣  Submitting property...");
    const tx1 = await marketplace.submitProperty(
        chicSandton.metadataURI,
        chicSandton.totalBricks,
        chicSandton.pricePerBrick,
        chicSandton.depositAmount,
        chicSandton.buyer,
        chicSandton.trustWallet,
        chicSandton.otpPeriodDays
    );
    const receipt1 = await tx1.wait();
    const tokenId1 = receipt1.events?.find(e => e.event === 'PropertySubmitted')?.args?.tokenId;
    console.log("✅ Property submitted! Token ID:", tokenId1.toString());
    console.log("   Status: PENDING\n");

    // Buyer pays deposit
    console.log("3️⃣  Buyer paying deposit...");
    const buyerBrk1 = brkToken.connect(buyer1);
    const buyerMarket1 = marketplace.connect(buyer1);
    await (await buyerBrk1.approve(MARKETPLACE, chicSandton.depositAmount)).wait();
    await (await buyerMarket1.payDeposit(tokenId1)).wait();
    console.log("✅ Deposit paid! Property is now ACTIVE\n");

    // ========== PROPERTY 2: STEELDALE MALL ==========
    console.log("\n" + "=".repeat(80));
    console.log("PROPERTY 2: STEELDALE MALL");
    console.log("=".repeat(80));

    const steeldaleMall = {
        name: "Steeldale Mall Shopping Centre",
        metadataURI: "https://rpc.entailabs.com/ipfs/QmSteeldaleMall123",
        totalBricks: 240000000, // R240M
        pricePerBrick: ethers.utils.parseEther("1"), // 1 BRK per brick
        depositAmount: ethers.utils.parseEther("24000000"), // 10% property manager stake
        buyer: propertyManager.address, // Property manager acts as "buyer"
        trustWallet: "0x8da6CE40Bf4F1c5333D7316e789c755384c290d5", // Different trust wallet
        otpPeriodDays: 180
    };

    console.log("Name:", steeldaleMall.name);
    console.log("Total Value: R240,000,000");
    console.log("Property Manager Stake (10%): R24,000,000");
    console.log("Community Investor Bricks (90%): 216,000,000");
    console.log("Property Manager:", steeldaleMall.buyer);
    console.log("Trust Wallet:", steeldaleMall.trustWallet);
    console.log();

    // Approve and submit
    console.log("1️⃣  Approving listing fee...");
    await (await brkToken.approve(MARKETPLACE, listingFee)).wait();
    console.log("✅ Approved\n");

    console.log("2️⃣  Submitting property...");
    const tx2 = await marketplace.submitProperty(
        steeldaleMall.metadataURI,
        steeldaleMall.totalBricks,
        steeldaleMall.pricePerBrick,
        steeldaleMall.depositAmount,
        steeldaleMall.buyer,
        steeldaleMall.trustWallet,
        steeldaleMall.otpPeriodDays
    );
    const receipt2 = await tx2.wait();
    const tokenId2 = receipt2.events?.find(e => e.event === 'PropertySubmitted')?.args?.tokenId;
    console.log("✅ Property submitted! Token ID:", tokenId2.toString());
    console.log("   Status: PENDING\n");

    // Property manager pays deposit
    console.log("3️⃣  Property Manager paying deposit...");
    const managerBrk = brkToken.connect(propertyManager);
    const managerMarket = marketplace.connect(propertyManager);
    await (await managerBrk.approve(MARKETPLACE, steeldaleMall.depositAmount)).wait();
    await (await managerMarket.payDeposit(tokenId2)).wait();
    console.log("✅ Deposit paid! Property is now ACTIVE\n");

    // ========== SUMMARY ==========
    console.log("\n" + "=".repeat(80));
    console.log("🎉 SUCCESS - ALL PROPERTIES CREATED!");
    console.log("=".repeat(80));
    console.log();
    console.log("Property 1: Chic Sandton Apartment");
    console.log("  Token ID:", tokenId1.toString());
    console.log("  Total Value: R2,800,000");
    console.log("  Available to Investors: 2,100,000 bricks");
    console.log("  Status: ACTIVE");
    console.log();
    console.log("Property 2: Steeldale Mall");
    console.log("  Token ID:", tokenId2.toString());
    console.log("  Total Value: R240,000,000");
    console.log("  Available to Investors: 216,000,000 bricks");
    console.log("  Status: ACTIVE");
    console.log();
    console.log("✅ Properties are now visible in the marketplace!");
    console.log("Visit: http://localhost:3000/marketplace");
    console.log("=".repeat(80));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
