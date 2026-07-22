const { ethers } = require("hardhat");

async function main() {
    const brkTokenAddress = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";
    const buyerAddress = "0x6923ddaa0402be804cabf525e6a199772e025ba7";

    const [deployer] = await ethers.getSigners();
    const brkToken = await ethers.getContractAt("IERC20", brkTokenAddress);

    const buyerBRK = await brkToken.balanceOf(buyerAddress);
    const buyerETH = await ethers.provider.getBalance(buyerAddress);

    console.log("\nBuyer Wallet:", buyerAddress);
    console.log("  BRK Balance:", ethers.utils.formatEther(buyerBRK), "BRK");
    console.log("  ETH Balance:", ethers.utils.formatEther(buyerETH), "ETH");
    console.log("\nRequired for deposit: 700,000 BRK + gas ETH");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
