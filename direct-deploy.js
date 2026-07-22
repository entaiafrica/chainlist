// direct-deploy.js
const { ethers } = require("ethers");

async function deployContract() {
  // Connect to the Besu network
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Create a wallet with the private key
  const privateKey = "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d";
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("Deployer address:", wallet.address);
  console.log("Deployer balance:", (await provider.getBalance(wallet.address)).toString());
  
  // BRK token address
  const BRK_TOKEN_ADDRESS = "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24";
  // Forwarder address
  const FORWARDER_ADDRESS = "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab";
  
  // Contract bytecode (this needs to be compiled first)
  const fs = require("fs");
  const contractPath = "/opt/facebrick/artifacts/contracts/CoinPoolGame.sol/CoinPoolGame.json";
  const contractArtifact = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  
  const bytecode = contractArtifact.bytecode;
  const abi = contractArtifact.abi;
  
  // Create contract factory
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  
  // Deploy the contract
  console.log("Deploying CoinPoolGame contract...");
  const contract = await factory.deploy(BRK_TOKEN_ADDRESS, FORWARDER_ADDRESS);
  
  console.log("Transaction hash:", contract.deployTransaction.hash);
  console.log("Waiting for deployment...");
  
  await contract.deployed();
  
  console.log("CoinPoolGame deployed to:", contract.address);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contract.address,
    brkTokenAddress: BRK_TOKEN_ADDRESS,
    forwarderAddress: FORWARDER_ADDRESS,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    "/opt/facebrick/brickx/coinPoolGameDeployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("Deployment info saved to coinPoolGameDeployment.json");
  
  // Verify initial state
  console.log("\nInitial state:");
  console.log("- Pool size:", (await contract.getPoolSize()).toString());
  console.log("- Current pool amount:", ethers.utils.formatEther(await contract.getCurrentPoolAmount()));
  console.log("- Amount needed to fill pool:", ethers.utils.formatEther(await contract.getAmountNeededToFillPool()));
  console.log("- Current game round:", (await contract.getCurrentGameRound()).toString());
  
  return contract.address;
}

deployContract()
  .then(() => {
    console.log("Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });