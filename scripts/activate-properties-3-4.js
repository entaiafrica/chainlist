const { ethers } = require("hardhat");

async function main() {
    console.log("\n⚡ ACTIVATING PROPERTIES 3 & 4 BY PAYING DEPOSITS\n");
    console.log("=".repeat(70));

    const NEW_MARKETPLACE = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
    const BRK_TOKEN = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";

    // Use hardhat account #1 as buyer for Property 3
    const buyer1PrivateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
    const buyer1 = new ethers.Wallet(buyer1PrivateKey, ethers.provider);

    // Use hardhat account #2 as buyer for Property 4
    const buyer2PrivateKey = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";
    const buyer2 = new ethers.Wallet(buyer2PrivateKey, ethers.provider);

    const marketplace = await ethers.getContractAt("BrickMarketplace", NEW_MARKETPLACE);
    const brkAbi = ["function approve(address, uint256) returns (bool)", "function balanceOf(address) view returns (uint256)", "function transfer(address, uint256) returns (bool)"];

    // Need to fund buyers with BRK first
    const [funder] = await ethers.getSigners();
    const brkToken = new ethers.Contract(BRK_TOKEN, brkAbi, funder);

    console.log("\n" + "=".repeat(70));
    console.log("PROPERTY 3 ACTIVATION (Chic Sandton)");
    console.log("=".repeat(70));

    try {
        const prop3 = await marketplace.getPropertyData(3);
        const depositAmount = prop3.depositAmount;

        console.log("\nProperty 3 Info:");
        console.log("  Status:", prop3.status, "(0=PENDING, 1=ACTIVE)");
        console.log("  Deposit Required:", ethers.utils.formatEther(depositAmount), "BRK");
        console.log("  Buyer:", buyer1.address);

        // Fund buyer with BRK
        console.log("\n💸 Funding buyer with BRK...");
        const buyer1Balance = await brkToken.balanceOf(buyer1.address);
        console.log("  Current balance:", ethers.utils.formatEther(buyer1Balance), "BRK");

        if (buyer1Balance.lt(depositAmount)) {
            const needed = depositAmount.sub(buyer1Balance);
            console.log("  Sending", ethers.utils.formatEther(needed), "BRK to buyer...");
            const fundTx = await brkToken.transfer(buyer1.address, needed);
            await fundTx.wait();
            console.log("  ✅ Funded");
        } else {
            console.log("  ✅ Buyer already has enough BRK");
        }

        // Buyer approves marketplace
        console.log("\n📝 Buyer approving marketplace...");
        const brkTokenAsBuyer1 = new ethers.Contract(BRK_TOKEN, brkAbi, buyer1);
        const approveTx = await brkTokenAsBuyer1.approve(NEW_MARKETPLACE, depositAmount);
        await approveTx.wait();
        console.log("✅ Approved");

        // Pay deposit
        console.log("\n💳 Paying deposit to activate property...");
        const marketplaceAsBuyer1 = marketplace.connect(buyer1);
        const depositTx = await marketplaceAsBuyer1.payDeposit(3);
        const receipt = await depositTx.wait();
        console.log("✅ Property 3 ACTIVATED!");
        console.log("   TX:", receipt.transactionHash);

        // Verify
        const prop3After = await marketplace.getPropertyData(3);
        console.log("   New Status:", prop3After.status, "(should be 1=ACTIVE)");

    } catch (error) {
        console.error("\n❌ Property 3 activation failed:", error.message);
    }

    console.log("\n" + "=".repeat(70));
    console.log("PROPERTY 4 ACTIVATION (Steeldale Mall)");
    console.log("=".repeat(70));

    try {
        const prop4 = await marketplace.getPropertyData(4);
        const depositAmount = prop4.depositAmount;

        console.log("\nProperty 4 Info:");
        console.log("  Status:", prop4.status, "(0=PENDING, 1=ACTIVE)");
        console.log("  Deposit Required:", ethers.utils.formatEther(depositAmount), "BRK");
        console.log("  Buyer:", buyer2.address);

        // Fund buyer with BRK
        console.log("\n💸 Funding buyer with BRK...");
        const buyer2Balance = await brkToken.balanceOf(buyer2.address);
        console.log("  Current balance:", ethers.utils.formatEther(buyer2Balance), "BRK");

        if (buyer2Balance.lt(depositAmount)) {
            const needed = depositAmount.sub(buyer2Balance);
            console.log("  Sending", ethers.utils.formatEther(needed), "BRK to buyer...");
            const fundTx = await brkToken.transfer(buyer2.address, needed);
            await fundTx.wait();
            console.log("  ✅ Funded");
        } else {
            console.log("  ✅ Buyer already has enough BRK");
        }

        // Buyer approves marketplace
        console.log("\n📝 Buyer approving marketplace...");
        const brkTokenAsBuyer2 = new ethers.Contract(BRK_TOKEN, brkAbi, buyer2);
        const approveTx = await brkTokenAsBuyer2.approve(NEW_MARKETPLACE, depositAmount);
        await approveTx.wait();
        console.log("✅ Approved");

        // Pay deposit
        console.log("\n💳 Paying deposit to activate property...");
        const marketplaceAsBuyer2 = marketplace.connect(buyer2);
        const depositTx = await marketplaceAsBuyer2.payDeposit(4);
        const receipt = await depositTx.wait();
        console.log("✅ Property 4 ACTIVATED!");
        console.log("   TX:", receipt.transactionHash);

        // Verify
        const prop4After = await marketplace.getPropertyData(4);
        console.log("   New Status:", prop4After.status, "(should be 1=ACTIVE)");

    } catch (error) {
        console.error("\n❌ Property 4 activation failed:", error.message);
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ PROPERTIES ACTIVATED!");
    console.log("=".repeat(70));
    console.log("\nBoth properties are now ACTIVE and ready for investors!");
    console.log("Investors can now buy bricks using the buyBricks() function.");
    console.log("\n🎉 Your trust wallets have the BRK to sell to investors:");
    console.log("   Property 3 Trust: 1,091,000 BRK");
    console.log("   Property 4 Trust: 24,730,000 BRK");
    console.log("\nFrontend should now show both properties at:");
    console.log("http://localhost:3300");
    console.log("\n⚠️ IMPORTANT: Update frontend to fetch properties 3 and 4 instead of 1 and 2");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
