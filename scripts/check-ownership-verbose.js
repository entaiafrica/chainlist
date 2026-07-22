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

    // Get all properties first
    try {
        const allProperties = await contract.getAllProperties();
        console.log("📋 Total properties in contract:", allProperties.length);
        console.log("Property IDs:", allProperties.map(id => id.toString()).join(", "));
        console.log("\n");

        for (let tokenId of allProperties) {
            try {
                const id = tokenId.toNumber();
                console.log(`\n🏠 TOKEN ID ${id}`);
                console.log("─".repeat(80));

                const propertyData = await contract.getPropertyData(id);

                const totalBricks = parseFloat(hre.ethers.utils.formatUnits(propertyData.totalBricks, 0));
                const bricksAvailable = parseFloat(hre.ethers.utils.formatUnits(propertyData.bricksAvailable, 0));
                const pricePerBrick = hre.ethers.utils.formatEther(propertyData.pricePerBrick);
                const depositAmount = parseFloat(hre.ethers.utils.formatUnits(propertyData.depositAmount, 0));

                console.log(`   Total Bricks: ${totalBricks}`);
                console.log(`   Available: ${bricksAvailable}`);
                console.log(`   Sold: ${totalBricks - bricksAvailable}`);
                console.log(`   Price per Brick: R${pricePerBrick}`);
                console.log(`   Deposit Amount: ${depositAmount} bricks`);

                // Get buyer info
                const buyer = await contract.propertyBuyer(id);
                const creator = await contract.propertyCreator(id);

                console.log(`\n   👤 Creator: ${creator}`);
                console.log(`   👤 Buyer: ${buyer}`);

                // Check if our address is the buyer
                const isBuyer = buyer.toLowerCase() === checkAddress.toLowerCase();
                const isCreator = creator.toLowerCase() === checkAddress.toLowerCase();

                console.log(`\n   Is ${checkAddress.substring(0,10)}... the creator? ${isCreator ? "YES ✅" : "NO ❌"}`);
                console.log(`   Is ${checkAddress.substring(0,10)}... the buyer? ${isBuyer ? "YES ✅" : "NO ❌"}`);

                // Check balance
                const balance = await contract.balanceOf(checkAddress, id);
                const bricks = parseFloat(hre.ethers.utils.formatUnits(balance, 0));

                console.log(`\n   💰 Balance: ${bricks} bricks`);

                if (bricks > 0) {
                    console.log(`   💵 Value: R${bricks * parseFloat(pricePerBrick)}`);
                }

                // Get metadata
                try {
                    const metadataURI = await contract.uri(id);
                    console.log(`   🔗 Metadata URI: ${metadataURI}`);
                    const response = await fetch(metadataURI);
                    const metadata = await response.json();
                    console.log(`   📋 Property Name: ${metadata.name}`);
                } catch (e) {
                    console.log(`   📋 Property Name: (metadata unavailable - ${e.message})`);
                }

            } catch (err) {
                console.error(`   ❌ Error fetching token ${tokenId}:`, err.message);
            }
        }

    } catch (err) {
        console.error("❌ Error fetching properties:", err.message);
        console.error(err);
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
