const { ethers } = require("hardhat");

async function main() {
    console.log("🏠 Quick Property Creation Script\n");

    const [deployer, buyer1] = await ethers.getSigners();

    const MARKETPLACE = "0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B";
    const BRK_TOKEN = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

    console.log("Deployer:", deployer.address);
    console.log("Buyer 1:", buyer1.address);
    console.log();

    const marketplace = await ethers.getContractAt("BrickMarketplace", MARKETPLACE);
    const brkToken = await ethers.getContractAt("MockERC20", BRK_TOKEN);

    // Check if BRK token is set in marketplace
    try {
        const currentBrkToken = await marketplace.brkToken();
        console.log("BRK Token in marketplace:", currentBrkToken);

        if (currentBrkToken === ethers.constants.AddressZero) {
            console.log("Setting BRK token in marketplace...");
            const setTokenTx = await marketplace.setBrkToken(BRK_TOKEN);
            await setTokenTx.wait();
            console.log("✅ BRK token set!\n");
        }
    } catch (e) {
        console.log("Setting BRK token in marketplace...");
        const setTokenTx = await marketplace.setBrkToken(BRK_TOKEN);
        await setTokenTx.wait();
        console.log("✅ BRK token set!\n");
    }

    // Check deployer's BRK balance
    const deployerBalance = await brkToken.balanceOf(deployer.address);
    console.log("Deployer BRK balance:", ethers.utils.formatEther(deployerBalance), "BRK");

    const listingFee = await marketplace.listPrice();
    console.log("Listing fee:", ethers.utils.formatEther(listingFee), "BRK\n");

    // Mint BRK tokens if needed
    if (deployerBalance.lt(listingFee)) {
        console.log("Minting BRK tokens for deployer...");
        const mintAmount = ethers.utils.parseEther("100000"); // 100k BRK
        const mintTx = await brkToken.mint(deployer.address, mintAmount);
        await mintTx.wait();
        console.log("✅ Minted", ethers.utils.formatEther(mintAmount), "BRK\n");
    }

    // Mint BRK for buyer
    const buyerBalance = await brkToken.balanceOf(buyer1.address);
    console.log("Buyer BRK balance:", ethers.utils.formatEther(buyerBalance), "BRK");

    const depositAmount = ethers.utils.parseEther("560000"); // 20% of 2.8M
    if (buyerBalance.lt(depositAmount)) {
        console.log("Minting BRK tokens for buyer...");
        const mintAmount = ethers.utils.parseEther("1000000"); // 1M BRK
        const mintTx = await brkToken.mint(buyer1.address, mintAmount);
        await mintTx.wait();
        console.log("✅ Minted", ethers.utils.formatEther(mintAmount), "BRK for buyer\n");
    }

    // Create a sample property
    console.log("📋 Creating Sample Property: Luxury Villa in Sandton");
    console.log("━".repeat(60));

    const property = {
        metadataURI: "https://rpc.entailabs.com/ipfs/QmSampleProperty123",
        totalBricks: 2800000, // R2.8M (each brick = R1)
        pricePerBrick: ethers.utils.parseEther("1"), // R1 per brick
        depositAmount: depositAmount, // 20% deposit
        buyer: buyer1.address,
        trustWallet: ethers.Wallet.createRandom().address, // Random trust wallet
        otpPeriodDays: 90
    };

    console.log("Property Details:");
    console.log("  Total Value: R", property.totalBricks.toLocaleString());
    console.log("  Price per Brick: R1");
    console.log("  Deposit (20%):", ethers.utils.formatEther(property.depositAmount), "BRK");
    console.log("  Buyer:", property.buyer);
    console.log("  Trust Wallet:", property.trustWallet);
    console.log("  OTP Period:", property.otpPeriodDays, "days");
    console.log();

    // Approve listing fee
    console.log("1️⃣  Approving listing fee...");
    const approveTx = await brkToken.approve(MARKETPLACE, listingFee);
    await approveTx.wait();
    console.log("✅ Approved\n");

    // Submit property
    console.log("2️⃣  Submitting property to marketplace...");
    const submitTx = await marketplace.submitProperty(
        property.metadataURI,
        property.totalBricks,
        property.pricePerBrick,
        property.depositAmount,
        property.buyer,
        property.trustWallet,
        property.otpPeriodDays
    );
    const submitReceipt = await submitTx.wait();

    const submitEvent = submitReceipt.events?.find(e => e.event === 'PropertySubmitted');
    const tokenId = submitEvent.args.tokenId;
    console.log("✅ Property submitted! Token ID:", tokenId.toString());
    console.log("   Status: PENDING (waiting for buyer deposit)\n");

    // Buyer pays deposit to activate
    console.log("3️⃣  Buyer paying deposit to activate property...");

    const buyerBrkToken = brkToken.connect(buyer1);
    const buyerMarketplace = marketplace.connect(buyer1);

    console.log("   Approving deposit amount...");
    const buyerApproveTx = await buyerBrkToken.approve(MARKETPLACE, property.depositAmount);
    await buyerApproveTx.wait();

    console.log("   Paying deposit...");
    const depositTx = await buyerMarketplace.payDeposit(tokenId);
    await depositTx.wait();
    console.log("✅ Deposit paid! Property is now ACTIVE\n");

    // Check property status
    const propData = await marketplace.getPropertyData(tokenId);
    console.log("🎉 Property Created Successfully!");
    console.log("━".repeat(60));
    console.log("Token ID:", tokenId.toString());
    console.log("Total Bricks:", propData.totalBricks.toString());
    console.log("Available Bricks:", propData.bricksAvailable.toString());
    console.log("Price per Brick:", ethers.utils.formatEther(propData.pricePerBrick), "BRK");
    console.log("Status:", ["PENDING", "ACTIVE", "FUNDED", "FAILED", "CLOSED"][propData.status]);
    console.log();
    console.log("✅ Property is now visible in the marketplace!");
    console.log("Visit: http://localhost:3000/marketplace");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
