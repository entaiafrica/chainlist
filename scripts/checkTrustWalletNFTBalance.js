const { ethers } = require("hardhat");

async function main() {
    const MARKETPLACE_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const CHIC_SANDTON_TRUST = "0x712820B679400DACbb5c9eeccFB785378fc9b9B6";
    const STEELDALE_TRUST = "0x361Ba631152BE934ef5d6e1670a177Ecef9458B6";

    console.log("\n🔍 Checking NFT balances in trust wallets...\n");

    const marketplace = await ethers.getContractAt("BrickMarketplace", MARKETPLACE_ADDRESS);

    // Check Token 1 (Chic Sandton)
    console.log("=" .repeat(70));
    console.log("TOKEN 1 - CHIC SANDTON");
    console.log("=" .repeat(70));
    const token1Balance = await marketplace.balanceOf(CHIC_SANDTON_TRUST, 1);
    console.log(`Trust Wallet: ${CHIC_SANDTON_TRUST}`);
    console.log(`NFT Balance: ${ethers.utils.formatUnits(token1Balance, 0)} bricks`);

    const prop1 = await marketplace.getPropertyData(1);
    console.log(`Total Bricks: ${ethers.utils.formatUnits(prop1.totalBricks, 0)}`);
    console.log(`Available Bricks: ${ethers.utils.formatUnits(prop1.bricksAvailable, 0)}`);
    console.log(`Status: ${prop1.status}`);

    // Check Token 2 (Steeldale)
    console.log("\n" + "=".repeat(70));
    console.log("TOKEN 2 - STEELDALE MALL");
    console.log("=" .repeat(70));
    const token2Balance = await marketplace.balanceOf(STEELDALE_TRUST, 2);
    console.log(`Trust Wallet: ${STEELDALE_TRUST}`);
    console.log(`NFT Balance: ${ethers.utils.formatUnits(token2Balance, 0)} bricks`);

    const prop2 = await marketplace.getPropertyData(2);
    console.log(`Total Bricks: ${ethers.utils.formatUnits(prop2.totalBricks, 0)}`);
    console.log(`Available Bricks: ${ethers.utils.formatUnits(prop2.bricksAvailable, 0)}`);
    console.log(`Status: ${prop2.status}`);

    console.log("\n" + "=".repeat(70));

    // Also check if approval is needed (though we shouldn't need it with internal transfer)
    console.log("\n🔑 Checking approvals...");
    const isApprovedChic = await marketplace.isApprovedForAll(CHIC_SANDTON_TRUST, MARKETPLACE_ADDRESS);
    const isApprovedSteel = await marketplace.isApprovedForAll(STEELDALE_TRUST, MARKETPLACE_ADDRESS);
    console.log(`Chic Sandton Trust approved contract: ${isApprovedChic}`);
    console.log(`Steeldale Trust approved contract: ${isApprovedSteel}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
