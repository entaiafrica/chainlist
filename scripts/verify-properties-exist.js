const { ethers } = require("hardhat");

async function main() {
    console.log("\n🔍 VERIFYING PROPERTIES ON CONTRACT\n");
    console.log("=".repeat(70));

    const NEW_MARKETPLACE = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
    const BRK_TOKEN = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";

    const marketplace = await ethers.getContractAt("BrickMarketplace", NEW_MARKETPLACE);
    const brkAbi = ["function balanceOf(address) view returns (uint256)"];
    const brkToken = new ethers.Contract(BRK_TOKEN, brkAbi, ethers.provider);

    console.log("Scanning token IDs 1-10...\n");

    for (let tokenId = 1; tokenId <= 10; tokenId++) {
        try {
            const prop = await marketplace.getPropertyData(tokenId);

            if (prop.totalBricks.eq(0)) {
                console.log(`Token ${tokenId}: ❌ Not found (totalBricks = 0)`);
                continue;
            }

            const trustWallet = await marketplace.propertyTrustWallet(tokenId);
            const trustBalance = await brkToken.balanceOf(trustWallet);
            const uri = await marketplace.uri(tokenId);

            console.log(`Token ${tokenId}: ✅ EXISTS`);
            console.log(`  Status: ${prop.status === 0 ? "PENDING" : "ACTIVE"}`);
            console.log(`  Total Bricks: ${prop.totalBricks.toString()}`);
            console.log(`  Available: ${prop.bricksAvailable.toString()}`);
            console.log(`  Price per Brick: ${ethers.utils.formatEther(prop.pricePerBrick)} BRK`);
            console.log(`  Trust Wallet: ${trustWallet}`);
            console.log(`  Trust Balance: ${ethers.utils.formatEther(trustBalance)} BRK`);
            console.log(`  Metadata URI: ${uri}`);
            console.log("");

        } catch (error) {
            console.log(`Token ${tokenId}: ❌ Error: ${error.message}`);
        }
    }

    console.log("\n" + "=".repeat(70));
    console.log("Frontend should be able to see these properties!");
    console.log("If frontend shows nothing, check browser console for errors.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
