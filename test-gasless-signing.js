const { ethers } = require('ethers');
require('dotenv').config();

async function testGaslessSigning() {
    console.log('🧪 Testing Gasless Transaction Signing\n');

    // Setup
    const RPC_URL = 'http://127.0.0.1:8545';
    const FORWARDER_ADDRESS = '0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab';
    const BRK_TOKEN_ADDRESS = '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24';
    const MARKETPLACE_ADDRESS = '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B';

    // Use a test wallet
    const testPrivateKey = '0xa3b0d634e0111fec7d93001c40138a35c34172d76aa38ce2ff21db88ff7dfc9a';
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(testPrivateKey, provider);

    console.log('Wallet Address:', wallet.address);
    console.log('Forwarder Address:', FORWARDER_ADDRESS);
    console.log('Chain ID:', (await provider.getNetwork()).chainId);
    console.log('');

    // Get nonce from forwarder
    const forwarderABI = ["function getNonce(address from) view returns (uint256)"];
    const forwarder = new ethers.Contract(FORWARDER_ADDRESS, forwarderABI, wallet);
    const nonce = await forwarder.getNonce(wallet.address);
    console.log('Forwarder Nonce:', nonce.toString());

    // Create a simple approval transaction
    const brkABI = ["function approve(address spender, uint256 amount) returns (bool)"];
    const brkContract = new ethers.Contract(BRK_TOKEN_ADDRESS, brkABI, wallet);
    const approveAmount = ethers.utils.parseEther('100');
    const data = brkContract.interface.encodeFunctionData('approve', [MARKETPLACE_ADDRESS, approveAmount]);

    console.log('Transaction Data:', data);
    console.log('');

    // Build meta-transaction request
    const request = {
        from: wallet.address,
        to: BRK_TOKEN_ADDRESS,
        value: 0,
        gas: 1000000,
        nonce: nonce.toString(),
        data: data,
    };

    console.log('Meta-Transaction Request:', JSON.stringify(request, null, 2));
    console.log('');

    // Create EIP-712 signature
    const domain = {
        name: 'MinimalForwarder',
        version: '0.0.1',
        chainId: 12786,
        verifyingContract: FORWARDER_ADDRESS,
    };

    const types = {
        ForwardRequest: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'gas', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'data', type: 'bytes' },
        ],
    };

    console.log('EIP-712 Domain:', JSON.stringify(domain, null, 2));
    console.log('');

    // Sign
    console.log('Signing transaction...');
    const signature = await wallet._signTypedData(domain, types, request);
    console.log('Signature:', signature);
    console.log('');

    // Test the signature locally by calling verify on forwarder
    const fullForwarderABI = require('./artifacts/@openzeppelin/contracts/metatx/MinimalForwarder.sol/MinimalForwarder.json').abi;
    const fullForwarder = new ethers.Contract(FORWARDER_ADDRESS, fullForwarderABI, provider);

    try {
        const isValid = await fullForwarder.verify(request, signature);
        console.log('✅ Signature is VALID:', isValid);
    } catch (error) {
        console.log('❌ Signature is INVALID:', error.message);
    }

    console.log('');
    console.log('Now sending to relayer...');

    // Send to relayer
    const response = await fetch('http://localhost:8549/relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request, signature }),
    });

    const result = await response.json();
    console.log('Relayer Response:', JSON.stringify(result, null, 2));

    if (result.success) {
        console.log('✅ Transaction sent!');
        console.log('Transaction Hash:', result.transactionHash);
    } else {
        console.log('❌ Transaction failed');
    }
}

testGaslessSigning().catch(console.error);
