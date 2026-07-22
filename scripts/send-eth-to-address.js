const { ethers } = require("hardhat");

async function main() {
    const [sender] = await ethers.getSigners();
    
    console.log("Sending from:", sender.address);
    console.log("Sender balance:", ethers.utils.formatEther(await sender.getBalance()), "ETH");
    
    const recipient = "0x52b83c7ecefafb399a299fd4a780b15d29e26b49";
    const amount = ethers.utils.parseEther("5.0"); // Send 5 ETH
    
    console.log("\nSending", ethers.utils.formatEther(amount), "ETH to", recipient);
    
    const tx = await sender.sendTransaction({
        to: recipient,
        value: amount
    });
    
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    
    const newBalance = await ethers.provider.getBalance(recipient);
    console.log("\n✅ Transfer complete!");
    console.log("Recipient address:", recipient);
    console.log("Recipient balance:", ethers.utils.formatEther(newBalance), "ETH");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
