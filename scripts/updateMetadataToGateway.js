const { ethers } = require("hardhat");

async function main() {
    console.log("\n" + "=".repeat(70));
    console.log("UPDATING METADATA URI TO GATEWAY URL");
    console.log("=".repeat(70));

    const [deployer] = await ethers.getSigners();
    const marketplaceAddress = "0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B";
    const tokenId = 1;

    // Use gateway URL instead of ipfs:// so MetaMask can fetch it
    const ipfsHash = "QmYWPJBakmXAvqTaNPri3uKENLBJYGU7YYbiJjbE7aBiG4";
    const gatewayURL = `https://rpc.entailabs.com/ipfs/${ipfsHash}`;

    console.log("\nUpdating Token ID:", tokenId);
    console.log("New URI:", gatewayURL);
    console.log("Owner:", deployer.address);

    const marketplace = await ethers.getContractAt("BrickMarketplace", marketplaceAddress);

    // Update metadata URI
    const tx = await marketplace.updateMetadataURI(tokenId, gatewayURL);
    await tx.wait();

    console.log("\n✓ Metadata URI updated!");
    console.log("Transaction:", tx.hash);

    // Verify
    const newURI = await marketplace.uri(tokenId);
    console.log("\nVerified URI:", newURI);

    console.log("\n" + "=".repeat(70));
    console.log("✅ SUCCESS - Metadata now accessible via gateway!");
    console.log("=".repeat(70));
    console.log("\nMetaMask should now display:");
    console.log("  - Property image");
    console.log("  - Property name and description");
    console.log("  - All attributes");
    console.log("\nRefresh your wallet to see the changes.");
    console.log("=".repeat(70));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
