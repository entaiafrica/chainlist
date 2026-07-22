const { ethers } = require("hardhat");
const https = require('https');
const http = require('http');

async function testEndpoint(url, label) {
    console.log(`\n🔍 Testing ${label}: ${url}`);
    try {
        const provider = new ethers.providers.JsonRpcProvider(url);
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();
        console.log(`✅ SUCCESS!`);
        console.log(`   Chain ID: ${network.chainId}`);
        console.log(`   Block: ${blockNumber}`);
        return true;
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log("🧪 TESTING RPC ENDPOINTS\n");
    console.log("=".repeat(70));

    await testEndpoint("http://rpc.entailabs.com:8545", "HTTP with port");
    await testEndpoint("https://rpc.entailabs.com:8545", "HTTPS with port");
    await testEndpoint("https://rpc.entailabs.com", "HTTPS without port");
    await testEndpoint("http://rpc.entailabs.com", "HTTP without port");

    console.log("\n" + "=".repeat(70));
    console.log("RECOMMENDATION:");
    console.log("Use whichever endpoint shows ✅ SUCCESS");
    console.log("If only HTTP works, you need to access frontend via HTTP:");
    console.log("  http://localhost:3300  (not https://fb.entailabs.com)");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
