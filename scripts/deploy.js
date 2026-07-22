const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Marketplace = await ethers.getContractFactory("NFTMarketplace");
  const marketplace = await Marketplace.deploy();

  await marketplace.deployed();

  console.log("Marketplace deployed to:", marketplace.address);

  const brkTokenAddress = "0x7ab30bf11a35926426671155B6113959F6b7FC9A";
  await marketplace.setBrkToken(brkTokenAddress);
  console.log("BRK token address set to:", brkTokenAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });