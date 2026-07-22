const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("FACEBRICK COMPLETE DEPLOYMENT - Chain ID 12786");
    console.log("=".repeat(80));

    const [deployer] = await ethers.getSigners();
    const deployerBalance = await deployer.getBalance();

    console.log("\nDeployer Account:", deployer.address);
    console.log("Balance:", ethers.utils.formatEther(deployerBalance), "BRK (native)");
    console.log();

    // ========== STEP 1: Deploy MinimalForwarder ==========
    console.log("STEP 1: Deploy MinimalForwarder (ERC-2771)");
    console.log("=".repeat(80));

    const MinimalForwarder = await ethers.getContractFactory("MinimalForwarder");
    const forwarder = await MinimalForwarder.deploy();
    await forwarder.deployed();
    
    console.log("✅ MinimalForwarder deployed:", forwarder.address);
    console.log();

    // ========== STEP 2: Deploy BRK Token ==========
    console.log("STEP 2: Deploy BRK Token (ERC-20 with Gasless)");
    console.log("=".repeat(80));

    const BRKToken = await ethers.getContractFactory("BRKToken");
    const brkToken = await BRKToken.deploy(
        "Brick Token",
        "BRK",
        forwarder.address
    );
    await brkToken.deployed();
    
    console.log("✅ BRK Token deployed:", brkToken.address);
    console.log("   Forwarder configured:", forwarder.address);

    // Mint initial supply to deployer
    console.log("\nMinting initial supply...");
    const initialSupply = ethers.utils.parseEther("100000000"); // 100M BRK
    await (await brkToken.mint(deployer.address, initialSupply)).wait();
    console.log("✅ Minted", ethers.utils.formatEther(initialSupply), "BRK to deployer");
    console.log();

    // ========== STEP 3: Deploy BrickMarketplace ==========
    console.log("STEP 3: Deploy BrickMarketplace (with Gasless)");
    console.log("=".repeat(80));

    const BrickMarketplace = await ethers.getContractFactory("BrickMarketplace");
    const baseURI = "https://rpc.entailabs.com/ipfs/";
    
    const marketplace = await BrickMarketplace.deploy(baseURI, forwarder.address);
    await marketplace.deployed();
    
    console.log("✅ BrickMarketplace deployed:", marketplace.address);
    console.log("   Base URI:", baseURI);
    console.log("   Forwarder:", forwarder.address);

    // Verify forwarder is trusted
    const isTrusted = await marketplace.isTrustedForwarder(forwarder.address);
    console.log("   Forwarder trusted:", isTrusted ? "✅ Yes" : "❌ No");
    console.log();

    // ========== STEP 4: Configure Marketplace ==========
    console.log("STEP 4: Configure Marketplace");
    console.log("=".repeat(80));

    console.log("Setting BRK token address...");
    await (await marketplace.setBrkToken(brkToken.address)).wait();
    console.log("✅ BRK token configured in marketplace");
    console.log();

    // ========== Save Deployment Info ==========
    const deployment = {
        chainId: 12786,
        network: "facebrick",
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
            MinimalForwarder: forwarder.address,
            BRKToken: brkToken.address,
            BrickMarketplace: marketplace.address
        },
        configuration: {
            baseURI: baseURI,
            initialSupply: ethers.utils.formatEther(initialSupply)
        }
    };

    fs.writeFileSync(
        "/opt/facebrick/deployment.json",
        JSON.stringify(deployment, null, 2)
    );

    console.log("=".repeat(80));
    console.log("DEPLOYMENT COMPLETE!");
    console.log("=".repeat(80));
    console.log("\nContract Addresses:");
    console.log("  MinimalForwarder:", forwarder.address);
    console.log("  BRKToken:", brkToken.address);
    console.log("  BrickMarketplace:", marketplace.address);
    console.log("\nDeployment info saved to: /opt/facebrick/deployment.json");
    console.log();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
