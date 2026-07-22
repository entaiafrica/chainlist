const hre = require("hardhat");

async function main() {
  const { deployer } = await hre.getNamedAccounts();
  const signer = await hre.ethers.getSigner(deployer);

  // BRKToken contract address (replace with your deployed address)
  const brkTokenAddress = "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49";
  const ipfsURI = "ipfs://QmWCpwHhDGqQfL86wh2VawT7euGkWKMtCs95eSQ75NSCe5";

  console.log("Updating BRKToken URI...");
  console.log("  BRKToken Address:", brkTokenAddress);
  console.log("  Signer:", signer.address);
  console.log("  New IPFS URI:", ipfsURI);

  const brkToken = await hre.ethers.getContractAt("BRKToken", brkTokenAddress, signer);

  // Check if the signer is the owner
  const owner = await brkToken.owner();
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    console.error("Error: Signer is not the owner of the BRKToken contract.");
    console.error("  Owner:", owner);
    console.error("  Signer:", signer.address);
    return;
  }

  const tx = await brkToken._setTokenURI(ipfsURI);
  await tx.wait();

  console.log("✅ BRKToken URI updated successfully!");
  console.log("  Transaction Hash:", tx.hash);

  const updatedURI = await brkToken.tokenURI();
  console.log("  New Token URI:", updatedURI);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });