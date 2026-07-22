const { ethers } = require("hardhat");

async function main() {
    console.log("\n🔍 CHECKING TRUST WALLETS ON CONTRACT\n");
    console.log("=".repeat(70));

    const NEW_MARKETPLACE = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
    const BRK_TOKEN = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";

    const marketplace = await ethers.getContractAt("BrickMarketplace", NEW_MARKETPLACE);
    const brkAbi = ["function balanceOf(address) view returns (uint256)"];
    const brkToken = new ethers.Contract(BRK_TOKEN, brkAbi, ethers.provider);

    console.log("\n📋 USER'S EXPECTED TRUST WALLETS:\n");
    console.log("Chic Sandton:  0x712820b679400dacbb5c9eeccfb785378fc9b9b6");
    console.log("Steeldale:     0x361ba631152be934ef5d6e1670a177ecef9458b6");

    console.log("\n" + "=".repeat(70));
    console.log("PROPERTY 1: CHIC SANDTON");
    console.log("=".repeat(70));

    try {
        const prop1 = await marketplace.getPropertyData(1);
        const trustWallet1 = await marketplace.propertyTrustWallet(1);
        const trust1Balance = await brkToken.balanceOf(trustWallet1);

        console.log("\n📊 On Contract:");
        console.log("  Trust Wallet:", trustWallet1);
        console.log("  BRK Balance:", ethers.utils.formatEther(trust1Balance));
        console.log("  Total Bricks:", prop1.totalBricks.toString());
        console.log("  Available Bricks:", prop1.bricksAvailable.toString());
        console.log("  Status:", prop1.status === 0 ? "PENDING" : "ACTIVE");

        // Check the user's expected wallet
        const userTrust1 = "0x712820b679400dacbb5c9eeccfb785378fc9b9b6";
        const userTrust1Balance = await brkToken.balanceOf(userTrust1);
        console.log("\n📊 User's Expected Wallet:");
        console.log("  Address:", userTrust1);
        console.log("  BRK Balance:", ethers.utils.formatEther(userTrust1Balance));

        if (trustWallet1.toLowerCase() === userTrust1.toLowerCase()) {
            console.log("\n✅ MATCH! Contract uses your expected wallet.");
        } else {
            console.log("\n❌ MISMATCH! Contract has different wallet.");
        }

    } catch (error) {
        console.error("Error:", error.message);
    }

    console.log("\n" + "=".repeat(70));
    console.log("PROPERTY 2: STEELDALE MALL");
    console.log("=".repeat(70));

    try {
        const prop2 = await marketplace.getPropertyData(2);
        const trustWallet2 = await marketplace.propertyTrustWallet(2);
        const trust2Balance = await brkToken.balanceOf(trustWallet2);

        console.log("\n📊 On Contract:");
        console.log("  Trust Wallet:", trustWallet2);
        console.log("  BRK Balance:", ethers.utils.formatEther(trust2Balance));
        console.log("  Total Bricks:", prop2.totalBricks.toString());
        console.log("  Available Bricks:", prop2.bricksAvailable.toString());
        console.log("  Status:", prop2.status === 0 ? "PENDING" : "ACTIVE");

        // Check the user's expected wallet
        const userTrust2 = "0x361ba631152be934ef5d6e1670a177ecef9458b6";
        const userTrust2Balance = await brkToken.balanceOf(userTrust2);
        console.log("\n📊 User's Expected Wallet:");
        console.log("  Address:", userTrust2);
        console.log("  BRK Balance:", ethers.utils.formatEther(userTrust2Balance));

        if (trustWallet2.toLowerCase() === userTrust2.toLowerCase()) {
            console.log("\n✅ MATCH! Contract uses your expected wallet.");
        } else {
            console.log("\n❌ MISMATCH! Contract has different wallet.");
        }

    } catch (error) {
        console.error("Error:", error.message);
    }

    console.log("\n" + "=".repeat(70));
    console.log("RECOMMENDATIONS:");
    console.log("=".repeat(70));

    console.log("\nIf there's a MISMATCH:");
    console.log("  Option 1: Resubmit properties with YOUR trust wallets");
    console.log("  Option 2: Fund the NEW trust wallets that are on contract");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
