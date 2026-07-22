const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("\n" + "=".repeat(70));
    console.log("🚀 DEPLOYING BRICKMARKETPLACE WITH GASLESS TRANSACTION SUPPORT");
    console.log("=".repeat(70) + "\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH\n");

    // Get existing forwarder address (already deployed)
    const FORWARDER_ADDRESS = "0x36C02dA8a0983159322a80FFE9F24b1acfF8B570";
    console.log("✅ Using existing MinimalForwarder at:", FORWARDER_ADDRESS);

    // Get existing BRK token address
    const BRK_TOKEN_ADDRESS = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";
    console.log("✅ Using existing BRK Token at:", BRK_TOKEN_ADDRESS);

    // Deploy new marketplace with gasless support
    console.log("\n📝 Deploying BrickMarketplace with ERC2771Context...");
    const BrickMarketplace = await ethers.getContractFactory("BrickMarketplace");
    const marketplace = await BrickMarketplace.deploy(
        "https://rpc.entailabs.com/ipfs/", // Base URI
        FORWARDER_ADDRESS // Trusted forwarder
    );
    await marketplace.deployed();

    console.log("✅ BrickMarketplace deployed to:", marketplace.address);
    console.log("   Transaction hash:", marketplace.deployTransaction.hash);

    // Set BRK token
    console.log("\n🔧 Configuring marketplace...");
    const setBrkTx = await marketplace.setBrkToken(BRK_TOKEN_ADDRESS);
    await setBrkTx.wait();
    console.log("✅ BRK token configured");

    // Get network info
    const network = await ethers.provider.getNetwork();

    // Save deployment info
    const deploymentInfo = {
        marketplace: marketplace.address,
        forwarder: FORWARDER_ADDRESS,
        brkToken: BRK_TOKEN_ADDRESS,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
        network: network.name,
        chainId: network.chainId,
        gaslessEnabled: true,
        oldMarketplace: "0x68B1D87F95878fE05B998F19b66F4baba5De1aed"
    };

    const infoPath = path.join(__dirname, '..', 'deployment-gasless.json');
    fs.writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to: deployment-gasless.json");

    console.log("\n" + "=".repeat(70));
    console.log("✅ DEPLOYMENT COMPLETE!");
    console.log("=".repeat(70));
    console.log("\n📋 CONTRACT ADDRESSES:");
    console.log("   New Marketplace (Gasless):", marketplace.address);
    console.log("   Old Marketplace:           0x68B1D87F95878fE05B998F19b66F4baba5De1aed");
    console.log("   MinimalForwarder:          ", FORWARDER_ADDRESS);
    console.log("   BRK Token:                 ", BRK_TOKEN_ADDRESS);

    console.log("\n📝 NEXT STEPS:");
    console.log("=".repeat(70));
    console.log("\n1. Update src/Marketplace_new.json with new contract address:");
    console.log(`   "address": "${marketplace.address}"`);
    console.log("\n2. Enable gasless in .env:");
    console.log("   REACT_APP_FORWARDER_ADDRESS=0x36C02dA8a0983159322a80FFE9F24b1acfF8B570");
    console.log("   REACT_APP_RELAYER_URL=https://fb.entailabs.com");
    console.log("   REACT_APP_GASLESS_ENABLED=true");
    console.log("\n3. Deploy relayer service to fb.entailabs.com:");
    console.log("   cd relayer && pm2 start server.js --name nft-relayer");
    console.log("\n4. Rebuild and deploy frontend:");
    console.log("   npm run build");
    console.log("\n5. Test gasless transactions:");
    console.log("   - Try buyBricks with user having low ETH balance");
    console.log("   - Verify transactions succeed without paying gas");
    console.log("\n" + "=".repeat(70) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error deploying marketplace:");
        console.error(error);
        process.exit(1);
    });
