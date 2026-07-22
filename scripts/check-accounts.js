const { ethers } = require("hardhat");

async function main() {
    console.log("\n🔍 CHECKING AVAILABLE ACCOUNTS\n");
    console.log("=".repeat(70));

    const signers = await ethers.getSigners();
    const BRK_TOKEN = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";
    const brkAbi = ["function balanceOf(address) view returns (uint256)"];
    const brkToken = new ethers.Contract(BRK_TOKEN, brkAbi, signers[0]);

    for (let i = 0; i < Math.min(5, signers.length); i++) {
        const signer = signers[i];
        const address = await signer.getAddress();
        const ethBalance = await signer.getBalance();
        const brkBalance = await brkToken.balanceOf(address);

        console.log(`\nAccount ${i}:`);
        console.log(`  Address: ${address}`);
        console.log(`  ETH: ${ethers.utils.formatEther(ethBalance)}`);
        console.log(`  BRK: ${ethers.utils.formatEther(brkBalance)}`);

        if (address.toLowerCase() === "0x8da6CE40Bf4F1c5333D7316e789c755384c290d5".toLowerCase()) {
            console.log("  ⭐ THIS IS THE PLATFORM WALLET!");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
