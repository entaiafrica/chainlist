import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState, useEffect } from "react";
import { HelpCircle, Wallet, PlusCircle, Copy, Check, X, Loader2 } from 'lucide-react';
import { getEthersProvider, isWalletInstalled, connectAndSetupWallet, getCurrentAddress } from '../walletUtils';
const ethers = require("ethers");

export default function BuyBricks() {
    const [brickAmount, setBrickAmount] = useState(105);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [copiedContract, setCopiedContract] = useState(false);
    const [brkBalance, setBrkBalance] = useState("0");
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [showCardModal, setShowCardModal] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState('');

    // Constants
    const BRICK_VALUE = 1.00; // R1.00 per brick
    const PROCESSING_FEE_PERCENT = 0.05; // 5% processing fee
    const MIN_BRICKS_AMOUNT = 105;
    const BRK_TOKEN_ADDRESS = "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24";

    // Calculations
    const netZarAmount = brickAmount * BRICK_VALUE;
    const zarAmount = netZarAmount / (1 - PROCESSING_FEE_PERCENT);
    const totalFees = zarAmount * PROCESSING_FEE_PERCENT;

    const handleBrickAmountChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        setBrickAmount(value);
    };

    useEffect(() => {
        const checkConnection = async () => {
            const address = await getCurrentAddress();
            if (address) {
                setWalletAddress(address);
                fetchWalletBalance(address);
            }
        }
        checkConnection();
    }, []);

    const fetchWalletBalance = async (address) => {
        try {
            if (isWalletInstalled() && address) {
                const provider = getEthersProvider();
                const brkAbi = ["function balanceOf(address) view returns (uint256)"];
                const brkContract = new ethers.Contract(BRK_TOKEN_ADDRESS, brkAbi, provider);
                const brkBal = await brkContract.balanceOf(address);
                setBrkBalance(ethers.utils.formatEther(brkBal));
            }
        } catch (error) {
            console.error("Error fetching wallet balance:", error);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedContract(true);
            setTimeout(() => setCopiedContract(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleCardInputChange = (e) => {
        const { name, value } = e.target;
        setCardDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleCardPayment = async () => {
        setPaymentProcessing(true);
        setPaymentMessage('Processing payment...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (cardDetails.number === '1111222233334444' && cardDetails.cvv === '123') {
            setPaymentMessage('Payment successful! BRK tokens will be deposited into your wallet shortly.');
        } else {
            setPaymentMessage('Payment failed. Please check your card details and try again.');
        }
        setPaymentProcessing(false);
    };

    const handleBuyBricks = async () => {
        if (brickAmount < MIN_BRICKS_AMOUNT) {
            setMessage(`Minimum purchase is ${MIN_BRICKS_AMOUNT} bricks`);
            return;
        }
        setShowCardModal(true);
    };

    const handleConnectAndSetup = async () => {
        setLoading(true);
        setMessage("Please follow the prompts in your wallet...");
        const result = await connectAndSetupWallet();
        if (result.success) {
            setWalletAddress(result.address);
            await fetchWalletBalance(result.address);
            setMessage("Setup Complete!");
        } else {
            setMessage(`Error: ${result.error}`);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 w-full">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-12 pt-24">
                <div className="text-center mb-12">
                    <img src="/brick-logo.png" alt="Brick" className="h-20 w-20 mx-auto mb-4" />
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                        Buy Bricks
                    </h1>
                    <p className="text-lg text-gray-600">
                        Purchase BRK tokens to start investing in property.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Purchase Card */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <div className="mb-6">
                                <label htmlFor="brickAmount" className="block text-sm font-medium text-gray-800 mb-2">
                                    Bricks to purchase (BRK)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        id="brickAmount"
                                        value={brickAmount}
                                        onChange={handleBrickAmountChange}
                                        min={MIN_BRICKS_AMOUNT}
                                        step="10"
                                        className="w-full pl-3 pr-12 py-3 rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-lg text-gray-900 bg-white"
                                        placeholder="105"
                                    />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <span className="text-gray-600 sm:text-sm">BRK</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Order Summary:</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-gray-800">
                                        <span>Bricks (BRK):</span>
                                        <span className="font-bold text-lg text-primary">{brickAmount.toFixed(2)} BRK</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Value (at R{BRICK_VALUE.toFixed(2)}/BRK):</span>
                                        <span className="text-gray-800">R{netZarAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Processing Fee ({PROCESSING_FEE_PERCENT * 100}%):</span>
                                        <span className="text-gray-800">R{totalFees.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="border-t border-gray-300 my-3"></div>
                                <div className="flex justify-between font-bold text-gray-900">
                                    <span>Total Cost:</span>
                                    <span>R{zarAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            {message && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">{message}</p>
                                </div>
                            )}

                            <button
                                onClick={handleBuyBricks}
                                disabled={loading || brickAmount < MIN_BRICKS_AMOUNT}
                                className="w-full py-3 rounded-lg font-bold text-lg text-white bg-primary hover:bg-primary-dark transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Buy Bricks
                            </button>
                        </div>

                        {/* Payment Methods */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Methods</h3>
                            <div className="space-y-4">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-5" />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5" />
                                            <span className="font-semibold text-gray-800">Credit/Debit Card</span>
                                        </div>
                                        <button onClick={() => setShowCardModal(true)} className="text-primary hover:text-primary-dark text-sm font-medium">Pay with Card</button>
                                    </div>
                                    <p className="text-sm text-gray-600">Secure payment via our trusted payment gateway.</p>
                                </div>
                            </div>
                            </div>
                    </div>

                    {/* Right Column: Info & Wallet Setup */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Contract Information</h3>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200 mb-4">
                                <label className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 block">
                                    BRK Token Contract Address
                                </label>
                                <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-green-200">
                                    <code className="flex-1 font-mono text-sm text-gray-900 break-all">
                                        {BRK_TOKEN_ADDRESS}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(BRK_TOKEN_ADDRESS)}
                                        className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-md transition-colors"
                                        title="Copy contract address"
                                    >
                                        {copiedContract ? (
                                            <Check className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Copy className="w-5 h-5 text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-600 mt-3">
                                    Use this address to manually import the BRK token into any wallet.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary/10 to-purple-100 rounded-lg shadow-sm border-2 border-primary/30 p-6">
                            <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center">
                                <Wallet className="w-5 h-5 mr-2 text-primary" />
                                Your Wallet
                            </h3>
                            {walletAddress ? (
                                <div className="space-y-3">
                                    <div className="bg-white/80 rounded-lg p-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-gray-600 uppercase">BRK Balance</span>
                                            <span className="text-lg font-bold text-primary">{parseFloat(brkBalance).toLocaleString(undefined, {maximumFractionDigits: 2})} BRK</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/80 rounded-lg p-2">
                                        <div className="text-xs text-gray-600 truncate">
                                            {walletAddress}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-600 mb-3">Connect your wallet to see your balance</p>
                                    <button
                                        onClick={handleConnectAndSetup}
                                        disabled={loading}
                                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                                    >
                                        {loading ? "Connecting..." : "Connect Wallet & Add BRK Token"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-lg text-gray-900 mb-3">Wallet Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={handleConnectAndSetup}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center text-sm font-medium py-2 px-4 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                                    <Wallet className="w-4 h-4 mr-2" /> {loading ? "Connecting..." : "Connect Wallet & Add BRK Token"}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-lg text-gray-900 mb-3">Common Questions</h3>
                            <div className="space-y-4 text-sm">
                                <details className="group">
                                    <summary className="flex justify-between items-center font-medium text-gray-800 cursor-pointer list-none">
                                        <span>What is a BRK token?</span>
                                        <span className="transition group-open:rotate-180">
                                            <HelpCircle className="w-4 h-4 text-gray-500" />
                                        </span>
                                    </summary>
                                    <p className="text-gray-600 mt-2">
                                        BRK is our platform's utility token, used to invest in property fractions (NFTs). Each BRK is pegged to R1.00.
                                    </p>
                                </details>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {showCardModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative">
                        <button
                            onClick={() => setShowCardModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Complete Purchase</h3>

                        <div className="mb-4 text-lg text-gray-700">
                            You are purchasing <span className="font-bold text-primary">{brickAmount.toFixed(2)} BRK</span> for a total of <span className="font-bold text-primary">R{zarAmount.toFixed(2)}</span>.
                        </div>

                        {paymentMessage && (
                            <div className={`mb-4 p-3 rounded-lg ${paymentMessage.includes('successful') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                <p className="text-sm">{paymentMessage}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                <input
                                    type="text"
                                    id="cardNumber"
                                    name="number"
                                    value={cardDetails.number}
                                    onChange={handleCardInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    placeholder="XXXX XXXX XXXX XXXX"
                                    maxLength="16"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                                    <input
                                        type="text"
                                        id="cardExpiry"
                                        name="expiry"
                                        value={cardDetails.expiry}
                                        onChange={handleCardInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                        placeholder="MM/YY"
                                        maxLength="5"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                    <input
                                        type="text"
                                        id="cardCvv"
                                        name="cvv"
                                        value={cardDetails.cvv}
                                        onChange={handleCardInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                        placeholder="XXX"
                                        maxLength="3"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                                <input
                                    type="text"
                                    id="cardName"
                                    name="name"
                                    value={cardDetails.name}
                                    onChange={handleCardInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    placeholder="Full Name"
                                />
                            </div>
                            <button
                                onClick={handleCardPayment}
                                disabled={paymentProcessing}
                                className="w-full py-3 rounded-lg font-bold text-lg text-white bg-primary hover:bg-primary-dark transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {paymentProcessing ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </span>
                                ) : (
                                    "Confirm Payment"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

