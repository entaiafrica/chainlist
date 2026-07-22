const { ethers } = require("hardhat");

async function main() {
    console.log("\n🔍 CHECKING PROPERTY BUYERS\n");
    console.log("=".repeat(70));

    const NEW_MARKETPLACE = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
    const marketplace = await ethers.getContractAt("BrickMarketplace", NEW_MARKETPLACE);

    console.log("\nProperty 3 (Chic Sandton):");
    const buyer3 = await marketplace.propertyBuyer(3);
    console.log("  Designated Buyer:", buyer3);

    console.log("\nProperty 4 (Steeldale Mall):");
    const buyer4 = await marketplace.propertyBuyer(4);
    console.log("  Designated Buyer:", buyer4);

    console.log("\n" + "=".repeat(70));
    console.log("THESE are the addresses that need to pay deposits!");
    console.log("=".repeat(70));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
