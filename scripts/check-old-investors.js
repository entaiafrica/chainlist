const { ethers } = require("hardhat");

async function main() {
    console.log("\n🔍 CHECKING OLD INVESTORS ON HTTP BLOCKCHAIN\n");
    console.log("=".repeat(70));

    const OLD_MARKETPLACE = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
    const OLD_RPC = "http://rpc.entailabs.com:8545";

    const oldProvider = new ethers.providers.JsonRpcProvider(OLD_RPC);

    const oldMarketplace = new ethers.Contract(
        OLD_MARKETPLACE,
        [
            "function getInvestorList(uint256) view returns (address[])",
            "function balanceOf(address, uint256) view returns (uint256)"
        ],
        oldProvider
    );

    // Check properties 3 and 4 (the activated ones on HTTP)
    const propertiesToCheck = [1, 2, 3, 4];

    let totalInvestors = 0;
    let investorData = [];

    for (const tokenId of propertiesToCheck) {
        console.log(`\n${"=".repeat(70)}`);
        console.log(`PROPERTY ${tokenId} ON HTTP BLOCKCHAIN`);
        console.log("=".repeat(70));

        try {
            const investors = await oldMarketplace.getInvestorList(tokenId);
            console.log(`\nFound ${investors.length} investor(s)`);

            if (investors.length > 0) {
                for (const investor of investors) {
                    const balance = await oldMarketplace.balanceOf(investor, tokenId);
                    if (balance.gt(0)) {
                        console.log(`  ${investor}: ${balance.toString()} bricks`);
                        investorData.push({
                            property: tokenId,
                            investor: investor,
                            bricks: balance.toString()
                        });
                        totalInvestors++;
                    }
                }
            } else {
                console.log("  No investors found");
            }

        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
        }
    }

    console.log("\n" + "=".repeat(70));
    console.log("SUMMARY");
    console.log("=".repeat(70));
    console.log(`\nTotal Unique Investors: ${totalInvestors}`);

    if (totalInvestors > 0) {
        console.log("\n📋 Investor Data:");
        console.log(JSON.stringify(investorData, null, 2));

        const fs = require('fs');
        fs.writeFileSync('old_investors_snapshot.json', JSON.stringify(investorData, null, 2));
        console.log("\n💾 Saved to: old_investors_snapshot.json");

        console.log("\n📝 MIGRATION NEEDED:");
        console.log("These investors need to be migrated to HTTPS blockchain");
        console.log("Property 3 (HTTP) -> Property 1 (HTTPS) - Chic Sandton");
        console.log("Property 4 (HTTP) -> Property 2 (HTTPS) - Steeldale");
    } else {
        console.log("\n✅ No investors to migrate (properties had no sales)");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
