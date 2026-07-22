const hre = require("hardhat");

async function main() {
    console.log("\n💰 Distributing BRK Tokens to User\n");
    console.log("=".repeat(70));

    // Configuration
    const BRK_TOKEN = "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49";
    const USER_ADDRESS = "0x3536C224C57da6671906af52FE21b81f962F2cb5";
    const AMOUNT = hre.ethers.utils.parseEther("100000"); // 100k BRK for testing

    // Use FirstBrick wallet (which holds all the BRK)
    const FIRSTBRICK_KEY = "0xa3b0d634e0111fec7d93001c40138a35c34172d76aa38ce2ff21db88ff7dfc9a";
    const firstBrickWallet = new hre.ethers.Wallet(FIRSTBRICK_KEY, hre.ethers.provider);

    console.log("📋 Configuration:");
    console.log("   BRK Token:", BRK_TOKEN);
    console.log("   From (FirstBrick):", firstBrickWallet.address);
    console.log("   To (User):", USER_ADDRESS);
    console.log("   Amount:", hre.ethers.utils.formatEther(AMOUNT), "BRK");
    console.log("");

    const brkToken = await hre.ethers.getContractAt("BRKToken", BRK_TOKEN, firstBrickWallet);

    // Check FirstBrick balance
    console.log("1️⃣  Checking FirstBrick balance...");
    const fbBalance = await brkToken.balanceOf(firstBrickWallet.address);
    console.log("   FirstBrick Balance:", hre.ethers.utils.formatEther(fbBalance), "BRK");
    console.log("");

    // Transfer to user
    console.log("2️⃣  Transferring BRK to user...");
    const tx = await brkToken.transfer(USER_ADDRESS, AMOUNT);
    await tx.wait();
    console.log("   ✅ Transfer confirmed:", tx.hash);
    console.log("");

    // Verify user balance
    console.log("3️⃣  Verifying user balance...");
    const userBalance = await brkToken.balanceOf(USER_ADDRESS);
    console.log("   ✅ User Balance:", hre.ethers.utils.formatEther(userBalance), "BRK");
    console.log("");

    console.log("=".repeat(70));
    console.log("\n✅ Distribution Complete!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
