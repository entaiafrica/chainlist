const { ethers } = require("hardhat");

async function main() {
    const walletAddress = "0x52b83c7ecefafb399a299fd4a780b15d29e26b49";
    const marketplaceAddress = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042";
    
    console.log("Checking brick balance for:", walletAddress);
    console.log("Marketplace:", marketplaceAddress);
    console.log();
    
    const marketplace = await ethers.getContractAt("BrickMarketplace", marketplaceAddress);
    
    // Get total number of properties (token IDs)
    const totalTokens = await marketplace._tokenIds();
    console.log("Total properties in marketplace:", totalTokens.toString());
    console.log();
    
    let totalBricks = 0;
    
    for (let tokenId = 1; tokenId <= totalTokens.toNumber(); tokenId++) {
        const balance = await marketplace.balanceOf(walletAddress, tokenId);
        
        if (balance.gt(0)) {
            const property = await marketplace.properties(tokenId);
            console.log(`Property #${tokenId}:`);
            console.log(`  Bricks owned: ${balance.toString()}`);
            console.log(`  Price per brick: ${ethers.utils.formatEther(property.pricePerBrick)} BRK`);
            console.log(`  Total value: ${ethers.utils.formatEther(balance.mul(property.pricePerBrick))} BRK`);
            console.log();
            
            totalBricks += balance.toNumber();
        }
    }
    
    console.log("=".repeat(50));
    console.log(`Total bricks owned: ${totalBricks}`);
    
    if (totalBricks === 0) {
        console.log("\n❌ This wallet owns 0 bricks");
    } else {
        console.log(`\n✅ This wallet owns bricks in the marketplace!`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
