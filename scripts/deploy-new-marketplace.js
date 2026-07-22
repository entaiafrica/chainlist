const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying new BrickMarketplace with per-property trust wallet support...\n");

    // Deploy new BrickMarketplace
    console.log("📦 Deploying BrickMarketplace...");
    const BrickMarketplace = await ethers.getContractFactory("BrickMarketplace");
    const marketplace = await BrickMarketplace.deploy("https://rpc.entailabs.com/ipfs/");
    await marketplace.deployed();
    console.log("✅ BrickMarketplace deployed to:", marketplace.address);

    // Get BRK token address from old deployment (you can update this if different)
    const BRK_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    console.log("\n🔧 Setting BRK token address...");
    const setBrkTx = await marketplace.setBrkToken(BRK_TOKEN_ADDRESS);
    await setBrkTx.wait();
    console.log("✅ BRK token address set to:", BRK_TOKEN_ADDRESS);

    console.log("\n" + "=".repeat(70));
    console.log("✅ DEPLOYMENT COMPLETE!");
    console.log("=".repeat(70));
    console.log("\n📋 Contract Addresses:");
    console.log("   New BrickMarketplace:", marketplace.address);
    console.log("   BRK Token:", BRK_TOKEN_ADDRESS);

    console.log("\n📝 Next Steps:");
    console.log("1. Update your frontend to use the new contract address:");
    console.log(`   MARKETPLACE_ADDRESS="${marketplace.address}"`);
    console.log("\n2. Create properties with their specific trust wallets:");
    console.log("   - Token 1 (Chic Sandton): Trust wallet 0x712820B679400DACbb5c9eeccFB785378fc9b9B6");
    console.log("   - Token 2 (Steeldale): Trust wallet 0x361Ba631152BE934ef5d6e1670a177Ecef9458B6");
    console.log("\n3. Each trust wallet should have bricks equal to:");
    console.log("   - Chic Sandton: 1,086,000 bricks (700k deposit + 386k investors)");
    console.log("   - Steeldale: 24,735,000 bricks (24M deposit + 735k investors)");
    console.log("=".repeat(70));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
