const { ethers } = require('ethers');

const RELAYER_URL = process.env.REACT_APP_RELAYER_URL || 'http://localhost:3001';

const ForwarderABI = [
    "function getNonce(address from) view returns (uint256)",
];

export async function sendMetaTransaction(contract, methodName, params, signer) {
    const from = await signer.getAddress();
    const forwarderAddress = process.env.REACT_APP_FORWARDER_ADDRESS;

    if (!forwarderAddress) {
        throw new Error('REACT_APP_FORWARDER_ADDRESS not configured');
    }

    // Get forwarder nonce
    const forwarder = new ethers.Contract(forwarderAddress, ForwarderABI, signer);
    const nonce = await forwarder.getNonce(from);

    // Encode function call
    const data = contract.interface.encodeFunctionData(methodName, params);

    // Build meta-transaction request
    const request = {
        from: from,
        to: contract.address,
        value: 0,
        gas: 1000000,
        nonce: nonce.toString(),
        data: data,
    };

    // Create EIP-712 signature
    const domain = {
        name: 'MinimalForwarder',
        version: '0.0.1',
        chainId: parseInt(process.env.REACT_APP_CHAIN_ID || '12786'),
        verifyingContract: forwarderAddress,
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

    const signature = await signer._signTypedData(domain, types, request);

    // Send to relayer
    const response = await fetch(`${RELAYER_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request, signature }),
    });

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.message || 'Meta-transaction failed');
    }

    return result.transactionHash;
}
