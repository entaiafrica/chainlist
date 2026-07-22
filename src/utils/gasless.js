import { ethers } from 'ethers';
import { sendMetaTransaction } from './metatx';

/**
 * Check if gasless transactions are enabled
 * @returns {boolean} True if gasless is configured and enabled
 */
export function isGaslessEnabled() {
    return (
        process.env.REACT_APP_GASLESS_ENABLED === 'true' &&
        process.env.REACT_APP_FORWARDER_ADDRESS &&
        process.env.REACT_APP_RELAYER_URL
    );
}

/**
 * Execute a transaction (gasless if enabled, regular otherwise)
 * @param {ethers.Contract} contract - The contract instance
 * @param {string} methodName - The method name to call
 * @param {Array} params - The method parameters
 * @param {ethers.Signer} signer - The signer instance
 * @param {Object} options - Options { forceGasless, fallbackToRegular }
 * @returns {Promise<Object>} Transaction object with wait() method and gasless flag
 */
export async function executeTransaction(contract, methodName, params, signer, options = {}) {
    const gaslessEnabled = options.forceGasless !== false && isGaslessEnabled();

    console.log(`[Gasless] Executing ${methodName} - Gasless mode: ${gaslessEnabled}`);

    if (gaslessEnabled) {
        try {
            // Try gasless transaction first
            console.log(`[Gasless] Attempting meta-transaction for ${methodName}...`);
            const txHash = await sendMetaTransaction(contract, methodName, params, signer);

            console.log(`[Gasless] Meta-transaction sent: ${txHash}`);

            return {
                hash: txHash,
                wait: async () => {
                    // Poll for transaction receipt
                    const provider = signer.provider;
                    let receipt = null;
                    let attempts = 0;
                    const maxAttempts = 150; // 300 seconds max (5 minutes with 2s intervals)

                    console.log(`[Gasless] Waiting for transaction ${txHash} to be mined...`);

                    while (!receipt && attempts < maxAttempts) {
                        receipt = await provider.getTransactionReceipt(txHash);
                        if (!receipt) {
                            // Log progress every 10 attempts (20 seconds)
                            if (attempts > 0 && attempts % 10 === 0) {
                                console.log(`[Gasless] Still waiting... (${attempts * 2}s elapsed)`);
                            }
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            attempts++;
                        }
                    }

                    if (!receipt) {
                        throw new Error(`Transaction not mined within timeout period (${maxAttempts * 2}s). Transaction may still be pending: ${txHash}`);
                    }

                    console.log(`[Gasless] Transaction mined in block ${receipt.blockNumber} after ${attempts * 2}s`);
                    return receipt;
                },
                gasless: true
            };
        } catch (error) {
            console.error(`[Gasless] Meta-transaction failed: ${error.message}`);
            throw new Error(`Gasless transaction failed: ${error.message}`);
        }
    }

    // If gasless is not enabled, throw error
    throw new Error('Gasless transactions are not enabled. Please enable gasless mode or ensure you have sufficient gas balance.');
}

/**
 * Check if user has enough gas for transactions
 * @param {ethers.providers.Provider} provider - The provider instance
 * @param {string} address - The address to check
 * @returns {Promise<Object>} Object with balance info and gas status
 */
export async function checkUserGasBalance(provider, address) {
    const balance = await provider.getBalance(address);
    const minimumGas = ethers.utils.parseEther("0.01"); // 0.01 ETH minimum

    return {
        balance: balance,
        balanceFormatted: ethers.utils.formatEther(balance),
        hasEnoughGas: balance.gte(minimumGas),
        needsGas: balance.lt(minimumGas),
        minimumGas: ethers.utils.formatEther(minimumGas)
    };
}

/**
 * Get gasless configuration info
 * @returns {Object} Configuration object
 */
export function getGaslessConfig() {
    return {
        enabled: isGaslessEnabled(),
        forwarderAddress: process.env.REACT_APP_FORWARDER_ADDRESS,
        relayerUrl: process.env.REACT_APP_RELAYER_URL
    };
}

/**
 * Check relayer health
 * @returns {Promise<boolean>} True if relayer is healthy
 */
export async function checkRelayerHealth() {
    if (!isGaslessEnabled()) {
        return false;
    }

    try {
        const relayerUrl = process.env.REACT_APP_RELAYER_URL;
        const response = await fetch(`${relayerUrl}/health`);
        const data = await response.json();
        return data.status === 'ok';
    } catch (error) {
        console.error('[Gasless] Relayer health check failed:', error);
        return false;
    }
}
