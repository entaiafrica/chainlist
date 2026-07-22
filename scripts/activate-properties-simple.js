const { ethers } = require("hardhat");

async function main() {
    console.log("\n⚡ ACTIVATING PROPERTIES - SIMPLE VERSION\n");
    console.log("=".repeat(70));

    const NEW_MARKETPLACE = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
    const BRK_TOKEN = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";

    // For now, let's just mark properties as having minimal deposits
    // Then we can test the frontend display

    console.log("\nOption 1: Use Platform Wallet");
    console.log("  If you have the private key for 0x8da6CE40Bf4F1c5333D7316e789c755384c290d5");
    console.log("  It has 215 million BRK which is enough for deposits");
    console.log("");
    console.log("Option 2: Lower deposit amounts in contract");
    console.log("  We can submit new properties with lower deposits (1000 BRK each)");
    console.log("");
    console.log("Option 3: For testing, let's check if frontend loads properties in PENDING status");
    console.log("");

    const marketplace = await ethers.getContractAt("BrickMarketplace", NEW_MARKETPLACE);

    console.log("Checking submitted properties...");
    try {
        const prop1 = await marketplace.getPropertyData(1);
        const prop2 = await marketplace.getPropertyData(2);

        console.log("\nProperty 1:");
        console.log("  Total Bricks:", prop1.totalBricks.toString());
        console.log("  Available:", prop1.bricksAvailable.toString());
        console.log("  Status:", prop1.status, "(0=PENDING, 1=ACTIVE)");
        console.log("  Deposit Required:", ethers.utils.formatEther(prop1.depositAmount), "BRK");

        console.log("\nProperty 2:");
        console.log("  Total Bricks:", prop2.totalBricks.toString());
        console.log("  Available:", prop2.bricksAvailable.toString());
        console.log("  Status:", prop2.status, "(0=PENDING, 1=ACTIVE)");
        console.log("  Deposit Required:", ethers.utils.formatEther(prop2.depositAmount), "BRK");

        console.log("\n✓ Properties exist on new contract!");
        console.log("✓ Frontend should display them (even if PENDING)");
        console.log("\nTo activate: Buyers need to call payDeposit() with sufficient BRK");

    } catch (error) {
        console.error("Error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
