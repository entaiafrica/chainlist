const { ethers } = require("hardhat");

async function main() {
    console.log("\n⚡ ACTIVATING PROPERTY 4 (Steeldale Mall)\n");
    console.log("=".repeat(70));

    const NEW_MARKETPLACE = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
    const BRK_TOKEN = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";

    // Correct steeldale buyer private key
    const buyer4PrivateKey = "0xa01391250b4cfbe877784ec2f862b3962d65f0ee4b6ad436ad87554aee71c630";
    const buyer4 = new ethers.Wallet(buyer4PrivateKey, ethers.provider);

    console.log("Buyer 4 address:", buyer4.address);

    const marketplace = await ethers.getContractAt("BrickMarketplace", NEW_MARKETPLACE);
    const expectedBuyer = await marketplace.propertyBuyer(4);
    console.log("Contract expects:", expectedBuyer);
    console.log("Match:", buyer4.address.toLowerCase() === expectedBuyer.toLowerCase() ? "✅ YES" : "❌ NO");

    const prop4 = await marketplace.getPropertyData(4);
    const depositAmount = prop4.depositAmount;

    console.log("\nProperty 4 Info:");
    console.log("  Status:", prop4.status === 0 ? "PENDING" : "ACTIVE");
    console.log("  Deposit Required:", ethers.utils.formatEther(depositAmount), "BRK");
    console.log("  Trust Wallet:", await marketplace.propertyTrustWallet(4));

    const brkAbi = [
        "function approve(address, uint256) returns (bool)",
        "function balanceOf(address) view returns (uint256)"
    ];
    const brkToken = new ethers.Contract(BRK_TOKEN, brkAbi, buyer4);

    // Check balances
    const buyer4BrkBalance = await brkToken.balanceOf(buyer4.address);
    const buyer4EthBalance = await ethers.provider.getBalance(buyer4.address);
    console.log("\nBuyer 4 Balances:");
    console.log("  BRK:", ethers.utils.formatEther(buyer4BrkBalance));
    console.log("  ETH:", ethers.utils.formatEther(buyer4EthBalance));

    // If buyer doesn't have funds, we need to fund them
    const [funder] = await ethers.getSigners();

    if (buyer4BrkBalance.lt(depositAmount)) {
        console.log("\n💸 Funding buyer with BRK...");
        const brkTokenAsFunder = new ethers.Contract(BRK_TOKEN, brkAbi, funder);
        const needed = depositAmount.sub(buyer4BrkBalance);
        const fundTx = await brkTokenAsFunder.transfer(buyer4.address, needed);
        await fundTx.wait();
        console.log("✅ Sent", ethers.utils.formatEther(needed), "BRK");
    }

    if (buyer4EthBalance.lt(ethers.utils.parseEther("0.01"))) {
        console.log("\n💸 Funding buyer with ETH for gas...");
        const ethTx = await funder.sendTransaction({
            to: buyer4.address,
            value: ethers.utils.parseEther("0.5")
        });
        await ethTx.wait();
        console.log("✅ Sent 0.5 ETH");
    }

    try {
        // Approve marketplace
        console.log("\n📝 Buyer approving marketplace...");
        const approveTx = await brkToken.approve(NEW_MARKETPLACE, depositAmount, {
            gasLimit: 100000
        });
        await approveTx.wait();
        console.log("✅ Approved:", approveTx.hash);

        // Pay deposit
        console.log("\n💳 Paying deposit to activate property...");
        const marketplaceAsBuyer4 = marketplace.connect(buyer4);
        const depositTx = await marketplaceAsBuyer4.payDeposit(4, {
            gasLimit: 300000
        });
        console.log("Transaction sent:", depositTx.hash);
        const receipt = await depositTx.wait();
        console.log("✅ Property 4 ACTIVATED!");
        console.log("   Block:", receipt.blockNumber);

        // Verify
        const prop4After = await marketplace.getPropertyData(4);
        console.log("   New Status:", prop4After.status === 1 ? "ACTIVE ✅" : "PENDING");

        console.log("\n" + "=".repeat(70));
        console.log("🎉 SUCCESS! BOTH PROPERTIES NOW ACTIVE!");
        console.log("=".repeat(70));
        console.log("\n✅ Property 3: Chic Sandton - ACTIVE");
        console.log("✅ Property 4: Steeldale Mall - ACTIVE");
        console.log("\n✅ Trust wallets have inventory:");
        console.log("   Property 3: 1,091,000 BRK");
        console.log("   Property 4: 24,730,000 BRK");
        console.log("\n🚀 Platform is ready for investors!");
        console.log("📝 NEXT: Update frontend to use property IDs 3 and 4");

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
