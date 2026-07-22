const { ethers } = require("hardhat");

async function main() {
    console.log("\n🚀 DEPLOYING COMPLETE SYSTEM TO HTTPS ENDPOINT\n");
    console.log("=".repeat(70));

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

    if (balance.eq(0)) {
        throw new Error("❌ Deployer has no ETH! Cannot deploy. Fund this address first: " + deployer.address);
    }

    // Step 1: Deploy BRK Token
    console.log("\n" + "=".repeat(70));
    console.log("STEP 1: DEPLOYING BRK TOKEN");
    console.log("=".repeat(70));

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const initialSupply = ethers.utils.parseEther("1000000000"); // 1 billion BRK
    const brkToken = await MockERC20.deploy("Brick Token", "BRK", initialSupply);
    await brkToken.deployed();

    console.log("✅ BRK Token deployed:", brkToken.address);

    // Step 2: Deploy Marketplace
    console.log("\n" + "=".repeat(70));
    console.log("STEP 2: DEPLOYING MARKETPLACE");
    console.log("=".repeat(70));

    const BrickMarketplace = await ethers.getContractFactory("BrickMarketplace");
    const marketplace = await BrickMarketplace.deploy("https://rpc.entailabs.com/ipfs/");
    await marketplace.deployed();

    console.log("✅ Marketplace deployed:", marketplace.address);

    // Step 3: Configure Marketplace
    console.log("\n" + "=".repeat(70));
    console.log("STEP 3: CONFIGURING MARKETPLACE");
    console.log("=".repeat(70));

    console.log("Setting BRK token address...");
    const setTokenTx = await marketplace.setBrkToken(brkToken.address);
    await setTokenTx.wait();
    console.log("✅ BRK token configured");

    // Step 4: Fund with ETH for gas sponsorship
    console.log("\n" + "=".repeat(70));
    console.log("STEP 4: FUNDING MARKETPLACE FOR GAS SPONSORSHIP");
    console.log("=".repeat(70));

    const gasStipendAmount = ethers.utils.parseEther("10"); // 10 ETH = 100 investors
    console.log("Sending", ethers.utils.formatEther(gasStipendAmount), "ETH to marketplace...");

    const fundTx = await deployer.sendTransaction({
        to: marketplace.address,
        value: gasStipendAmount
    });
    await fundTx.wait();
    console.log("✅ Marketplace funded with 10 ETH for gas sponsorship");

    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
        network: "HTTPS - https://rpc.entailabs.com",
        chainId: 1337,
        brkToken: brkToken.address,
        marketplace: marketplace.address,
        deployer: deployer.address,
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync('HTTPS_DEPLOYMENT.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to HTTPS_DEPLOYMENT.json");

    // Update frontend config
    const marketplaceConfig = {
        address: marketplace.address
    };
    fs.writeFileSync('src/Marketplace_new.json', JSON.stringify(marketplaceConfig, null, 2));
    console.log("💾 Frontend config updated: src/Marketplace_new.json");

    console.log("\n" + "=".repeat(70));
    console.log("✅ DEPLOYMENT COMPLETE!");
    console.log("=".repeat(70));
    console.log("\n📝 Contract Addresses:");
    console.log("  BRK Token:", brkToken.address);
    console.log("  Marketplace:", marketplace.address);
    console.log("\n🔑 Save these addresses!");
    console.log("\nNext steps:");
    console.log("1. Submit properties");
    console.log("2. Activate properties");
    console.log("3. Update frontend");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
