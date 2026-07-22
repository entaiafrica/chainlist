const hre = require("hardhat");
const Marketplace = require("../src/Marketplace_new.json");

async function main() {
    console.log("🔍 Checking NFT Ownership on Blockchain...\n");
    
    const provider = new hre.ethers.providers.JsonRpcProvider("https://rpc.entailabs.com");
    const contract = new hre.ethers.Contract(Marketplace.address, Marketplace.abi, provider);
    
    const checkAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    console.log("👤 Checking wallet:", checkAddress);
    console.log("📝 Contract:", Marketplace.address);
    console.log("\n" + "=".repeat(80) + "\n");
    
    // Check token IDs 1-10
    for (let tokenId = 1; tokenId <= 10; tokenId++) {
        try {
            const propertyData = await contract.getPropertyData(tokenId);
            
            if (propertyData.totalBricks.eq(0)) {
                continue; // Property doesn't exist
            }
            
            console.log(`\n🏠 TOKEN ID ${tokenId}`);
            console.log("─".repeat(80));
            
            // Get property details
            const totalBricks = propertyData.totalBricks.toNumber();
            const bricksAvailable = propertyData.bricksAvailable.toNumber();
            const pricePerBrick = hre.ethers.utils.formatEther(propertyData.pricePerBrick);
            const depositAmount = propertyData.depositAmount.toNumber();
            
            console.log(`   Total Bricks: ${totalBricks.toLocaleString()}`);
            console.log(`   Available: ${bricksAvailable.toLocaleString()}`);
            console.log(`   Price per Brick: R${pricePerBrick}`);
            console.log(`   Deposit Amount: ${depositAmount.toLocaleString()} bricks`);
            
            // Get buyer info
            const buyer = await contract.propertyBuyer(tokenId);
            const creator = await contract.propertyCreator(tokenId);
            
            console.log(`\n   👤 Creator: ${creator}`);
            console.log(`   👤 Buyer: ${buyer}`);
            
            // Check if our address is the buyer
            const isBuyer = buyer.toLowerCase() === checkAddress.toLowerCase();
            console.log(`\n   ✓ Is ${checkAddress.substring(0,10)}... the buyer? ${isBuyer ? "YES ✅" : "NO ❌"}`);
            
            // Check balance
            const balance = await contract.balanceOf(checkAddress, tokenId);
            const bricks = balance.toNumber();
            
            console.log(`   💰 Balance for ${checkAddress.substring(0,10)}...: ${bricks.toLocaleString()} bricks`);
            
            if (bricks > 0) {
                console.log(`   💵 Value: R${(bricks * parseFloat(pricePerBrick)).toLocaleString()}`);
            }
            
            // Get metadata
            try {
                const metadataURI = await contract.uri(tokenId);
                const response = await fetch(metadataURI);
                const metadata = await response.json();
                console.log(`   📋 Property Name: ${metadata.name}`);
            } catch (e) {
                console.log(`   📋 Property Name: (metadata unavailable)`);
            }
            
            console.log("\n" + "─".repeat(80));
            
        } catch (err) {
            // Token doesn't exist, skip
            continue;
        }
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("\n✅ Scan complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
