const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing transactions for wallet: 0x8da6CE40Bf4F1c5333D7316e789c755384c290d5\n");
    
    // Connect with the wallet's private key
    const privateKey = "0xa3b0d634e0111fec7d93001c40138a35c34172d76aa38ce2ff21db88ff7dfc9a";
    const wallet = new ethers.Wallet(privateKey, ethers.provider);
    
    console.log("Wallet address:", wallet.address);
    
    // Check balance
    const balance = await wallet.getBalance();
    console.log("ETH balance:", ethers.utils.formatEther(balance), "ETH");
    
    // Check nonce
    const nonce = await wallet.getTransactionCount();
    console.log("Current nonce:", nonce);
    
    // Get BRK token contract
    const brkAddress = "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB";
    const brkContract = await ethers.getContractAt("MockERC20", brkAddress, wallet);
    
    const brkBalance = await brkContract.balanceOf(wallet.address);
    console.log("BRK balance:", ethers.utils.formatEther(brkBalance), "BRK");
    
    // Get Marketplace contract
    const marketplaceAddress = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042";
    const marketplace = await ethers.getContractAt("BrickMarketplace", marketplaceAddress, wallet);
    
    console.log("\n--- Testing Transaction 1: Simple Transfer ---");
    try {
        const tx1 = await wallet.sendTransaction({
            to: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            value: ethers.utils.parseEther("0.01")
        });
        console.log("✅ Transaction sent:", tx1.hash);
        await tx1.wait();
        console.log("✅ Transaction confirmed!");
        
        const newNonce = await wallet.getTransactionCount();
        console.log("New nonce:", newNonce);
    } catch (error) {
        console.error("❌ Transaction failed:", error.message);
    }
    
    console.log("\n--- Testing Transaction 2: BRK Token Approval ---");
    try {
        const approveTx = await brkContract.approve(
            marketplaceAddress,
            ethers.utils.parseEther("100")
        );
        console.log("✅ Approval sent:", approveTx.hash);
        await approveTx.wait();
        console.log("✅ Approval confirmed!");
        
        const allowance = await brkContract.allowance(wallet.address, marketplaceAddress);
        console.log("Current allowance:", ethers.utils.formatEther(allowance), "BRK");
    } catch (error) {
        console.error("❌ Approval failed:", error.message);
    }
    
    console.log("\n--- Final Status ---");
    const finalNonce = await wallet.getTransactionCount();
    console.log("Final nonce:", finalNonce);
    console.log("\n✅ All tests complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
