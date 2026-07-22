const { ethers } = require("hardhat");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("ENABLING GASLESS TRANSACTIONS");
    console.log("=".repeat(80));

    const [deployer] = await ethers.getSigners();
    console.log("\nUsing account:", deployer.address);

    const MARKETPLACE = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

    const marketplace = await ethers.getContractAt("BrickMarketplace", MARKETPLACE);

    // Check current balance
    const provider = deployer.provider;
    const deployerETHBalance = await provider.getBalance(deployer.address);
    console.log("Deployer ETH balance:", ethers.utils.formatEther(deployerETHBalance), "ETH\n");

    // ========== STEP 1: Fund marketplace with ETH for gas sponsorship ==========
    console.log("STEP 1: Fund Marketplace for Gas Sponsorship");
    console.log("=".repeat(80));

    const currentMarketplaceBalance = await provider.getBalance(MARKETPLACE);
    console.log("Current marketplace ETH balance:", ethers.utils.formatEther(currentMarketplaceBalance), "ETH");

    const fundAmount = ethers.utils.parseEther("10"); // 10 ETH for gas sponsorship
    console.log("Funding marketplace with:", ethers.utils.formatEther(fundAmount), "ETH\n");

    const fundTx = await deployer.sendTransaction({
        to: MARKETPLACE,
        value: fundAmount
    });
    await fundTx.wait();
    console.log("✅ Marketplace funded!");

    const newBalance = await provider.getBalance(MARKETPLACE);
    console.log("New marketplace balance:", ethers.utils.formatEther(newBalance), "ETH");
    console.log("This will sponsor ~100 new investors with 0.1 ETH each\n");

    // ========== STEP 2: Check forwarder and set as trusted ==========
    console.log("\nSTEP 2: Configure Meta-Transaction Forwarder");
    console.log("=".repeat(80));

    // Check if forwarder deployment exists
    const fs = require('fs');
    let forwarderAddress;

    if (fs.existsSync('./forwarder-deployment.json')) {
        const forwarderData = JSON.parse(fs.readFileSync('./forwarder-deployment.json', 'utf8'));
        forwarderAddress = forwarderData.address;
        console.log("Found existing forwarder:", forwarderAddress);
    } else {
        // Deploy new forwarder
        console.log("No forwarder found, deploying MinimalForwarder...");
        const MinimalForwarder = await ethers.getContractFactory("MinimalForwarder");
        const forwarder = await MinimalForwarder.deploy();
        await forwarder.deployed();
        forwarderAddress = forwarder.address;

        // Save deployment
        fs.writeFileSync('./forwarder-deployment.json', JSON.stringify({
            address: forwarderAddress,
            deployedAt: new Date().toISOString()
        }, null, 2));

        console.log("✅ MinimalForwarder deployed:", forwarderAddress);
    }

    // Check if already trusted
    const isTrusted = await marketplace.isTrustedForwarder(forwarderAddress);
    console.log("Is forwarder trusted?", isTrusted);

    if (!isTrusted) {
        console.log("\n⚠️  Forwarder is not trusted by marketplace");
        console.log("NOTE: The marketplace was deployed with a specific forwarder address");
        console.log("      To use meta-transactions, you need to redeploy the marketplace");
        console.log("      with the forwarder address in the constructor");
        console.log("\nForwarder address to use:", forwarderAddress);
    } else {
        console.log("✅ Forwarder is already trusted");
    }

    // ========== STEP 3: Verify gasless features ==========
    console.log("\n\nSTEP 3: Verify Gasless Configuration");
    console.log("=".repeat(80));

    const gasSponsorshipEnabled = await marketplace.gasSponsorshipEnabled();
    const gasStipend = await marketplace.gasStipend();
    const minGasBalance = await marketplace.minGasBalance();
    const marketplaceBalance = await provider.getBalance(MARKETPLACE);

    console.log("\n🎯 Gas Sponsorship:");
    console.log("  Status:", gasSponsorshipEnabled ? "ENABLED ✅" : "DISABLED ❌");
    console.log("  Stipend per investor:", ethers.utils.formatEther(gasStipend), "ETH");
    console.log("  Min balance to qualify:", ethers.utils.formatEther(minGasBalance), "ETH");
    console.log("  Contract ETH available:", ethers.utils.formatEther(marketplaceBalance), "ETH");
    console.log("  Can sponsor ~", Math.floor(parseFloat(ethers.utils.formatEther(marketplaceBalance)) / parseFloat(ethers.utils.formatEther(gasStipend))), "investors");

    console.log("\n📡 Meta-Transactions:");
    console.log("  Forwarder:", forwarderAddress);
    console.log("  Status:", isTrusted ? "ENABLED ✅" : "NOT CONFIGURED ⚠️");

    console.log("\n" + "=".repeat(80));
    console.log("SUMMARY");
    console.log("=".repeat(80));

    if (gasSponsorshipEnabled && marketplaceBalance.gt(0)) {
        console.log("✅ Gas Sponsorship: ACTIVE");
        console.log("   When investors buy bricks for the first time, they automatically");
        console.log("   receive 0.1 ETH to cover future transaction fees");
    } else {
        console.log("❌ Gas Sponsorship: NOT ACTIVE");
    }

    if (isTrusted) {
        console.log("\n✅ Meta-Transactions: ENABLED");
        console.log("   Users can sign transactions off-chain, relayer pays gas");
    } else {
        console.log("\n⚠️  Meta-Transactions: NOT CONFIGURED");
        console.log("   Marketplace needs to be redeployed with forwarder address");
        console.log("   Or deploy new marketplace with:");
        console.log("   constructor(uri, " + forwarderAddress + ")");
    }

    console.log("\n💡 Current State:");
    console.log("   Users making first investment: Get 0.1 ETH for future txs (if balance < 0.05 ETH)");
    console.log("   Users making additional purchases: Pay normal gas fees");
    console.log("=".repeat(80));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
