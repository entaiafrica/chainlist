const { ethers } = require("hardhat");

async function main() {
    console.log("\n⚡ RETRYING PROPERTY 4 ACTIVATION\n");
    console.log("=".repeat(70));

    const NEW_MARKETPLACE = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
    const BRK_TOKEN = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";

    // The steeldale buyer private key
    const buyer4PrivateKey = "0xc4665a0774acc41a479db364250670bf4b56fe48b3eda336459a8012f9da01b6";
    const buyer4 = new ethers.Wallet(buyer4PrivateKey, ethers.provider);

    console.log("Buyer 4 derived address:", buyer4.address);

    const marketplace = await ethers.getContractAt("BrickMarketplace", NEW_MARKETPLACE);

    // Check who the contract expects
    const expectedBuyer = await marketplace.propertyBuyer(4);
    console.log("Contract expects buyer:", expectedBuyer);
    console.log("Match:", buyer4.address.toLowerCase() === expectedBuyer.toLowerCase() ? "✅ YES" : "❌ NO");

    // Check balance
    const buyer4EthBalance = await ethers.provider.getBalance(buyer4.address);
    console.log("\nBuyer 4 ETH balance:", ethers.utils.formatEther(buyer4EthBalance));

    const brkAbi = [
        "function approve(address, uint256) returns (bool)",
        "function balanceOf(address) view returns (uint256)"
    ];
    const brkToken = new ethers.Contract(BRK_TOKEN, brkAbi, buyer4);
    const buyer4BrkBalance = await brkToken.balanceOf(buyer4.address);
    console.log("Buyer 4 BRK balance:", ethers.utils.formatEther(buyer4BrkBalance));

    const prop4 = await marketplace.getPropertyData(4);
    const depositAmount = prop4.depositAmount;
    console.log("Deposit needed:", ethers.utils.formatEther(depositAmount), "BRK");

    if (buyer4.address.toLowerCase() !== expectedBuyer.toLowerCase()) {
        console.log("\n❌ ERROR: The private key doesn't match the expected buyer!");
        console.log("The contract expects:", expectedBuyer);
        console.log("But your key is for:", buyer4.address);
        console.log("\nYou need the private key for:", expectedBuyer);
        return;
    }

    if (buyer4BrkBalance.lt(depositAmount)) {
        console.log("\n❌ Insufficient BRK! Buyer needs", ethers.utils.formatEther(depositAmount), "BRK");
        return;
    }

    if (buyer4EthBalance.lt(ethers.utils.parseEther("0.01"))) {
        console.log("\n❌ Insufficient ETH for gas!");
        return;
    }

    try {
        // Approve with manual gas limit
        console.log("\n📝 Buyer approving marketplace (with manual gas limit)...");
        const approveTx = await brkToken.approve(NEW_MARKETPLACE, depositAmount, {
            gasLimit: 100000
        });
        await approveTx.wait();
        console.log("✅ Approved:", approveTx.hash);

        // Pay deposit with manual gas limit
        console.log("\n💳 Paying deposit to activate property...");
        const marketplaceAsBuyer4 = marketplace.connect(buyer4);
        const depositTx = await marketplaceAsBuyer4.payDeposit(4, {
            gasLimit: 300000
        });
        console.log("Transaction sent:", depositTx.hash);
        const receipt = await depositTx.wait();
        console.log("✅ Property 4 ACTIVATED!");
        console.log("   Block:", receipt.blockNumber);

        const prop4After = await marketplace.getPropertyData(4);
        console.log("   New Status:", prop4After.status === 1 ? "ACTIVE ✅" : "PENDING");

    } catch (error) {
        console.error("\n❌ Failed:", error.message);
        if (error.error && error.error.data) {
            console.error("Error data:", error.error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
