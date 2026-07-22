const { ethers } = require("hardhat");

async function main() {
    const CONTRACTS_TO_CHECK = [
        "0xFC628dd79137395F3C9744e33b1c5DE554D94882",
        "0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B"
    ];

    console.log("\n🔍 Checking contracts on persistent blockchain (rpc.entailabs.com:8545)...\n");

    // Connect to persistent blockchain
    const provider = new ethers.providers.JsonRpcProvider("http://rpc.entailabs.com:8545");
    const blockNumber = await provider.getBlockNumber();
    console.log(`Connected to blockchain - Block number: ${blockNumber}\n`);

    for (const address of CONTRACTS_TO_CHECK) {
        console.log("=".repeat(70));
        console.log(`Checking: ${address}`);
        console.log("=".repeat(70));

        // Check if contract exists
        const code = await provider.getCode(address);
        if (code === "0x") {
            console.log("❌ No contract deployed at this address\n");
            continue;
        }

        console.log("✅ Contract exists!");

        // Try to read as BrickMarketplace
        try {
            const abi = [
                "function getPropertyData(uint256 tokenId) view returns (tuple(uint256 totalBricks, uint256 bricksAvailable, uint256 pricePerBrick, uint256 depositAmount, uint256 otpDeadline, uint8 status))",
                "function balanceOf(address account, uint256 id) view returns (uint256)",
                "function getTrustWallet(uint256 tokenId) view returns (address)",
                "function getInvestorList(uint256 tokenId) view returns (address[])"
            ];

            const contract = new ethers.Contract(address, abi, provider);

            // Check Token 1
            console.log("\n📊 Token 1 Data:");
            try {
                const prop1 = await contract.getPropertyData(1);
                console.log(`   Total Bricks: ${prop1.totalBricks.toString()}`);
                console.log(`   Available Bricks: ${prop1.bricksAvailable.toString()}`);
                console.log(`   Status: ${prop1.status}`);

                const investors1 = await contract.getInvestorList(1);
                console.log(`   Investors: ${investors1.length}`);

                if (investors1.length > 0) {
                    console.log(`\n   First 3 investors:`);
                    for (let i = 0; i < Math.min(3, investors1.length); i++) {
                        const balance = await contract.balanceOf(investors1[i], 1);
                        console.log(`   ${i + 1}. ${investors1[i]}: ${balance.toString()} bricks`);
                    }
                }
            } catch (e) {
                console.log(`   ❌ Error reading Token 1: ${e.message}`);
            }

            // Check Token 2
            console.log("\n📊 Token 2 Data:");
            try {
                const prop2 = await contract.getPropertyData(2);
                console.log(`   Total Bricks: ${prop2.totalBricks.toString()}`);
                console.log(`   Available Bricks: ${prop2.bricksAvailable.toString()}`);
                console.log(`   Status: ${prop2.status}`);

                const investors2 = await contract.getInvestorList(2);
                console.log(`   Investors: ${investors2.length}`);
            } catch (e) {
                console.log(`   ❌ Error reading Token 2: ${e.message}`);
            }

        } catch (e) {
            console.log(`❌ Error interacting with contract: ${e.message}`);
        }

        console.log("");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
