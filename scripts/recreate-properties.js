const { ethers } = require("hardhat");

async function main() {
    const MARKETPLACE_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const BRK_TOKEN_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

    console.log("\n🏗️  Recreating properties with existing investor data...\n");

    const [deployer, ...accounts] = await ethers.getSigners();
    const marketplace = await ethers.getContractAt("BrickMarketplace", MARKETPLACE_ADDRESS);
    const brkToken = await ethers.getContractAt("MockERC20", BRK_TOKEN_ADDRESS);

    // ========== PROPERTY 1: CHIC SANDTON ==========
    console.log("=" .repeat(70));
    console.log("PROPERTY 1: CHIC SANDTON");
    console.log("=" .repeat(70));

    const chicTrustWallet = "0x712820B679400DACbb5c9eeccFB785378fc9b9B6";
    const chicBuyer = accounts[4].address; // Using account 5 as buyer

    console.log("\n📝 Submitting property...");
    // Approve listing fee
    await brkToken.approve(MARKETPLACE_ADDRESS, ethers.utils.parseUnits("1000", 18));

    const submitTx1 = await marketplace.submitProperty(
        "QmYWPJBakmXAvqTaNPri3uKENLBJYGU7YYbiJjbE7aBiG4",  // Chic Sandton metadata
        2800000,                    // Total bricks
        ethers.utils.parseUnits("1", 18),  // Price per brick (1 BRK)
        ethers.utils.parseUnits("700000", 18),  // Deposit amount (700k BRK)
        chicBuyer,                  // Buyer address
        chicTrustWallet,            // Trust wallet
        180                         // OTP period (180 days)
    );
    await submitTx1.wait();
    console.log("✅ Property submitted as Token ID: 1");

    console.log("\n💰 Buyer paying deposit...");
    // Transfer BRK to buyer for deposit
    await brkToken.transfer(chicBuyer, ethers.utils.parseUnits("700000", 18));

    // Buyer approves and pays deposit
    const buyerSigner1 = await ethers.getSigner(chicBuyer);
    await brkToken.connect(buyerSigner1).approve(MARKETPLACE_ADDRESS, ethers.utils.parseUnits("700000", 18));
    const depositTx1 = await marketplace.connect(buyerSigner1).payDeposit(1);
    await depositTx1.wait();
    console.log("✅ Deposit paid - Property activated!");

    console.log("\n👥 Recreating investor purchases...");
    const chicInvestors = [
        { address: accounts[1], amount: 25000 },    // 0x3536...2cb5: 25,000
        { address: accounts[2], amount: 50000 },    // 0x52B8...6b49: 50,000
        { address: accounts[3], amount: 200 },      // 0xca93...1F38: 200
        { address: accounts[5], amount: 255000 },   // 0x8b5e...d030: 255,000
        { address: accounts[6], amount: 15100 },    // 0x0Db6...9B3f: 15,100
        { address: accounts[7], amount: 10000 },    // 0x3F3D...D10d: 10,000
        { address: accounts[8], amount: 700 },      // 0x8da6...0d5: 700
        { address: accounts[9], amount: 30000 }     // 0x166C...f1e4: 30,000
    ];

    for (const investor of chicInvestors) {
        const cost = ethers.utils.parseUnits(investor.amount.toString(), 18);
        await brkToken.connect(investor.address).approve(MARKETPLACE_ADDRESS, cost);
        const buyTx = await marketplace.connect(investor.address).buyBricks(1, investor.amount);
        await buyTx.wait();
        console.log(`   ✓ ${investor.address.address}: ${investor.amount} bricks`);
    }

    // ========== PROPERTY 2: STEELDALE MALL ==========
    console.log("\n" + "=".repeat(70));
    console.log("PROPERTY 2: STEELDALE MALL");
    console.log("=" .repeat(70));

    const steelTrustWallet = "0x361Ba631152BE934ef5d6e1670a177Ecef9458B6";
    const steelBuyer = accounts[10].address; // Using account 11 as buyer

    console.log("\n📝 Submitting property...");
    await brkToken.approve(MARKETPLACE_ADDRESS, ethers.utils.parseUnits("1000", 18));

    const submitTx2 = await marketplace.submitProperty(
        "QmerLCBWnHi72dzXiwvMJ8SaWsvZfpCPjutxdT9FqZYr2L",  // Steeldale metadata
        240000000,                  // Total bricks
        ethers.utils.parseUnits("1", 18),  // Price per brick (1 BRK)
        ethers.utils.parseUnits("24000000", 18),  // Deposit amount (24M BRK)
        steelBuyer,                 // Buyer address
        steelTrustWallet,           // Trust wallet
        180                         // OTP period (180 days)
    );
    await submitTx2.wait();
    console.log("✅ Property submitted as Token ID: 2");

    console.log("\n💰 Buyer paying deposit...");
    await brkToken.transfer(steelBuyer, ethers.utils.parseUnits("24000000", 18));

    const buyerSigner2 = await ethers.getSigner(steelBuyer);
    await brkToken.connect(buyerSigner2).approve(MARKETPLACE_ADDRESS, ethers.utils.parseUnits("24000000", 18));
    const depositTx2 = await marketplace.connect(buyerSigner2).payDeposit(2);
    await depositTx2.wait();
    console.log("✅ Deposit paid - Property activated!");

    console.log("\n👥 Recreating investor purchases...");
    const steelInvestors = [
        { address: accounts[1], amount: 35000 },    // 0x3536...2cb5: 35,000
        { address: accounts[5], amount: 600000 },   // 0x8b5e...d030: 600,000
        { address: accounts[11], amount: 100000 }   // 0x331e...6d5f: 100,000
    ];

    for (const investor of steelInvestors) {
        const cost = ethers.utils.parseUnits(investor.amount.toString(), 18);
        await brkToken.connect(investor.address).approve(MARKETPLACE_ADDRESS, cost);
        const buyTx = await marketplace.connect(investor.address).buyBricks(2, investor.amount);
        await buyTx.wait();
        console.log(`   ✓ ${investor.address.address}: ${investor.amount} bricks`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ ALL PROPERTIES RECREATED SUCCESSFULLY!");
    console.log("=" .repeat(70));

    // Verify balances
    console.log("\n🔍 Verification:");
    const prop1 = await marketplace.getPropertyData(1);
    const prop2 = await marketplace.getPropertyData(2);

    console.log("\nChic Sandton:");
    console.log(`   Available Bricks: ${prop1.bricksAvailable.toString()}`);
    console.log(`   Status: ${prop1.status}`);

    console.log("\nSteeldale Mall:");
    console.log(`   Available Bricks: ${prop2.bricksAvailable.toString()}`);
    console.log(`   Status: ${prop2.status}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
