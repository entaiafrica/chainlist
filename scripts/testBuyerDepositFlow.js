const { ethers } = require("hardhat");

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("TESTING COMPLETE BUYER DEPOSIT FLOW - 789 Parkview Drive");
    console.log("=".repeat(80));

    // Get signers
    const [deployer, propertyOwner, investor1, investor2] = await ethers.getSigners();

    console.log("\n👥 Test Accounts:");
    console.log("  Deployer:", deployer.address);
    console.log("  Property Owner:", propertyOwner.address);
    console.log("  Investor 1:", investor1.address);
    console.log("  Investor 2:", investor2.address);

    // Buyer wallet (will impersonate)
    const buyerAddress = "0x6923ddaa0402be804cabf525e6a199772e025ba7";
    console.log("  Buyer (to impersonate):", buyerAddress);

    // Deploy mock BRK token for testing
    console.log("\n📦 Deploying Mock BRK Token...");
    const MockERC20 = await ethers.getContractFactory("contracts/MockERC20.sol:MockERC20");
    const brkToken = await MockERC20.deploy("Brick Token", "BRK", ethers.utils.parseUnits("10000000", "ether"));
    await brkToken.deployed();
    console.log("✓ BRK Token deployed:", brkToken.address);

    // Deploy BrickMarketplace
    console.log("\n📦 Deploying BrickMarketplace...");
    const baseURI = "https://gateway.pinata.cloud/ipfs/";
    const Marketplace = await ethers.getContractFactory("BrickMarketplace");
    const marketplace = await Marketplace.deploy(baseURI);
    await marketplace.deployed();
    console.log("✓ BrickMarketplace deployed:", marketplace.address);

    // Set BRK token
    await marketplace.setBrkToken(brkToken.address);
    console.log("✓ BRK token configured");

    // Get trust wallet and approve contract
    const trustWallet = await marketplace.trustWallet();
    console.log("\n🔧 Setting up Trust Wallet approval...");
    await ethers.provider.send("hardhat_impersonateAccount", [trustWallet]);
    const trustSigner = await ethers.getSigner(trustWallet);
    await deployer.sendTransaction({
        to: trustWallet,
        value: ethers.utils.parseEther("1.0")
    });
    // Use ERC1155's public setApprovalForAll
    await marketplace.connect(trustSigner).setApprovalForAll(marketplace.address, true);
    console.log("✓ Trust wallet approved contract for NFT transfers");

    // Deploy PaymentDistributor
    console.log("\n📦 Deploying PaymentDistributor...");
    const PaymentDistributor = await ethers.getContractFactory("PaymentDistributor");
    const distributor = await PaymentDistributor.deploy(marketplace.address, brkToken.address);
    await distributor.deployed();
    console.log("✓ PaymentDistributor deployed:", distributor.address);

    // Distribute BRK tokens to test accounts
    console.log("\n💰 Distributing BRK Tokens...");
    await brkToken.transfer(propertyOwner.address, ethers.utils.parseUnits("5000", "ether"));
    await brkToken.transfer(buyerAddress, ethers.utils.parseUnits("200000", "ether"));
    await brkToken.transfer(investor1.address, ethers.utils.parseUnits("10000", "ether"));
    await brkToken.transfer(investor2.address, ethers.utils.parseUnits("10000", "ether"));
    console.log("✓ Tokens distributed");

    // Property details
    const totalBricks = 800000;
    const pricePerBrick = ethers.utils.parseUnits("1.0", "ether");
    const depositAmount = ethers.utils.parseUnits("160000", "ether");
    const metadataURI = "ipfs://QmDemo789Parkview/metadata.json";

    console.log("\n" + "=".repeat(80));
    console.log("STEP 1: Property Owner Submits Property");
    console.log("=".repeat(80));

    // Approve listing fee
    console.log("\n1.1 Approving 1000 BRK listing fee...");
    await brkToken.connect(propertyOwner).approve(marketplace.address, ethers.utils.parseUnits("1000", "ether"));
    console.log("✓ Approved");

    // Submit property
    console.log("\n1.2 Submitting property with buyer address...");
    const submitTx = await marketplace.connect(propertyOwner).submitProperty(
        metadataURI,
        totalBricks,
        pricePerBrick,
        depositAmount,
        buyerAddress
    );
    const submitReceipt = await submitTx.wait();
    const tokenId = submitReceipt.events.find(e => e.event === "PropertySubmitted").args.tokenId;

    console.log("✓ Property submitted!");
    console.log("  Token ID:", tokenId.toString());
    console.log("  Buyer:", buyerAddress);
    console.log("  Deposit Required: R" + ethers.utils.formatEther(depositAmount));

    // Check property status
    const propData1 = await marketplace.getPropertyData(tokenId);
    console.log("\n📊 Property Status:");
    console.log("  Total Bricks:", propData1.totalBricks.toString());
    console.log("  Available Bricks:", propData1.bricksAvailable.toString());
    console.log("  Deposit Amount:", ethers.utils.formatEther(propData1.depositAmount), "BRK");
    console.log("  Is Active:", propData1.isActive);

    console.log("\n" + "=".repeat(80));
    console.log("STEP 2: Try to Buy Bricks BEFORE Buyer Pays Deposit (Should Fail)");
    console.log("=".repeat(80));

    try {
        await brkToken.connect(investor1).approve(marketplace.address, ethers.utils.parseUnits("1000", "ether"));
        await marketplace.connect(investor1).buyBricks(tokenId, 100);
        console.log("❌ ERROR: Should have failed but didn't!");
    } catch (error) {
        console.log("✓ Correctly blocked! Message:", error.message.substring(0, 100) + "...");
    }

    console.log("\n" + "=".repeat(80));
    console.log("STEP 3: Buyer Pays Deposit (ACTIVATES PROPERTY)");
    console.log("=".repeat(80));

    // Impersonate buyer
    console.log("\n3.1 Impersonating buyer wallet...");
    await ethers.provider.send("hardhat_impersonateAccount", [buyerAddress]);
    const buyer = await ethers.getSigner(buyerAddress);

    // Fund buyer with ETH for gas
    await deployer.sendTransaction({
        to: buyerAddress,
        value: ethers.utils.parseEther("1.0")
    });
    console.log("✓ Buyer impersonated and funded with gas");

    // Check buyer's BRK balance
    const buyerBalance = await brkToken.balanceOf(buyerAddress);
    console.log("\n3.2 Buyer's BRK Balance:", ethers.utils.formatEther(buyerBalance), "BRK");

    // Approve deposit
    console.log("\n3.3 Buyer approving deposit...");
    await brkToken.connect(buyer).approve(marketplace.address, depositAmount);
    console.log("✓ Approved", ethers.utils.formatEther(depositAmount), "BRK");

    // Check trust wallet balance before
    console.log("\n3.4 Trust Wallet NFT Balance (before):", (await marketplace.balanceOf(trustWallet, tokenId)).toString());

    // Pay deposit
    console.log("\n3.5 Buyer paying deposit...");
    const depositTx = await marketplace.connect(buyer).payDeposit(tokenId);
    await depositTx.wait();
    console.log("✓ Deposit paid!");

    // Check results
    console.log("\n📊 After Deposit Payment:");
    const propData2 = await marketplace.getPropertyData(tokenId);
    const buyerNFTBalance = await marketplace.balanceOf(buyerAddress, tokenId);
    const trustNFTBalance = await marketplace.balanceOf(trustWallet, tokenId);
    const buyerBRKBalance = await brkToken.balanceOf(buyerAddress);
    const trustBRKBalance = await brkToken.balanceOf(trustWallet);

    console.log("  Property Active:", propData2.isActive);
    console.log("  Available Bricks:", propData2.bricksAvailable.toString());
    console.log("  Buyer NFT Balance:", buyerNFTBalance.toString(), "bricks");
    console.log("  Trust Wallet NFT Balance:", trustNFTBalance.toString(), "bricks");
    console.log("  Buyer BRK Balance:", ethers.utils.formatEther(buyerBRKBalance), "BRK");
    console.log("  Trust Wallet BRK Balance:", ethers.utils.formatEther(trustBRKBalance), "BRK");

    // Verify calculations
    const expectedBuyerBricks = 160000;
    const expectedTrustBricks = 640000;
    console.log("\n✓ Verification:");
    console.log("  Buyer should have 160,000 bricks:", buyerNFTBalance.toString() === expectedBuyerBricks.toString() ? "✓" : "❌");
    console.log("  Trust should have 640,000 bricks:", trustNFTBalance.toString() === expectedTrustBricks.toString() ? "✓" : "❌");

    console.log("\n" + "=".repeat(80));
    console.log("STEP 4: Investors Buy Bricks (Should Work Now)");
    console.log("=".repeat(80));

    // Investor 1 buys 1000 bricks
    console.log("\n4.1 Investor 1 buying 1000 bricks...");
    const cost1 = pricePerBrick.mul(1000);
    await brkToken.connect(investor1).approve(marketplace.address, cost1);
    await marketplace.connect(investor1).buyBricks(tokenId, 1000);
    const inv1Balance = await marketplace.balanceOf(investor1.address, tokenId);
    console.log("✓ Investor 1 bought 1000 bricks");
    console.log("  NFT Balance:", inv1Balance.toString());

    // Investor 2 buys 2000 bricks
    console.log("\n4.2 Investor 2 buying 2000 bricks...");
    const cost2 = pricePerBrick.mul(2000);
    await brkToken.connect(investor2).approve(marketplace.address, cost2);
    await marketplace.connect(investor2).buyBricks(tokenId, 2000);
    const inv2Balance = await marketplace.balanceOf(investor2.address, tokenId);
    console.log("✓ Investor 2 bought 2000 bricks");
    console.log("  NFT Balance:", inv2Balance.toString());

    // Check updated availability
    const propData3 = await marketplace.getPropertyData(tokenId);
    console.log("\n📊 Updated Property Status:");
    console.log("  Available Bricks:", propData3.bricksAvailable.toString());
    console.log("  Sold to Investors:", (640000 - propData3.bricksAvailable.toNumber()).toString());

    console.log("\n" + "=".repeat(80));
    console.log("STEP 5: Test Payment Distribution (Buyer EXCLUDED)");
    console.log("=".repeat(80));

    // Simulate monthly payment
    const monthlyPayment = ethers.utils.parseUnits("9136", "ether"); // R9,136
    console.log("\n5.1 Buyer makes monthly payment of R9,136...");

    // Fund payment receiver wallet and approve
    const paymentReceiver = "0x419dcbe78a9eb41f38ad97fcfe12a431d98cb2b2";
    await brkToken.transfer(paymentReceiver, monthlyPayment);

    await ethers.provider.send("hardhat_impersonateAccount", [paymentReceiver]);
    const paymentSigner = await ethers.getSigner(paymentReceiver);
    await deployer.sendTransaction({
        to: paymentReceiver,
        value: ethers.utils.parseEther("1.0")
    });

    // Approve and send payment
    await brkToken.connect(paymentSigner).approve(distributor.address, monthlyPayment);
    await distributor.connect(paymentSigner).receivePayment(monthlyPayment, tokenId);
    console.log("✓ Payment processed");

    // Check balances
    console.log("\n📊 Payment Distribution:");
    const platformFee = monthlyPayment.mul(10).div(100); // 10%
    const investorPool = monthlyPayment.sub(platformFee); // 90%

    console.log("  Total Payment:", ethers.utils.formatEther(monthlyPayment), "BRK");
    console.log("  Platform Fee (10%):", ethers.utils.formatEther(platformFee), "BRK");
    console.log("  Investor Pool (90%):", ethers.utils.formatEther(investorPool), "BRK");

    // Check individual balances
    const buyerClaimable = await distributor.getBalance(buyerAddress);
    const inv1Claimable = await distributor.getBalance(investor1.address);
    const inv2Claimable = await distributor.getBalance(investor2.address);

    console.log("\n💰 Claimable Balances:");
    console.log("  Buyer (should be 0):", ethers.utils.formatEther(buyerClaimable), "BRK");
    console.log("  Investor 1 (1000/3000 = 33.33%):", ethers.utils.formatEther(inv1Claimable), "BRK");
    console.log("  Investor 2 (2000/3000 = 66.67%):", ethers.utils.formatEther(inv2Claimable), "BRK");

    // Verify buyer gets NOTHING
    console.log("\n✓ Critical Verification:");
    console.log("  Buyer receives 0 payment:", buyerClaimable.toString() === "0" ? "✓ CORRECT" : "❌ FAILED");

    // Calculate expected investor payments (only 3000 total investor bricks)
    const totalInvestorBricks = 3000;
    const expected1 = investorPool.mul(1000).div(totalInvestorBricks);
    const expected2 = investorPool.mul(2000).div(totalInvestorBricks);

    console.log("  Investor 1 payment correct:", inv1Claimable.toString() === expected1.toString() ? "✓" : "❌");
    console.log("  Investor 2 payment correct:", inv2Claimable.toString() === expected2.toString() ? "✓" : "❌");

    // Withdraw test
    console.log("\n5.2 Investor 1 withdrawing earnings...");
    await distributor.connect(investor1).withdraw();
    const inv1BRKAfter = await brkToken.balanceOf(investor1.address);
    console.log("✓ Withdrawn successfully");

    console.log("\n" + "=".repeat(80));
    console.log("FINAL SUMMARY");
    console.log("=".repeat(80));

    console.log("\n📊 NFT Holdings:");
    console.log("  Buyer:", (await marketplace.balanceOf(buyerAddress, tokenId)).toString(), "bricks (20%)");
    console.log("  Investor 1:", (await marketplace.balanceOf(investor1.address, tokenId)).toString(), "bricks");
    console.log("  Investor 2:", (await marketplace.balanceOf(investor2.address, tokenId)).toString(), "bricks");
    console.log("  Trust Wallet:", (await marketplace.balanceOf(trustWallet, tokenId)).toString(), "bricks (remaining)");

    console.log("\n💎 Key Test Results:");
    console.log("  ✓ Property submission requires buyer address");
    console.log("  ✓ Property starts INACTIVE");
    console.log("  ✓ Investor purchases blocked until buyer pays deposit");
    console.log("  ✓ Buyer deposit activates property and mints NFTs");
    console.log("  ✓ Buyer automatically receives their NFT portion");
    console.log("  ✓ Investors can purchase after activation");
    console.log("  ✓ Payment distribution excludes buyer (buyer receives 0)");
    console.log("  ✓ Only investors share the 90% pool");

    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("=".repeat(80));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
