
const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = "0xb09bCc172050fBd4562da8b229Cf3E45Dc3045A6";
const CONTRACT_ABI = require("./artifacts/contracts/CoinPoolGame.sol/CoinPoolGame.json").abi;

async function findLastWinner() {
  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const currentRound = await contract.gameRound();
    if (currentRound.eq(0)) {
      console.log("No game rounds have been completed yet.");
      return;
    }

    const lastRound = currentRound.sub(1);
    console.log(`Searching for winner of round ${lastRound.toString()}...`);

    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - 1000); // Query last 1000 blocks

    console.log(`Searching for winner of round ${lastRound.toString()} from block ${fromBlock} to ${latestBlock}...`);

    const filter = contract.filters.WinnerSelected();
    const events = await contract.queryFilter(filter, fromBlock, latestBlock);

    const winnerEvent = events.find(event => event.args.gameRound.eq(lastRound));

    if (winnerEvent) {
      const winnerAddress = winnerEvent.args.winner;
      console.log(`The winner of round ${lastRound.toString()} was: ${winnerAddress}`);
    } else {
      console.log(`Could not find a winner for round ${lastRound.toString()}.`);
    }
  } catch (error) {
    console.error("Error finding winner:", error);
  }
}

findLastWinner();
