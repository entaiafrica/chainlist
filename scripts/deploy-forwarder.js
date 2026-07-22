const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("\n🚀 Deploying MinimalForwarder for Gasless Transactions...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

    // Deploy MinimalForwarder
    console.log("📝 Deploying MinimalForwarder contract...");
    const MinimalForwarder = await ethers.getContractFactory("MinimalForwarder");
    const forwarder = await MinimalForwarder.deploy();
    await forwarder.deployed();

    console.log("✅ MinimalForwarder deployed to:", forwarder.address);
    console.log("Transaction hash:", forwarder.deployTransaction.hash);

    // Save forwarder address to file
    const forwarderInfo = {
        address: forwarder.address,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
        network: (await ethers.provider.getNetwork()).name,
        chainId: (await ethers.provider.getNetwork()).chainId
    };

    const infoPath = path.join(__dirname, '..', 'forwarder-deployment.json');
    fs.writeFileSync(infoPath, JSON.stringify(forwarderInfo, null, 2));
    console.log("\n📄 Deployment info saved to:", infoPath);

    // Update .env instructions
    console.log("\n" + "=".repeat(70));
    console.log("📋 NEXT STEPS:");
    console.log("=".repeat(70));
    console.log("\n1. Update Frontend .env file:");
    console.log(`   REACT_APP_FORWARDER_ADDRESS=${forwarder.address}`);
    console.log("\n2. Update Relayer .env file (relayer/.env):");
    console.log(`   FORWARDER_ADDRESS=${forwarder.address}`);
    console.log(`   PLATFORM_PRIVATE_KEY=${process.env.PLATFORM_WALLET_KEY || '0xa3b0d634e0111fec7d93001c40138a35c34172d76aa38ce2ff21db88ff7dfc9a'}`);
    console.log(`   RPC_URL=https://rpc.entailabs.com`);
    console.log(`   PORT=3001`);
    console.log("\n3. Start the relayer service:");
    console.log("   cd relayer && npm install && npm start");
    console.log("\n4. Restart your frontend to pick up new env variables");
    console.log("=".repeat(70) + "\n");

    // Verify forwarder is working
    console.log("🔍 Verifying forwarder deployment...");
    const domain = await forwarder.name();
    console.log("   Forwarder domain name:", domain);
    console.log("   ✅ Forwarder is ready for meta-transactions!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error deploying forwarder:");
        console.error(error);
        process.exit(1);
    });
