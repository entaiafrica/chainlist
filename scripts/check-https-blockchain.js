const { ethers } = require("hardhat");

async function main() {
    console.log("\n🔍 CHECKING HTTPS BLOCKCHAIN STATE\n");
    console.log("=".repeat(70));

    const provider = new ethers.providers.JsonRpcProvider("https://rpc.entailabs.com");

    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    console.log("Network:", network);
    console.log("Chain ID:", network.chainId);
    console.log("Block Number:", blockNumber);

    // Check if platform wallet has funds
    const platformWallet = "0x8da6CE40Bf4F1c5333D7316e789c755384c290d5";
    const balance = await provider.getBalance(platformWallet);

    console.log("\nPlatform Wallet:", platformWallet);
    console.log("ETH Balance:", ethers.utils.formatEther(balance));

    // Check BRK token address
    const BRK_TOKEN = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";
    const code = await provider.getCode(BRK_TOKEN);

    console.log("\nBRK Token:", BRK_TOKEN);
    if (code === "0x") {
        console.log("Status: ❌ NOT DEPLOYED on HTTPS endpoint");
    } else {
        console.log("Status: ✅ DEPLOYED on HTTPS endpoint");
        console.log("Code size:", code.length, "bytes");
    }

    console.log("\n" + "=".repeat(70));
    console.log("CONCLUSION:");
    if (code === "0x") {
        console.log("Need to deploy BRK token and marketplace to HTTPS endpoint");
    } else {
        console.log("BRK token exists, check if it has the right supply");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
