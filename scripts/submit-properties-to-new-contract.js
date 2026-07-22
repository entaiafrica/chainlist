const { ethers } = require("hardhat");

async function main() {
    console.log("\n🚀 SUBMITTING PROPERTIES TO NEW CONTRACT\n");
    console.log("=".repeat(70));

    const [deployer] = await ethers.getSigners();
    console.log("Submitting with account:", deployer.address);

    const NEW_MARKETPLACE = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
    const OLD_MARKETPLACE = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
    const BRK_TOKEN = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";

    // Connect to contracts
    const newMarketplace = await ethers.getContractAt("BrickMarketplace", NEW_MARKETPLACE);

    const oldAbi = [
        "function getPropertyData(uint256) view returns (tuple(uint256 totalBricks, uint256 bricksAvailable, uint256 pricePerBrick, uint256 depositAmount, uint256 otpDeadline, uint8 status))",
        "function uri(uint256) view returns (string)",
        "function propertyBuyer(uint256) view returns (address)",
        "function propertyCreator(uint256) view returns (address)"
    ];
    const oldMarketplace = new ethers.Contract(OLD_MARKETPLACE, oldAbi, deployer);

    const brkAbi = ["function approve(address, uint256) returns (bool)", "function balanceOf(address) view returns (uint256)"];
    const brkToken = new ethers.Contract(BRK_TOKEN, brkAbi, deployer);

    // Generate NEW trust wallets for each property
    const trustWallet1 = ethers.Wallet.createRandom();
    const trustWallet2 = ethers.Wallet.createRandom();

    console.log("\n📝 NEW TRUST WALLETS GENERATED:");
    console.log("Property 1 Trust:", trustWallet1.address);
    console.log("Property 2 Trust:", trustWallet2.address);

    // Save trust wallet info
    const fs = require('fs');
    fs.writeFileSync('TRUST_WALLETS.json', JSON.stringify({
        property1: { address: trustWallet1.address, privateKey: trustWallet1.privateKey },
        property2: { address: trustWallet2.address, privateKey: trustWallet2.privateKey }
    }, null, 2));
    console.log("💾 Trust wallets saved to TRUST_WALLETS.json");

    console.log("\n" + "=".repeat(70));
    console.log("PROPERTY 1: Chic Sandton Apartment");
    console.log("=".repeat(70));

    try {
        // Read from old contract
        const prop1 = await oldMarketplace.getPropertyData(1);
        const uri1 = await oldMarketplace.uri(1);
        const buyer1 = await oldMarketplace.propertyBuyer(1);
        const creator1 = await oldMarketplace.propertyCreator(1);

        console.log("\n📊 Property Data from Old Contract:");
        console.log("  Total Bricks:", prop1.totalBricks.toString());
        console.log("  Price per Brick:", ethers.utils.formatEther(prop1.pricePerBrick), "BRK");
        console.log("  Deposit Amount:", ethers.utils.formatEther(prop1.depositAmount), "BRK");
        console.log("  Buyer:", buyer1);
        console.log("  Metadata:", uri1);

        // Check deployer BRK balance
        const balance = await brkToken.balanceOf(deployer.address);
        const listPrice = ethers.utils.parseEther("1000");
        console.log("\n💰 Deployer BRK Balance:", ethers.utils.formatEther(balance));

        if (balance.lt(listPrice)) {
            throw new Error(`Insufficient BRK! Need 1000 BRK, have ${ethers.utils.formatEther(balance)}`);
        }

        // Approve listing fee
        console.log("\n📝 Approving listing fee (1000 BRK)...");
        const approveTx = await brkToken.approve(NEW_MARKETPLACE, listPrice);
        await approveTx.wait();
        console.log("✅ Approved");

        // Submit property
        console.log("\n📝 Submitting Property 1 to new contract...");
        const submitTx = await newMarketplace.submitProperty(
            uri1,
            prop1.totalBricks,
            prop1.pricePerBrick,
            prop1.depositAmount,
            buyer1,
            trustWallet1.address,  // NEW per-property trust wallet
            30  // OTP period: 30 days
        );
        const receipt = await submitTx.wait();
        console.log("✅ Property 1 submitted!");
        console.log("   TX:", receipt.transactionHash);

    } catch (error) {
        console.error("\n❌ Property 1 failed:", error.message);
        throw error;
    }

    console.log("\n" + "=".repeat(70));
    console.log("PROPERTY 2: Steeldale Mall");
    console.log("=".repeat(70));

    try {
        // Read from old contract
        const prop2 = await oldMarketplace.getPropertyData(2);
        const uri2 = await oldMarketplace.uri(2);
        const buyer2 = await oldMarketplace.propertyBuyer(2);
        const creator2 = await oldMarketplace.propertyCreator(2);

        console.log("\n📊 Property Data from Old Contract:");
        console.log("  Total Bricks:", prop2.totalBricks.toString());
        console.log("  Price per Brick:", ethers.utils.formatEther(prop2.pricePerBrick), "BRK");
        console.log("  Deposit Amount:", ethers.utils.formatEther(prop2.depositAmount), "BRK");
        console.log("  Buyer:", buyer2);
        console.log("  Metadata:", uri2);

        // Approve listing fee
        console.log("\n📝 Approving listing fee (1000 BRK)...");
        const listPrice = ethers.utils.parseEther("1000");
        const approveTx2 = await brkToken.approve(NEW_MARKETPLACE, listPrice);
        await approveTx2.wait();
        console.log("✅ Approved");

        // Submit property
        console.log("\n📝 Submitting Property 2 to new contract...");
        const submitTx2 = await newMarketplace.submitProperty(
            uri2,
            prop2.totalBricks,
            prop2.pricePerBrick,
            prop2.depositAmount,
            buyer2,
            trustWallet2.address,  // NEW per-property trust wallet
            30  // OTP period: 30 days
        );
        const receipt2 = await submitTx2.wait();
        console.log("✅ Property 2 submitted!");
        console.log("   TX:", receipt2.transactionHash);

    } catch (error) {
        console.error("\n❌ Property 2 failed:", error.message);
        throw error;
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ BOTH PROPERTIES SUBMITTED!");
    console.log("=".repeat(70));
    console.log("\nNEXT STEPS:");
    console.log("1. Properties are in PENDING status");
    console.log("2. Buyers need to pay deposits to ACTIVATE them");
    console.log("3. Run: npx hardhat run scripts/activate-properties.js --network loyalty");
    console.log("4. Then investors can buy bricks!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
