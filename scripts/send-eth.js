const { ethers } = require("hardhat");

async function main() {
    const [sender] = await ethers.getSigners();
    
    console.log("Sending from:", sender.address);
    console.log("Sender balance:", ethers.utils.formatEther(await sender.getBalance()), "ETH");
    
    const recipient = "0x8da6CE40Bf4F1c5333D7316e789c755384c290d5";
    const amount = ethers.utils.parseEther("5.0");
    
    console.log("\nSending", ethers.utils.formatEther(amount), "ETH to", recipient);
    
    const tx = await sender.sendTransaction({
        to: recipient,
        value: amount
    });
    
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    
    const newBalance = await ethers.provider.getBalance(recipient);
    console.log("\n✅ Transfer complete!");
    console.log("Recipient balance:", ethers.utils.formatEther(newBalance), "ETH");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
