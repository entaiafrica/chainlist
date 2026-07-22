const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Check deployer balance
    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

    // Deploy BrickMarketplace (ERC1155)
    console.log("\n1. Deploying BrickMarketplace...");
    const baseURI = "https://gateway.pinata.cloud/ipfs/"; // Base URI for metadata
    const Marketplace = await ethers.getContractFactory("BrickMarketplace");
    const marketplace = await Marketplace.deploy(baseURI);
    await marketplace.deployed();
    console.log("✓ BrickMarketplace deployed to:", marketplace.address);

    // Set BRK token
    console.log("\n2. Configuring BRK token...");
    const brkTokenAddress = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";
    await marketplace.setBrkToken(brkTokenAddress);
    console.log("✓ BRK token set to:", brkTokenAddress);

    // Deploy PaymentDistributor
    console.log("\n3. Deploying PaymentDistributor...");
    const PaymentDistributor = await ethers.getContractFactory("PaymentDistributor");
    const distributor = await PaymentDistributor.deploy(
        marketplace.address,
        brkTokenAddress
    );
    await distributor.deployed();
    console.log("✓ PaymentDistributor deployed to:", distributor.address);

    console.log("\n" + "=".repeat(70));
    console.log("DEPLOYMENT SUMMARY");
    console.log("=".repeat(70));
    console.log("BrickMarketplace (ERC1155):", marketplace.address);
    console.log("PaymentDistributor:", distributor.address);
    console.log("BRK Token:", brkTokenAddress);
    console.log("\nWallet Configuration:");
    console.log("  Trust Wallet:", "0x712820B679400DACbb5c9eeccFB785378fc9b9B6");
    console.log("  Platform Wallet:", "0x8da6CE40Bf4F1c5333D7316e789c755384c290d5");
    console.log("  Payment Receiver:", "0x419dcbe78a9eb41f38ad97fcfe12a431d98cb2b2");
    console.log("\nNOTE:");
    console.log("- 789 Parkview will mint 800,000 ERC1155 tokens (1 per brick)");
    console.log("- Gasless transactions removed to solve compilation issues");
    console.log("- Investors will need small amounts of ETH for gas");
    console.log("=".repeat(70));
    console.log("\nNext Steps:");
    console.log("1. Update src/Marketplace_new.json with address:", marketplace.address);
    console.log("2. Create src/PaymentDistributor.json with address:", distributor.address);
    console.log("3. Mint demo property 789 Parkview Drive");
    console.log("=".repeat(70));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
