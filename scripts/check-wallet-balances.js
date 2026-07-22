const { ethers } = require("hardhat");

async function main() {
    const MARKETPLACE_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const BRK_TOKEN_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const WALLET = "0x3536C224C57da6671906af52FE21b81f962F2cb5";

    console.log("\n🔍 Checking wallet:", WALLET);
    console.log("=" .repeat(70));

    const marketplace = await ethers.getContractAt("BrickMarketplace", MARKETPLACE_ADDRESS);
    const brkToken = await ethers.getContractAt("MockERC20", BRK_TOKEN_ADDRESS);
    const provider = ethers.provider;

    // Check ETH balance
    const ethBalance = await provider.getBalance(WALLET);
    console.log("\n💰 ETH Balance:", ethers.utils.formatEther(ethBalance), "ETH");

    // Check BRK balance
    const brkBalance = await brkToken.balanceOf(WALLET);
    console.log("💰 BRK Balance:", ethers.utils.formatUnits(brkBalance, 18), "BRK");

    // Check NFT holdings
    console.log("\n🏠 NFT Holdings:");
    const token1Balance = await marketplace.balanceOf(WALLET, 1);
    const token2Balance = await marketplace.balanceOf(WALLET, 2);

    console.log(`   Token 1 (Chic Sandton): ${token1Balance.toString()} bricks`);
    console.log(`   Token 2 (Steeldale Mall): ${token2Balance.toString()} bricks`);

    // Calculate portfolio value
    const prop1 = await marketplace.getPropertyData(1);
    const prop2 = await marketplace.getPropertyData(2);

    const value1 = token1Balance.mul(prop1.pricePerBrick);
    const value2 = token2Balance.mul(prop2.pricePerBrick);
    const totalValue = value1.add(value2);

    console.log("\n📊 Portfolio Value:");
    console.log(`   Token 1 Value: ${ethers.utils.formatUnits(value1, 18)} BRK`);
    console.log(`   Token 2 Value: ${ethers.utils.formatUnits(value2, 18)} BRK`);
    console.log(`   Total Value: ${ethers.utils.formatUnits(totalValue, 18)} BRK`);

    console.log("\n" + "=".repeat(70));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
