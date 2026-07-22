const { ethers } = require("hardhat");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("UPDATE METADATA URIs TO LOCAL SERVER");
    console.log("=".repeat(80));

    const [deployer] = await ethers.getSigners();
    const MARKETPLACE = "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f";

    const marketplace = await ethers.getContractAt("BrickMarketplace", MARKETPLACE);

    console.log("\nUsing account:", deployer.address);
    console.log("Marketplace:", MARKETPLACE);
    console.log();

    // Update to use localhost URLs that will be served by the React dev server
    const properties = [
        {
            tokenId: 1,
            name: "Chic Sandton Apartment",
            newURI: "http://localhost:3300/metadata/QmChicSandton2024"
        },
        {
            tokenId: 2,
            name: "Steeldale Mall",
            newURI: "http://localhost:3300/metadata/QmSteeldaleMall2024"
        }
    ];

    console.log("Updating metadata URIs to local server...\n");

    for (const prop of properties) {
        console.log(`Property ${prop.tokenId}: ${prop.name}`);
        console.log(`  Old URI: ${await marketplace.uri(prop.tokenId)}`);
        console.log(`  New URI: ${prop.newURI}`);

        const tx = await marketplace.updateMetadataURI(prop.tokenId, prop.newURI);
        await tx.wait();
        console.log(`  ✅ Updated!\n`);
    }

    console.log("=".repeat(80));
    console.log("✅ METADATA URIs UPDATED");
    console.log("=".repeat(80));
    console.log("\nMetadata is now served from React dev server");
    console.log("Accessible at:");
    console.log("  - http://localhost:3000/metadata/QmChicSandton2024");
    console.log("  - http://localhost:3000/metadata/QmSteeldaleMall2024");
    console.log("\nRefresh your browser to see updated property data!");
    console.log("=".repeat(80));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
