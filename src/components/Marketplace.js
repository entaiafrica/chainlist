
import Navbar from "./Navbar";
import Footer from "./Footer";
import MarketplaceJSON from "../Marketplace_new.json";
import { useState, useEffect } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import { Loader2 } from 'lucide-react';
import { Link } from "react-router-dom";
import CountdownTimer from './CountdownTimer';
import WalletBalance from './WalletBalance';
import { getUserProfile } from '../profileService';
import { getEthersProvider, isWalletInstalled } from '../walletUtils';

export default function Marketplace() {
    const [data, updateData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profiles, setProfiles] = useState({});
    const [userAddress, setUserAddress] = useState(null);

    async function getAllNFTs() {
        setLoading(true);
        setError(null);
        const ethers = require("ethers");

        try {
            // Always use static RPC provider for reading blockchain data to ensure properties load
            // This allows properties to be loaded even without wallet connection
            const provider = new ethers.providers.StaticJsonRpcProvider(process.env.REACT_APP_RPC_URL, { chainId: 12786, name: 'BrickChain' });

            let fetchedUserAddress = null;
            // Only try to get user address if wallet is installed and connected
            if (isWalletInstalled()) {
                try {
                    const walletProvider = getEthersProvider();
                    // Check if the wallet is actually connected by trying to get accounts
                    const accounts = await walletProvider.listAccounts();
                    if (accounts && accounts.length > 0) {
                        const signer = walletProvider.getSigner();
                        fetchedUserAddress = await signer.getAddress();
                        setUserAddress(fetchedUserAddress);
                    } else {
                        setUserAddress(null);
                    }
                } catch (err) {
                    console.log("Wallet not connected or error getting address:", err.message);
                    setUserAddress(null);
                }
            } else {
                setUserAddress(null);
            }

            const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, provider);

            // Call the contract to get all property token IDs
            let propertyTokenIds = [];
            try {
                propertyTokenIds = await contract.getAllProperties();
            } catch (error) {
                console.error("Error getting all properties:", error.message);
                // If getAllProperties fails, try to continue with an empty array
                // This could happen if the contract has no properties yet
                propertyTokenIds = [];
            }

            // OPTIMIZED: Load all properties in parallel for 5-10x faster loading
            const propertyPromises = propertyTokenIds.map(async (tokenId) => {
                try {
                    // Batch all independent contract calls in parallel
                    const [propertyData, buyer, metadataURI, investorAddresses, trustWallet] = await Promise.all([
                        contract.getPropertyData(tokenId).catch(err => {
                            console.warn(`Error getting property data for token ${tokenId}:`, err.message);
                            return null;
                        }),
                        contract.propertyBuyer(tokenId).catch(() => ethers.constants.AddressZero),
                        contract.uri(tokenId).catch(() => ""),
                        contract.getInvestorList(tokenId).catch(() => []),
                        contract.propertyTrustWallet(tokenId).catch(() => ethers.constants.AddressZero)
                    ]);

                    if (!propertyData) return null; // Skip if property data failed

                    const depositAmount = parseFloat(ethers.utils.formatEther(propertyData.depositAmount));
                    const pricePerBrick = parseFloat(ethers.utils.formatEther(propertyData.pricePerBrick));

                    // Batch all investor balance checks in parallel
                    const investorBalances = await Promise.all(
                        investorAddresses
                            .filter(addr => addr.toLowerCase() !== trustWallet.toLowerCase())
                            .map(address =>
                                contract.balanceOf(address, tokenId)
                                    .then(balance => ({
                                        address,
                                        bricks: parseInt(ethers.utils.formatUnits(balance, 0)),
                                        amount: 0 // Will calculate after
                                    }))
                                    .catch(() => null)
                            )
                    );

                    const investors = investorBalances
                        .filter(inv => inv && inv.bricks > 0)
                        .map(inv => ({ ...inv, amount: inv.bricks * pricePerBrick }))
                        .sort((a, b) => b.bricks - a.bricks);

                    // Fetch metadata (can be slow, but done in parallel across properties)
                    let metadata = {};
                    if (metadataURI) {
                        try {
                            const httpMetadataURI = GetIpfsUrlFromPinata(metadataURI);
                            const response = await fetch(httpMetadataURI);
                            if (response.ok) {
                                metadata = await response.json();
                            }
                        } catch (e) {
                            console.warn(`Metadata fetch failed for token ${tokenId}`);
                        }
                    }

                    // Get user bricks if connected
                    let userBricks = 0;
                    if (fetchedUserAddress) {
                        userBricks = await contract.balanceOf(fetchedUserAddress, tokenId)
                            .then(balance => parseInt(ethers.utils.formatUnits(balance, 0)))
                            .catch(() => 0);
                    }

                    return {
                        tokenId: tokenId.toString(),
                        name: metadata.name || metadata.Name || `Property #${tokenId}`,
                        propertyAddress: metadata.properties?.propertyAddress ||
                            metadata.propertyAddress ||
                            metadata.description ||
                            metadata.Description ||
                            metadata.location ||
                            metadata.Location ||
                            "Address not available",
                        image: metadata.properties?.images?.[0] ||
                            metadata.image ||
                            metadata.Image ||
                            metadata.properties?.image ||
                            "",
                        totalPropertyValue: ethers.utils.formatUnits(propertyData.totalBricks, 0),
                        bricksToSell: ethers.utils.formatUnits(propertyData.bricksAvailable, 0),
                        pricePerBrick: ethers.utils.formatEther(propertyData.pricePerBrick),
                        status: propertyData.status,
                        buyer: buyer,
                        buyerDeposit: depositAmount,
                        investors: investors,
                        otpDeadline: ethers.utils.formatUnits(propertyData.otpDeadline, 0),
                        userBricks,
                        propertyType: metadata.attributes?.find(a => a.trait_type === "Property Type")?.value ||
                            metadata.properties?.propertyType ||
                            metadata.propertyType ||
                            "Property",
                    };
                } catch (err) {
                    console.warn(`Error loading property ${tokenId}:`, err.message);
                    return null;
                }
            });

            // Wait for all properties to load in parallel
            const items = (await Promise.all(propertyPromises)).filter(item => item !== null);
            updateData(items);
        } catch (error) {
            console.error("Error in getAllNFTs:", error);
            setError(error.message || "Failed to connect to blockchain");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getAllNFTs();
    }, []);

    useEffect(() => {
        async function loadProfiles() {
            if (data.length === 0) return;
            const addresses = new Set();
            data.forEach(prop => {
                if (prop.buyer) addresses.add(prop.buyer);
                prop.investors.forEach(inv => addresses.add(inv.address));
            });

            // OPTIMIZED: Load all profiles in parallel instead of sequentially
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
        }
        loadProfiles();

        const handleProfileUpdate = () => {
            console.log("♻️ Profile update detected, reloading profiles...");
            loadProfiles();
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
    }, [data]);

    const getProfileData = (address) => profiles[address.toLowerCase()] || {};
    const getInitials = (nameOrAddress) => {
        if (!nameOrAddress) return '?';
        if (nameOrAddress.startsWith('0x')) return nameOrAddress.substring(2, 4).toUpperCase();
        const parts = nameOrAddress.trim().split(' ');
        return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : nameOrAddress.substring(0, 2).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-gray-100 w-full">
            <Navbar />
            <div className="w-full py-12 pt-24">
                <div className="text-center mb-8 px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Marketplace</h1>
                    <p className="text-lg text-gray-600">Invest in South African Real Estate, One Brick at a Time.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <span className="text-xl text-gray-600 ml-4">Loading Properties...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 px-4">
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
                        {data.map((property) => {
                            const totalValue = parseFloat(property.totalPropertyValue) * parseFloat(property.pricePerBrick);
                            const fundingRaised = (property.buyerDeposit + property.investors.reduce((sum, inv) => sum + inv.amount, 0));
                            const fundedPercentage = totalValue > 0 ? (fundingRaised / totalValue) * 100 : 0;

                            return (
                                <div key={property.tokenId} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100 flex flex-col overflow-hidden group">
                                    <div className="relative h-64 overflow-hidden">
                                        {property.image && (
                                            <img src={GetIpfsUrlFromPinata(property.image)} alt={property.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" onError={(e) => {
                                                e.target.onerror = null; // Prevent infinite loop
                                                e.target.src = '/image.png'; // Fallback image
                                            }} />
                                        )}
                                        <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm font-bold">{fundedPercentage.toFixed(0)}% Funded</div>
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow">
                                        {userAddress && <div className="mb-4"><WalletBalance compact /></div>}
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{property.name}</h3>
                                        <p className="text-gray-600 text-sm mb-4">{property.propertyAddress}</p>

                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            <div className="bg-blue-50 p-2 rounded-lg text-center"><p className="text-xs font-semibold uppercase text-blue-800">Value</p><p className="text-lg font-bold text-gray-900">R{totalValue.toLocaleString()}</p></div>
                                            <div className="bg-gray-100 p-2 rounded-lg text-center"><p className="text-xs font-semibold uppercase text-gray-700">Need</p><p className="text-lg font-bold text-gray-900">R{(totalValue - fundingRaised).toLocaleString()}</p></div>
                                            <div className="bg-green-50 p-2 rounded-lg text-center"><p className="text-xs font-semibold uppercase text-green-800">Raised</p><p className="text-lg font-bold text-green-700">R{fundingRaised.toLocaleString()}</p></div>
                                        </div>

                                        <div className="flex-grow">
                                            {(property.investors?.length > 0 || property.buyerDeposit > 0) && (
                                                <div className="mb-4">
                                                    <h4 className="text-lg font-bold text-gray-800 mb-2">Investors</h4>
                                                    <div className="space-y-2">
                                                        {property.buyer && property.buyerDeposit > 0 && (() => {
                                                            const profile = getProfileData(property.buyer);
                                                            const displayName = profile.name ? `${profile.name} (${property.buyer.substring(0, 4)}...${property.buyer.substring(38)})` : `${property.buyer.substring(0, 6)}...${property.buyer.substring(38)}`;
                                                            return (
                                                                <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg">
                                                                    <div className="flex items-center gap-3">
                                                                        {profile.profilePicture ? (
                                                                            <img
                                                                                src={GetIpfsUrlFromPinata(profile.profilePicture)}
                                                                                alt={displayName}
                                                                                className="w-8 h-8 rounded-full"
                                                                                onError={(e) => {
                                                                                    e.target.onerror = null; // Prevent infinite loop
                                                                                    e.target.style.display = 'none'; // Hide the image
                                                                                    e.target.nextSibling.style.display = 'flex'; // Show initials fallback
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                                                                {getInitials(profile.name || property.buyer)}
                                                                            </div>
                                                                        )}
                                                                        <p className="text-sm font-semibold text-gray-800">{displayName} <span className="text-xs font-bold text-blue-700">(Buyer)</span></p>
                                                                    </div>
                                                                    <span className="text-sm font-bold text-blue-700">R{property.buyerDeposit.toLocaleString()}</span>
                                                                </div>
                                                            );
                                                        })()}
                                                        {property.investors.slice(0, 3).map((inv) => {
                                                            const profile = getProfileData(inv.address);
                                                            const displayName = profile.name ? `${profile.name} (${inv.address.substring(0, 4)}...${inv.address.substring(38)})` : `${inv.address.substring(0, 6)}...${inv.address.substring(38)}`;
                                                            return (
                                                                <div key={inv.address} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                                                    <div className="flex items-center gap-3">
                                                                        {profile.profilePicture ? (
                                                                            <img
                                                                                src={GetIpfsUrlFromPinata(profile.profilePicture)}
                                                                                alt={displayName}
                                                                                className="w-8 h-8 rounded-full"
                                                                                onError={(e) => {
                                                                                    e.target.onerror = null; // Prevent infinite loop
                                                                                    e.target.style.display = 'none'; // Hide the image
                                                                                    e.target.nextSibling.style.display = 'flex'; // Show initials fallback
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                                                                                {getInitials(profile.name || inv.address)}
                                                                            </div>
                                                                        )}
                                                                        <p className="text-sm font-semibold text-gray-800">{displayName}</p>
                                                                    </div>
                                                                    <span className="text-sm font-bold text-gray-900">R{inv.amount.toLocaleString()}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 flex-grow flex flex-col justify-end">
                                            <div className={`grid ${userAddress ? 'grid-cols-3' : 'grid-cols-2'} gap-2 mb-4`}>
                                                <div className="bg-gray-100 p-2 rounded-lg text-center"><p className="text-xs font-semibold uppercase text-gray-600">Offer Ends</p><CountdownTimer deadline={property.otpDeadline} compact={true} /></div>
                                                <div className="bg-gray-100 p-2 rounded-lg text-center"><p className="text-xs font-semibold uppercase text-gray-600">Available</p><p className="text-xl font-bold text-primary">{parseFloat(property.bricksToSell).toLocaleString()}</p></div>
                                                {userAddress && <div className="bg-green-100 p-2 rounded-lg text-center border-2 border-green-500"><p className="text-xs font-semibold uppercase text-green-800">You Own</p><p className="text-xl font-bold text-green-600">{property.userBricks.toLocaleString()}</p></div>}
                                            </div>
                                            <Link to={`/nftPage/${property.tokenId}`} className="block w-full text-center bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-colors">Invest Now</Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
