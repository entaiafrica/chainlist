const { ethers } = require("hardhat");

async function main() {
    console.log("🏠 Creating Test Properties on Gasless Marketplace\n");

    const [deployer, buyer1, buyer2] = await ethers.getSigners();
    console.log("Using account:", deployer.address);
    console.log("Buyer 1:", buyer1.address);
    console.log("Buyer 2:", buyer2.address);
    console.log();

    const MARKETPLACE = "0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154";
    const BRK_TOKEN = "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB";

    const marketplaceABI = require('../src/Marketplace_new.json').abi;
    const brkABI = require('../src/ERC20ABI.json');

    const marketplace = new ethers.Contract(MARKETPLACE, marketplaceABI, deployer);
    const brkToken = new ethers.Contract(BRK_TOKEN, brkABI, deployer);

    // Get listing fee
    const listingFee = await marketplace.listPrice();
    console.log("Listing fee:", ethers.utils.formatEther(listingFee), "BRK\n");

    const properties = [
        {
            name: "Luxury Villa in Sandton",
            description: "Beautiful 4-bedroom villa with pool and garden. Perfect for families seeking luxury living in the heart of Sandton. Features modern finishes, double garage, and state-of-the-art security.",
            totalValue: 2800000, // R2.8M
            buyer: buyer1.address,
            metadata: {
                propertyType: "House",
                bedrooms: 4,
                bathrooms: 3,
                location: "Sandton, Johannesburg"
            }
        },
        {
            name: "Modern Apartment in Cape Town CBD",
            description: "Stunning 2-bedroom apartment with ocean views. Located in the vibrant Cape Town CBD, close to restaurants, shops, and entertainment. Includes secure parking and 24/7 security.",
            totalValue: 1500000, // R1.5M
            buyer: buyer2.address,
            metadata: {
                propertyType: "Apartment",
                bedrooms: 2,
                bathrooms: 2,
                location: "Cape Town CBD"
            }
        }
    ];

    for (let i = 0; i < properties.length; i++) {
        const prop = properties[i];
        console.log(`\n📋 Creating Property ${i + 1}: ${prop.name}`);
        console.log("━".repeat(60));

        const totalBricks = prop.totalValue;
        const pricePerBrick = ethers.utils.parseUnits("1.0", "ether"); // R1 per brick
        const depositAmount = ethers.utils.parseUnits((prop.totalValue * 0.2).toString(), "ether"); // 20%
        const otpPeriodDays = 90;

        // Create metadata JSON (simplified, in production this would be uploaded to IPFS)
        const metadataURI = `ipfs://test-property-${i + 1}`;

        try {
            // Approve listing fee
            console.log("Approving listing fee...");
            const approveTx = await brkToken.approve(MARKETPLACE, listingFee);
            await approveTx.wait();

            // Submit property (need to provide trust wallet address)
            const trustWallet = ethers.Wallet.createRandom().address; // Create random trust wallet
            console.log("Submitting property to marketplace...");
            const submitTx = await marketplace.submitProperty(
                metadataURI,
                totalBricks,
                pricePerBrick,
                depositAmount,
                prop.buyer,
                trustWallet,
                otpPeriodDays
            );
            await submitTx.wait();
            console.log("✅ Property submitted (Status: PENDING)");
            console.log(`   Trust Wallet: ${trustWallet}`);

            // Now activate the property by having the buyer pay deposit
            console.log("\nActivating property (buyer paying deposit)...");

            // Get BRK contract with buyer's signer
            const buyerBrkToken = brkToken.connect(i === 0 ? buyer1 : buyer2);
            const buyerMarketplace = marketplace.connect(i === 0 ? buyer1 : buyer2);

            // Approve deposit
            console.log(`Buyer approving R${(prop.totalValue * 0.2).toLocaleString()} deposit...`);
            const buyerApproveTx = await buyerBrkToken.approve(MARKETPLACE, depositAmount);
            await buyerApproveTx.wait();

            // Pay deposit to activate
            console.log("Buyer paying deposit...");
            const activateTx = await buyerMarketplace.payDeposit(i + 1);
            await activateTx.wait();
            console.log("✅ Property ACTIVATED - Ready for investors!");

            // Get property data
            const propertyData = await marketplace.getPropertyData(i + 1);
            console.log("\n📊 Property Details:");
            console.log(`  Token ID: ${i + 1}`);
            console.log(`  Total Bricks: ${propertyData.totalBricks.toString()}`);
            console.log(`  Available for Investors: ${propertyData.bricksAvailable.toString()}`);
            console.log(`  Price per Brick: R${ethers.utils.formatEther(propertyData.pricePerBrick)}`);
            console.log(`  Status: ${propertyData.status === 1 ? 'ACTIVE ✅' : 'PENDING'}`);
            console.log(`  Buyer: ${prop.buyer}`);

        } catch (error) {
            console.error(`❌ Error creating property ${i + 1}:`, error.message);
        }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Test Properties Created Successfully!");
    console.log("=".repeat(60));
    console.log("\n🎯 Next Steps:");
    console.log("1. Restart frontend: npm start");
    console.log("2. View properties at: http://localhost:3000/marketplace");
    console.log("3. Test gasless transactions by buying bricks!");
    console.log("\n💡 To test gasless:");
    console.log("   - Create a wallet with ONLY BRK tokens (no ETH)");
    console.log("   - Try buying bricks - it should work without gas fees!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
