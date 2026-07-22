const { ethers } = require("hardhat");

async function main() {
    console.log("\n🚀 DEPLOYING NEW BRICKMARKETPLACE WITH PER-PROPERTY TRUST WALLETS\n");
    console.log("=" .repeat(70));

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

    // IMPORTANT: We will REUSE the existing BRK token
    const EXISTING_BRK_TOKEN = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";
    console.log("✓ Reusing existing BRK Token:", EXISTING_BRK_TOKEN);

    // OLD CONTRACT (for reference)
    const OLD_MARKETPLACE = "0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B";
    console.log("✓ Old Marketplace (will migrate from):", OLD_MARKETPLACE);

    console.log("\n" + "=".repeat(70));
    console.log("STEP 1: Deploy New BrickMarketplace Contract");
    console.log("=".repeat(70) + "\n");

    const BrickMarketplace = await ethers.getContractFactory("BrickMarketplace");
    const marketplace = await BrickMarketplace.deploy("https://rpc.entailabs.com/ipfs/");
    await marketplace.deployed();

    console.log("✅ New BrickMarketplace deployed to:", marketplace.address);

    // Set BRK token address
    console.log("\n📝 Configuring BRK token address...");
    const tx1 = await marketplace.setBrkToken(EXISTING_BRK_TOKEN);
    await tx1.wait();
    console.log("✅ BRK token configured");

    // Verify configuration
    const configuredBrk = await marketplace.brkToken();
    console.log("✓ Verified BRK token address:", configuredBrk);

    console.log("\n" + "=".repeat(70));
    console.log("DEPLOYMENT SUMMARY");
    console.log("=".repeat(70));
    console.log("✅ New BrickMarketplace:", marketplace.address);
    console.log("✅ BRK Token (existing):", EXISTING_BRK_TOKEN);
    console.log("✅ Old Marketplace:", OLD_MARKETPLACE);

    console.log("\n" + "=".repeat(70));
    console.log("NEXT STEPS:");
    console.log("=".repeat(70));
    console.log("1. Run migration script to copy properties from old to new contract");
    console.log("2. Update frontend Marketplace_new.json with new address");
    console.log("3. Test thoroughly before switching production");
    console.log("4. Keep old contract accessible for historical data\n");

    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
        newMarketplace: marketplace.address,
        brkToken: EXISTING_BRK_TOKEN,
        oldMarketplace: OLD_MARKETPLACE,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
        network: "Loyalty Rewards Chain (rpc.entailabs.com:8545)",
        chainId: 1337
    };

    fs.writeFileSync(
        'DEPLOYMENT_NEW_MARKETPLACE.json',
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("💾 Deployment info saved to: DEPLOYMENT_NEW_MARKETPLACE.json\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    });
