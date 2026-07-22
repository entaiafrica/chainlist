const { ethers } = require("hardhat");

async function main() {
    const brkTokenAddress = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";
    const brkToken = await ethers.getContractAt("IERC20", brkTokenAddress);

    try {
        // Try to get name and symbol
        const name = await brkToken.name();
        const symbol = await brkToken.symbol();
        console.log("Token Name:", name);
        console.log("Token Symbol:", symbol);
    } catch (e) {
        console.log("Could not get name/symbol");
    }

    try {
        // Try to get total supply
        const totalSupply = await brkToken.totalSupply();
        console.log("Total Supply:", ethers.utils.formatEther(totalSupply));
    } catch (e) {
        console.log("Could not get total supply");
    }

    // Check deployer balance
    const [deployer] = await ethers.getSigners();
    console.log("\nDeployer:", deployer.address);
    const balance = await brkToken.balanceOf(deployer.address);
    console.log("Deployer Balance:", ethers.utils.formatEther(balance));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
