import { useState, useEffect } from 'react';
import { getCurrentChainId, getNetworkName, getBrickChainConfig } from '../walletUtils';

export default function NetworkMismatchModal({ isOpen, onClose, currentNetwork, targetNetwork = 'BrickChain' }) {
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);
  const [detectedChainId, setDetectedChainId] = useState(null);
  const [detectedNetworkName, setDetectedNetworkName] = useState('Unknown');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if running on mobile
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    // Get current chain ID
    if (isOpen) {
      getCurrentChainId()
        .then(chainId => {
          setDetectedChainId(chainId);
          setDetectedNetworkName(getNetworkName(chainId));
        })
        .catch(err => {
          console.error('Error detecting chain:', err);
        });
    }
  }, [isOpen]);

  const handleAddNetwork = async () => {
    setIsAddingNetwork(true);

    try {
      const config = getBrickChainConfig();

      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [config],
      });

      // Success - close modal and reload
      alert('BrickChain network added successfully! The page will reload.');
      window.location.reload();
    } catch (error) {
      console.error('Error adding network:', error);

      if (error.code === 4001) {
        alert('You rejected the network addition request.');
      } else {
        alert('Failed to add network automatically. Please add it manually using the instructions below.');
      }
    } finally {
      setIsAddingNetwork(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
  };

  if (!isOpen) return null;

  const networkConfig = getBrickChainConfig();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ zIndex: 9999 }}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-purple-500">
          {/* Header */}
          <div className="bg-red-600 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-lg font-bold text-white">Wrong Network Detected</h3>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 text-white">
            {/* Current vs Required Network */}
            <div className="mb-6 p-4 bg-purple-950 rounded-lg border border-purple-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Current Network:</p>
                  <p className="font-bold text-red-400">{detectedNetworkName}</p>
                  <p className="text-xs text-gray-500 mt-1">Chain ID: {detectedChainId || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Required Network:</p>
                  <p className="font-bold text-green-400">BrickChain</p>
                  <p className="text-xs text-gray-500 mt-1">Chain ID: 0x31f2 (12786)</p>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="mb-6">
              <p className="text-gray-300">
                Your wallet is currently connected to <span className="font-semibold text-red-400">{detectedNetworkName}</span>,
                but FirstBrick Marketplace operates on the <span className="font-semibold text-green-400">BrickChain network</span>.
              </p>
              <p className="text-gray-300 mt-2">
                You need to add and switch to BrickChain to see your BRK balance and interact with properties.
              </p>
            </div>

            {/* Auto-add button (non-mobile only) */}
            {!isMobile && (
              <div className="mb-6">
                <button
                  onClick={handleAddNetwork}
                  disabled={isAddingNetwork}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isAddingNetwork ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding Network...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add BrickChain Network Automatically
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Manual instructions */}
            <div className="bg-indigo-950 rounded-lg p-4 border border-indigo-700">
              <h4 className="font-bold text-lg mb-3 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Manual Setup Instructions
              </h4>

              {isMobile ? (
                // Mobile-specific instructions
                <div className="space-y-3 text-sm">
                  <p className="text-yellow-400 font-semibold">For Brave Wallet on iPad/Mobile:</p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>Tap the <strong>Brave icon</strong> in your browser</li>
                    <li>Tap <strong>Settings</strong> (gear icon)</li>
                    <li>Tap <strong>Networks</strong></li>
                    <li>Tap <strong>Add Network</strong> or <strong>+</strong></li>
                    <li>Enter the following details:</li>
                  </ol>
                </div>
              ) : (
                // Desktop instructions
                <div className="space-y-3 text-sm">
                  <p className="text-gray-300">To manually add BrickChain to your wallet:</p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>Open your Brave Wallet</li>
                    <li>Click <strong>Settings</strong></li>
                    <li>Select <strong>Networks</strong></li>
                    <li>Click <strong>Add Network</strong></li>
                    <li>Enter the following details:</li>
                  </ol>
                </div>
              )}

              {/* Network Details */}
              <div className="mt-4 space-y-2 bg-purple-950 p-3 rounded border border-purple-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Network Name:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-black px-2 py-1 rounded text-green-400">{networkConfig.chainName}</code>
                    <button
                      onClick={() => copyToClipboard(networkConfig.chainName)}
                      className="text-blue-400 hover:text-blue-300"
                      title="Copy"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">RPC URL:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-black px-2 py-1 rounded text-green-400 text-xs">{networkConfig.rpcUrls[0]}</code>
                    <button
                      onClick={() => copyToClipboard(networkConfig.rpcUrls[0])}
                      className="text-blue-400 hover:text-blue-300"
                      title="Copy"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Chain ID:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-black px-2 py-1 rounded text-green-400">{networkConfig.chainId}</code>
                    <button
                      onClick={() => copyToClipboard(networkConfig.chainId)}
                      className="text-blue-400 hover:text-blue-300"
                      title="Copy"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Currency Symbol:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-black px-2 py-1 rounded text-green-400">{networkConfig.nativeCurrency.symbol}</code>
                    <button
                      onClick={() => copyToClipboard(networkConfig.nativeCurrency.symbol)}
                      className="text-blue-400 hover:text-blue-300"
                      title="Copy"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-xs mt-3">
                After adding the network, switch to BrickChain in your wallet and reload this page.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-purple-950 px-6 py-4 flex justify-end border-t border-purple-700">
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
