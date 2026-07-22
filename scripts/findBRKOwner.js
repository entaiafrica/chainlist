const { ethers } = require("hardhat");

async function main() {
    const brkTokenAddress = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";
    const brkToken = await ethers.getContractAt("IERC20", brkTokenAddress);

    const addresses = [
        { name: "Trust Wallet", address: "0x712820B679400DACbb5c9eeccFB785378fc9b9B6" },
        { name: "Platform Wallet", address: "0x8da6CE40Bf4F1c5333D7316e789c755384c290d5" },
        { name: "Payment Receiver", address: "0x419dcbe78a9eb41f38ad97fcfe12a431d98cb2b2" },
        { name: "Buyer Wallet", address: "0x6923ddaa0402be804cabf525e6a199772e025ba7" },
    ];

    console.log("\nBRK Token Balances:");
    console.log("=".repeat(70));

    for (const wallet of addresses) {
        const balance = await brkToken.balanceOf(wallet.address);
        if (balance.gt(0)) {
            console.log(`${wallet.name}: ${ethers.utils.formatEther(balance)} BRK`);
            console.log(`  Address: ${wallet.address}`);
        }
    }

    console.log("=".repeat(70));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
