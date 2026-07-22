const { ethers } = require("hardhat");

async function main() {
    const MARKETPLACE_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const marketplace = await ethers.getContractAt("BrickMarketplace", MARKETPLACE_ADDRESS);

    console.log("\n🔍 Checking metadata URIs...\n");

    const uri1 = await marketplace.uri(1);
    const uri2 = await marketplace.uri(2);

    console.log("Token 1 URI:", uri1);
    console.log("Token 2 URI:", uri2);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
