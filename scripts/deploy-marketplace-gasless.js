const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🚀 Deploying BrickMarketplace with Gasless Support...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

    // Configuration
    const FORWARDER_ADDRESS = "0x36C02dA8a0983159322a80FFE9F24b1acfF8B570";
    const IPFS_BASE_URI = "ipfs://";

    console.log("Configuration:");
    console.log("- MinimalForwarder:", FORWARDER_ADDRESS);
    console.log("- IPFS Base URI:", IPFS_BASE_URI);
    console.log();

    // Deploy BrickMarketplace
    console.log("📦 Deploying BrickMarketplace...");
    const BrickMarketplace = await ethers.getContractFactory("BrickMarketplace");
    const marketplace = await BrickMarketplace.deploy(IPFS_BASE_URI, FORWARDER_ADDRESS);
    await marketplace.deployed();
    console.log("✅ BrickMarketplace deployed to:", marketplace.address);

    // Verify gasless configuration
    console.log("\n🔍 Verifying gasless configuration...");
    const trustedForwarder = await marketplace.isTrustedForwarder(FORWARDER_ADDRESS);
    console.log("Is trusted forwarder:", trustedForwarder);

    if (!trustedForwarder) {
        console.error("❌ ERROR: Forwarder is not trusted!");
        process.exit(1);
    }

    // Save deployment info
    const deploymentInfo = {
        marketplace: marketplace.address,
        forwarder: FORWARDER_ADDRESS,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
        network: "Loyalty Rewards Chain",
        chainId: (await ethers.provider.getNetwork()).chainId,
        gaslessEnabled: true
    };

    fs.writeFileSync(
        'GASLESS_DEPLOYMENT.json',
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n✅ Deployment complete!");
    console.log("\n📋 Next steps:");
    console.log("1. Set BRK token address:");
    console.log(`   marketplace.setBrkToken("BRK_TOKEN_ADDRESS")`);
    console.log("\n2. Update frontend .env:");
    console.log(`   REACT_APP_MARKETPLACE_ADDRESS=${marketplace.address}`);
    console.log(`   REACT_APP_FORWARDER_ADDRESS=${FORWARDER_ADDRESS}`);
    console.log(`   REACT_APP_RELAYER_URL=http://localhost:8549`);
    console.log(`   REACT_APP_GASLESS_ENABLED=true`);
    console.log("\n3. Update Marketplace_new.json with new ABI and address");
    console.log("\n4. Restart relayer service and frontend");

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
