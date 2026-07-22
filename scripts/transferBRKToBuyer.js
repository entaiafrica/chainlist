const { ethers } = require("hardhat");

async function main() {
    console.log("\n" + "=".repeat(70));
    console.log("TRANSFERRING BRK TO BUYER WALLET");
    console.log("=".repeat(70));

    const [deployer] = await ethers.getSigners();
    const brkTokenAddress = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";
    const buyerAddress = "0x6923ddaa0402be804cabf525e6a199772e025ba7";
    const amount = ethers.utils.parseUnits("700000", "ether"); // 700K BRK

    const brkToken = await ethers.getContractAt("IERC20", brkTokenAddress);

    console.log("\nFrom:", deployer.address);
    console.log("To:", buyerAddress);
    console.log("Amount:", ethers.utils.formatEther(amount), "BRK");

    // Check deployer balance
    const deployerBalance = await brkToken.balanceOf(deployer.address);
    console.log("\nDeployer Balance:", ethers.utils.formatEther(deployerBalance), "BRK");

    if (deployerBalance.lt(amount)) {
        console.log("\n⚠️  INSUFFICIENT BALANCE!");
        return;
    }

    // Check buyer current balance
    const buyerBalanceBefore = await brkToken.balanceOf(buyerAddress);
    console.log("Buyer Balance Before:", ethers.utils.formatEther(buyerBalanceBefore), "BRK");

    // Transfer
    console.log("\nTransferring...");
    const tx = await brkToken.transfer(buyerAddress, amount);
    await tx.wait();
    console.log("✓ Transfer complete! Transaction:", tx.hash);

    // Check final balances
    const deployerBalanceAfter = await brkToken.balanceOf(deployer.address);
    const buyerBalanceAfter = await brkToken.balanceOf(buyerAddress);

    console.log("\n" + "=".repeat(70));
    console.log("✅ SUCCESS");
    console.log("=".repeat(70));
    console.log("Deployer Balance After:", ethers.utils.formatEther(deployerBalanceAfter), "BRK");
    console.log("Buyer Balance After:", ethers.utils.formatEther(buyerBalanceAfter), "BRK");
    console.log("\nBuyer is ready to pay deposit!");
    console.log("=".repeat(70));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
