const { ethers } = require("hardhat");

async function main() {
    console.log("🏠 Adding Sample Property to Marketplace\n");

    const [deployer] = await ethers.getSigners();
    const marketplaceAddr = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

    console.log("Adding property with account:", deployer.address);

    const marketplace = await ethers.getContractAt("BrickMarketplace", marketplaceAddr);

    // Sample property data
    const property = {
        ipfsHash: "QmTest123SampleProperty",
        totalBricks: 1000,
        pricePerBrick: ethers.utils.parseEther("1"), // 1 BRK per brick
        depositAmount: ethers.utils.parseEther("100"), // 100 BRK deposit
        depositDeadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
        propertyValue: ethers.utils.parseEther("1000")
    };

    console.log("Property Details:");
    console.log("- IPFS Hash:", property.ipfsHash);
    console.log("- Total Bricks:", property.totalBricks);
    console.log("- Price per Brick:", ethers.utils.formatEther(property.pricePerBrick), "BRK");
    console.log("- Deposit Amount:", ethers.utils.formatEther(property.depositAmount), "BRK");
    console.log("- Deposit Deadline:", new Date(property.depositDeadline * 1000).toLocaleString());
    console.log();

    console.log("📝 Submitting property to marketplace...");
    const tx = await marketplace.submitProperty(
        property.ipfsHash,
        property.totalBricks,
        property.pricePerBrick,
        property.depositAmount,
        property.depositDeadline,
        property.propertyValue
    );

    console.log("Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Property submitted! Block:", receipt.blockNumber);

    // Get the token ID from the event
    const event = receipt.events?.find(e => e.event === 'PropertySubmitted');
    if (event) {
        console.log("\n🎉 Property Created!");
        console.log("Token ID:", event.args.tokenId.toString());
        console.log("\nProperty is now available in the marketplace!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
