const { ethers } = require("hardhat");

async function main() {
    console.log("\n⛽ FUNDING BUYERS WITH ETH FOR GAS\n");
    console.log("=".repeat(70));

    const buyer1 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const buyer2 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

    const [funder] = await ethers.getSigners();
    console.log("Sending from:", funder.address);

    // Check funder balance
    const funderBalance = await funder.getBalance();
    console.log("Funder ETH balance:", ethers.utils.formatEther(funderBalance));

    // Send 0.5 ETH to each buyer (enough for many transactions)
    const amountPerBuyer = ethers.utils.parseEther("0.5");

    console.log("\n📤 Sending", ethers.utils.formatEther(amountPerBuyer), "ETH to Buyer 1...");
    const tx1 = await funder.sendTransaction({
        to: buyer1,
        value: amountPerBuyer
    });
    await tx1.wait();
    console.log("✅ Buyer 1 funded:", tx1.hash);

    console.log("\n📤 Sending", ethers.utils.formatEther(amountPerBuyer), "ETH to Buyer 2...");
    const tx2 = await funder.sendTransaction({
        to: buyer2,
        value: amountPerBuyer
    });
    await tx2.wait();
    console.log("✅ Buyer 2 funded:", tx2.hash);

    // Verify
    const buyer1Balance = await ethers.provider.getBalance(buyer1);
    const buyer2Balance = await ethers.provider.getBalance(buyer2);

    console.log("\n" + "=".repeat(70));
    console.log("✅ BUYERS FUNDED WITH ETH!");
    console.log("=".repeat(70));
    console.log("\nBuyer 1:", buyer1);
    console.log("  ETH:", ethers.utils.formatEther(buyer1Balance));
    console.log("\nBuyer 2:", buyer2);
    console.log("  ETH:", ethers.utils.formatEther(buyer2Balance));

    console.log("\nNow run activation:");
    console.log("npx hardhat run scripts/activate-properties-3-4.js --network loyalty");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
