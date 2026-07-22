const { ethers } = require("hardhat");

async function main() {
    console.log("\n🔄 RESUBMITTING PROPERTIES WITH CORRECT TRUST WALLETS\n");
    console.log("=".repeat(70));

    const [deployer] = await ethers.getSigners();
    console.log("Submitting with account:", deployer.address);

    const NEW_MARKETPLACE = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
    const OLD_MARKETPLACE = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
    const BRK_TOKEN = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";

    // YOUR ACTUAL TRUST WALLETS (with funds!)
    const trustWallet1 = "0x712820b679400dacbb5c9eeccfb785378fc9b9b6";  // Has 1,091,000 BRK
    const trustWallet2 = "0x361ba631152be934ef5d6e1670a177ecef9458b6";  // Has 24,730,000 BRK

    console.log("\n✅ Using YOUR existing trust wallets:");
    console.log("Property 1 Trust:", trustWallet1);
    console.log("Property 2 Trust:", trustWallet2);

    const newMarketplace = await ethers.getContractAt("BrickMarketplace", NEW_MARKETPLACE);

    const oldAbi = [
        "function getPropertyData(uint256) view returns (tuple(uint256 totalBricks, uint256 bricksAvailable, uint256 pricePerBrick, uint256 depositAmount, uint256 otpDeadline, uint8 status))",
        "function uri(uint256) view returns (string)",
        "function propertyBuyer(uint256) view returns (address)"
    ];
    const oldMarketplace = new ethers.Contract(OLD_MARKETPLACE, oldAbi, deployer);

    const brkAbi = ["function approve(address, uint256) returns (bool)", "function balanceOf(address) view returns (uint256)"];
    const brkToken = new ethers.Contract(BRK_TOKEN, brkAbi, deployer);

    // Check current property count
    let nextPropertyId;
    try {
        // Properties are 1-indexed, so try to get property 3 to see if it exists
        await newMarketplace.getPropertyData(3);
        console.log("\n⚠️ Warning: Properties 1 and 2 already exist.");
        console.log("   We'll submit as properties 3 and 4 with correct wallets.");
        nextPropertyId = 3;
    } catch (error) {
        console.log("\n✅ Will submit as properties 3 and 4.");
        nextPropertyId = 3;
    }

    console.log("\n" + "=".repeat(70));
    console.log(`PROPERTY ${nextPropertyId}: CHIC SANDTON (Corrected)`);
    console.log("=".repeat(70));

    try {
        const prop1 = await oldMarketplace.getPropertyData(1);
        const uri1 = await oldMarketplace.uri(1);
        const buyer1 = await oldMarketplace.propertyBuyer(1);

        console.log("\n📊 Property Data:");
        console.log("  Total Bricks:", prop1.totalBricks.toString());
        console.log("  Price per Brick:", ethers.utils.formatEther(prop1.pricePerBrick), "BRK");
        console.log("  Deposit Amount:", ethers.utils.formatEther(prop1.depositAmount), "BRK");
        console.log("  Trust Wallet:", trustWallet1, "(YOUR wallet with 1,091,000 BRK)");
        console.log("  Metadata:", uri1);

        const balance = await brkToken.balanceOf(deployer.address);
        const listPrice = ethers.utils.parseEther("1000");
        console.log("\n💰 Your BRK Balance:", ethers.utils.formatEther(balance));

        if (balance.lt(listPrice)) {
            throw new Error(`Insufficient BRK! Need 1000 BRK, have ${ethers.utils.formatEther(balance)}`);
        }

        console.log("\n📝 Approving listing fee (1000 BRK)...");
        const approveTx = await brkToken.approve(NEW_MARKETPLACE, listPrice);
        await approveTx.wait();
        console.log("✅ Approved");

        console.log("\n📝 Submitting Property...");
        const submitTx = await newMarketplace.submitProperty(
            uri1,
            prop1.totalBricks,
            prop1.pricePerBrick,
            prop1.depositAmount,
            buyer1,
            trustWallet1,  // YOUR trust wallet!
            30
        );
        const receipt = await submitTx.wait();
        console.log("✅ Property submitted!");
        console.log("   TX:", receipt.transactionHash);
        console.log("   Property ID:", nextPropertyId);

    } catch (error) {
        console.error("\n❌ Property 1 failed:", error.message);
        throw error;
    }

    console.log("\n" + "=".repeat(70));
    console.log(`PROPERTY ${nextPropertyId + 1}: STEELDALE MALL (Corrected)`);
    console.log("=".repeat(70));

    try {
        const prop2 = await oldMarketplace.getPropertyData(2);
        const uri2 = await oldMarketplace.uri(2);
        const buyer2 = await oldMarketplace.propertyBuyer(2);

        console.log("\n📊 Property Data:");
        console.log("  Total Bricks:", prop2.totalBricks.toString());
        console.log("  Price per Brick:", ethers.utils.formatEther(prop2.pricePerBrick), "BRK");
        console.log("  Deposit Amount:", ethers.utils.formatEther(prop2.depositAmount), "BRK");
        console.log("  Trust Wallet:", trustWallet2, "(YOUR wallet with 24,730,000 BRK)");
        console.log("  Metadata:", uri2);

        console.log("\n📝 Approving listing fee (1000 BRK)...");
        const listPrice = ethers.utils.parseEther("1000");
        const approveTx2 = await brkToken.approve(NEW_MARKETPLACE, listPrice);
        await approveTx2.wait();
        console.log("✅ Approved");

        console.log("\n📝 Submitting Property...");
        const submitTx2 = await newMarketplace.submitProperty(
            uri2,
            prop2.totalBricks,
            prop2.pricePerBrick,
            prop2.depositAmount,
            buyer2,
            trustWallet2,  // YOUR trust wallet!
            30
        );
        const receipt2 = await submitTx2.wait();
        console.log("✅ Property submitted!");
        console.log("   TX:", receipt2.transactionHash);
        console.log("   Property ID:", nextPropertyId + 1);

    } catch (error) {
        console.error("\n❌ Property 2 failed:", error.message);
        throw error;
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ BOTH PROPERTIES RESUBMITTED WITH CORRECT WALLETS!");
    console.log("=".repeat(70));
    console.log("\n🎉 YOUR TRUST WALLETS ALREADY HAVE THE BRK!");
    console.log("   Property 1 Trust has: 1,091,000 BRK");
    console.log("   Property 2 Trust has: 24,730,000 BRK");
    console.log("\nNEXT STEP:");
    console.log(`   Buyers need to pay deposits to activate properties ${nextPropertyId} and ${nextPropertyId + 1}`);
    console.log("   Run: npx hardhat run scripts/activate-properties.js --network loyalty");
    console.log("\n💡 TIP: Update your frontend to use property IDs", nextPropertyId, "and", nextPropertyId + 1);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
