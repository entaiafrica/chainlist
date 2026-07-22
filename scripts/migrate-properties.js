const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🔄 Migrating Properties to Gasless-Enabled Marketplace\n");

    const [deployer] = await ethers.getSigners();
    console.log("Migrating with account:", deployer.address);

    const OLD_MARKETPLACE = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042";
    const NEW_MARKETPLACE = "0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154";

    const marketplaceABI = require('../src/Marketplace_new.json').abi;

    const provider = ethers.provider;
    const oldContract = new ethers.Contract(OLD_MARKETPLACE, marketplaceABI, provider);
    const newContract = new ethers.Contract(NEW_MARKETPLACE, marketplaceABI, deployer);

    console.log("Old Marketplace:", OLD_MARKETPLACE);
    console.log("New Marketplace:", NEW_MARKETPLACE);
    console.log();

    // Check old marketplace for properties
    const propertiesToMigrate = [];

    for (let tokenId = 1; tokenId <= 10; tokenId++) {
        try {
            const propertyData = await oldContract.getPropertyData(tokenId);

            // Only migrate if property has bricks (exists)
            if (propertyData.totalBricks.gt(0)) {
                const metadataURI = await oldContract.uri(tokenId);
                const creator = await oldContract.propertyCreator(tokenId);
                const buyer = await oldContract.propertyBuyer(tokenId);

                console.log(`Found Property ${tokenId}:`);
                console.log(`  Total Bricks: ${propertyData.totalBricks.toString()}`);
                console.log(`  Price per Brick: ${ethers.utils.formatEther(propertyData.pricePerBrick)} BRK`);
                console.log(`  Status: ${propertyData.status} (0=PENDING, 1=ACTIVE, 2=FUNDED)`);
                console.log(`  Buyer: ${buyer}`);
                console.log(`  Metadata: ${metadataURI}`);
                console.log();

                propertiesToMigrate.push({
                    tokenId,
                    propertyData,
                    metadataURI,
                    creator,
                    buyer
                });
            }
        } catch (e) {
            // Property doesn't exist, continue
            break;
        }
    }

    if (propertiesToMigrate.length === 0) {
        console.log("❌ No properties found to migrate!");
        return;
    }

    console.log(`\n📋 Found ${propertiesToMigrate.length} properties to migrate\n`);

    // Migrate each property
    for (const property of propertiesToMigrate) {
        console.log(`\n🔄 Migrating Property ${property.tokenId}...`);

        try {
            // Submit property to new marketplace
            const tx = await newContract.submitProperty(
                property.metadataURI,
                property.propertyData.totalBricks,
                property.propertyData.pricePerBrick,
                property.propertyData.depositAmount,
                property.buyer,
                Math.floor((property.propertyData.otpDeadline - Date.now() / 1000) / 86400) || 90
            );

            await tx.wait();
            console.log(`✅ Property ${property.tokenId} migrated successfully!`);
            console.log(`   Transaction: ${tx.hash}`);

            // If property was ACTIVE on old contract, activate it on new contract
            if (property.propertyData.status === 1) {
                console.log(`   Property was ACTIVE, activating on new marketplace...`);

                // We need to pay the deposit as the buyer
                // This requires the buyer's wallet to have BRK tokens and approve the marketplace
                console.log(`   ⚠️  Manual step required: Buyer (${property.buyer}) needs to call payDeposit(${property.tokenId})`);
            }

        } catch (error) {
            console.error(`❌ Error migrating property ${property.tokenId}:`, error.message);
        }
    }

    console.log("\n✅ Migration complete!");
    console.log("\n⚠️  IMPORTANT NOTES:");
    console.log("1. Properties have been recreated on the new marketplace");
    console.log("2. Properties that were ACTIVE need buyers to call payDeposit() again");
    console.log("3. Investors will need to re-purchase their bricks on the new marketplace");
    console.log("4. Update frontend to use new marketplace address:", NEW_MARKETPLACE);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
