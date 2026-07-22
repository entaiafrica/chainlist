const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("\n🚀 Deploying FIXED BrickMarketplace with transfer-based logic...\n");
    console.log("Deployer:", deployer.address);

    // Step 1: Deploy Mock BRK Token
    console.log("\n📦 Step 1: Deploying Mock BRK Token...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const brkToken = await MockERC20.deploy("Brick Token", "BRK", ethers.utils.parseUnits("1000000000", 18)); // 1 billion BRK
    await brkToken.deployed();
    console.log("✅ BRK Token deployed to:", brkToken.address);

    // Step 2: Deploy BrickMarketplace with fixed transfer logic
    console.log("\n📦 Step 2: Deploying BrickMarketplace...");
    const BrickMarketplace = await ethers.getContractFactory("BrickMarketplace");
    const marketplace = await BrickMarketplace.deploy("https://rpc.entailabs.com/ipfs/");
    await marketplace.deployed();
    console.log("✅ BrickMarketplace deployed to:", marketplace.address);

    // Step 3: Configure BRK token in marketplace
    console.log("\n🔧 Step 3: Setting BRK token address...");
    const setBrkTx = await marketplace.setBrkToken(brkToken.address);
    await setBrkTx.wait();
    console.log("✅ BRK token configured");

    // Step 4: Distribute BRK to test accounts
    console.log("\n💰 Step 4: Distributing BRK tokens...");
    const accounts = await ethers.getSigners();
    for (let i = 1; i < 20; i++) {
        const amount = ethers.utils.parseUnits("10000000", 18); // 10M BRK each
        await brkToken.transfer(accounts[i].address, amount);
    }
    console.log("✅ Distributed 10M BRK to 19 test accounts");

    console.log("\n" + "=".repeat(70));
    console.log("✅ DEPLOYMENT COMPLETE!");
    console.log("=".repeat(70));
    console.log("\n📋 Contract Addresses:");
    console.log("   BrickMarketplace:", marketplace.address);
    console.log("   BRK Token:", brkToken.address);

    console.log("\n📝 Update src/Marketplace_new.json:");
    console.log(`   - address: "${marketplace.address}"`);
    console.log(`   - Update ABI from artifacts/contracts/BrickMarketplace.sol/BrickMarketplace.json`);

    console.log("\n📝 Next Steps:");
    console.log("1. Run scripts to create properties:");
    console.log("   - mintChicSandton.js (with new marketplace address)");
    console.log("   - mintSteeldaleMall.js (with new marketplace address)");
    console.log("\n2. Trust wallet addresses:");
    console.log("   - Chic Sandton: 0x712820B679400DACbb5c9eeccFB785378fc9b9B6");
    console.log("   - Steeldale: 0x361Ba631152BE934ef5d6e1670a177Ecef9458B6");
    console.log("=".repeat(70));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
