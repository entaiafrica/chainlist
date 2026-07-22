const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
    console.log("\n🪙 Deploying ERC2771-Compatible BRK Token\n");
    console.log("=".repeat(70));

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    const balance = await deployer.getBalance();
    console.log("Deployer balance:", hre.ethers.utils.formatEther(balance), "ETH\n");

    // Configuration
    const FORWARDER_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const FIRSTBRICK_WALLET = "0x8da6CE40Bf4F1c5333D7316e789c755384c290d5";

    // Total BRK to mint for both properties
    // Property #1 (Chic Santon): 2,800,000 BRK
    // Property #2 (Steeldale): 240,000,000 BRK
    // Total: 242,800,000 BRK
    const TOTAL_BRK = hre.ethers.utils.parseEther("242800000");

    console.log("📋 Configuration:");
    console.log("   Forwarder:", FORWARDER_ADDRESS);
    console.log("   FirstBrick Wallet:", FIRSTBRICK_WALLET);
    console.log("   Total BRK to mint:", hre.ethers.utils.formatEther(TOTAL_BRK), "BRK");
    console.log("");

    // Deploy BRKToken
    console.log("1️⃣  Deploying BRKToken...");
    const BRKToken = await hre.ethers.getContractFactory("BRKToken");
    const brkToken = await BRKToken.deploy(
        "FirstBrick Token",
        "BRK",
        FORWARDER_ADDRESS
    );
    await brkToken.deployed();
    console.log("   ✅ BRKToken deployed to:", brkToken.address);
    console.log("");

    // Verify forwarder is trusted
    console.log("2️⃣  Verifying forwarder trust...");
    const isTrusted = await brkToken.isTrustedForwarder(FORWARDER_ADDRESS);
    console.log("   ✅ Forwarder trusted:", isTrusted);
    console.log("");

    // Mint BRK tokens to FirstBrick wallet
    console.log("3️⃣  Minting BRK tokens to FirstBrick wallet...");
    const mintTx = await brkToken.mint(FIRSTBRICK_WALLET, TOTAL_BRK);
    await mintTx.wait();
    console.log("   ✅ Minted", hre.ethers.utils.formatEther(TOTAL_BRK), "BRK");
    console.log("");

    // Verify balance
    console.log("4️⃣  Verifying balance...");
    const balance_brk = await brkToken.balanceOf(FIRSTBRICK_WALLET);
    console.log("   ✅ FirstBrick wallet balance:", hre.ethers.utils.formatEther(balance_brk), "BRK");
    console.log("");

    console.log("=".repeat(70));
    console.log("\n✅ Deployment Complete!\n");

    console.log("📝 Summary:");
    console.log("   BRK Token Address:", brkToken.address);
    console.log("   Token Name: FirstBrick Token");
    console.log("   Token Symbol: BRK");
    console.log("   Forwarder:", FORWARDER_ADDRESS);
    console.log("   Total Supply:", hre.ethers.utils.formatEther(balance_brk), "BRK");
    console.log("   Holder:", FIRSTBRICK_WALLET);
    console.log("");

    // Save deployment info
    const deploymentInfo = {
        brkToken: brkToken.address,
        forwarder: FORWARDER_ADDRESS,
        firstBrickWallet: FIRSTBRICK_WALLET,
        totalSupply: hre.ethers.utils.formatEther(TOTAL_BRK),
        deployedAt: new Date().toISOString(),
        network: hre.network.name
    };

    const fs = require('fs');
    fs.writeFileSync(
        'BRK_TOKEN_DEPLOYMENT.json',
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("💾 Deployment info saved to BRK_TOKEN_DEPLOYMENT.json\n");

    return brkToken.address;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
