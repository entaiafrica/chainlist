const { ethers } = require('ethers');
const fs = require('fs');

async function testInvestment() {
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

  // Use one of the pre-funded accounts
  const privateKey = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'; // Account 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
  const wallet = new ethers.Wallet(privateKey, provider);

  const marketplaceAddr = '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B';
  const brkTokenAddr = '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24';

  // Load contracts
  const marketplaceArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/BrickMarketplace.sol/BrickMarketplace.json', 'utf8'));
  const brkArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/BRKToken.sol/BRKToken.json', 'utf8'));

  const marketplace = new ethers.Contract(marketplaceAddr, marketplaceArtifact.abi, wallet);
  const brkToken = new ethers.Contract(brkTokenAddr, brkArtifact.abi, wallet);

  console.log('=== TESTING PROPERTY INVESTMENT ===\n');
  console.log('Wallet address:', wallet.address);

  // Check BRK balance
  const balance = await brkToken.balanceOf(wallet.address);
  console.log('BRK Balance:', ethers.utils.formatEther(balance), 'BRK');

  // Check current allowance
  const currentAllowance = await brkToken.allowance(wallet.address, marketplaceAddr);
  console.log('Current allowance:', ethers.utils.formatEther(currentAllowance), 'BRK');

  // Get property details
  const propData = await marketplace.getPropertyData(1);
  const totalBricks = propData[0];
  const availableBricks = propData[1];
  const pricePerBrick = propData[2];
  const totalRaised = propData[3];

  console.log('\n=== PROPERTY 1 DETAILS ===');
  console.log('Total bricks:', totalBricks.toString());
  console.log('Available bricks:', availableBricks.toString());
  console.log('Price per brick:', ethers.utils.formatEther(pricePerBrick), 'BRK');
  console.log('Total raised so far:', ethers.utils.formatEther(totalRaised), 'BRK');

  // Try to buy 10 bricks
  const bricksToBuy = 10;
  const totalCost = pricePerBrick.mul(bricksToBuy);

  console.log('\n=== ATTEMPTING TO BUY', bricksToBuy, 'BRICKS ===');
  console.log('Total cost:', ethers.utils.formatEther(totalCost), 'BRK');

  // Step 1: Approve marketplace if needed
  if (currentAllowance.lt(totalCost)) {
    console.log('\nStep 1: Approving marketplace to spend BRK tokens...');
    try {
      const approveTx = await brkToken.approve(marketplaceAddr, ethers.constants.MaxUint256);
      console.log('Approval tx hash:', approveTx.hash);
      const approveReceipt = await approveTx.wait();
      console.log('Approval confirmed in block:', approveReceipt.blockNumber);
    } catch (error) {
      console.error('❌ Approval failed:', error.message);
      if (error.error) console.error('Error details:', error.error);
      return;
    }
  } else {
    console.log('\n✓ Marketplace already approved');
  }

  // Step 2: Buy bricks
  console.log('\nStep 2: Buying bricks...');
  try {
    const buyTx = await marketplace.buyBricks(1, bricksToBuy);
    console.log('Buy tx hash:', buyTx.hash);
    const buyReceipt = await buyTx.wait();
    console.log('✅ Purchase confirmed in block:', buyReceipt.blockNumber);
    console.log('Gas used:', buyReceipt.gasUsed.toString());

    // Check for events
    if (buyReceipt.logs && buyReceipt.logs.length > 0) {
      console.log('\nEvents emitted:', buyReceipt.logs.length);
    }
  } catch (error) {
    console.error('❌ Purchase failed:', error.message);
    if (error.error) {
      console.error('Error details:', JSON.stringify(error.error, null, 2));
    }
    if (error.reason) {
      console.error('Reason:', error.reason);
    }
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testInvestment().catch(console.error);
