const { ethers } = require("hardhat");

async function main() {
    console.log("\n🔍 CHECKING YOUR WALLET ON HTTPS BLOCKCHAIN\n");
    console.log("=".repeat(70));

    const YOUR_WALLET = "0x712820B679400DACbb5c9eeccFB785378fc9b9B6";
    const BRK_TOKEN = "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB";

    const provider = new ethers.providers.JsonRpcProvider("https://rpc.entailabs.com");

    // Check ETH balance
    const ethBalance = await provider.getBalance(YOUR_WALLET);
    console.log("Your Wallet:", YOUR_WALLET);
    console.log("ETH Balance:", ethers.utils.formatEther(ethBalance));

    // Check BRK balance
    const brkAbi = ["function balanceOf(address) view returns (uint256)"];
    const brkToken = new ethers.Contract(BRK_TOKEN, brkAbi, provider);
    const brkBalance = await brkToken.balanceOf(YOUR_WALLET);
    console.log("BRK Balance:", ethers.utils.formatEther(brkBalance));

    console.log("\n" + "=".repeat(70));
    if (brkBalance.gt(0)) {
        console.log("✅ You have BRK on HTTPS blockchain!");
        console.log("MetaMask needs to be on: https://rpc.entailabs.com");
    } else {
        console.log("❌ You have 0 BRK on HTTPS blockchain");
        console.log("\nThis wallet was funded as Trust Wallet 1 with 2M BRK");
        console.log("Let me check if the funds are there...");

        const trustWallet1 = "0x712820b679400dacbb5c9eeccfb785378fc9b9b6";
        const trust1Balance = await brkToken.balanceOf(trustWallet1);
        console.log("\nTrust Wallet 1:", trustWallet1);
        console.log("Balance:", ethers.utils.formatEther(trust1Balance), "BRK");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
