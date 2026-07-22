import { useState, useEffect } from "react";
import { Wallet, Plus } from 'lucide-react';
import { getEthersProvider, getPreferredProvider, isWalletInstalled } from '../walletUtils';
import { getTokenLogo } from '../utils/tokenLogo';
const ethers = require("ethers");

export default function WalletBalance({ compact = false, showTitle = true, ultraCompact = false }) {
    const [walletAddress, setWalletAddress] = useState("");
    const [brkBalance, setBrkBalance] = useState("0");
    const [loading, setLoading] = useState(false);

    const BRK_TOKEN_ADDRESS = "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24"; // FirstBrick Token (ERC2771)

    const addBRKToMetaMask = async () => {
        console.log('🚀 [WalletBalance] Starting wallet setup...');

        try {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

            console.log('📱 Device info:', { isMobile, isIOS });

            let provider = null;
            if (isMobile) {
                provider = window.ethereum;
                console.log('✓ Using window.ethereum for mobile');
            } else {
                const preferredProvider = getPreferredProvider();
                if (preferredProvider && preferredProvider.provider) {
                    provider = preferredProvider.provider;
                    console.log('✓ Using preferred provider:', preferredProvider.name);
                } else if (window.ethereum) {
                    provider = window.ethereum;
                    console.log('✓ Using window.ethereum as fallback');
                }
            }

            if (!provider) {
                console.error('❌ No provider found');
                alert("❌ No wallet found!\n\nPlease install MetaMask, Brave Wallet, or Rabby to continue.");
                return;
            }

            // Step 1: Connect wallet
            console.log('🔐 Step 1/3: Requesting wallet connection...');
            try {
                const accounts = await provider.request({ method: 'eth_requestAccounts' });
                console.log('✓ Wallet connected:', accounts[0]);
            } catch (connectError) {
                console.error('❌ Wallet connection rejected:', connectError);
                alert('❌ Wallet connection was cancelled.\n\nPlease try again and approve the connection.');
                return;
            }

            // Step 2: Add/Switch to BrickChain network
            console.log('🌐 Step 2/3: Adding BrickChain network...');
            try {
                await provider.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x31f2',
                        chainName: 'BrickChain',
                        nativeCurrency: {
                            name: 'Brick Gas',
                            symbol: 'BRK',
                            decimals: 18
                        },
                        rpcUrls: ['https://rpc.firstbrick.cloud'],
                        blockExplorerUrls: ['https://explorer.firstbrick.cloud'],
                        iconUrls: ['https://rpc.firstbrick.cloud/ipfs/Qmdc7gosuFCSUJrhAZH7mupAUuG88heWEBV9W7MQraqRXU']
                    }]
                });
                console.log('✓ BrickChain network added/switched');
            } catch (networkError) {
                console.warn('⚠️ Network error (may already exist):', networkError.message);
            }

            // Step 3: Add BRK Token
            console.log('🪙 Step 3/3: Adding BRK token...');

            let logoImage;
            try {
                console.log('📸 Loading token logo...');
                logoImage = await getTokenLogo('BRK');
                console.log('✓ Logo loaded successfully');
            } catch (logoError) {
                console.warn('⚠️ Logo loading failed, using fallback URL:', logoError);
                logoImage = 'https://rpc.firstbrick.cloud/ipfs/Qmdc7gosuFCSUJrhAZH7mupAUuG88heWEBV9W7MQraqRXU';
            }

            console.log('📤 Sending wallet_watchAsset request...');
            console.log('Token details:', {
                address: BRK_TOKEN_ADDRESS,
                symbol: 'BRK',
                decimals: 18,
                imageLength: logoImage?.length || 'N/A'
            });

            const wasAdded = await provider.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: BRK_TOKEN_ADDRESS,
                        symbol: 'BRK',
                        decimals: 18,
                        image: logoImage,
                    },
                },
            });

            console.log('📊 Token add result:', wasAdded);

            if (wasAdded) {
                console.log('✅ All steps completed successfully!');
                alert('✅ Setup Complete!\n\n✓ Wallet connected\n✓ BrickChain network added\n✓ BRK token added\n\nYou\'re ready to invest!');
                await fetchWalletBalance();
            } else {
                console.warn('⚠️ Token not added (user may have cancelled)');
                alert('⚠️ Setup partially complete.\n\nWallet and network are connected, but token was not added.\n\nManual token address:\n0x5b1869D9A4C187F2EAa108f3062412ecf0526b24');
                await fetchWalletBalance();
            }
        } catch (error) {
            console.error('❌ Setup failed:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });

            alert('❌ Setup Failed\n\n' +
                  'Error: ' + (error.message || 'Unknown error') + '\n\n' +
                  'Please check browser console (F12) for details.\n\n' +
                  'Manual setup:\n' +
                  '1. Network: BrickChain (Chain ID: 12786)\n' +
                  '2. RPC: https://rpc.firstbrick.cloud\n' +
                  '3. Token: 0x5b1869D9A4C187F2EAa108f3062412ecf0526b24');
        }
    };

    useEffect(() => {
        fetchWalletBalance();

        // Listen for account changes using proper provider
        const preferredProvider = getPreferredProvider();
        if (preferredProvider) {
            preferredProvider.provider.on('accountsChanged', fetchWalletBalance);
            preferredProvider.provider.on('chainChanged', fetchWalletBalance);
        }

        // Refresh balance every 5 seconds
        const interval = setInterval(fetchWalletBalance, 5000);

        return () => {
            clearInterval(interval);
            const preferredProvider = getPreferredProvider();
            if (preferredProvider && preferredProvider.provider.removeListener) {
                preferredProvider.provider.removeListener('accountsChanged', fetchWalletBalance);
                preferredProvider.provider.removeListener('chainChanged', fetchWalletBalance);
            }
        };
    }, []);

    const fetchWalletBalance = async () => {
        try {
            console.log("🔍 WalletBalance: Fetching balance...");

            if (isWalletInstalled()) {
                const provider = getEthersProvider();

                // Try to get accounts without requesting (to avoid popup on every page load)
                let accounts = await provider.listAccounts();
                console.log("📋 Accounts:", accounts);

                // If no accounts, skip (don't auto-request)
                if (accounts.length === 0) {
                    console.log("❌ No accounts connected");
                    setWalletAddress("");
                    setBrkBalance("0");
    
                    return;
                }

                const address = accounts[0];
                console.log("✓ Using address:", address);
                setWalletAddress(address);



                // Get BRK balance
                const brkAbi = ["function balanceOf(address) view returns (uint256)"];
                const brkContract = new ethers.Contract(BRK_TOKEN_ADDRESS, brkAbi, provider);
                const brkBal = await brkContract.balanceOf(address);
                const brkFormatted = ethers.utils.formatEther(brkBal);
                console.log("💎 BRK Balance:", brkFormatted, "BRK");
                setBrkBalance(brkFormatted);

                console.log("✅ Balance fetch complete");
            } else {
                console.log("❌ Wallet not found");
            }
        } catch (error) {
            console.error("❌ Error fetching wallet balance:", error);
            console.error("Error details:", error.message);
        }
    };

    const connectWallet = async () => {
        const preferredProvider = getPreferredProvider();
        if (preferredProvider) {
            try {
                setLoading(true);
                await preferredProvider.provider.request({ method: 'eth_requestAccounts' });
                await fetchWalletBalance();
            } catch (error) {
                console.error("Error connecting wallet:", error);
            } finally {
                setLoading(false);
            }
        } else {
            alert("Please install a Web3 wallet to continue.");
        }
    };

    if (ultraCompact) {
        return walletAddress ? (
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-100 p-2 rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-600">BRK Balance</p>
                    <p className="font-bold text-primary">{parseFloat(brkBalance).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                </div>
 
            </div>
        ) : (
            <button
                onClick={connectWallet}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white px-3 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 text-sm"
            >
                <Wallet className="w-4 h-4" />
                {loading ? "Connecting..." : "Connect Wallet"}
            </button>
        );
    }

    if (compact) {
        // Compact version for inline display
        return walletAddress ? (
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-primary/10 to-purple-100 px-3 py-2 rounded-lg border border-primary/30 w-full flex-nowrap">
                    <div className="flex items-center gap-2 text-sm flex-shrink min-w-0">
                        <Wallet className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-gray-600 text-xs truncate">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm flex-shrink-0">
                        <span className="font-bold text-primary">{parseFloat(brkBalance).toLocaleString(undefined, {maximumFractionDigits: 0})} BRK</span>
                    </div>
                </div>
                <button
                    onClick={addBRKToMetaMask}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-xs py-1.5 px-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                    <Plus className="w-3 h-3" />
                    Add BRK Token
                </button>
            </div>
        ) : (
            <button
                onClick={connectWallet}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
                <Wallet className="w-4 h-4" />
                {loading ? "Connecting..." : "Connect Wallet"}
            </button>
        );
    }

    // Full card version
    return (
        <div className="bg-gradient-to-br from-primary/10 to-purple-100 rounded-lg shadow-sm border-2 border-primary/30 p-4">
            {showTitle && (
                <h3 className="font-bold text-base text-gray-900 mb-3 flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-primary" />
                    Your Wallet
                </h3>
            )}
            {walletAddress ? (
                <div className="space-y-2">
                    <div className="bg-white/80 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-600 uppercase">BRK Balance</span>
                            <span className="text-lg font-bold text-primary">{parseFloat(brkBalance).toLocaleString(undefined, {maximumFractionDigits: 2})} BRK</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-right">
                            ≈ R{parseFloat(brkBalance).toLocaleString(undefined, {maximumFractionDigits: 2})}
                        </div>
                    </div>

                    <div className="bg-white/80 rounded-lg p-2">
                        <div className="text-xs text-gray-600 truncate text-center">
                            {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                        </div>
                    </div>

                    {/* Add BRK Token Button */}
                    <button
                        onClick={addBRKToMetaMask}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-xs py-2 px-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add BRK Token to Wallet
                    </button>
                </div>
            ) : (
                <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-3">Connect your wallet to see your balance</p>
                    <button
                        onClick={connectWallet}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                        {loading ? "Connecting..." : "Connect Wallet"}
                    </button>
                </div>
            )}
        </div>
    );
}
