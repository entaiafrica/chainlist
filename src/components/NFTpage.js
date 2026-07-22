import Navbar from "./Navbar";
import Footer from "./Footer";
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import { BedDouble, Bath, Calendar, PieChart, User, FileText, MapPin, Loader2, Users, Copy, Check, Wallet, Store, Percent, Calculator, ChevronDown, ChevronLeft, ChevronRight, Map as MapIcon, Globe, ExternalLink } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import Marketplace from '../Marketplace_new.json';
import { getUserProfile } from '../profileService';
import { executeTransaction, isGaslessEnabled } from '../utils/gasless';
import { isWalletInstalled, getEthersProvider, getEthersSigner, getPreferredProvider, isIOS, getIOSInstructions } from '../walletUtils';
import { getWalletLogo } from '../utils/tokenLogo';
const ethers = require("ethers");

const getInitials = (nameOrAddress) => {
    if (!nameOrAddress) return '?';
    if (nameOrAddress.startsWith('0x')) return nameOrAddress.substring(2, 4).toUpperCase();
    const parts = nameOrAddress.trim().split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : nameOrAddress.substring(0, 2).toUpperCase();
};

export default function NFTPage() {
    const [data, updateData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [activeImage, setActiveImage] = useState(0);
    const [bricksToBuy, setBricksToBuy] = useState(100);
    const [message, setMessage] = useState('');
    const [isHovering, setIsHovering] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Auto-scroll images
    useEffect(() => {
        if (!data?.images || data.images.length <= 1 || isHovering) return;
        const interval = setInterval(() => {
            setActiveImage((prev) => (prev + 1) % data.images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [data, isHovering]);

    const nextImage = (e) => {
        e.stopPropagation();
        if (data?.images) {
            setActiveImage((prev) => (prev + 1) % data.images.length);
        }
    };

    const prevImage = (e) => {
        e.stopPropagation();
        if (data?.images) {
            setActiveImage((prev) => (prev === 0 ? data.images.length - 1 : prev - 1));
        }
    };

    // Touch handlers for swipe
    const handleTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextImage({ stopPropagation: () => { } });
        }
        if (isRightSwipe) {
            prevImage({ stopPropagation: () => { } });
        }
    };
    const [userBrickBalance, setUserBrickBalance] = useState(0);
    const [copiedContract, setCopiedContract] = useState(false);
    const [copiedTokenId, setCopiedTokenId] = useState(false);
    const [currentUserAddress, setCurrentUserAddress] = useState('');
    const [brkBalance, setBrkBalance] = useState("0");
    const [profiles, setProfiles] = useState({});
    const [profilesLoading, setProfilesLoading] = useState(true);
    const [mapMode, setMapMode] = useState('map'); // 'map' or 'street'


    const params = useParams();
    const tokenId = params.propertyAddress || params.tokenId;

    useEffect(() => {
        async function fetchPropertyData() {
            setLoading(true);
            try {
                let provider;
                try {
                    if (isWalletInstalled()) {
                        provider = getEthersProvider();
                    } else {
                        throw new Error("Wallet not available");
                    }
                } catch (err) {
                    provider = new ethers.providers.StaticJsonRpcProvider("https://rpc.firstbrick.cloud", {
                        chainId: 12786,
                        name: 'BrickChain'
                    });
                }

                const contract = new ethers.Contract(Marketplace.address, Marketplace.abi, provider);
                const tokenIdNum = parseInt(tokenId);
                if (isNaN(tokenIdNum)) {
                    throw new Error("Invalid token ID");
                }

                let propertyData;
                try {
                    propertyData = await contract.getPropertyData(tokenIdNum);
                } catch (error) {
                    console.error(`Error getting property data for token ${tokenIdNum}:`, error.message);
                    throw new Error(`Property with ID ${tokenIdNum} does not exist or is invalid: ${error.message}`);
                }

                const rawMetadataURI = await contract.uri(tokenIdNum);
                const buyer = await contract.propertyBuyer(tokenIdNum);

                let metadata = {};
                try {
                    const httpMetadataURI = GetIpfsUrlFromPinata(rawMetadataURI);
                    if (!httpMetadataURI) throw new Error("Invalid metadata URI");
                    const response = await fetch(httpMetadataURI);
                    if (!response.ok) throw new Error("HTTP error");
                    metadata = await response.json();
                } catch (err) { }

                const investors = [];
                const depositAmount = parseFloat(ethers.utils.formatEther(propertyData.depositAmount));
                const pricePerBrick = parseFloat(ethers.utils.formatEther(propertyData.pricePerBrick));
                const buyerBricks = depositAmount / pricePerBrick;

                try {
                    const trustWallet = await contract.propertyTrustWallet(tokenIdNum);
                    const investorAddresses = await contract.getInvestorList(tokenIdNum);
                    for (const address of investorAddresses) {
                        try {
                            if (address.toLowerCase() === trustWallet.toLowerCase()) continue;
                            const balance = await contract.balanceOf(address, tokenIdNum);
                            const bricks = parseInt(ethers.utils.formatUnits(balance, 0));
                            if (bricks > 0) {
                                investors.push({
                                    address: address,
                                    bricks: bricks,
                                    amount: bricks * pricePerBrick
                                });
                            }
                        } catch (e) { }
                    }
                    investors.sort((a, b) => b.bricks - a.bricks);
                } catch (err) { }

                const totalBricksValue = ethers.utils.formatUnits(propertyData.totalBricks, 0);
                const bricksAvailableValue = ethers.utils.formatUnits(propertyData.bricksAvailable, 0);
                const pricePerBrickValue = ethers.utils.formatEther(propertyData.pricePerBrick);
                const propertyTypeValue = metadata.attributes?.find(a => a.trait_type === "Property Type")?.value || "Property";
                const isCommercial = propertyTypeValue.toLowerCase().includes("commercial");

                const combinedData = {
                    name: metadata.name || "Property #" + tokenId,
                    propertyAddress: metadata.properties?.propertyAddress || "Address not available",
                    gps: metadata.properties?.gps || "",
                    images: metadata.properties?.images || (metadata.image ? [metadata.image] : []),
                    propertyType: propertyTypeValue,
                    isCommercial: isCommercial,
                    propertySubType: metadata.properties?.propertySubType || "",
                    bedrooms: metadata.attributes?.find(a => a.trait_type === "Bedrooms")?.value || "N/A",
                    bathrooms: metadata.attributes?.find(a => a.trait_type === "Bathrooms")?.value || "N/A",
                    gla: metadata.properties?.gla || metadata.attributes?.find(a => a.trait_type === "GLA")?.value || "N/A",
                    occupancyRate: metadata.properties?.occupancyRate || metadata.attributes?.find(a => a.trait_type === "Occupancy Rate")?.value || "N/A",
                    numberOfTenants: metadata.properties?.numberOfTenants || metadata.attributes?.find(a => a.trait_type === "Number of Tenants")?.value || "N/A",
                    nettAnnualIncome: metadata.properties?.nettAnnualIncome || metadata.attributes?.find(a => a.trait_type === "Annual Income")?.value || "N/A",
                    monthlyIncome: (() => {
                        const totalValue = parseFloat(totalBricksValue) * parseFloat(pricePerBrickValue);
                        const yieldVal = parseFloat(metadata.properties?.annualYield || "12");
                        return Math.round((totalValue * (yieldVal / 100)) / 12);
                    })(),
                    majorTenants: metadata.properties?.majorTenants || [],
                    propertyManager: metadata.properties?.propertyManager || null,
                    yearBuilt: metadata.attributes?.find(a => a.trait_type === "Year Built")?.value || "N/A",
                    propertyDetails: metadata.description || "No description available",
                    totalPropertyValue: (metadata.properties?.totalBricks || totalBricksValue).toString(),
                    bricksToSell: bricksAvailableValue,
                    pricePerBrick: pricePerBrickValue,
                    mortgageAmount: (metadata.properties?.mortgageAmount || metadata.properties?.bricksForInvestors || bricksAvailableValue).toString(),
                    mortgageTerm: (metadata.properties?.mortgageTerm || metadata.properties?.investmentTerm || "15").toString(),
                    downPayment: (metadata.properties?.downPayment || metadata.properties?.bricksForBuyer || (propertyData.totalBricks.sub(propertyData.bricksAvailable)).toString()).toString(),
                    annualYield: metadata.properties?.annualYield?.toString() || "10",
                    propertyAppreciation: metadata.properties?.propertyAppreciation?.toString() || "5",
                    propertyRiskRating: metadata.attributes?.find(a => a.trait_type === "Risk Rating")?.value,
                    status: propertyData.status,
                    totalBricks: totalBricksValue,
                    buyer: buyer,
                    buyerDeposit: buyerBricks,
                    buyerDepositAmount: depositAmount,
                    investors: investors,
                    otpDeadline: propertyData.otpDeadline.toString(),
                    // Homebuyer fields will be populated dynamically from profile service in the render
                    interestRate: (metadata.properties?.interestRate || "12").toString(),
                };

                if (tokenId === "1") {
                    combinedData.gps = "-26.032475162544433, 27.967247759085883"; // Blandford Rd, Noordhang
                }

                if (tokenId === "2") {
                    combinedData.occupancyRate = "93.12";
                    combinedData.numberOfTenants = "43";
                    combinedData.majorTenants = [
                        { "name": "Pick n Pay Hypermarket" }, { "name": "Mega World" }, { "name": "FNB" }, { "name": "ABSA" },
                        { "name": "Nedbank" }, { "name": "Capitec" }, { "name": "OBC Chicken" }, { "name": "Dis-chem" },
                        { "name": "Clicks" }, { "name": "SA Post Office" }, { "name": "Pep" }, { "name": "Ackermans" }, { "name": "KFC" }
                    ];
                    combinedData.gps = "-26.24611, 28.09611";
                }

                updateData(combinedData);

                try {
                    const signer = provider.getSigner();
                    const address = await signer.getAddress();
                    setCurrentUserAddress(address);
                    const balance = await contract.balanceOf(address, tokenIdNum);
                    setUserBrickBalance(ethers.utils.formatUnits(balance, 0));
                    const brkAbi = ["function balanceOf(address) view returns (uint256)"];
                    const brkContract = new ethers.Contract("0x5b1869D9A4C187F2EAa108f3062412ecf0526b24", brkAbi, provider);
                    const brkBal = await brkContract.balanceOf(address);
                    setBrkBalance(ethers.utils.formatEther(brkBal));
                } catch (err) {
                    setCurrentUserAddress('');
                    setUserBrickBalance(0);
                    setBrkBalance("0");
                }
                setLoading(false);
            } catch (error) {
                setLoading(false);
                let errorMsg = "Error loading property data from blockchain.\n\n";
                if (error.message.includes("invalid BigNumber")) errorMsg += "Issue: Invalid token ID format\n";
                else if (error.message.includes("network")) errorMsg += "Issue: Network connection problem\nPlease make sure MetaMask is connected to BrickChain network (Chain ID 12786)\n";
                else if (error.message.includes("does not exist") || error.message.includes("revert")) errorMsg += `Token ID ${tokenId} may not exist yet.\n`;
                else errorMsg += `Issue: ${error.message}\n`;
                alert(errorMsg);
            }
        }
        fetchPropertyData();
    }, [tokenId]);

    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash === 'investors') {
            setActiveTab('investors');
            // Scroll to details section roughly
            const detailsSection = document.getElementById('details-section');
            if (detailsSection) detailsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, [data]); // Run when data loads

    useEffect(() => {
        const loadProfiles = async () => {
            if (!data) return;
            setProfilesLoading(true);
            const addresses = new Set();
            if (data.buyer) addresses.add(data.buyer);
            data.investors.forEach(inv => addresses.add(inv.address));

            // Parallel loading for better performance
            const profilePromises = Array.from(addresses).map(async (address) => {
                const profile = await getUserProfile(address);
                return { address: address.toLowerCase(), profile };
            });

            const profileResults = await Promise.all(profilePromises);
            const loadedProfiles = {};
            profileResults.forEach(({ address, profile }) => {
                loadedProfiles[address] = profile;
            });

            setProfiles(loadedProfiles);
            setProfilesLoading(false);
        };

        if (activeTab === 'investors' || data) {
            loadProfiles();
        }

        const handleProfileUpdate = () => {
            console.log("♻️ Profile update detected, reloading profiles...");
            loadProfiles();
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
    }, [activeTab, data]);

    const copyToClipboard = async (text, setCopied) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) { console.error('Failed to copy keys', err); }
    };

    const addToMetaMask = async () => {
        try {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            let provider = null;

            if (isMobile && window.ethereum) {
                provider = window.ethereum;
            } else {
                const preferredProvider = getPreferredProvider();
                if (preferredProvider) provider = preferredProvider.provider;
                else if (window.ethereum) provider = window.ethereum;
            }

            if (!provider) {
                alert('Wallet not found. Please open in MetaMask app browser.');
                return;
            }

            const tokenIdNum = parseInt(tokenId);
            let nftImage = undefined;

            // Try to get image for wallet display
            if (data.images && data.images[0]) {
                const httpImageUrl = GetIpfsUrlFromPinata(data.images[0]);
                if (httpImageUrl) try { nftImage = await getWalletLogo(httpImageUrl); } catch (e) { nftImage = httpImageUrl; }
            }
            if (!nftImage && data.image) {
                const httpImageUrl = GetIpfsUrlFromPinata(data.image);
                if (httpImageUrl) try { nftImage = await getWalletLogo(httpImageUrl); } catch (e) { }
            }

            // Attempt automatic addition (Standard EIP-747)
            try {
                // Try as ERC721 first (Supported by some mobile wallets now)
                await provider.request({
                    method: 'wallet_watchAsset',
                    params: {
                        type: 'ERC721',
                        options: {
                            address: Marketplace.address,
                            tokenId: tokenIdNum.toString(),
                            symbol: 'BRICK',
                            decimals: 0,
                            image: nftImage,
                            name: data.name || `Brick #${tokenIdNum}`
                        }
                    }
                });
                alert('Request sent! Check your wallet.');
            } catch (erc721Error) {
                console.warn("ERC721 watch failed, trying ERC1155 fallback:", erc721Error);
                try {
                    // Try as ERC1155 (Specific for Fractional/Editions)
                    await provider.request({
                        method: 'wallet_watchAsset',
                        params: {
                            type: 'ERC1155',
                            options: {
                                address: Marketplace.address,
                                tokenId: tokenIdNum.toString(),
                                symbol: 'BRICK',
                                decimals: 0,
                                image: nftImage,
                                name: data.name || `Brick #${tokenIdNum}`
                            }
                        }
                    });
                    alert('Request sent! Check your wallet.');
                } catch (erc1155Error) {
                    console.warn("ERC1155 watch failed, trying ERC20 fallback:", erc1155Error);
                    // Fallback to ERC20 (More widely supported on older mobile versions)
                    try {
                        await provider.request({
                            method: 'wallet_watchAsset',
                            params: {
                                type: 'ERC20',
                                options: {
                                    address: Marketplace.address,
                                    symbol: 'BRICK',
                                    decimals: 0,
                                    image: nftImage,
                                    name: data.name || `Brick #${tokenIdNum}`
                                }
                            }
                        });
                        alert('Request sent (Legacy Mode)! Check your wallet.');
                    } catch (e) {
                        console.error("All wallet add attempts failed:", e);
                        // Final fallback: Show manual details
                        alert(`Could not add automatically.\n\nContract: ${Marketplace.address}\nToken ID: ${tokenIdNum}`);
                    }
                }
            }
        } catch (error) {
            console.error("addToMetaMask error:", error);
            alert('Failed to initiate wallet request.');
        }
    };

    const buyBricks = async () => {
        try {
            if (bricksToBuy < 100) { alert('Minimum purchase is 100 bricks'); return; }
            setMessage("Connecting to wallet...");
            const provider = getEthersProvider();
            await provider.send("eth_requestAccounts", []);
            const signer = getEthersSigner();
            const userAddress = await signer.getAddress();
            const contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
            const brkTokenAddress = "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24";
            const brkTokenABI = require("../ERC20ABI.json");
            const brkContract = new ethers.Contract(brkTokenAddress, brkTokenABI, signer);
            if (!data || !data.pricePerBrick || data.pricePerBrick === "N/A") { alert("Error: Property data issue."); setMessage(""); return; }
            const pricePerBrick = ethers.utils.parseUnits(data.pricePerBrick.toString(), 'ether');
            const totalCost = pricePerBrick.mul(bricksToBuy);
            const brkBalance = await brkContract.balanceOf(userAddress);
            if (brkBalance.lt(totalCost)) {
                alert(`Insufficient BRK tokens! Required: ${parseFloat(ethers.utils.formatEther(totalCost)).toLocaleString()} BRK`);
                setMessage(""); return;
            }
            const gaslessMode = isGaslessEnabled();
            setMessage(`Approving BRK...${gaslessMode ? ' (gasless)' : ''}`);
            const approveTx = await executeTransaction(brkContract, 'approve', [Marketplace.address, totalCost], signer);
            await approveTx.wait();
            setMessage(`Purchasing bricks...${gaslessMode ? ' (gasless)' : ''}`);
            const tokenIdNum = parseInt(tokenId);
            const buyTx = await executeTransaction(contract, 'buyBricks', [tokenIdNum, bricksToBuy], signer);
            await buyTx.wait();
            alert(`Successfully purchased ${bricksToBuy} bricks!`);
            setMessage("");
            window.location.reload();
        } catch (error) {
            console.error("Error buying bricks:", error);
            alert("Transaction failed: " + error.message);
            setMessage("");
        }
    };

    const activateProperty = async () => {
        try {
            setMessage("Activating property...");
            const provider = getEthersProvider();
            await provider.send("eth_requestAccounts", []);
            const signer = getEthersSigner();
            const contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
            const brkTokenAddress = "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24";
            const brkContract = new ethers.Contract(brkTokenAddress, ["function approve(address spender, uint256 amount) returns (bool)"], signer);
            const tokenIdNum = parseInt(tokenId);
            const depositAmount = ethers.utils.parseUnits(data.buyerDepositAmount.toString(), 'ether');
            const gaslessMode = isGaslessEnabled();
            setMessage(`Approving deposit...${gaslessMode ? ' (gasless)' : ''}`);
            const approveTx = await executeTransaction(brkContract, 'approve', [Marketplace.address, depositAmount], signer);
            await approveTx.wait();
            setMessage(`Activating property...${gaslessMode ? ' (gasless)' : ''}`);
            const activateTx = await executeTransaction(contract, 'payDeposit', [tokenIdNum], signer);
            await activateTx.wait();
            alert(`Property activated successfully!`);
            setMessage("");
            window.location.reload();
        } catch (error) {
            alert("Activation failed: " + error.message);
            setMessage("");
        }
    };

    if (loading || !data) {
        return (
            <div className="h-screen w-full flex justify-center items-center bg-gray-900 text-white">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    // Calculations
    // Consistent Percentage Calculation (matches Marketplace.js and Landing.js)
    const totalValue = parseFloat(data.totalPropertyValue || 0) * parseFloat(data.pricePerBrick || 0);
    const raised = (data.investors?.reduce((sum, inv) => sum + inv.amount, 0) || 0) + (data.buyerDeposit ? data.buyerDeposit * parseFloat(data.pricePerBrick || 0) : 0);
    const fundedPercentage = totalValue > 0 ? (raised / totalValue) * 100 : 0;

    const pricePerBrickNum = parseFloat(data.pricePerBrick || 0);
    const totalPrice = (bricksToBuy * pricePerBrickNum).toFixed(2);

    // Calculator Logic (Integrated into Purchase)
    // Loan is 12%, 2% platform fee, 10% to investors.
    const monthlyReturn = (totalPrice * 0.10) / 12;
    const annualReturn = totalPrice * 0.10;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FileText },
        { id: 'financials', label: 'Financials', icon: PieChart },
        { id: 'investors', label: 'Investors', icon: Users },
        { id: 'homebuyer', label: 'Homebuyer', icon: User },
    ];

    // Main Vertical Scroll Layout
    return (
        <div className="md:snap-none md:h-auto md:overflow-visible h-screen w-full snap-y snap-mandatory overflow-y-scroll overflow-x-hidden selection:bg-primary selection:text-white">
            <Navbar />

            {/* SECTION 1: HERO (Image + Key Stats) */}
            <section className="h-screen w-full snap-start flex flex-col relative bg-gray-900">
                {/* Image: 2/3 of screen */}
                <div
                    className="h-2/3 relative group"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Carousel Background */}
                    <div className="absolute inset-0 z-0 bg-black">
                        {data.images.map((img, index) => (
                            <img
                                key={index}
                                src={GetIpfsUrlFromPinata(img)?.replace(/Crop\d+x\d+/, 'Ensure1280x720') || '/static-images/366774723'}
                                alt={`${data.name} ${index + 1}`}
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === activeImage ? 'opacity-100' : 'opacity-0'}`}
                                onError={(e) => { e.target.src = '/static-images/366774723'; }}
                            />
                        ))}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                    </div>

                    {/* Image Navigation Arrows */}
                    {data.images && data.images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-all z-20 opacity-0 group-hover:opacity-100"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                            <button
                                onClick={nextImage}
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-all z-20 opacity-0 group-hover:opacity-100"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>


                        </>
                    )}
                </div>

                {/* Info: 1/3 of screen */}
                <div className="h-1/3 relative z-10 flex flex-col justify-center px-4 pb-4 -mt-8">
                    <div className="bg-black/80 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/10 w-full max-w-lg mx-auto">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-1">{data.name}</h1>
                                <p className="text-gray-400 text-sm flex items-center gap-1"><MapPin size={14} className="text-primary" /> {data.location || data.propertyAddress}</p>
                            </div>
                            <span className="bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider h-fit mt-1">
                                {data.isCommercial ? 'Commercial' : 'Residential'}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Progress</span>
                                <span className="text-white font-semibold">{fundedPercentage.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${Math.min(fundedPercentage, 100)}%` }}></div>
                            </div>
                        </div>

                        {/* Compact Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 mb-4 text-white">
                            <div className="bg-blue-600/20 backdrop-blur-sm p-2 rounded-lg border border-blue-500/30">
                                <p className="text-[10px] uppercase text-blue-200 font-medium leading-tight">Value</p>
                                <p className="text-sm font-bold leading-tight">R{totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                            <div className="bg-green-600/20 backdrop-blur-sm p-2 rounded-lg border border-green-500/30">
                                <p className="text-[10px] uppercase text-green-200 font-medium leading-tight">Raised</p>
                                <p className="text-sm font-bold leading-tight">R{raised.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                            <div className="bg-orange-600/20 backdrop-blur-sm p-2 rounded-lg border border-orange-500/30">
                                <p className="text-[10px] uppercase text-orange-200 font-medium leading-tight">Yield</p>
                                <p className="text-sm font-bold leading-tight">12%</p>
                            </div>
                        </div>

                        <button
                            onClick={() => document.getElementById('investment-panel').scrollIntoView({ behavior: 'smooth' })}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95 text-sm"
                        >
                            INVEST NOW
                        </button>
                    </div>
                </div>
            </section>

            {/* SECTION 2: ACTION (Integrated Investment) */}
            <section id="investment-panel" className="min-h-screen md:min-h-0 w-full snap-start relative bg-gray-900 flex flex-col justify-center items-center p-4 md:py-24">
                <div className="w-full max-w-4xl mx-auto flex justify-center items-center h-full pt-16 md:pt-0">

                    {/* Integrated Investment Action Panel */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl text-gray-900 w-full max-w-lg relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-8 -mt-8 z-0"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Buy Bricks</h2>
                                    <p className="text-sm text-gray-500">Invest in this property</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Price per Brick</p>
                                    <p className="text-xl font-bold text-primary">R{parseFloat(data.pricePerBrick).toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Funding Progress</span>
                                    <span className="text-sm font-bold text-primary">{fundedPercentage.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div className="bg-primary h-3 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(106,69,255,0.5)]" style={{ width: `${fundedPercentage}%` }}></div>
                                </div>
                            </div>

                            <div className="space-y-6 mb-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">How many bricks?</label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setBricksToBuy(Math.max(100, bricksToBuy - 100))}
                                            className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xl transition-colors"
                                        >-</button>
                                        <div className="flex-1 relative">
                                            <input
                                                type="number"
                                                value={bricksToBuy}
                                                onChange={(e) => setBricksToBuy(Math.max(0, parseInt(e.target.value) || 0))}
                                                className="w-full bg-gray-50 border-2 border-gray-200 focus:border-primary rounded-xl py-3 px-4 text-center text-xl font-bold outline-none transition-all"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">BRICKS</span>
                                        </div>
                                        <button
                                            onClick={() => setBricksToBuy(bricksToBuy + 100)}
                                            className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xl transition-colors"
                                        >+</button>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                        <span className="text-gray-600 font-medium">Total Investment</span>
                                        <span className="text-2xl font-bold text-gray-900">R{parseFloat(totalPrice).toLocaleString()}</span>
                                    </div>

                                    {/* Integrated Returns Display */}
                                    <div className="grid grid-cols-2 gap-4 pt-1">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Est. Monthly</p>
                                            <p className="text-lg font-bold text-green-600">+R{monthlyReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase">Est. Annual</p>
                                            <p className="text-lg font-bold text-green-600">+R{annualReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Wallet Balance Check */}
                                <div className="flex justify-between items-center text-xs font-medium bg-blue-50 text-blue-800 px-3 py-2 rounded-lg">
                                    <div className="flex items-center gap-1.5">
                                        <Wallet className="w-3 h-3" />
                                        <span>Wallet Balance:</span>
                                    </div>
                                    <span className={parseFloat(brkBalance) < parseFloat(totalPrice) ? "text-red-500 font-bold" : "text-blue-900 font-bold"}>
                                        {parseFloat(brkBalance).toLocaleString(undefined, { maximumFractionDigits: 0 })} BRK
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={buyBricks}
                                disabled={message !== ''}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-primary/30 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                            >
                                {message || 'Invest Now'}
                            </button>

                            {currentUserAddress && data.buyer?.toLowerCase() === currentUserAddress.toLowerCase() && data.status === 0 && (
                                <button
                                    onClick={activateProperty}
                                    disabled={message !== ''}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow hover:shadow-lg disabled:opacity-50"
                                >
                                    {message || 'Activate Property (Pay Deposit)'}
                                </button>
                            )}
                            <p className="text-xs text-center text-gray-500 mt-4 bg-gray-100 p-2 rounded-lg leading-relaxed">
                                <span className="font-bold text-gray-700">Fair Yield Policy:</span> 12% Gross Yield - 2% Platform Fee = <span className="text-green-600 font-bold">10% Net Return</span>
                            </p>
                            <p className="text-[10px] text-center text-gray-400 mt-2">Minimum investment 100 bricks.</p>
                        </div>
                    </div>
                </div>
            </section >

            {/* SECTION 3: DETAILS (Tabs: Overview, Financials, Investors) */}
            < section id="details-section" className="min-h-screen md:min-h-0 w-full snap-start bg-white text-gray-900 py-16 px-4 md:py-24 md:px-8" >
                <div className="max-w-7xl mx-auto pt-16 md:pt-0">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4">
                        <h2 className="text-3xl font-bold text-black mb-4 md:mb-0">Property Details</h2>
                        {/* Tabs Navigation */}
                        <div className="flex space-x-1 md:space-x-2 bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4 mr-2" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content Container */}
                    <div className="min-h-[600px]">
                        {/* REUSING EXISTING CONTENT BLOCKS BUT ADAPTED STYLES */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up">
                                <div className="md:col-span-2 space-y-6">
                                    <h3 className="text-2xl font-bold">About the Property</h3>
                                    <p className="text-gray-600 leading-7 text-lg">{data.propertyDetails}</p>

                                    {/* Map Embed and Street View Toggle */}
                                    {data.gps && (
                                        <div className="rounded-xl overflow-hidden border border-gray-200 mt-6 shadow-md bg-white">
                                            {/* Map Controls */}
                                            <div className="flex border-b border-gray-200">
                                                <button
                                                    onClick={() => setMapMode('map')}
                                                    className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mapMode === 'map' ? 'bg-gray-100 text-primary' : 'hover:bg-gray-50 text-gray-600'}`}
                                                >
                                                    <MapIcon className="w-4 h-4" /> Map View
                                                </button>
                                                <button
                                                    onClick={() => setMapMode('street')}
                                                    className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mapMode === 'street' ? 'bg-gray-100 text-primary' : 'hover:bg-gray-50 text-gray-600'}`}
                                                >
                                                    <Globe className="w-4 h-4" /> Street View
                                                </button>
                                            </div>

                                            {/* Map Container */}
                                            <div className="h-64 md:h-80 relative bg-gray-100">
                                                {mapMode === 'map' ? (
                                                    <iframe
                                                        title="Property Location"
                                                        width="100%"
                                                        height="100%"
                                                        frameBorder="0"
                                                        scrolling="no"
                                                        marginHeight="0"
                                                        marginWidth="0"
                                                        src={`https://maps.google.com/maps?q=${data.gps}&hl=en&z=15&output=embed`}
                                                    ></iframe>
                                                ) : (
                                                    <iframe
                                                        title="Property Street View"
                                                        width="100%"
                                                        height="100%"
                                                        frameBorder="0"
                                                        scrolling="no"
                                                        marginHeight="0"
                                                        marginWidth="0"
                                                        src={`https://maps.google.com/maps?q=${data.gps}&layer=c&cbll=${data.gps}&cbp=12,0,0,0,0&z=18&output=svembed`}
                                                    ></iframe>
                                                )}
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${data.gps}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute bottom-2 right-2 bg-white/90 backdrop-blur text-xs px-2 py-1 rounded shadow text-gray-600 hover:text-primary z-10"
                                                >
                                                    Open in Google Maps ↗
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                        <h4 className="font-bold text-gray-900 mb-4">Features</h4>
                                        <div className="space-y-3">
                                            {data.isCommercial ? (
                                                <>
                                                    <div className="flex justify-between"><span className="text-gray-500">GLA</span><span className="font-bold">{data.gla}</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-500">Occupancy</span><span className="font-bold">{data.occupancyRate}%</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-500">Tenants</span><span className="font-bold">{data.numberOfTenants}</span></div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between"><span className="text-gray-500">Bedrooms</span><span className="font-bold">{data.bedrooms}</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-500">Bathrooms</span><span className="font-bold">{data.bathrooms}</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-500">Year Built</span><span className="font-bold">{data.yearBuilt}</span></div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {data.isCommercial && data.majorTenants?.length > 0 && (
                                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                            <h4 className="font-bold text-gray-900 mb-4">Major Tenants</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {data.majorTenants.map((t, i) => (
                                                    <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">{t.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                        <h4 className="font-bold text-gray-900 mb-4">NFT Details</h4>
                                        <button
                                            onClick={addToMetaMask}
                                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-4 rounded-lg shadow hover:shadow-lg transition-all"
                                        >
                                            <Wallet className="w-4 h-4" /> Add to Wallet
                                        </button>
                                        <div className="mt-4 space-y-2">
                                            <div className="flex justify-between text-xs"><span className="text-gray-500">Contract</span> <button onClick={() => copyToClipboard(Marketplace.address, setCopiedContract)} className="text-blue-600 hover:underline truncate w-32 text-right">{Marketplace.address}</button></div>
                                            <div className="flex justify-between text-xs"><span className="text-gray-500">Token ID</span> <span className="font-mono">{tokenId}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'financials' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                                {[
                                    { label: "Total Property Value", value: `R${(parseInt(data.totalPropertyValue) * parseFloat(data.pricePerBrick)).toLocaleString()}`, color: "bg-gray-50" },
                                    { label: "Net Yield", value: `${data.annualYield}%`, color: "bg-blue-50 text-blue-700" },
                                    { label: "Appreciation Est.", value: `${data.propertyAppreciation}%`, color: "bg-green-50 text-green-700" },
                                    { label: "Gross Monthly Income", value: `R${typeof data.monthlyIncome === 'number' ? data.monthlyIncome.toLocaleString() : data.monthlyIncome}`, color: "bg-gray-50" },
                                    { label: "Mortgage Term", value: `${data.mortgageTerm} Years`, color: "bg-gray-50" },
                                    { label: "Interest Rate", value: `${data.interestRate || '12'}%`, color: "bg-gray-50" }
                                ].map((item, i) => (
                                    <div key={i} className={`${item.color} p-6 rounded-xl border border-gray-100 shadow-sm`}>
                                        <p className="text-sm font-medium opacity-70 mb-2">{item.label}</p>
                                        <p className="text-3xl font-bold">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'investors' && (
                            <div className="animate-fade-in-up">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
                                        R{((data.investors?.reduce((sum, inv) => sum + inv.amount, 0) || 0) + (data.buyerDeposit ? data.buyerDeposit * parseFloat(data.pricePerBrick) : 0)).toLocaleString()} Raised
                                    </div>
                                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-bold">
                                        {(data.investors?.length || 0) + (data.buyer ? 1 : 0)} Investors
                                    </div>
                                </div>

                                {profilesLoading ? (
                                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
                                ) : (
                                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                        {/* Desktop Table View */}
                                        <table className="hidden md:table min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Investor</th>
                                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Bricks</th>
                                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Value</th>
                                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">%</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {/* Buyer Row */}
                                                {data.buyer && (
                                                    <tr className="bg-blue-50/50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded mr-2">BUYER</span>
                                                                {(() => {
                                                                    const buyerProfile = profiles[data.buyer.toLowerCase()];
                                                                    const ipfsUrl = GetIpfsUrlFromPinata(buyerProfile?.profilePicture);
                                                                    const hasName = !!buyerProfile?.name;
                                                                    const displayName = buyerProfile?.name || `${data.buyer.substring(0, 6)}...${data.buyer.substring(38)}`;

                                                                    return (
                                                                        <div className="flex items-center gap-2">
                                                                            {ipfsUrl ? (
                                                                                <img src={ipfsUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                                                            ) : (
                                                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                                                                    {getInitials(displayName)}
                                                                                </div>
                                                                            )}
                                                                            <div className="flex items-center gap-1">
                                                                                <span className="font-medium text-gray-900">
                                                                                    {displayName}
                                                                                    {hasName && <span className="text-gray-500 font-normal text-xs ml-1">({data.buyer.substring(0, 4)}...{data.buyer.substring(38)})</span>}
                                                                                </span>
                                                                                <a href={`https://explorer.firstbrick.cloud/address/${data.buyer}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 ml-1" title="View on Explorer">
                                                                                    <Globe size={14} />
                                                                                </a>
                                                                                <button onClick={() => copyToClipboard(data.buyer, setCopiedContract)} className="text-gray-400 hover:text-green-500 ml-1" title="Copy Address">
                                                                                    <Copy size={14} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">{data.buyerDeposit.toLocaleString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-blue-600">R{(data.buyerDeposit * parseFloat(data.pricePerBrick)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">10%</td>
                                                    </tr>
                                                )}

                                                {data.investors?.map((investor, idx) => {
                                                    const profile = profiles[investor.address.toLowerCase()];
                                                    const ipfsUrl = GetIpfsUrlFromPinata(profile?.profilePicture);
                                                    const hasName = !!profile?.name;
                                                    const displayName = profile?.name || `${investor.address.substring(0, 6)}...${investor.address.substring(38)}`;

                                                    return (
                                                        <tr key={idx} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    {ipfsUrl ? (
                                                                        <img src={ipfsUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                                                    ) : (
                                                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                                                                            {getInitials(displayName)}
                                                                        </div>
                                                                    )}
                                                                    <div className="ml-4 flex items-center gap-1">
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {displayName}
                                                                            {hasName && <span className="text-gray-500 font-normal text-xs ml-1">({investor.address.substring(0, 4)}...{investor.address.substring(38)})</span>}
                                                                        </div>
                                                                        <a href={`https://explorer.firstbrick.cloud/address/${investor.address}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 ml-1" title="View on Explorer">
                                                                            <Globe size={14} />
                                                                        </a>
                                                                        <button onClick={() => copyToClipboard(investor.address, setCopiedContract)} className="text-gray-400 hover:text-green-500 ml-1" title="Copy Address">
                                                                            <Copy size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{investor.bricks.toLocaleString()}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">R{investor.amount.toLocaleString()}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{((investor.bricks / parseFloat(data.mortgageAmount)) * 100).toFixed(2)}%</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>

                                        {/* Mobile List View (Styled like Landing Page - Light Mode Card) */}
                                        <div className="md:hidden space-y-2">
                                            {/* Buyer Row */}
                                            {data.buyer && (
                                                <div className="flex items-center justify-between p-3 bg-blue-50/50 border-b border-gray-100 last:border-0">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        {(() => {
                                                            const buyerProfile = profiles[data.buyer.toLowerCase()];
                                                            const ipfsUrl = GetIpfsUrlFromPinata(buyerProfile?.profilePicture);
                                                            const displayName = buyerProfile?.name || `${data.buyer.substring(0, 4)}...${data.buyer.substring(38)}`;
                                                            return (
                                                                <>
                                                                    <div className="relative flex-shrink-0">
                                                                        {ipfsUrl ? <img src={ipfsUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover shadow-sm" /> : <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">{getInitials(displayName)}</div>}
                                                                        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-[10px] text-white px-1.5 py-0.5 rounded-full font-bold border border-white">BUYER</div>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                                                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                                                            <span>{data.buyerDeposit.toLocaleString()} Bricks</span>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )
                                                        })()}
                                                    </div>
                                                    <div className="text-right flex-shrink-0 ml-2">
                                                        <p className="text-sm font-bold text-blue-600">R{(data.buyerDeposit * parseFloat(data.pricePerBrick)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                                        <p className="text-xs text-gray-500 font-medium">10.00%</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Investor Rows */}
                                            {data.investors?.map((investor, idx) => {
                                                const profile = profiles[investor.address.toLowerCase()];
                                                const ipfsUrl = GetIpfsUrlFromPinata(profile?.profilePicture);
                                                const displayName = profile?.name || `${investor.address.substring(0, 4)}...${investor.address.substring(38)}`;
                                                const percentage = ((investor.bricks / parseFloat(data.mortgageAmount)) * 100).toFixed(2);

                                                return (
                                                    <div key={idx} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            {ipfsUrl ? (
                                                                <img src={ipfsUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-sm" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-xs flex-shrink-0 shadow-sm">
                                                                    {getInitials(displayName)}
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                                    <span>{investor.bricks.toLocaleString()} Bricks</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0 ml-2">
                                                            <p className="text-sm font-bold text-gray-900">R{investor.amount.toLocaleString()}</p>
                                                            <p className="text-xs text-green-600 font-medium">{percentage}%</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'homebuyer' && (
                            <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 animate-fade-in-up">
                                <h3 className="text-2xl font-bold mb-6">Homebuyer Profile</h3>
                                {data.buyer ? (
                                    <div className="space-y-6">
                                        <div className="border-b pb-4">
                                            <span className="text-gray-500 block text-xs uppercase mb-1">Buyer Wallet Address</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-mono font-medium text-primary break-all">{data.buyer}</span>
                                                <button onClick={() => copyToClipboard(data.buyer, setCopiedContract)} className="text-gray-400 hover:text-gray-600">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            {[
                                                { label: "Employment Status", key: "employmentStatus" },
                                                { label: "Years Employed", key: "employmentYears" },
                                                { label: "Income Range", key: "incomeRange" },
                                                { label: "Credit Score", key: "creditScore" },
                                                { label: "First Time Buyer", key: "firstTimeBuyer" }
                                            ].map((field) => (
                                                <div key={field.key} className="border-b pb-2">
                                                    <span className="text-gray-500 block text-xs uppercase mb-1">{field.label}</span>
                                                    <span className="text-lg font-medium text-gray-900">
                                                        {profiles[data.buyer.toLowerCase()]?.[field.key] || "N/A"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-4 italic">
                                            * Profile data is retrieved from the decentralized profile registry.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No buyer assigned to this property yet.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section >

            {/* Blockchain Transparency Section */}
            < section className="bg-gray-50 border-t border-gray-200 py-12 px-4 snap-start md:snap-none" >
                <div className="max-w-7xl mx-auto">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        Blockchain Transparency
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Property Transactions</h4>
                            <p className="text-gray-600 mb-4 text-sm">Verify all property transactions directly on the blockchain explorer.</p>
                            <a href="https://explorer.firstbrick.cloud/properties" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary font-bold hover:underline">
                                View Transactions <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Contract Details</h4>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-xs text-gray-500 block">Contract Address</span>
                                    <div className="flex items-center gap-2">
                                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-primary break-all">{Marketplace.address}</code>
                                        <button onClick={() => copyToClipboard(Marketplace.address, setCopiedContract)} className="text-gray-400 hover:text-green-600 transition-colors" title="Copy Contract Address">
                                            {copiedContract ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 block">Token ID</span>
                                    <div className="flex items-center gap-2">
                                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-primary">{tokenId}</code>
                                        <button onClick={() => copyToClipboard(tokenId, setCopiedTokenId)} className="text-gray-400 hover:text-green-600 transition-colors" title="Copy Token ID">
                                            {copiedTokenId ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* SECTION 4: FOOTER */}
            < section className="snap-start md:snap-none" >
                <Footer />
            </section >
        </div >
    );
}
