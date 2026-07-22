const { ethers } = require("hardhat");

async function main() {
    const MARKETPLACE_ADDRESS = "0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B";

    console.log("\n🔧 Fixing metadata URIs...\n");

    const [deployer] = await ethers.getSigners();
    const marketplace = await ethers.getContractAt("BrickMarketplace", MARKETPLACE_ADDRESS, deployer);

    // Update Token 1 (Chic Sandton)
    console.log("Updating Token 1 URI...");
    const tx1 = await marketplace.updateMetadataURI(
        1,
        "https://rpc.firstbrick.cloud/ipfs/QmSApSwJgoyrzr8S3aWLDXD72q1bQV9PHP3NS74eNnreTv"
    );
    await tx1.wait();
    console.log("✅ Token 1 URI updated");

    // Update Token 2 (Steeldale) - COMMENTED OUT AS IT DOES NOT EXIST ON FRESH CHAIN
    /*
    console.log("\nUpdating Token 2 URI...");
    const tx2 = await marketplace.updateMetadataURI(
        2,
        "https://rpc.entailabs.com/ipfs/QmerLCBWnHi72dzXiwvMJ8SaWsvZfpCPjutxdT9FqZYr2L"
    );
    await tx2.wait();
    console.log("✅ Token 2 URI updated");
    */

    // Verify
    console.log("\n🔍 Verification:");
    const uri1 = await marketplace.uri(1);
    // const uri2 = await marketplace.uri(2);
    console.log("Token 1 URI:", uri1);
    // console.log("Token 2 URI:", uri2);

    console.log("\n✅ Metadata URIs fixed!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
