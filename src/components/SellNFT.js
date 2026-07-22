import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from '../Marketplace_new.json';
import { UploadCloud, User, DollarSign, Check, Loader2, ArrowRight } from 'lucide-react';
import { executeTransaction, isGaslessEnabled } from '../utils/gasless';
import { getEthersProvider, getEthersSigner } from '../walletUtils';

export default function SellNFT() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formParams, updateFormParams] = useState({
        propertyAddress: '', propertyType: '', bedrooms: '', bathrooms: '',
        totalPropertyValue: '', mortgageAmount: '', interestRate: '',
        homebuyerCreditScore: '', propertyDetails: '',
        buyerWalletAddress: '', otpPeriodDays: '90'
    });
    const [fileURL, setFileURL] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, updateMessage] = useState('');
    const ethers = require("ethers");

    // Simulate AI processing and pre-fill form
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        updateMessage("Uploading document to IPFS...");
        try {
            const response = await uploadFileToIPFS(file);
            if (response.success) {
                setFileURL(response.pinataURL);
                setIsUploading(false);
                setIsProcessing(true);
                updateMessage("AI is processing your document...");

                // Simulate AI processing time
                setTimeout(() => {
                    updateFormParams({
                        propertyAddress: '123 AI Lane, Sandton',
                        propertyType: 'House',
                        bedrooms: '3',
                        bathrooms: '2',
                        totalPropertyValue: '1500000',
                        mortgageAmount: '1200000',
                        interestRate: '7.8',
                        homebuyerCreditScore: '720',
                        propertyDetails: 'A lovely family home with a garden and pool, pre-filled by our AI assistant.',
                    });
                    setIsProcessing(false);
                    updateMessage("Your form has been auto-populated. Please review and complete.");
                    setCurrentStep(2);
                }, 2000);
            } else {
                updateMessage("Image upload failed.");
                setIsUploading(false);
            }
        } catch (e) {
            console.log("Error during file upload", e);
            updateMessage("Upload failed. Please try again.");
            setIsUploading(false);
        }
    };

    const listNFT = async (e) => {
        e.preventDefault();

        try {
            updateMessage("Preparing to submit property...");

            // Validate required fields
            if (!formParams.buyerWalletAddress || !ethers.utils.isAddress(formParams.buyerWalletAddress)) {
                alert("Please enter a valid buyer wallet address");
                return;
            }

            if (!formParams.totalPropertyValue || !formParams.mortgageAmount) {
                alert("Please fill in property value and mortgage amount");
                return;
            }

            // Connect to wallet (Brave-compatible)
            const provider = getEthersProvider();
            await provider.send("eth_requestAccounts", []);
            const signer = getEthersSigner();

            // Get contract instances
            let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
            const brkTokenAddress = "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24";
            const brkTokenABI = require("../ERC20ABI.json");
            let brkContract = new ethers.Contract(brkTokenAddress, brkTokenABI, signer);

            // Calculate property parameters
            const totalPropertyValue = parseInt(formParams.totalPropertyValue);
            const totalBricks = totalPropertyValue; // 1 brick = R1
            const pricePerBrick = ethers.utils.parseUnits("1.0", "ether"); // R1.00 per brick
            const depositAmount = ethers.utils.parseUnits((totalPropertyValue * 0.2).toString(), "ether"); // 20% deposit
            const otpPeriodDays = parseInt(formParams.otpPeriodDays);

            // Create metadata JSON
            const metadataJSON = {
                name: formParams.propertyAddress,
                description: formParams.propertyDetails,
                image: fileURL || "https://via.placeholder.com/400",
                attributes: [
                    {trait_type: "Property Type", value: formParams.propertyType},
                    {trait_type: "Total Value", value: `R${totalPropertyValue.toLocaleString()}`},
                    {trait_type: "Bedrooms", display_type: "number", value: parseInt(formParams.bedrooms || 0)},
                    {trait_type: "Bathrooms", display_type: "number", value: parseInt(formParams.bathrooms || 0)},
                    {trait_type: "Interest Rate", value: `${formParams.interestRate}%`},
                    {trait_type: "Credit Score", value: formParams.homebuyerCreditScore}
                ],
                properties: {
                    propertyAddress: formParams.propertyAddress,
                    propertyType: formParams.propertyType,
                    totalBricks: totalBricks,
                    depositAmount: (totalPropertyValue * 0.2),
                    mortgageAmount: parseInt(formParams.mortgageAmount),
                    interestRate: parseFloat(formParams.interestRate),
                    buyerWallet: formParams.buyerWalletAddress,
                    otpPeriodDays: otpPeriodDays
                }
            };

            updateMessage("Uploading metadata to IPFS...");
            const metadataResponse = await uploadJSONToIPFS(metadataJSON);

            if (!metadataResponse.success) {
                alert("Metadata upload failed");
                updateMessage("");
                return;
            }

            const metadataURI = metadataResponse.pinataURL;

            // Approve 1000 BRK listing fee (with gasless support)
            const gaslessMode = isGaslessEnabled();
            updateMessage(`Approving 1000 BRK listing fee...${gaslessMode ? ' (gasless)' : ''}`);
            const listingFee = ethers.utils.parseUnits("1000", "ether");
            let approvalTx = await executeTransaction(brkContract, 'approve', [Marketplace.address, listingFee], signer);
            await approvalTx.wait();

            // Submit property (with gasless support)
            updateMessage(`Submitting property to blockchain...${gaslessMode ? ' (gasless)' : ''}`);
            let transaction = await executeTransaction(contract, 'submitProperty', [
                metadataURI,
                totalBricks,
                pricePerBrick,
                depositAmount,
                formParams.buyerWalletAddress,
                otpPeriodDays
            ], signer);

            await transaction.wait();

            alert(`Property successfully submitted! Status: PENDING\n\nBuyer (${formParams.buyerWalletAddress}) must pay R${(totalPropertyValue * 0.2).toLocaleString()} deposit to activate.\n\nOTP Period: ${otpPeriodDays} days`);
            updateMessage("");
            window.location.replace("/marketplace");

        } catch (e) {
            console.error("Error listing property:", e);
            alert("Failed to list property: " + (e.reason || e.message));
            updateMessage("");
        }
    };

    const steps = [
        { id: 1, name: 'OTP', icon: UploadCloud },
        { id: 2, name: 'Affordability & Background', icon: User },
        { id: 3, name: 'Pay Deposit', icon: DollarSign },
        { id: 4, name: 'List', icon: Check },
    ];

    return (
        <div className="min-h-screen bg-gray-100 w-full">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                        Finance Your Home
                    </h1>
                    <p className="text-lg text-gray-600">
                        Our AI-powered process makes it simple to get funding from investors.
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="mb-12">
                    <nav aria-label="Progress">
                        <ol className="grid grid-cols-4">
                            {steps.map((step, stepIdx) => (
                                <li key={step.name} className="relative">
                                    <div className="flex items-center">
                                        <div className="flex items-center text-sm font-medium">
                                            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${currentStep > step.id ? 'bg-primary' : currentStep === step.id ? 'border-2 border-primary bg-white' : 'border-2 border-gray-300 bg-white'}`}>
                                                {currentStep > step.id ? <Check className="w-6 h-6 text-white" /> : <span className={`${currentStep === step.id ? 'text-primary' : 'text-gray-500'}`}>{step.id}</span>}
                                            </div>
                                            <p className={`ml-4 ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}`}>{step.name}</p>
                                        </div>
                                        {stepIdx !== steps.length - 1 ? (
                                            <div className="hidden md:block absolute top-1/2 right-0 w-full h-0.5 bg-gray-200" />
                                        ) : null}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    {currentStep === 1 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Offer to Purchase (OTP)</h2>
                            <p className="text-gray-600 mb-6">Our AI will scan your document and pre-fill the application form for you.</p>
                            <div className="mt-4 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10">
                                <div className="text-center">
                                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary-dark">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileUpload} disabled={isUploading || isProcessing} />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs leading-5 text-gray-500">PDF, PNG, JPG up to 10MB</p>
                                </div>
                            </div>
                            {(isUploading || isProcessing) && (
                                <div className="mt-4 flex items-center justify-center text-gray-600">
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    <span>{message}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Property & Buyer Details</h2>
                            <p className="text-gray-600 mb-6">Please provide the buyer's wallet address and select the OTP period.</p>

                            <div className="space-y-6">
                                {/* Buyer Wallet Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Buyer Wallet Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="0x..."
                                        value={formParams.buyerWalletAddress}
                                        onChange={e => updateFormParams({...formParams, buyerWalletAddress: e.target.value})}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">The buyer who will pay the 20% deposit and monthly installments</p>
                                </div>

                                {/* OTP Period Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        OTP Period (Funding Deadline) <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={formParams.otpPeriodDays}
                                        onChange={e => updateFormParams({...formParams, otpPeriodDays: e.target.value})}
                                    >
                                        <option value="30">30 Days</option>
                                        <option value="60">60 Days</option>
                                        <option value="90">90 Days (Recommended)</option>
                                        <option value="120">120 Days</option>
                                        <option value="180">180 Days</option>
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">All investor bricks must be sold within this period or funds will be refunded</p>
                                </div>

                                {/* Deposit Calculation Display */}
                                {formParams.totalPropertyValue && (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h3 className="font-medium text-blue-900 mb-2">Calculated Values</h3>
                                        <div className="space-y-1 text-sm text-blue-800">
                                            <p><strong>Property Value:</strong> R{parseInt(formParams.totalPropertyValue).toLocaleString()}</p>
                                            <p><strong>Total Bricks:</strong> {parseInt(formParams.totalPropertyValue).toLocaleString()}</p>
                                            <p><strong>Buyer Deposit (20%):</strong> R{(parseInt(formParams.totalPropertyValue) * 0.2).toLocaleString()}</p>
                                            <p><strong>Investor Bricks (80%):</strong> {(parseInt(formParams.totalPropertyValue) * 0.8).toLocaleString()}</p>
                                            <p><strong>Funding Deadline:</strong> {formParams.otpPeriodDays} days from activation</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex justify-between">
                                <button type="button" onClick={() => setCurrentStep(1)} className="text-sm font-medium text-gray-700">Back</button>
                                <button type="button" onClick={() => setCurrentStep(3)} className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors flex items-center">
                                    Proceed to Next Step <ArrowRight className="w-5 h-5 ml-2" />
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pay Deposit</h2>
                            <p className="text-gray-600 mb-4">A small deposit is required to list your property. This covers administrative and legal costs.</p>
                             <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                                <p>This is a placeholder for the payment integration.</p>
                            </div>
                            <div className="mt-8 flex justify-between">
                                <button type="button" onClick={() => setCurrentStep(2)} className="text-sm font-medium text-gray-700">Back</button>
                                <button type="button" onClick={() => setCurrentStep(4)} className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors flex items-center">
                                    Confirm Deposit & Proceed <ArrowRight className="w-5 h-5 ml-2" />
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Final Review & List</h2>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between"><span className="text-gray-600">Property Address:</span><span className="font-medium text-gray-900">{formParams.propertyAddress}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Property Type:</span><span className="font-medium text-gray-900">{formParams.propertyType}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Bedrooms:</span><span className="font-medium text-gray-900">{formParams.bedrooms}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Property Value:</span><span className="font-medium text-gray-900">R{parseInt(formParams.totalPropertyValue || 0).toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Funding Required:</span><span className="font-medium text-gray-900">R{parseInt(formParams.mortgageAmount || 0).toLocaleString()}</span></div>
                            </div>
                            <div className="mt-8 flex justify-between">
                                <button type="button" onClick={() => setCurrentStep(3)} className="text-sm font-medium text-gray-700">Back</button>
                                <button type="button" onClick={listNFT} className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-dark transition-colors">
                                    Submit Listing
                                </button>
                            </div>
                            {message && <p className="text-center mt-4 text-gray-600">{message}</p>}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    )
}