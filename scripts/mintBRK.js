const { ethers } = require("hardhat");

async function main() {
    console.log("\n" + "=".repeat(70));
    console.log("MINTING BRK TOKENS");
    console.log("=".repeat(70));

    const [deployer] = await ethers.getSigners();
    console.log("\nMinting with account:", deployer.address);

    const brkTokenAddress = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";
    const brkToken = await ethers.getContractAt("MockERC20", brkTokenAddress);

    // Mint 10M BRK tokens for testing (enough for listing fees and deposits)
    const amount = ethers.utils.parseUnits("10000000", "ether");

    console.log("\nMinting", ethers.utils.formatEther(amount), "BRK tokens to deployer...");
    const tx = await brkToken.mint(deployer.address, amount);
    await tx.wait();

    const balance = await brkToken.balanceOf(deployer.address);
    console.log("✓ Minted successfully!");
    console.log("Deployer BRK balance:", ethers.utils.formatEther(balance), "BRK");
    console.log("=".repeat(70));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
