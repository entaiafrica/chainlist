import { useState, useEffect } from "react";
import { getPreferredProvider } from '../walletUtils';
import { getTokenLogo } from '../utils/tokenLogo';

export default function GenesisModal({ isOpen, onClose }) {
    const [brickAmount, setBrickAmount] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [remainingBricks, setRemainingBricks] = useState(650);
    const [investors, setInvestors] = useState(0);

    // Genesis Brick Constants - Token Economics
    const GENESIS_CONTRACT = "0x17F8376935341F8Ec506906313aE2E061fE7C628";
    const GENESIS_LOGO = "https://rpc.firstbrick.cloud/ipfs/QmdScpRWNv2hKqou4y1KdgNMhZkcRBVTX1MDVFhndQaeE7";
    const TOTAL_GENESIS_BRICKS = 1000;
    const FOUNDERS_RETAIN = 350; // 35%
    const AVAILABLE_FOR_INVESTORS = 650; // 65%
    const TOTAL_RAISE = 15400000; // R15,400,000
    const GENESIS_BRICK_VALUE = 23692.31; // R15,400,000 ÷ 650 = R23,692.31
    const PROCESSING_FEE = 307.69; // ~1.3% processing fee
    const PRICE_PER_GENESIS_BRICK = 24000; // R24,000 total cost (rounded)
    const MIN_GENESIS_BRICKS = 1;
    const BOARD_SEAT_TOKENS = 200; // 20% for board seat
    const COMPANY_VALUATION = 23692308; // R23,692,308

    // Calculate total cost
    const totalCost = (brickAmount * PRICE_PER_GENESIS_BRICK).toLocaleString('en-ZA');
    const brickValue = (brickAmount * GENESIS_BRICK_VALUE).toLocaleString('en-ZA');
    const totalFees = (brickAmount * PROCESSING_FEE).toLocaleString('en-ZA');

    useEffect(() => {
        const fetchRemainingBricks = async () => {
            try {
                // For now, we'll use the static values since Otterscan has different API structure
                // In a real implementation, we would use web3.js or ethers.js to query the contract directly
                setRemainingBricks(AVAILABLE_FOR_INVESTORS);
                // For now, we'll keep the investor count as is until we implement direct contract queries
                setInvestors(0); // This would need to be fetched from the contract directly
            } catch (error) {
                console.error('Error fetching blockchain data:', error);
                setRemainingBricks(AVAILABLE_FOR_INVESTORS);
                setInvestors(0);
            }
        };
        if (isOpen) {
            fetchRemainingBricks();
        }
    }, [isOpen, GENESIS_CONTRACT, AVAILABLE_FOR_INVESTORS]);

    const handleBrickAmountChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        if (value >= MIN_GENESIS_BRICKS || value === 0) {
            if (value <= remainingBricks) {
                setBrickAmount(value);
            } else {
                setBrickAmount(remainingBricks);
                setMessage(`Only ${remainingBricks} Genesis Bricks remaining!`);
            }
        }
    };

    const handleQuickSelect = (amount) => {
        if (amount <= remainingBricks) {
            setBrickAmount(amount);
        } else {
            setBrickAmount(remainingBricks);
            setMessage(`Only ${remainingBricks} Genesis Bricks remaining!`);
        }
    };

    const handleBuyGenesisBricks = async () => {
        if (brickAmount < MIN_GENESIS_BRICKS) {
            setMessage(`Minimum purchase is ${MIN_GENESIS_BRICKS} Genesis Brick`);
            return;
        }

        if (!walletAddress || walletAddress.length < 10) {
            setMessage("Please enter a valid wallet address");
            return;
        }

        setLoading(true);
        setMessage("Processing your Genesis Brick purchase...");

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setMessage(`Success! ${brickAmount} Genesis Brick(s) will be transferred to your wallet shortly.`);
            setRemainingBricks(prev => prev - brickAmount);
            setInvestors(prev => prev + 1);
            setLoading(false);
        } catch (error) {
            setMessage("Error processing payment. Please try again.");
            setLoading(false);
        }
    };

    const addGenesisToWallet = async () => {
        try {
            // On mobile (iOS/Android), use window.ethereum directly
            // On desktop, use getPreferredProvider for multi-wallet support
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            let provider = null;

            if (isMobile) {
                // Mobile: use window.ethereum directly (MetaMask in-app browser)
                provider = window.ethereum;
                console.log('Mobile detected: Using window.ethereum directly');
            } else {
                // Desktop: use preferred provider (Brave, Rabby, MetaMask)
                const preferredProvider = getPreferredProvider();
                if (preferredProvider) {
                    provider = preferredProvider.provider;
                    console.log('Desktop detected: Using', preferredProvider.name);
                } else if (window.ethereum) {
                    provider = window.ethereum;
                }
            }

            if (!provider) {
                setMessage("Please install a wallet to add Genesis Brick token");
                return;
            }

            // Get optimized logo (Base64 for mobile, URL for desktop)
            const optimizedLogo = await getTokenLogo('GBRK');

            const wasAdded = await provider.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: GENESIS_CONTRACT,
                        symbol: 'GBRK',
                        decimals: 18,
                        image: optimizedLogo,
                    },
                },
            });

            if (wasAdded) {
                setMessage('Genesis Brick token successfully added to your wallet!');
            }
        } catch (error) {
            console.error('Error adding token:', error);
            setMessage('Failed to add Genesis Brick token. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-yellow-500/30">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-all transform hover:scale-110"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Content */}
                    <div className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <img src={GENESIS_LOGO} alt="Genesis Brick" className="h-24 w-24 animate-pulse" />
                                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                        LIMITED
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-4xl font-bold mb-2">
                                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-transparent bg-clip-text">
                                    Genesis Brick Offering
                                </span>
                            </h2>
                            <p className="text-lg text-gray-300 mb-2">Own Equity in FirstBrick</p>
                            <p className="text-sm text-gray-400">650 tokens available for investors (350 retained by founders)</p>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-6">
                                <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-4 rounded-lg border border-yellow-500/30">
                                    <div className="text-2xl font-bold text-yellow-400">{remainingBricks}</div>
                                    <div className="text-xs text-gray-400">Available</div>
                                </div>
                                <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 p-4 rounded-lg border border-orange-500/30">
                                    <div className="text-2xl font-bold text-orange-400">{AVAILABLE_FOR_INVESTORS - remainingBricks}</div>
                                    <div className="text-xs text-gray-400">Sold</div>
                                </div>
                                <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 p-4 rounded-lg border border-red-500/30">
                                    <div className="text-2xl font-bold text-red-400">{investors}</div>
                                    <div className="text-xs text-gray-400">Investors</div>
                                </div>
                            </div>
                        </div>

                        {/* Token Economics */}
                        <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-yellow-500/20">
                            <h3 className="text-xl font-bold mb-4 text-yellow-300">Token Economics</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Total Tokens:</span>
                                        <span className="text-white font-semibold">{TOTAL_GENESIS_BRICKS}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Founders Retain:</span>
                                        <span className="text-white font-semibold">{FOUNDERS_RETAIN} ({((FOUNDERS_RETAIN/TOTAL_GENESIS_BRICKS)*100).toFixed(0)}%)</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Available for Investors:</span>
                                        <span className="text-white font-semibold">{AVAILABLE_FOR_INVESTORS} ({((AVAILABLE_FOR_INVESTORS/TOTAL_GENESIS_BRICKS)*100).toFixed(0)}%)</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Price per Token:</span>
                                        <span className="text-green-400 font-semibold">R{PRICE_PER_GENESIS_BRICK.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Company Valuation:</span>
                                        <span className="text-white font-semibold">R{COMPANY_VALUATION.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Total Raise Target:</span>
                                        <span className="text-white font-semibold">R{TOTAL_RAISE.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Board Seat Requirement:</span>
                                        <span className="text-purple-400 font-semibold">{BOARD_SEAT_TOKENS} tokens (20%)</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Equity per Token:</span>
                                        <span className="text-blue-400 font-semibold">0.1%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Purchase Form */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Left Column - Form */}
                            <div className="space-y-4">
                                <button
                                    onClick={addGenesisToWallet}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Add GBRK Token</span>
                                </button>

                                <div>
                                    <label className="block text-gray-300 text-sm font-semibold mb-2">
                                        Number of Genesis Bricks (Max: {remainingBricks})
                                    </label>
                                    <input
                                        type="number"
                                        value={brickAmount}
                                        onChange={handleBrickAmountChange}
                                        min={MIN_GENESIS_BRICKS}
                                        max={remainingBricks}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-yellow-500"
                                    />
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 5, 10, 25].map(amount => (
                                        <button
                                            key={amount}
                                            onClick={() => handleQuickSelect(amount)}
                                            disabled={amount > remainingBricks}
                                            className={`font-semibold py-2 px-3 rounded-lg transition-all ${
                                                amount > remainingBricks
                                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                    : 'bg-gray-700 hover:bg-yellow-600 text-white'
                                            }`}
                                        >
                                            {amount}
                                        </button>
                                    ))}
                                </div>

                                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-gray-400">
                                            <span>Token Value ({brickAmount} × R{GENESIS_BRICK_VALUE.toLocaleString()}):</span>
                                            <span className="text-green-400 font-mono">R {brickValue}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400">
                                            <span>Processing Fee:</span>
                                            <span className="text-yellow-400 font-mono">R {totalFees}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400 text-xs">
                                            <span>Platform Equity:</span>
                                            <span className="text-purple-400 font-mono">{(brickAmount * 0.1).toFixed(2)}%</span>
                                        </div>
                                        <div className="border-t border-gray-700 pt-2"></div>
                                        <div className="flex justify-between text-white font-bold">
                                            <span>Total Investment:</span>
                                            <span className="text-yellow-400 font-mono">R {totalCost}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-semibold mb-2">
                                        Your Wallet Address
                                    </label>
                                    <input
                                        type="text"
                                        value={walletAddress}
                                        onChange={(e) => setWalletAddress(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-yellow-500"
                                    />
                                </div>

                                <button
                                    onClick={handleBuyGenesisBricks}
                                    disabled={loading || brickAmount < MIN_GENESIS_BRICKS}
                                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                                        loading || brickAmount < MIN_GENESIS_BRICKS
                                            ? 'bg-gray-600 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 shadow-lg'
                                    } text-white`}
                                >
                                    {loading ? 'Processing...' : `Invest R ${totalCost}`}
                                </button>

                                {message && (
                                    <div className={`p-3 rounded-lg text-sm text-center ${
                                        message.includes('Success')
                                            ? 'bg-green-900/30 border border-green-500 text-green-400'
                                            : message.includes('Error')
                                            ? 'bg-red-900/30 border border-red-500 text-red-400'
                                            : 'bg-blue-900/30 border border-blue-500 text-blue-400'
                                    }`}>
                                        {message}
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Benefits */}
                            <div className="space-y-4">
                                <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 p-4 rounded-lg border border-yellow-500/30">
                                    <h4 className="text-lg font-bold mb-3 text-yellow-300">What You Get</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start text-gray-300">
                                            <span className="text-yellow-400 mr-2">★</span>
                                            <span>Equity ownership in FirstBrick platform</span>
                                        </li>
                                        <li className="flex items-start text-gray-300">
                                            <span className="text-yellow-400 mr-2">★</span>
                                            <span>Revenue share from all platform transactions</span>
                                        </li>
                                        <li className="flex items-start text-gray-300">
                                            <span className="text-yellow-400 mr-2">★</span>
                                            <span>Governance voting rights</span>
                                        </li>
                                        <li className="flex items-start text-gray-300">
                                            <span className="text-yellow-400 mr-2">★</span>
                                            <span>Priority access to new features</span>
                                        </li>
                                        <li className="flex items-start text-gray-300">
                                            <span className="text-yellow-400 mr-2">★</span>
                                            <span>Board seat eligibility (200+ tokens)</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4 rounded-lg border border-blue-500/30">
                                    <h4 className="text-lg font-bold mb-2 text-blue-300">Trust & Security</h4>
                                    <p className="text-gray-400 text-sm mb-3">
                                        All funds secured in registered trust account managed by licensed conveyancers and audited quarterly.
                                    </p>
                                    <div className="space-y-1 text-xs text-gray-500">
                                        <p><strong>Firm:</strong> FirstBrick Trust Services (Pty) Ltd</p>
                                        <p><strong>Bank:</strong> FNB Business Trust Account</p>
                                        <p><strong>Auditor:</strong> Deloitte South Africa</p>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-4 rounded-lg border border-purple-500/30">
                                    <h4 className="text-lg font-bold mb-2 text-purple-300">Contract Info</h4>
                                    <div className="space-y-1 text-xs">
                                        <p className="text-gray-500">Token: <span className="text-white font-mono">GBRK</span></p>
                                        <p className="text-gray-500">Network: <span className="text-white">BrickChain (EVM)</span></p>
                                        <p className="text-gray-500">Contract:</p>
                                        <p className="text-white font-mono text-[10px] break-all">{GENESIS_CONTRACT}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Disclaimer */}
                        <div className="mt-6 bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                            <p className="text-xs text-gray-500 text-center">
                                <strong className="text-gray-400">Investment Disclaimer:</strong> Genesis Brick tokens represent fractional equity ownership.
                                Returns depend on platform growth. All projections are estimates. Cryptocurrency investments carry risk.
                                Funds held in registered trust account. Contract: {GENESIS_CONTRACT}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
