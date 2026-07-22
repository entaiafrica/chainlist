const hre = require("hardhat");
const Marketplace = require("../src/Marketplace_new.json");

async function main() {
    const checkAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Buyer 1
    
    console.log("👤 Checking BUYER wallet:", checkAddress);
    console.log("📝 Contract:", Marketplace.address);
    console.log("\n");
    
    const provider = new hre.ethers.providers.JsonRpcProvider("https://rpc.entailabs.com");
    const contract = new hre.ethers.Contract(Marketplace.address, Marketplace.abi, provider);
    
    const allProperties = await contract.getAllProperties();
    
    for (let tokenId of allProperties) {
        const id = tokenId.toNumber();
        const buyer = await contract.propertyBuyer(id);
        const balance = await contract.balanceOf(checkAddress, id);
        const bricks = parseFloat(hre.ethers.utils.formatUnits(balance, 0));
        
        if (buyer.toLowerCase() === checkAddress.toLowerCase()) {
            console.log(`🏠 Token ${id}: ✅ THIS WALLET IS THE BUYER`);
            console.log(`   Balance: ${bricks} bricks`);
            
            const metadataURI = await contract.uri(id);
            try {
                const response = await fetch(metadataURI);
                const metadata = await response.json();
                console.log(`   Property: ${metadata.name}`);
            } catch (e) {}
            console.log();
        } else if (bricks > 0) {
            console.log(`🧱 Token ${id}: Investor with ${bricks} bricks`);
        }
    }
}

main().catch(console.error);
