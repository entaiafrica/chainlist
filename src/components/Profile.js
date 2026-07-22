import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState, useEffect, useCallback } from "react";
import NFTTile from "./NFTTile";
import { Wallet, Building, Landmark, Loader2, Edit2, Upload, X } from 'lucide-react';
import { Link } from "react-router-dom";
import Marketplace from '../Marketplace_new.json';
import { updateUserProfile, getUserProfile } from '../profileService';
import { uploadFileToIPFS } from '../pinata'; // Added for automatic profile picture upload
import WalletBalance from './WalletBalance';
import { getEthersSigner } from '../walletUtils';
import { GetIpfsUrlFromPinata } from "../utils";
const ethers = require("ethers");

export default function Profile() {
    const [data, updateData] = useState([]);
    const [listedData, setListedData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [address, updateAddress] = useState("0x");
    const [totalValue, setTotalValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('investments');
    const [isBuyer, setIsBuyer] = useState(false);
    const [buyerStats, setBuyerStats] = useState({
        totalPropertyValue: 0,
        totalMonthlyPayment: 0,
        avgYearsRemaining: 0
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        profilePicture: ''
    });
    const [editForm, setEditForm] = useState({
        name: '',
        profilePicture: null,
        profilePicturePreview: '',
        profilePictureUrl: ''
    });

    // Sample data for user's investments
    const sampleInvestments = [
        {
            "name": "Chic Sandton Apartment",
            "propertyAddress": "The Capital Empire, 177 Empire Pl, Sandhurst, Sandton, 2196",
            "totalPropertyValue": "2800000",
            "bricksToSell": "1200000",
            "annualYield": "7.2",
            "propertyRiskRating": "Low",
            "image": "ipfs://QmZa3TwJJMrQnCWZVGZ1K19ujNRAwf8gS4RphvDczYjA1s",
            "tokenId": "1",
            "ownedBricks": 5000,
        },
        {
            "name": "Umhlanga Beachfront Condo",
            "propertyAddress": "The Pearls of Umhlanga, 6 Lagoon Dr, Umhlanga, 4320",
            "totalPropertyValue": "8500000",
            "bricksToSell": "3000000",
            "annualYield": "6.8",
            "propertyRiskRating": "Low",
            "image": "ipfs://QmbzetqbEiiDuGK37sCiBuzHCKBWEPGqRbub6QWVjCMqrs",
            "tokenId": "3",
            "ownedBricks": 10000,
        },
    ];

    // Sample data for user's listed properties for financing
    const sampleListings = [
        {
            "name": "Secure Firstbrick Starter Home",
            "propertyAddress": "24 Aloe Park, Honeydew Manor, Roodepoort, 1724",
            "totalPropertyValue": "420000",
            "bricksToSell": "336000",
            "annualYield": "8.5",
            "propertyRiskRating": "Low",
            "image": "ipfs://QmcQw5eY4jauG3kCktM3xqLvjhLu19P8a4zUSigYJ1Sp1V",
            "tokenId": "4",
        }
    ];

    useEffect(() => {
        async function getNFTData() {
            setLoading(true);

            try {
                // Get wallet address using Brave-compatible provider
                const signer = getEthersSigner();
                const addr = await signer.getAddress();
                updateAddress(addr);

                // Get contract instance
                const contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);

                // Get all properties
                const allPropertyIds = await contract.getAllProperties();

                // Filter properties where user owns bricks
                const myInvestments = [];
                const myListings = [];
                let portfolioValue = 0;

                for (let tokenId of allPropertyIds) {
                    const brickBalance = await contract.balanceOf(addr, tokenId);
                    const propertyData = await contract.getPropertyData(tokenId);
                    const buyer = await contract.propertyBuyer(tokenId);
                    const isBuyer = buyer.toLowerCase() === addr.toLowerCase();

                    // Fetch metadata (shared for both buyers and investors)
                    const metadataURI = await contract.uri(tokenId);
                    let metadata;
                    try {
                        const httpMetadataURI = GetIpfsUrlFromPinata(metadataURI);
                        const response = await fetch(httpMetadataURI);
                        metadata = await response.json();
                    } catch (e) {
                        console.error("Error fetching metadata for token", tokenId, ":", e);
                        metadata = { name: `Property #${tokenId}`, description: "Metadata not found." };
                    }

                    const totalBricksNum = propertyData.totalBricks.toNumber();
                    const bricksAvailableNum = propertyData.bricksAvailable.toNumber();
                    const pricePerBrick = parseFloat(ethers.utils.formatEther(propertyData.pricePerBrick));
                    const depositAmount = parseFloat(ethers.utils.formatEther(propertyData.depositAmount));
                    const otpDeadline = propertyData.otpDeadline.toNumber();

                    // If user is the BUYER, add to listings only
                    if (isBuyer) {
                        const totalValue = totalBricksNum * pricePerBrick;
                        const mortgageAmount = totalValue - depositAmount;
                        const bricksSold = totalBricksNum - bricksAvailableNum;
                        const fundingProgress = ((bricksSold * pricePerBrick) / totalValue) * 100;

                        // Calculate mortgage details (assuming 20-year term, ~8% interest)
                        const monthlyInterestRate = 0.08 / 12;
                        const numberOfPayments = 20 * 12; // 20 years
                        const monthlyPayment = mortgageAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

                        // Calculate next payment date (assuming monthly payments starting from OTP deadline)
                        const now = Date.now() / 1000;
                        const monthsSinceOTP = Math.floor((now - otpDeadline) / (30 * 24 * 60 * 60));
                        const nextPaymentDate = otpDeadline + ((monthsSinceOTP + 1) * 30 * 24 * 60 * 60);
                        const paymentsRemaining = Math.max(0, numberOfPayments - monthsSinceOTP);
                        const yearsRemaining = (paymentsRemaining / 12).toFixed(1);

                        myListings.push({
                            name: metadata.name || "Property",
                            propertyAddress: metadata.properties?.propertyAddress || metadata.name || "Property",
                            image: metadata.properties?.images?.[0] || metadata.image || "",
                            images: metadata.properties?.images || (metadata.image ? [metadata.image] : []),
                            tokenId: tokenId.toString(),
                            totalBricks: totalBricksNum,
                            bricksAvailable: bricksAvailableNum,
                            bricksToSell: bricksAvailableNum.toString(),
                            pricePerBrick: pricePerBrick,
                            totalPropertyValue: totalBricksNum.toString(),
                            mortgageAmount: mortgageAmount,
                            depositAmount: depositAmount,
                            downPayment: depositAmount.toString(),
                            fundingProgress: fundingProgress,
                            annualYield: metadata.properties?.annualYield || "N/A",
                            propertyRiskRating: metadata.attributes?.find(a => a.trait_type === "Risk Rating")?.value || "N/A",
                            // Mortgage payment details
                            monthlyPayment: monthlyPayment,
                            nextPaymentDate: nextPaymentDate,
                            paymentsRemaining: paymentsRemaining,
                            yearsRemaining: yearsRemaining,
                            totalValue: totalValue
                        });
                    }
                    // If user owns bricks but is NOT the buyer, add to investments
                    else if (brickBalance.toNumber() > 0) {
                        const ownedBricks = brickBalance.toNumber();
                        const ownershipPercent = ((ownedBricks / totalBricksNum) * 100).toFixed(2);
                        const investmentValue = ownedBricks * pricePerBrick;

                        portfolioValue += investmentValue;

                        // Calculate returns (assuming property is funded)
                        const annualYield = parseFloat(metadata.properties?.annualYield || "7.5") / 100;
                        const monthlyReturn = (investmentValue * annualYield) / 12;
                        const totalValue = totalBricksNum * pricePerBrick;

                        // Calculate funded period (time since OTP deadline if property is funded)!
                        const now = Date.now() / 1000;
                        const fundedDays = Math.max(0, Math.floor((now - otpDeadline) / (24 * 60 * 60)));
                        const fundedMonths = Math.floor(fundedDays / 30);
                        const accumulatedReturn = monthlyReturn * fundedMonths;

                        myInvestments.push({
                            name: metadata.name || "Property",
                            propertyAddress: metadata.properties?.propertyAddress || metadata.name || "Property",
                            image: metadata.properties?.images?.[0] || metadata.image || "",
                            images: metadata.properties?.images || (metadata.image ? [metadata.image] : []),
                            tokenId: tokenId.toString(),
                            ownedBricks: ownedBricks,
                            totalBricks: totalBricksNum,
                            ownershipPercent: ownershipPercent,
                            investmentValue: investmentValue,
                            pricePerBrick: pricePerBrick,
                            bricksToSell: bricksAvailableNum.toString(),
                            totalPropertyValue: totalBricksNum.toString(),
                            mortgageAmount: (metadata.properties?.mortgageAmount || bricksAvailableNum).toString(),
                            annualYield: metadata.properties?.annualYield || "7.5",
                            propertyRiskRating: metadata.attributes?.find(a => a.trait_type === "Risk Rating")?.value || metadata.attributes?.find(a => a.trait_type === "Risk")?.value || "N/A",
                            userBricks: ownedBricks,
                            userInvestment: investmentValue,
                            // Investor return details
                            monthlyReturn: monthlyReturn,
                            accumulatedReturn: accumulatedReturn,
                            fundedMonths: fundedMonths,
                            fundedDays: fundedDays,
                            totalValue: totalValue
                        });
                    }
                }

                updateData(myInvestments);
                setListedData(myListings);
                setTotalValue(portfolioValue);

                // Determine if user is a buyer and calculate buyer stats
                if (myListings.length > 0) {
                    setIsBuyer(true);
                    const totalPropValue = myListings.reduce((sum, prop) => sum + (prop.totalValue || 0), 0);
                    const totalMonthly = myListings.reduce((sum, prop) => sum + (prop.monthlyPayment || 0), 0);
                    const avgYears = myListings.reduce((sum, prop) => sum + parseFloat(prop.yearsRemaining || 0), 0) / myListings.length;

                    setBuyerStats({
                        totalPropertyValue: totalPropValue,
                        totalMonthlyPayment: totalMonthly,
                        avgYearsRemaining: avgYears
                    });

                    // Set default tab to listings for buyers
                    if (myInvestments.length === 0) {
                        setActiveTab('listings');
                    }
                } else {
                    setIsBuyer(false);
                }

                updateFetched(true);
                setLoading(false);
            } catch (e) {
                console.error("Error fetching NFT data:", e);
                // Fall back to sample data on error
                updateAddress("0x1234...5678");
                updateData(sampleInvestments);
                setListedData(sampleListings);
                const total = sampleInvestments.reduce((acc, curr) => acc + (curr.ownedBricks * 1.05), 0);
                setTotalValue(total);
                updateFetched(true);
                setLoading(false);
            }
        }

        if (!dataFetched) {
            getNFTData();
        }
    }, [dataFetched]);

    useEffect(() => {
        async function fetchProfileData() {
            if (address && address !== "0x") {
                const profile = await getUserProfile(address);
                setProfileData(profile);
                setEditForm({
                    name: profile.name || '',
                    profilePictureUrl: profile.profilePicture || '',
                    profilePicturePreview: profile.profilePicture ? GetIpfsUrlFromPinata(profile.profilePicture) : '',
                    profilePictureFile: null
                });
            }
        }
        fetchProfileData();
    }, [address]);

    // Handle profile picture file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            const previewUrl = URL.createObjectURL(file);
            setEditForm(prev => ({
                ...prev,
                profilePictureFile: file, // Store the file object
                profilePicturePreview: previewUrl,
                profilePictureUrl: '' // Clear URL field
            }));
        }
    };

    // Handle profile picture URL change
    const handleUrlChange = (url) => {
        setEditForm({
            ...editForm,
            profilePictureUrl: url,
            profilePicturePreview: url,
            profilePictureFile: null // Clear file when URL is provided
        });
    };

    // Save profile
    const handleSaveProfile = async () => {
        try {
            let profilePictureUrl = editForm.profilePictureUrl || profileData.profilePicture;

            // Upload new profile picture if a file is in state
            if (editForm.profilePictureFile) {
                const uploadResponse = await uploadFileToIPFS(editForm.profilePictureFile);
                if (uploadResponse.success) {
                    // Extract IPFS hash and store in ipfs:// format for portability
                    const ipfsHashMatch = uploadResponse.pinataURL.match(/(?:\/ipfs\/|ipfs:\/\/|^)(Qm[a-zA-Z0-9]{44}|b[a-z0-9]{58,})/);
                    if (ipfsHashMatch && ipfsHashMatch[1]) {
                        profilePictureUrl = `ipfs://${ipfsHashMatch[1]}`;
                        console.log('✅ Profile picture uploaded to IPFS:', profilePictureUrl);
                    } else {
                        profilePictureUrl = uploadResponse.pinataURL;
                    }
                } else {
                    throw new Error(uploadResponse.message || 'IPFS upload failed');
                }
            }

            const newProfileData = {
                name: editForm.name || profileData.name,
                profilePicture: profilePictureUrl
            };

            console.log('💾 Saving profile data:', newProfileData);
            const success = await updateUserProfile(address, newProfileData);

            setProfileData(newProfileData);
            setShowEditModal(false);

            if (success) {
                alert('✅ Profile updated successfully!');
            } else {
                alert('⚠️ Profile saved locally but IPFS update may have failed. Please refresh.');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('❌ Failed to save profile: ' + error.message);
        }
    };
    const tabs = [
        { id: 'investments', label: 'My Investments', icon: Building },
        { id: 'listings', label: 'My Listings', icon: Landmark },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 w-full flex justify-center items-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-100 w-full">
            <Navbar />
            <div className="flex-grow max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 pt-20 flex flex-col">
                {/* Profile Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div className="mb-4 md:mb-0 flex items-start gap-4">
                            {/* Profile Picture */}
                            <div className="relative">
                                {profileData.profilePicture ? (
                                    <img
                                        src={GetIpfsUrlFromPinata(profileData.profilePicture)}
                                        alt="Profile"
                                        className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/image.png';
                                        }}
                                    />
                                ) : (<div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                                    {profileData.name ? profileData.name.charAt(0).toUpperCase() : address.substring(2, 4).toUpperCase()}
                                </div>
                                )}
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full hover:bg-primary-dark transition-colors shadow-lg"
                                >
                                    <Edit2 className="w-3 h-3" />
                                </button>
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                    {profileData.name || 'My Profile'}
                                </h1>
                                <div className="flex items-center text-gray-500 mb-2">
                                    <Wallet className="w-4 h-4 mr-2 flex-shrink-0" />
                                    <p className="font-mono text-xs break-all">{address}</p>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                        <span className="text-gray-600">Connected</span>
                                    </div>
                                    <div className="text-gray-500">
                                        Network: BrickChain
                                    </div>
                                    {isBuyer && (
                                        <div className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                                            BUYER
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats - Different for Buyers vs Investors */}
                        {isBuyer ? (
                            /* Buyer Stats - Show Mortgage Information */
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
                                <div className="text-center md:text-right md:border-r md:pr-4">
                                    <p className="text-sm text-gray-500 mb-1">Property Value</p>
                                    <p className="text-2xl font-bold text-primary">R{buyerStats.totalPropertyValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                </div>
                                <div className="text-center md:text-right md:border-r md:pr-4">
                                    <p className="text-sm text-gray-500 mb-1">Monthly Payment</p>
                                    <p className="text-2xl font-bold text-orange-600">R{buyerStats.totalMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                </div>
                                <div className="col-span-2 md:col-span-1 text-center md:text-right">
                                    <p className="text-sm text-gray-500 mb-1">Avg. Years Left</p>
                                    <p className="text-2xl font-bold text-gray-900">{buyerStats.avgYearsRemaining.toFixed(1)} yrs</p>
                                </div>
                            </div>
                        ) : (
                            /* Investor Stats - Show Investment Information */
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
                                <div className="text-center md:text-right md:border-r md:pr-4">
                                    <p className="text-sm text-gray-500 mb-1">Portfolio Value</p>
                                    <p className="text-2xl font-bold text-primary">R{totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className="text-center md:text-right md:border-r md:pr-4">
                                    <p className="text-sm text-gray-500 mb-1">Properties</p>
                                    <p className="text-2xl font-bold text-gray-900">{data.length}</p>
                                </div>
                                <div className="col-span-2 md:col-span-1 text-center md:text-right">
                                    <p className="text-sm text-gray-500 mb-1">Est. Monthly Returns</p>
                                    <p className="text-2xl font-bold text-gray-900">R{(totalValue * 0.008).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Wallet Balance */}
                <div className="mb-6">
                    <WalletBalance />
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-6">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5 mr-2" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto">
                    {activeTab === 'investments' && (
                        <div>
                            {data.length > 0 ? (
                                <>
                                    {/* Investment Summary Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                            <p className="text-sm text-gray-500 mb-1">Total Invested</p>
                                            <p className="text-2xl font-bold text-primary">R{totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                            <p className="text-sm text-gray-500 mb-1">Properties</p>
                                            <p className="text-2xl font-bold text-gray-900">{data.length}</p>
                                        </div>
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                            <p className="text-sm text-gray-500 mb-1">Total Bricks</p>
                                            <p className="text-2xl font-bold text-gray-900">{data.reduce((acc, curr) => acc + (curr.ownedBricks || 0), 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                            <p className="text-sm text-gray-500 mb-1">Avg. Ownership</p>
                                            <p className="text-2xl font-bold text-gray-900">{(data.reduce((acc, curr) => acc + parseFloat(curr.ownershipPercent || 0), 0) / data.length).toFixed(2)}%</p>
                                        </div>
                                    </div>

                                    {/* Property Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {data.map((value, index) => (
                                            <NFTTile data={value} key={index} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">You have no investments yet.</h3>
                                    <p className="text-gray-500 mb-6">Start building your property portfolio today.</p>
                                    <Link to="/marketplace" className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors">
                                        Browse Properties
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'listings' && (
                        <div>
                            {listedData.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {listedData.map((value, index) => (
                                        <NFTTile data={value} key={index} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">You have no properties listed.</h3>
                                    <p className="text-gray-500 mb-6">Get funding for your home by listing it on the marketplace.</p>
                                    <Link to="/sellNFT" className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors">
                                        List a Property
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>

                        <div className="space-y-5">
                            {/* Profile Picture Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Profile Picture
                                </label>
                                <div className="flex items-center gap-4 mb-3">
                                    {editForm.profilePicturePreview ? (
                                        <img
                                            src={editForm.profilePicturePreview}
                                            alt="Preview"
                                            className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                                            {editForm.name ? editForm.name.charAt(0).toUpperCase() : address.substring(2, 4).toUpperCase()}
                                        </div>
                                    )}
                                    <label className="flex-1 cursor-pointer">
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                                            <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                            <p className="text-sm text-gray-600">
                                                Click to upload
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                PNG, JPG (max 5MB)
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {/* Divider */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex-1 h-px bg-gray-200"></div>
                                    <span className="text-xs text-gray-500 font-medium">OR</span>
                                    <div className="flex-1 h-px bg-gray-200"></div>
                                </div>

                                {/* Profile Picture URL */}
                                <input
                                    type="url"
                                    value={editForm.profilePictureUrl}
                                    onChange={(e) => handleUrlChange(e.target.value)}
                                    placeholder="Enter image URL (e.g., https://example.com/avatar.jpg)"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm text-gray-900"
                                />
                            </div>

                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900"
                                    maxLength={50}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    className="flex-1 px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    )
};
