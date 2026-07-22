const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🚀 Quick Deploy: Complete System with Gasless Support\n");

    const [deployer, platformWallet] = await ethers.getSigners();
    const userAddress = "0x48ad3130263dcc8f52ee0cf5d5ef5c7c2e568a71";

    console.log("Deploying with:", deployer.address);
    console.log("Platform wallet:", platformWallet.address, "\n");

    // Step 1: Deploy MinimalForwarder
    console.log("1️⃣ Deploying MinimalForwarder...");
    const MinimalForwarder = await ethers.getContractFactory("MinimalForwarder");
    const forwarder = await MinimalForwarder.deploy();
    await forwarder.deployed();
    console.log("✅ Forwarder:", forwarder.address);

    // Step 2: Deploy BrickMarketplace
    console.log("\n2️⃣ Deploying BrickMarketplace...");
    const BrickMarketplace = await ethers.getContractFactory("BrickMarketplace");
    const marketplace = await BrickMarketplace.deploy("ipfs://", forwarder.address);
    await marketplace.deployed();
    console.log("✅ Marketplace:", marketplace.address);

    // Step 3: Deploy BRK Token
    console.log("\n3️⃣ Deploying BRK Token...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const brk = await MockERC20.deploy("FirstBrick Token", "BRK", ethers.utils.parseEther("1000000"));
    await brk.deployed();
    console.log("✅ BRK Token:", brk.address);

    // Step 4: Configure Marketplace
    console.log("\n4️⃣ Configuring Marketplace...");
    await (await marketplace.setBrkToken(brk.address)).wait();
    console.log("✅ BRK token set");

    // Step 5: Mint BRK to user
    console.log("\n5️⃣ Minting BRK to user...");
    await (await brk.mint(userAddress, ethers.utils.parseEther("500"))).wait();
    const userBalance = await brk.balanceOf(userAddress);
    console.log("✅ User balance:", ethers.utils.formatEther(userBalance), "BRK");

    // Step 6: Fund platform wallet
    console.log("\n6️⃣ Funding platform wallet...");
    const fundTx = await deployer.sendTransaction({
        to: "0x8da6CE40Bf4F1c5333D7316e789c755384c290d5",
        value: ethers.utils.parseEther("15")
    });
    await fundTx.wait();
    console.log("✅ Platform wallet funded with 15 ETH");

    // Save deployment info
    const deploymentInfo = {
        marketplace: marketplace.address,
        brkToken: brk.address,
        forwarder: forwarder.address,
        platformWallet: "0x8da6CE40Bf4F1c5333D7316e789c755384c290d5",
        deployer: deployer.address,
        network: "localhost",
        chainId: (await ethers.provider.getNetwork()).chainId,
        deployedAt: new Date().toISOString(),
        gaslessEnabled: true
    };

    fs.writeFileSync('DEPLOYMENT_INFO.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to DEPLOYMENT_INFO.json");

    // Update Marketplace_new.json
    const artifact = await ethers.getContractFactory("BrickMarketplace");
    const marketplaceAbi = {
        address: marketplace.address,
        abi: artifact.interface.format('json')
    };
    fs.writeFileSync('src/Marketplace_new.json', JSON.stringify(marketplaceAbi, null, 2));
    console.log("📄 Marketplace_new.json updated");

    // Update ERC20ABI.json with BRK address
    const erc20Artifact = await ethers.getContractFactory("MockERC20");
    const erc20Data = {
        address: brk.address,
        abi: erc20Artifact.interface.format('json')
    };
    fs.writeFileSync('src/BRK_Token.json', JSON.stringify(erc20Data, null, 2));
    console.log("📄 BRK_Token.json created");

    console.log("\n✅ DEPLOYMENT COMPLETE!\n");
    console.log("═══════════════════════════════════════");
    console.log("📋 Contract Addresses:");
    console.log("═══════════════════════════════════════");
    console.log("Marketplace:    ", marketplace.address);
    console.log("BRK Token:      ", brk.address);
    console.log("Forwarder:      ", forwarder.address);
    console.log("Platform Wallet:", "0x8da6CE40Bf4F1c5333D7316e789c755384c290d5");
    console.log("═══════════════════════════════════════");
    console.log("\n🔧 Next Steps:");
    console.log("1. Update .env.local with these addresses");
    console.log("2. Restart relayer: pm2 restart relayer");
    console.log("3. Restart frontend (it will pick up new contracts)");
    console.log("4. Hard refresh browser (Ctrl+Shift+R)");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
