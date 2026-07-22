const { ethers } = require("hardhat");

async function main() {
    console.log("\n🚀 SETTING UP PROPERTIES ON HTTPS ENDPOINT\n");
    console.log("=".repeat(70));

    const NEW_MARKETPLACE = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042";
    const BRK_TOKEN = "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB";

    // Trust wallets (same addresses)
    const trustWallet1 = "0x712820b679400dacbb5c9eeccfb785378fc9b9b6"; // Chic Sandton
    const trustWallet2 = "0x361ba631152be934ef5d6e1670a177ecef9458b6"; // Steeldale

    // Buyer addresses (you provided these earlier)
    const buyer1 = "0x6923DdaA0402bE804CAbF525e6a199772e025ba7";
    const buyer2 = "0x4F4f05360A3863a321A7DC9605f2b39a52a109De";

    const [deployer] = await ethers.getSigners();
    console.log("Operating as:", deployer.address);

    const marketplace = await ethers.getContractAt("BrickMarketplace", NEW_MARKETPLACE);
    const brkAbi = [
        "function balanceOf(address) view returns (uint256)",
        "function transfer(address, uint256) returns (bool)",
        "function approve(address, uint256) returns (bool)"
    ];
    const brkToken = new ethers.Contract(BRK_TOKEN, brkAbi, deployer);

    const deployerBalance = await brkToken.balanceOf(deployer.address);
    console.log("Deployer BRK balance:", ethers.utils.formatEther(deployerBalance));

    // Fund trust wallets
    console.log("\n" + "=".repeat(70));
    console.log("FUNDING TRUST WALLETS");
    console.log("=".repeat(70));

    const trust1Amount = ethers.utils.parseEther("2000000"); // 2M BRK
    const trust2Amount = ethers.utils.parseEther("50000000"); // 50M BRK

    console.log("\n💸 Sending", ethers.utils.formatEther(trust1Amount), "BRK to Trust 1...");
    const tx1 = await brkToken.transfer(trustWallet1, trust1Amount);
    await tx1.wait();
    console.log("✅ Trust 1 funded");

    console.log("\n💸 Sending", ethers.utils.formatEther(trust2Amount), "BRK to Trust 2...");
    const tx2 = await brkToken.transfer(trustWallet2, trust2Amount);
    await tx2.wait();
    console.log("✅ Trust 2 funded");

    // Submit properties
    console.log("\n" + "=".repeat(70));
    console.log("SUBMITTING PROPERTIES");
    console.log("=".repeat(70));

    // Approve listing fees
    const listingFee = ethers.utils.parseEther("1000");
    console.log("\n📝 Approving listing fees (2000 BRK total)...");
    const approveTx = await brkToken.approve(NEW_MARKETPLACE, listingFee.mul(2));
    await approveTx.wait();
    console.log("✅ Approved");

    // Property 1: Chic Sandton
    console.log("\n📝 Submitting Property 1: Chic Sandton...");
    const prop1Uri = "https://rpc.entailabs.com/ipfs/QmYWPJBakmXAvqTaNPri3uKENLBJYGU7YYbiJjbE7aBiG4";
    const submitTx1 = await marketplace.submitProperty(
        prop1Uri,
        2800000,                                        // totalBricks
        ethers.utils.parseEther("1"),                  // pricePerBrick: 1 BRK
        ethers.utils.parseEther("700000"),             // deposit: 700K BRK
        buyer1,
        trustWallet1,
        30                                             // OTP period: 30 days
    );
    await submitTx1.wait();
    console.log("✅ Property 1 submitted (Token ID: 1)");

    // Property 2: Steeldale
    console.log("\n📝 Submitting Property 2: Steeldale Mall...");
    const prop2Uri = "https://rpc.entailabs.com/ipfs/QmerLCBWnHi72dzXiwvMJ8SaWsvZfpCPjutxdT9FqZYr2L";
    const submitTx2 = await marketplace.submitProperty(
        prop2Uri,
        240000000,                                      // totalBricks
        ethers.utils.parseEther("1"),                  // pricePerBrick: 1 BRK
        ethers.utils.parseEther("24000000"),           // deposit: 24M BRK
        buyer2,
        trustWallet2,
        30                                             // OTP period: 30 days
    );
    await submitTx2.wait();
    console.log("✅ Property 2 submitted (Token ID: 2)");

    console.log("\n" + "=".repeat(70));
    console.log("✅ PROPERTIES SUBMITTED!");
    console.log("=".repeat(70));
    console.log("\nNEXT: Activate properties by paying deposits");
    console.log("Buyers need private keys to activate");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
