const { ethers } = require("hardhat");

async function main() {
    console.log("\n💸 FUNDING BUYER ACCOUNTS\n");
    console.log("=".repeat(70));

    const BRK_TOKEN = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";

    // These are the buyer accounts that need funding
    const buyer1Address = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";  // For Property 1
    const buyer2Address = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";  // For Property 2

    // Amounts needed
    const prop1Deposit = ethers.utils.parseEther("700000");     // 700K BRK
    const prop2Deposit = ethers.utils.parseEther("24000000");   // 24M BRK

    // Get the signer (should be platform wallet)
    const [funder] = await ethers.getSigners();
    console.log("\nFunding from account:", funder.address);

    const brkAbi = [
        "function balanceOf(address) view returns (uint256)",
        "function transfer(address, uint256) returns (bool)"
    ];
    const brkToken = new ethers.Contract(BRK_TOKEN, brkAbi, funder);

    // Check funder balance
    const funderBalance = await brkToken.balanceOf(funder.address);
    console.log("Your BRK balance:", ethers.utils.formatEther(funderBalance));

    const totalNeeded = prop1Deposit.add(prop2Deposit);
    console.log("Total needed:", ethers.utils.formatEther(totalNeeded), "BRK");

    if (funderBalance.lt(totalNeeded)) {
        throw new Error(`Insufficient balance! Need ${ethers.utils.formatEther(totalNeeded)} BRK but have ${ethers.utils.formatEther(funderBalance)}`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("FUNDING BUYER 1 (Property 1)");
    console.log("=".repeat(70));

    console.log("\n📝 Sending", ethers.utils.formatEther(prop1Deposit), "BRK to", buyer1Address);
    const tx1 = await brkToken.transfer(buyer1Address, prop1Deposit);
    console.log("Transaction sent:", tx1.hash);
    await tx1.wait();
    console.log("✅ Buyer 1 funded!");

    const buyer1Balance = await brkToken.balanceOf(buyer1Address);
    console.log("Buyer 1 new balance:", ethers.utils.formatEther(buyer1Balance), "BRK");

    console.log("\n" + "=".repeat(70));
    console.log("FUNDING BUYER 2 (Property 2)");
    console.log("=".repeat(70));

    console.log("\n📝 Sending", ethers.utils.formatEther(prop2Deposit), "BRK to", buyer2Address);
    const tx2 = await brkToken.transfer(buyer2Address, prop2Deposit);
    console.log("Transaction sent:", tx2.hash);
    await tx2.wait();
    console.log("✅ Buyer 2 funded!");

    const buyer2Balance = await brkToken.balanceOf(buyer2Address);
    console.log("Buyer 2 new balance:", ethers.utils.formatEther(buyer2Balance), "BRK");

    console.log("\n" + "=".repeat(70));
    console.log("✅ BOTH BUYERS FUNDED!");
    console.log("=".repeat(70));
    console.log("\nNEXT STEP:");
    console.log("Run: npx hardhat run scripts/activate-properties.js --network loyalty");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
