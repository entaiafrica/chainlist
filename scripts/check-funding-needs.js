const { ethers } = require("hardhat");

async function main() {
    console.log("\n💰 CHECKING FUNDING REQUIREMENTS\n");
    console.log("=".repeat(70));

    const NEW_MARKETPLACE = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
    const BRK_TOKEN = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";

    // Buyer accounts from activate-properties.js
    const buyer1PrivateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
    const buyer2PrivateKey = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";

    const buyer1 = new ethers.Wallet(buyer1PrivateKey, ethers.provider);
    const buyer2 = new ethers.Wallet(buyer2PrivateKey, ethers.provider);

    // Platform wallet
    const platformWallet = "0x8da6CE40Bf4F1c5333D7316e789c755384c290d5";

    const marketplace = await ethers.getContractAt("BrickMarketplace", NEW_MARKETPLACE);
    const brkAbi = ["function balanceOf(address) view returns (uint256)"];
    const brkToken = new ethers.Contract(BRK_TOKEN, brkAbi, ethers.provider);

    // Get property deposit requirements
    const prop1 = await marketplace.getPropertyData(1);
    const prop2 = await marketplace.getPropertyData(2);

    console.log("\n📋 PROPERTY DEPOSIT REQUIREMENTS:\n");
    console.log("Property 1 (Chic Sandton):");
    console.log("  Deposit needed:", ethers.utils.formatEther(prop1.depositAmount), "BRK");
    console.log("\nProperty 2 (Steeldale Mall):");
    console.log("  Deposit needed:", ethers.utils.formatEther(prop2.depositAmount), "BRK");

    console.log("\n" + "=".repeat(70));
    console.log("CURRENT ACCOUNT BALANCES:\n");

    // Check buyer 1
    const buyer1Balance = await brkToken.balanceOf(buyer1.address);
    console.log("Buyer 1 (Property 1):");
    console.log("  Address:", buyer1.address);
    console.log("  Current BRK:", ethers.utils.formatEther(buyer1Balance));
    console.log("  Needs:", ethers.utils.formatEther(prop1.depositAmount), "BRK");
    console.log("  Shortfall:", ethers.utils.formatEther(prop1.depositAmount.sub(buyer1Balance)), "BRK");

    // Check buyer 2
    const buyer2Balance = await brkToken.balanceOf(buyer2.address);
    console.log("\nBuyer 2 (Property 2):");
    console.log("  Address:", buyer2.address);
    console.log("  Current BRK:", ethers.utils.formatEther(buyer2Balance));
    console.log("  Needs:", ethers.utils.formatEther(prop2.depositAmount), "BRK");
    console.log("  Shortfall:", ethers.utils.formatEther(prop2.depositAmount.sub(buyer2Balance)), "BRK");

    // Check platform wallet
    const platformBalance = await brkToken.balanceOf(platformWallet);
    console.log("\nPlatform Wallet (Funding Source):");
    console.log("  Address:", platformWallet);
    console.log("  Current BRK:", ethers.utils.formatEther(platformBalance));
    console.log("  Can fund both:", platformBalance.gte(prop1.depositAmount.add(prop2.depositAmount)) ? "✅ YES" : "❌ NO");

    console.log("\n" + "=".repeat(70));
    console.log("FUNDING INSTRUCTIONS:\n");

    const totalNeeded = prop1.depositAmount.add(prop2.depositAmount);
    console.log("Total BRK needed:", ethers.utils.formatEther(totalNeeded));
    console.log("\n📝 OPTION 1: Fund from Platform Wallet");
    console.log("If you have access to platform wallet private key:");
    console.log(`  Transfer ${ethers.utils.formatEther(prop1.depositAmount)} BRK to: ${buyer1.address}`);
    console.log(`  Transfer ${ethers.utils.formatEther(prop2.depositAmount)} BRK to: ${buyer2.address}`);

    console.log("\n📝 OPTION 2: Use MetaMask");
    console.log("If you're connected with platform wallet in MetaMask:");
    console.log("  1. Send BRK to buyer addresses above");
    console.log("  2. Then run: npx hardhat run scripts/activate-properties.js --network loyalty");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
