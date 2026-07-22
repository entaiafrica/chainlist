const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting deployment and migration...\n");
    console.log("=".repeat(70));

    // Get signers
    const signers = await ethers.getSigners();
    if (!signers || signers.length === 0) {
        throw new Error("No signers available. Make sure Hardhat node is running.");
    }
    const [deployer, ...accounts] = signers;
    console.log("Deployer:", deployer.address);
    console.log("Available accounts:", signers.length);

    // Known addresses
    const BRK_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    // Property 1 details (Chic Sandton Apartment)
    const PROPERTY1_TRUST_WALLET = "0x712820B679400DACbb5c9eeccFB785378fc9b9B6";
    const PROPERTY1_BUYER = "0x6923DdaA0402bE804CAbF525e6a199772e025ba7";
    const PROPERTY1_METADATA = "https://rpc.entailabs.com/ipfs/QmYWPJBakmXAvqTaNPri3uKENLBJYGU7YYbiJjbE7aBiG4";
    const PROPERTY1_TOTAL_BRICKS = 2800000;
    const PROPERTY1_PRICE_PER_BRICK = 1;
    const PROPERTY1_DEPOSIT = 700000;
    const PROPERTY1_OTP_DAYS = 90;

    // Property 2 details (Steeldale Shopping Centre)
    const PROPERTY2_TRUST_WALLET = "0x361Ba631152BE934ef5d6e1670a177Ecef9458B6";
    const PROPERTY2_BUYER = "0x4F4f05360A3863a321A7DC9605f2b39a52a109De";
    const PROPERTY2_METADATA = "https://rpc.entailabs.com/ipfs/QmerLCBWnHi72dzXiwvMJ8SaWsvZfpCPjutxdT9FqZYr2L";
    const PROPERTY2_TOTAL_BRICKS = 240000000;
    const PROPERTY2_PRICE_PER_BRICK = 1;
    const PROPERTY2_DEPOSIT = 24000000;
    const PROPERTY2_OTP_DAYS = 90;

    // Deploy new BrickMarketplace contract
    console.log("\n📦 Deploying BrickMarketplace...");
    const BrickMarketplace = await ethers.getContractFactory("BrickMarketplace");
    const marketplace = await BrickMarketplace.deploy("https://rpc.entailabs.com/ipfs/");
    await marketplace.deployed();
    console.log("✅ BrickMarketplace deployed to:", marketplace.address);

    // Set BRK token
    console.log("\n🔧 Setting BRK token address...");
    const setBrkTx = await marketplace.setBrkToken(BRK_TOKEN_ADDRESS);
    await setBrkTx.wait();
    console.log("✅ BRK token set");

    // Get BRK token contract for approvals
    const brkToken = await ethers.getContractAt("MockERC20", BRK_TOKEN_ADDRESS);

    console.log("\n" + "=".repeat(70));
    console.log("📝 PROPERTY 1: Chic Sandton Apartment");
    console.log("=".repeat(70));

    // Approve listing fee for property 1
    console.log("\n💰 Approving listing fee from deployer...");
    const listPrice = await marketplace.listPrice();
    const approveTx1 = await brkToken.connect(deployer).approve(marketplace.address, listPrice);
    await approveTx1.wait();
    console.log("✅ Listing fee approved");

    // Submit property 1
    console.log("\n📤 Submitting property 1...");
    const submitTx1 = await marketplace.submitProperty(
        PROPERTY1_METADATA,
        PROPERTY1_TOTAL_BRICKS,
        PROPERTY1_PRICE_PER_BRICK,
        PROPERTY1_DEPOSIT,
        PROPERTY1_BUYER,
        PROPERTY1_TRUST_WALLET,
        PROPERTY1_OTP_DAYS
    );
    const receipt1 = await submitTx1.wait();
    console.log("✅ Property 1 submitted (Token ID: 1)");

    // Buyer pays deposit for property 1
    console.log("\n💵 Buyer paying deposit for property 1...");
    // Find the buyer signer
    const buyer1Signer = accounts.find(acc => acc.address.toLowerCase() === PROPERTY1_BUYER.toLowerCase()) || accounts[1];

    // Transfer BRK to buyer if needed
    const buyer1Balance = await brkToken.balanceOf(buyer1Signer.address);
    if (buyer1Balance.lt(PROPERTY1_DEPOSIT)) {
        console.log("   Transferring BRK to buyer...");
        const transferTx = await brkToken.transfer(buyer1Signer.address, PROPERTY1_DEPOSIT);
        await transferTx.wait();
    }

    // Approve deposit
    const approveTx2 = await brkToken.connect(buyer1Signer).approve(marketplace.address, PROPERTY1_DEPOSIT);
    await approveTx2.wait();
    console.log("   ✅ Deposit approved");

    // Pay deposit
    const depositTx1 = await marketplace.connect(buyer1Signer).payDeposit(1);
    await depositTx1.wait();
    console.log("✅ Deposit paid - Property 1 is now ACTIVE");

    // Simulate existing investor purchases for property 1
    console.log("\n👥 Simulating existing investor purchases...");
    const property1Investors = [
        { address: "0x3536C224C57da6671906af52FE21b81f962F2cb5", bricks: 25000 },
        { address: "0x52B83C7ECEfAfB399a299FD4A780b15D29E26b49", bricks: 50000 },
        { address: "0xca93Fb55D7E44a2EC97EF8c0801F9135AA001F38", bricks: 200 },
        { address: "0x8b5e1De84b669aA6db1F12bfD3c1132187A7d030", bricks: 255000 },
        { address: "0x0Db6035133dDC96578bAE0d0e00A322133299B3f", bricks: 15100 },
        { address: "0x3F3D526702633B71d0F96C621cEeFD2CBb88D10d", bricks: 10000 },
        { address: "0x8da6CE40Bf4F1c5333D7316e789c755384c290d5", bricks: 700 },
        { address: "0x166CF1Ad653214584174d1C157E656B54406f1e4", bricks: 30000 }
    ];

    for (const investor of property1Investors) {
        const investorSigner = accounts.find(acc => acc.address.toLowerCase() === investor.address.toLowerCase());
        if (!investorSigner) {
            console.log(`   ⚠️  Skipping ${investor.address} (not in accounts)`);
            continue;
        }

        const cost = investor.bricks * PROPERTY1_PRICE_PER_BRICK;

        // Transfer BRK to investor if needed
        const investorBalance = await brkToken.balanceOf(investorSigner.address);
        if (investorBalance.lt(cost)) {
            const transferTx = await brkToken.transfer(investorSigner.address, cost);
            await transferTx.wait();
        }

        // Approve and buy
        const approveTx = await brkToken.connect(investorSigner).approve(marketplace.address, cost);
        await approveTx.wait();

        const buyTx = await marketplace.connect(investorSigner).buyBricks(1, investor.bricks);
        await buyTx.wait();

        console.log(`   ✅ ${investor.address}: ${investor.bricks} bricks`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("📝 PROPERTY 2: Steeldale Shopping Centre");
    console.log("=".repeat(70));

    // Approve listing fee for property 2
    console.log("\n💰 Approving listing fee from deployer...");
    const approveTx3 = await brkToken.connect(deployer).approve(marketplace.address, listPrice);
    await approveTx3.wait();
    console.log("✅ Listing fee approved");

    // Submit property 2
    console.log("\n📤 Submitting property 2...");
    const submitTx2 = await marketplace.submitProperty(
        PROPERTY2_METADATA,
        PROPERTY2_TOTAL_BRICKS,
        PROPERTY2_PRICE_PER_BRICK,
        PROPERTY2_DEPOSIT,
        PROPERTY2_BUYER,
        PROPERTY2_TRUST_WALLET,
        PROPERTY2_OTP_DAYS
    );
    await submitTx2.wait();
    console.log("✅ Property 2 submitted (Token ID: 2)");

    // Buyer pays deposit for property 2
    console.log("\n💵 Buyer paying deposit for property 2...");
    const buyer2Signer = accounts.find(acc => acc.address.toLowerCase() === PROPERTY2_BUYER.toLowerCase()) || accounts[2];

    // Transfer BRK to buyer if needed
    const buyer2Balance = await brkToken.balanceOf(buyer2Signer.address);
    if (buyer2Balance.lt(PROPERTY2_DEPOSIT)) {
        console.log("   Transferring BRK to buyer...");
        const transferTx = await brkToken.transfer(buyer2Signer.address, PROPERTY2_DEPOSIT);
        await transferTx.wait();
    }

    // Approve deposit
    const approveTx4 = await brkToken.connect(buyer2Signer).approve(marketplace.address, PROPERTY2_DEPOSIT);
    await approveTx4.wait();
    console.log("   ✅ Deposit approved");

    // Pay deposit
    const depositTx2 = await marketplace.connect(buyer2Signer).payDeposit(2);
    await depositTx2.wait();
    console.log("✅ Deposit paid - Property 2 is now ACTIVE");

    // Simulate existing investor purchases for property 2
    console.log("\n👥 Simulating existing investor purchases...");
    const property2Investors = [
        { address: "0x3536C224C57da6671906af52FE21b81f962F2cb5", bricks: 35000 },
        { address: "0x8b5e1De84b669aA6db1F12bfD3c1132187A7d030", bricks: 600000 },
        { address: "0x331e3dC905e07aDA6c0E10fBF55e5bb52A896d5f", bricks: 100000 }
    ];

    for (const investor of property2Investors) {
        const investorSigner = accounts.find(acc => acc.address.toLowerCase() === investor.address.toLowerCase());
        if (!investorSigner) {
            console.log(`   ⚠️  Skipping ${investor.address} (not in accounts)`);
            continue;
        }

        const cost = investor.bricks * PROPERTY2_PRICE_PER_BRICK;

        // Transfer BRK to investor if needed
        const investorBalance = await brkToken.balanceOf(investorSigner.address);
        if (investorBalance.lt(cost)) {
            const transferTx = await brkToken.transfer(investorSigner.address, cost);
            await transferTx.wait();
        }

        // Approve and buy
        const approveTx = await brkToken.connect(investorSigner).approve(marketplace.address, cost);
        await approveTx.wait();

        const buyTx = await marketplace.connect(investorSigner).buyBricks(2, investor.bricks);
        await buyTx.wait();

        console.log(`   ✅ ${investor.address}: ${investor.bricks} bricks`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ DEPLOYMENT AND MIGRATION COMPLETE!");
    console.log("=".repeat(70));
    console.log("\n📋 Contract Addresses:");
    console.log("   BrickMarketplace:", marketplace.address);
    console.log("   BRK Token:", BRK_TOKEN_ADDRESS);
    console.log("\n📋 Property Details:");
    console.log("   Property 1 (Token ID 1): Chic Sandton Apartment");
    console.log("     Trust Wallet:", PROPERTY1_TRUST_WALLET);
    console.log("   Property 2 (Token ID 2): Steeldale Shopping Centre");
    console.log("     Trust Wallet:", PROPERTY2_TRUST_WALLET);
    console.log("\n💾 Save this address to update your frontend:");
    console.log(`   MARKETPLACE_ADDRESS="${marketplace.address}"`);
    console.log("=".repeat(70));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
