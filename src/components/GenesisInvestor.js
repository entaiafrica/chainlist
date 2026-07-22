import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, TrendingUp, Users, Award, FileText, Wallet } from 'lucide-react';
import { getPreferredProvider } from '../walletUtils';
import { getTokenLogo } from '../utils/tokenLogo';

export default function GenesisInvestor() {
    const [brickAmount, setBrickAmount] = useState(1);
    const [remainingBricks, ] = useState(650);
    const [message, setMessage] = useState("");

    const PRICE_PER_GENESIS_BRICK = 24000;
    const MIN_GENESIS_BRICKS = 1;
    const GENESIS_CONTRACT = "0x17F8376935341F8Ec506906313aE2E061fE7C628";
    const totalCost = (brickAmount * PRICE_PER_GENESIS_BRICK).toLocaleString('en-ZA');

    const handleBrickAmountChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        if (value >= MIN_GENESIS_BRICKS && value <= remainingBricks) {
            setBrickAmount(value);
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
                if (preferredProvider && preferredProvider.provider) {
                    provider = preferredProvider.provider;
                    console.log('Desktop detected: Using', preferredProvider.name);
                } else if (window.ethereum) {
                    provider = window.ethereum;
                }
            }

            if (!provider) {
                setMessage("Wallet is not installed. Please install MetaMask, Brave Wallet, or Rabby.");
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

    return (
        <div className="min-h-screen bg-gray-100 w-full">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <img src="https://rpc.firstbrick.cloud/ipfs/QmdScpRWNv2hKqou4y1KdgNMhZkcRBVTX1MDVFhndQaeE7" alt="Genesis Brick" className="h-24 w-24 mx-auto mb-4" />
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                        Become a Genesis Investor
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                        Own a foundational piece of FirstBrick and share in our success. The Genesis Offering is a one-time opportunity to acquire equity in the platform itself.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                        <p className="text-4xl font-bold text-primary">{remainingBricks}</p>
                        <p className="text-sm font-medium text-gray-500">Genesis Bricks Remaining</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                        <p className="text-4xl font-bold text-gray-900">R15.4M</p>
                        <p className="text-sm font-medium text-gray-500">Total Raise Target</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                        <p className="text-4xl font-bold text-gray-900">1,000</p>
                        <p className="text-sm font-medium text-gray-500">Total Genesis Bricks Ever</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Information */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Benefits Section */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Genesis Advantage</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"><PieChart className="w-6 h-6 text-primary" /></div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Platform Equity</h3>
                                        <p className="text-gray-600">Each Genesis Brick (GBRK) represents direct equity in the FirstBrick platform.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"><TrendingUp className="w-6 h-6 text-primary" /></div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Revenue Sharing</h3>
                                        <p className="text-gray-600">Earn a share of platform fees from every property transaction, forever.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-primary" /></div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Governance Rights</h3>
                                        <p className="text-gray-600">Vote on key platform decisions, from fee structures to new features.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"><Award className="w-6 h-6 text-primary" /></div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Exclusive Access</h3>
                                        <p className="text-gray-600">Get priority access to new property listings and future investment opportunities.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Investment Details */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Investment Details</h2>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
                                <div className="p-4 flex justify-between items-center"><span className="text-gray-600">Price per Genesis Brick</span><span className="font-bold text-lg text-gray-900">R24,000</span></div>
                                <div className="p-4 flex justify-between items-center"><span className="text-gray-600">Implied Value per Brick</span><span className="font-bold text-lg text-gray-900">R23,692.31</span></div>
                                <div className="p-4 flex justify-between items-center"><span className="text-gray-600">Platform Equity per Brick</span><span className="font-bold text-lg text-primary">0.1%</span></div>
                                <div className="p-4 flex justify-between items-center"><span className="text-gray-600">Company Valuation</span><span className="font-bold text-lg text-gray-900">R23.7M</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Purchase Panel */}
                    <div className="sticky top-24">
                        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Invest in FirstBrick</h3>

                            {/* Add GBRK to Wallet Button */}
                            <button
                                onClick={addGenesisToWallet}
                                className="w-full mb-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
                            >
                                <Wallet className="w-5 h-5 mr-2" />
                                Add GBRK Token
                            </button>

                            <div className="mb-4">
                                <label htmlFor="brickAmount" className="block text-sm font-medium text-gray-700 mb-1">Number of Genesis Bricks</label>
                                <input
                                    type="number"
                                    id="brickAmount"
                                    value={brickAmount}
                                    onChange={handleBrickAmountChange}
                                    min={MIN_GENESIS_BRICKS}
                                    max={remainingBricks}
                                    className="w-full p-2 rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-white text-gray-900"
                                />
                            </div>
                            <div className="flex justify-between font-bold text-xl text-gray-900 mb-4">
                                <span>Total Cost:</span>
                                <span>R{totalCost}</span>
                            </div>

                            {message && (
                                <div className={`mb-4 p-3 rounded-lg text-sm text-center ${
                                    message.includes('successfully')
                                        ? 'bg-green-50 border border-green-200 text-green-800'
                                        : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                                }`}>
                                    {message}
                                </div>
                            )}

                            <button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg">
                                Invest Now
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-2">Minimum investment is 1 GBRK.</p>
                        </div>
                        <div className="text-center mt-4">
                            <Link to="/disclaimer" className="text-sm text-gray-600 hover:text-primary underline flex items-center justify-center">
                                <FileText className="w-4 h-4 mr-1.5" /> View Investment Disclaimer
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
