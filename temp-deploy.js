const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying contracts for testing...");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy BRKToken
    const BRKToken = await ethers.getContractFactory("BRKToken");
    const brkToken = await BRKToken.deploy();
    await brkToken.deployed();
    console.log("BRKToken deployed to:", brkToken.address);

    // Deploy MinimalForwarder
    const MinimalForwarder = await ethers.getContractFactory("MinimalForwarder");
    const forwarder = await MinimalForwarder.deploy();
    await forwarder.deployed();
    console.log("MinimalForwarder deployed to:", forwarder.address);

    // Deploy CoinPoolGame
    console.log("Attempting to deploy CoinPoolGame with arguments:", brkToken.address, forwarder.address);
    const CoinPoolGame = await ethers.getContractFactory("CoinPoolGame");
    const coinPoolGame = await CoinPoolGame.deploy(brkToken.address, forwarder.address);
    await coinPoolGame.deployed();
    console.log("CoinPoolGame deployed to:", coinPoolGame.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
