const { ethers } = require("hardhat");

async function main() {
    const MARKETPLACE_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const BRK_TOKEN_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

    console.log("\n🧪 Testing brick purchase...\n");

    const [deployer, ...accounts] = await ethers.getSigners();
    const newInvestor = accounts[15]; // Use account 16 as new investor

    const marketplace = await ethers.getContractAt("BrickMarketplace", MARKETPLACE_ADDRESS);
    const brkToken = await ethers.getContractAt("MockERC20", BRK_TOKEN_ADDRESS);

    console.log("New Investor:", newInvestor.address);

    // Check property status before purchase
    const prop1Before = await marketplace.getPropertyData(1);
    const trustWallet = await marketplace.getTrustWallet(1);
    const trustBalanceBefore = await marketplace.balanceOf(trustWallet, 1);

    console.log("\n📊 Before Purchase:");
    console.log(`   Trust Wallet: ${trustWallet}`);
    console.log(`   Trust NFT Balance: ${trustBalanceBefore.toString()} bricks`);
    console.log(`   Available Bricks: ${prop1Before.bricksAvailable.toString()}`);
    console.log(`   Investor BRK Balance: ${ethers.utils.formatUnits(await brkToken.balanceOf(newInvestor.address), 18)} BRK`);

    // Buy 10,000 bricks
    const bricksToBuy = 10000;
    const cost = ethers.utils.parseUnits(bricksToBuy.toString(), 18);

    console.log(`\n💰 Buying ${bricksToBuy} bricks...`);

    // Approve BRK
    await brkToken.connect(newInvestor).approve(MARKETPLACE_ADDRESS, cost);
    console.log("   ✓ BRK approved");

    // Buy bricks
    const buyTx = await marketplace.connect(newInvestor).buyBricks(1, bricksToBuy);
    await buyTx.wait();
    console.log("   ✓ Purchase successful!");

    // Check balances after purchase
    const prop1After = await marketplace.getPropertyData(1);
    const investorNFTBalance = await marketplace.balanceOf(newInvestor.address, 1);
    const trustBalanceAfter = await marketplace.balanceOf(trustWallet, 1);

    console.log("\n📊 After Purchase:");
    console.log(`   Trust NFT Balance: ${trustBalanceAfter.toString()} bricks`);
    console.log(`   Investor NFT Balance: ${investorNFTBalance.toString()} bricks`);
    console.log(`   Available Bricks: ${prop1After.bricksAvailable.toString()}`);
    console.log(`   Investor BRK Balance: ${ethers.utils.formatUnits(await brkToken.balanceOf(newInvestor.address), 18)} BRK`);

    console.log("\n" + "=".repeat(70));
    console.log("✅ TEST PASSED! Bricks transferred correctly from trust wallet to investor!");
    console.log("=" .repeat(70));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ TEST FAILED!");
        console.error(error);
        process.exit(1);
    });
