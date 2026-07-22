const { ethers } = require("hardhat");

async function main() {
    console.log("\n📦 MIGRATING INVESTORS FROM HTTP TO HTTPS BLOCKCHAIN\n");
    console.log("=".repeat(70));

    // OLD blockchain (HTTP)
    const OLD_MARKETPLACE = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
    const OLD_RPC = "http://rpc.entailabs.com:8545";

    // NEW blockchain (HTTPS)
    const NEW_MARKETPLACE = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042";
    const NEW_RPC = "https://rpc.entailabs.com";

    const oldProvider = new ethers.providers.JsonRpcProvider(OLD_RPC);
    const newProvider = new ethers.providers.JsonRpcProvider(NEW_RPC);

    const [deployer] = await ethers.getSigners();
    console.log("Migrating as:", deployer.address);

    const oldMarketplace = new ethers.Contract(
        OLD_MARKETPLACE,
        ["function getInvestorList(uint256) view returns (address[])", "function balanceOf(address, uint256) view returns (uint256)"],
        oldProvider
    );

    const newMarketplace = await ethers.getContractAt("BrickMarketplace", NEW_MARKETPLACE);

    // Property mapping: OLD token ID -> NEW token ID
    // Property 3 (HTTP) -> Property 1 (HTTPS) - Chic Sandton
    // Property 4 (HTTP) -> Property 2 (HTTPS) - Steeldale
    const propertyMapping = {
        3: 1,  // Chic Sandton
        4: 2   // Steeldale
    };

    let totalInvestors = 0;
    let totalBricksMigrated = 0;

    for (const [oldTokenId, newTokenId] of Object.entries(propertyMapping)) {
        console.log("\n" + "=".repeat(70));
        console.log(`MIGRATING PROPERTY ${oldTokenId} (HTTP) -> PROPERTY ${newTokenId} (HTTPS)`);
        console.log("=".repeat(70));

        try {
            // Get all investors from old blockchain
            console.log("\n📋 Fetching investors from HTTP blockchain...");
            const investors = await oldMarketplace.getInvestorList(oldTokenId);
            console.log(`Found ${investors.length} investors`);

            if (investors.length === 0) {
                console.log("⚠️ No investors to migrate for this property");
                continue;
            }

            // Get balances for each investor
            const investorData = [];
            for (const investor of investors) {
                const balance = await oldMarketplace.balanceOf(investor, oldTokenId);
                if (balance.gt(0)) {
                    investorData.push({
                        address: investor,
                        bricks: balance
                    });
                    console.log(`  ${investor}: ${balance.toString()} bricks`);
                }
            }

            // Migrate to new blockchain
            console.log(`\n💎 Migrating ${investorData.length} investors to HTTPS blockchain...`);

            for (const investor of investorData) {
                try {
                    console.log(`\n  Migrating ${investor.address}...`);
                    console.log(`    Bricks: ${investor.bricks.toString()}`);

                    // Transfer bricks from trust wallet to investor on new blockchain
                    const tx = await newMarketplace.safeTransferFrom(
                        deployer.address,  // We need to transfer from trust wallet
                        investor.address,
                        newTokenId,
                        investor.bricks,
                        "0x"
                    );
                    await tx.wait();

                    console.log(`    ✅ Migrated ${investor.bricks.toString()} bricks`);
                    totalInvestors++;
                    totalBricksMigrated += parseInt(investor.bricks.toString());

                } catch (error) {
                    console.error(`    ❌ Failed: ${error.message}`);
                }
            }

        } catch (error) {
            console.error(`\n❌ Error migrating property ${oldTokenId}:`, error.message);
        }
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ MIGRATION COMPLETE!");
    console.log("=".repeat(70));
    console.log(`\nTotal Investors Migrated: ${totalInvestors}`);
    console.log(`Total Bricks Migrated: ${totalBricksMigrated.toLocaleString()}`);
    console.log("\n⚠️ NOTE: Trust wallets need to hold the bricks before migration");
    console.log("The trust wallets were funded earlier, so this should work.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
