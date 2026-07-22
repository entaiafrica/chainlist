const { ethers } = require("hardhat");

async function main() {
    console.log("\n🔍 CHECKING WALLET ON BOTH BLOCKCHAINS\n");
    console.log("=".repeat(70));

    const CURRENT_WALLET = "0x3536c224c57da6671906af52fe21b81f962f2cb5"; // User's current wallet
    const TRUST_WALLET = "0x712820b679400dacbb5c9eeccfb785378fc9b9b6"; // Trust wallet

    const OLD_BRK = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";
    const NEW_BRK = "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB";

    const httpProvider = new ethers.providers.JsonRpcProvider("http://rpc.entailabs.com:8545");
    const httpsProvider = new ethers.providers.JsonRpcProvider("https://rpc.entailabs.com");

    const brkAbi = ["function balanceOf(address) view returns (uint256)"];

    console.log("\n📱 YOUR CURRENT WALLET:", CURRENT_WALLET);
    console.log("=".repeat(70));

    // Check HTTP blockchain
    console.log("\n🔴 HTTP Blockchain (OLD):");
    const oldBrkToken = new ethers.Contract(OLD_BRK, brkAbi, httpProvider);
    const httpEth = await httpProvider.getBalance(CURRENT_WALLET);
    const httpBrk = await oldBrkToken.balanceOf(CURRENT_WALLET);
    console.log("  ETH:", ethers.utils.formatEther(httpEth));
    console.log("  BRK:", ethers.utils.formatEther(httpBrk));

    // Check HTTPS blockchain
    console.log("\n🟢 HTTPS Blockchain (NEW - CURRENT):");
    const newBrkToken = new ethers.Contract(NEW_BRK, brkAbi, httpsProvider);
    const httpsEth = await httpsProvider.getBalance(CURRENT_WALLET);
    const httpsBrk = await newBrkToken.balanceOf(CURRENT_WALLET);
    console.log("  ETH:", ethers.utils.formatEther(httpsEth));
    console.log("  BRK:", ethers.utils.formatEther(httpsBrk));

    console.log("\n\n💼 TRUST WALLET (Property 1):", TRUST_WALLET);
    console.log("=".repeat(70));

    // Check HTTP blockchain
    console.log("\n🔴 HTTP Blockchain (OLD):");
    const trustHttpEth = await httpProvider.getBalance(TRUST_WALLET);
    const trustHttpBrk = await oldBrkToken.balanceOf(TRUST_WALLET);
    console.log("  ETH:", ethers.utils.formatEther(trustHttpEth));
    console.log("  BRK:", ethers.utils.formatEther(trustHttpBrk));

    // Check HTTPS blockchain
    console.log("\n🟢 HTTPS Blockchain (NEW - CURRENT):");
    const trustHttpsEth = await httpsProvider.getBalance(TRUST_WALLET);
    const trustHttpsBrk = await newBrkToken.balanceOf(TRUST_WALLET);
    console.log("  ETH:", ethers.utils.formatEther(trustHttpsEth));
    console.log("  BRK:", ethers.utils.formatEther(trustHttpsBrk));

    console.log("\n" + "=".repeat(70));
    console.log("RECOMMENDATIONS:");
    console.log("=".repeat(70));

    if (httpsBrk.eq(0) && httpsEth.eq(0)) {
        console.log("\n❌ Your current wallet has NO funds on HTTPS blockchain");
        console.log("\n✅ OPTION 1: Switch to Trust Wallet in MetaMask");
        console.log("   - Trust wallet has", ethers.utils.formatEther(trustHttpsBrk), "BRK");
        console.log("   - This is the wallet that owns the property inventory");
        console.log("\n✅ OPTION 2: Fund your current wallet");
        console.log("   - I can send BRK and ETH to:", CURRENT_WALLET);
        console.log("   - How much do you need?");
    } else {
        console.log("\n✅ Your wallet has funds on HTTPS blockchain!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
