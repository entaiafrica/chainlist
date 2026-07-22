const { ethers } = require("hardhat");

async function main() {
    console.log("\n💸 FUNDING CORRECT BUYER ACCOUNTS\n");
    console.log("=".repeat(70));

    const BRK_TOKEN = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";

    // CORRECT buyer addresses from the contract
    const buyer3 = "0x6923DdaA0402bE804CAbF525e6a199772e025ba7";  // Property 3 (Chic Sandton)
    const buyer4 = "0x4F4f05360A3863a321A7DC9605f2b39a52a109De";  // Property 4 (Steeldale)

    // Amounts needed
    const deposit3 = ethers.utils.parseEther("700000");     // 700K BRK
    const deposit4 = ethers.utils.parseEther("24000000");   // 24M BRK
    const ethAmount = ethers.utils.parseEther("0.5");       // 0.5 ETH for gas

    const [funder] = await ethers.getSigners();
    console.log("Funding from:", funder.address);

    const brkAbi = [
        "function balanceOf(address) view returns (uint256)",
        "function transfer(address, uint256) returns (bool)"
    ];
    const brkToken = new ethers.Contract(BRK_TOKEN, brkAbi, funder);

    console.log("\n" + "=".repeat(70));
    console.log("BUYER 3 (Chic Sandton)");
    console.log("=".repeat(70));

    console.log("\nAddress:", buyer3);
    console.log("Needs: 700,000 BRK + 0.5 ETH");

    // Send BRK
    console.log("\n📤 Sending BRK...");
    const tx1Brk = await brkToken.transfer(buyer3, deposit3);
    await tx1Brk.wait();
    console.log("✅ BRK sent:", tx1Brk.hash);

    // Send ETH
    console.log("\n📤 Sending ETH...");
    const tx1Eth = await funder.sendTransaction({
        to: buyer3,
        value: ethAmount
    });
    await tx1Eth.wait();
    console.log("✅ ETH sent:", tx1Eth.hash);

    // Verify
    const buyer3BrkBalance = await brkToken.balanceOf(buyer3);
    const buyer3EthBalance = await ethers.provider.getBalance(buyer3);
    console.log("\n✅ Buyer 3 funded:");
    console.log("   BRK:", ethers.utils.formatEther(buyer3BrkBalance));
    console.log("   ETH:", ethers.utils.formatEther(buyer3EthBalance));

    console.log("\n" + "=".repeat(70));
    console.log("BUYER 4 (Steeldale Mall)");
    console.log("=".repeat(70));

    console.log("\nAddress:", buyer4);
    console.log("Needs: 24,000,000 BRK + 0.5 ETH");

    // Send BRK
    console.log("\n📤 Sending BRK...");
    const tx2Brk = await brkToken.transfer(buyer4, deposit4);
    await tx2Brk.wait();
    console.log("✅ BRK sent:", tx2Brk.hash);

    // Send ETH
    console.log("\n📤 Sending ETH...");
    const tx2Eth = await funder.sendTransaction({
        to: buyer4,
        value: ethAmount
    });
    await tx2Eth.wait();
    console.log("✅ ETH sent:", tx2Eth.hash);

    // Verify
    const buyer4BrkBalance = await brkToken.balanceOf(buyer4);
    const buyer4EthBalance = await ethers.provider.getBalance(buyer4);
    console.log("\n✅ Buyer 4 funded:");
    console.log("   BRK:", ethers.utils.formatEther(buyer4BrkBalance));
    console.log("   ETH:", ethers.utils.formatEther(buyer4EthBalance));

    console.log("\n" + "=".repeat(70));
    console.log("✅ BOTH BUYERS FUNDED!");
    console.log("=".repeat(70));
    console.log("\nNow you need the PRIVATE KEYS for these buyers to activate.");
    console.log("These were the original buyer addresses from the old contract.");
    console.log("\nDo you have access to these wallets?");
    console.log("  Buyer 3:", buyer3);
    console.log("  Buyer 4:", buyer4);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
