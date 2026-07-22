const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    const buyerAddress = "0x6923ddaa0402be804cabf525e6a199772e025ba7";
    const amount = ethers.utils.parseEther("1.0"); // 1 ETH for gas

    console.log("\nSending 1 ETH to buyer for gas fees...");
    console.log("From:", deployer.address);
    console.log("To:", buyerAddress);

    const tx = await deployer.sendTransaction({
        to: buyerAddress,
        value: amount
    });
    await tx.wait();

    console.log("✓ Sent! Transaction:", tx.hash);

    const balance = await ethers.provider.getBalance(buyerAddress);
    console.log("Buyer ETH balance:", ethers.utils.formatEther(balance), "ETH");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
