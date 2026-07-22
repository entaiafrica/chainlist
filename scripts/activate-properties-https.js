const { ethers } = require("hardhat");

async function main() {
    console.log("\n⚡ ACTIVATING PROPERTIES ON HTTPS ENDPOINT\n");
    console.log("=".repeat(70));

    const NEW_MARKETPLACE = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042";
    const BRK_TOKEN = "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB";

    // Buyer private keys
    const buyer1PrivateKey = "0xd30cf28dd2ff74e1f85e9d398b39c6ae333f1b4c131e4558edeb2de8446e9b44";
    const buyer2PrivateKey = "0xa01391250b4cfbe877784ec2f862b3962d65f0ee4b6ad436ad87554aee71c630";

    const buyer1 = new ethers.Wallet(buyer1PrivateKey, ethers.provider);
    const buyer2 = new ethers.Wallet(buyer2PrivateKey, ethers.provider);

    console.log("Buyer 1:", buyer1.address);
    console.log("Buyer 2:", buyer2.address);

    const [funder] = await ethers.getSigners();
    const marketplace = await ethers.getContractAt("BrickMarketplace", NEW_MARKETPLACE);
    const brkAbi = [
        "function balanceOf(address) view returns (uint256)",
        "function transfer(address, uint256) returns (bool)",
        "function approve(address, uint256) returns (bool)"
    ];
    const brkToken = new ethers.Contract(BRK_TOKEN, brkAbi, funder);

    // PROPERTY 1 ACTIVATION
    console.log("\n" + "=".repeat(70));
    console.log("PROPERTY 1 ACTIVATION");
    console.log("=".repeat(70));

    const prop1 = await marketplace.getPropertyData(1);
    console.log("\nDeposit required:", ethers.utils.formatEther(prop1.depositAmount), "BRK");

    // Fund buyer 1
    console.log("\n💸 Funding Buyer 1...");
    const fundTx1Brk = await brkToken.transfer(buyer1.address, prop1.depositAmount);
    await fundTx1Brk.wait();
    const fundTx1Eth = await funder.sendTransaction({ to: buyer1.address, value: ethers.utils.parseEther("0.5") });
    await fundTx1Eth.wait();
    console.log("✅ Funded with", ethers.utils.formatEther(prop1.depositAmount), "BRK + 0.5 ETH");

    // Buyer 1 approves and pays deposit
    console.log("\n📝 Buyer 1 approving marketplace...");
    const brkTokenAsBuyer1 = new ethers.Contract(BRK_TOKEN, brkAbi, buyer1);
    const approveTx1 = await brkTokenAsBuyer1.approve(NEW_MARKETPLACE, prop1.depositAmount);
    await approveTx1.wait();
    console.log("✅ Approved");

    console.log("\n💳 Paying deposit...");
    const marketplaceAsBuyer1 = marketplace.connect(buyer1);
    const depositTx1 = await marketplaceAsBuyer1.payDeposit(1);
    await depositTx1.wait();
    console.log("✅ Property 1 ACTIVATED!");

    // PROPERTY 2 ACTIVATION
    console.log("\n" + "=".repeat(70));
    console.log("PROPERTY 2 ACTIVATION");
    console.log("=".repeat(70));

    const prop2 = await marketplace.getPropertyData(2);
    console.log("\nDeposit required:", ethers.utils.formatEther(prop2.depositAmount), "BRK");

    // Fund buyer 2
    console.log("\n💸 Funding Buyer 2...");
    const fundTx2Brk = await brkToken.transfer(buyer2.address, prop2.depositAmount);
    await fundTx2Brk.wait();
    const fundTx2Eth = await funder.sendTransaction({ to: buyer2.address, value: ethers.utils.parseEther("0.5") });
    await fundTx2Eth.wait();
    console.log("✅ Funded with", ethers.utils.formatEther(prop2.depositAmount), "BRK + 0.5 ETH");

    // Buyer 2 approves and pays deposit
    console.log("\n📝 Buyer 2 approving marketplace...");
    const brkTokenAsBuyer2 = new ethers.Contract(BRK_TOKEN, brkAbi, buyer2);
    const approveTx2 = await brkTokenAsBuyer2.approve(NEW_MARKETPLACE, prop2.depositAmount);
    await approveTx2.wait();
    console.log("✅ Approved");

    console.log("\n💳 Paying deposit...");
    const marketplaceAsBuyer2 = marketplace.connect(buyer2);
    const depositTx2 = await marketplaceAsBuyer2.payDeposit(2);
    await depositTx2.wait();
    console.log("✅ Property 2 ACTIVATED!");

    console.log("\n" + "=".repeat(70));
    console.log("🎉 BOTH PROPERTIES ACTIVATED!");
    console.log("=".repeat(70));
    console.log("\n✅ Platform is LIVE on HTTPS endpoint!");
    console.log("✅ Using secure HTTPS blockchain");
    console.log("\n🌐 Access your platform:");
    console.log("   https://fb.entailabs.com");
    console.log("   OR http://localhost:3300");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
