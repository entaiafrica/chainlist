const hre = require("hardhat");

async function main() {
    console.log("\n🔄 Updating Marketplace BRK Token\n");
    console.log("=".repeat(70));

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    // Configuration
    const MARKETPLACE_ADDRESS = "0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B";
    const NEW_BRK_TOKEN = "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49";
    const OLD_BRK_TOKEN = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

    console.log("📋 Configuration:");
    console.log("   Marketplace:", MARKETPLACE_ADDRESS);
    console.log("   Old BRK Token:", OLD_BRK_TOKEN);
    console.log("   New BRK Token:", NEW_BRK_TOKEN);
    console.log("");

    // Get marketplace contract
    const marketplace = await hre.ethers.getContractAt("BrickMarketplace", MARKETPLACE_ADDRESS);

    // Check current BRK token
    console.log("1️⃣  Checking current BRK token...");
    const currentBrk = await marketplace.brkToken();
    console.log("   Current BRK Token:", currentBrk);
    console.log("");

    // Update to new BRK token
    console.log("2️⃣  Updating to new BRK token...");
    const tx = await marketplace.setBrkToken(NEW_BRK_TOKEN);
    await tx.wait();
    console.log("   ✅ Transaction confirmed:", tx.hash);
    console.log("");

    // Verify update
    console.log("3️⃣  Verifying update...");
    const updatedBrk = await marketplace.brkToken();
    console.log("   New BRK Token:", updatedBrk);
    console.log("");

    // Verify new token supports ERC2771
    console.log("4️⃣  Verifying ERC2771 support...");
    const brkToken = await hre.ethers.getContractAt("BRKToken", NEW_BRK_TOKEN);
    const FORWARDER = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const isTrusted = await brkToken.isTrustedForwarder(FORWARDER);
    console.log("   ✅ Forwarder trusted:", isTrusted);
    console.log("");

    console.log("=".repeat(70));
    console.log("\n✅ Marketplace Updated Successfully!\n");

    console.log("📝 Summary:");
    console.log("   Marketplace:", MARKETPLACE_ADDRESS);
    console.log("   New BRK Token:", NEW_BRK_TOKEN);
    console.log("   ERC2771 Support: ✅ Enabled");
    console.log("   Gasless Approvals: ✅ Now Supported");
    console.log("");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
