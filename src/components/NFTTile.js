import { Link } from "react-router-dom";
import { GetIpfsUrlFromPinata } from "../utils";
import { MapPin, Store } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserProfile } from '../profileService';


const getInitials = (nameOrAddress) => {
    if (!nameOrAddress) return '?';
    if (nameOrAddress.startsWith('0x')) return nameOrAddress.substring(2, 4).toUpperCase();
    const parts = nameOrAddress.trim().split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : nameOrAddress.substring(0, 2).toUpperCase();
};



function NFTTile ({ data }) {
    const propertyAddress = data.propertyAddress || data.name || "property";
    const formattedAddress = propertyAddress.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newTo = {
        pathname: "/nftPage/" + (data.tokenId || formattedAddress)
    }

    // GetIpfsUrlFromPinata handles gateway conversion automatically
    const IPFSUrl = GetIpfsUrlFromPinata(data.image);

    const formatValue = (value, isCurrency = true) => {
        if (!value) return 'N/A';
        const num = parseInt(value);
        if (isCurrency) {
            return 'R' + num.toLocaleString();
        }
        return num.toLocaleString();
    };
    
    // Calculate funding progress correctly
    const totalPropertyValue = parseFloat(data.totalPropertyValue || 0);
    const mortgageAmount = parseFloat(data.mortgageAmount || data.totalPropertyValue || 0);
    const bricksAvailable = parseFloat(data.bricksToSell || 0);
    const bricksSold = mortgageAmount - bricksAvailable;
    const fundedPercentage = mortgageAmount > 0 ? (bricksSold / mortgageAmount) * 100 : 0;
    const pricePerBrick = parseFloat(data.pricePerBrick || 1);
    const amountRaised = bricksSold * pricePerBrick; // Actual R amount raised

    // Detect if this is a buyer's property or investor's property
    const isBuyerProperty = data.monthlyPayment !== undefined;
    const isInvestorProperty = data.monthlyReturn !== undefined;

    // Format date helper
    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Detect commercial property
    const isCommercial = (data.propertyType || "").toLowerCase().includes("commercial");
    const commercialSubType = data.propertySubType || "Commercial";
    const monthlyIncome = parseFloat(data.monthlyIncome || data.monthlyPayment || 0);
    const nettAnnualIncome = parseFloat(data.nettAnnualIncome || 0);

    return (
        <Link to={newTo} className="group block h-full">
            <div className="flex flex-col h-full bg-white border-2 border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-primary/30">
                {/* Image - More Compact */}
                <div className="h-36 md:h-48 bg-gray-200 overflow-hidden relative">
                    <img
                        src={IPFSUrl}
                        alt={propertyAddress}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        crossOrigin="anonymous"
                    />

                    {/* Commercial Badge - Top Left */}
                    {isCommercial && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-600 to-indigo-600 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-lg font-bold text-xs shadow-lg flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5" />
                            <span>{commercialSubType}</span>
                        </div>
                    )}

                    {/* Funding Badge - Bottom Right */}
                    <div className={`absolute bottom-2 right-2 backdrop-blur-sm text-white px-2 py-1 rounded-md font-bold text-xs shadow-lg ${isCommercial ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-black/80'}`}>
                        {fundedPercentage.toFixed(0)}% Funded
                    </div>
                </div>

                <div className="px-3 pt-3 pb-0 flex flex-col flex-grow">
                    {/* Title & Location - Compact */}
                    <div className="mb-2">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                            {data.name || propertyAddress}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{data.propertyAddress}</span>
                        </div>
                    </div>

                    {/* Key Metrics - Compact 3-Column Grid */}
                    {isBuyerProperty ? (
                        /* Buyer Property - Show Mortgage Info */
                        <div className="mb-3 space-y-2">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                                <p className="text-[10px] font-semibold text-blue-700 uppercase mb-1">Property Value</p>
                                <p className="text-xl font-black text-gray-900">{formatValue(data.totalValue)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                                    <p className="text-[10px] font-semibold text-green-700 uppercase mb-0.5">Monthly Payment</p>
                                    <p className="text-sm font-bold text-green-600">{formatValue(data.monthlyPayment)}</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
                                    <p className="text-[10px] font-semibold text-purple-700 uppercase mb-0.5">Period Left</p>
                                    <p className="text-sm font-bold text-purple-600">{data.yearsRemaining} yrs</p>
                                </div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
                                <p className="text-[10px] font-semibold text-orange-700 uppercase mb-0.5">Next Payment Due</p>
                                <p className="text-sm font-bold text-orange-600">{formatDate(data.nextPaymentDate)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                                <p className="text-[10px] font-semibold text-gray-600 uppercase mb-0.5">Funding Progress</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-gray-900">{data.fundingProgress.toFixed(1)}%</p>
                                    <span className="text-xs text-gray-500">{formatValue(bricksAvailable, false)} bricks left</span>
                                </div>
                            </div>
                        </div>
                    ) : isInvestorProperty ? (
                        /* Investor Property - Show Return Info */
                        <div className="mb-3 space-y-2">
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                                <p className="text-[10px] font-semibold text-purple-700 uppercase mb-1">Your Investment</p>
                                <p className="text-xl font-black text-gray-900">{formatValue(data.investmentValue)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                                    <p className="text-[10px] font-semibold text-green-700 uppercase mb-0.5">Monthly Return</p>
                                    <p className="text-sm font-bold text-green-600">{formatValue(data.monthlyReturn)}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                                    <p className="text-[10px] font-semibold text-blue-700 uppercase mb-0.5">Ownership</p>
                                    <p className="text-sm font-bold text-blue-600">{data.ownershipPercent}%</p>
                                </div>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-200">
                                <p className="text-[10px] font-semibold text-emerald-700 uppercase mb-0.5">Accumulated Return</p>
                                <p className="text-sm font-bold text-emerald-600">{formatValue(data.accumulatedReturn)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                                <p className="text-[10px] font-semibold text-gray-600 uppercase mb-0.5">Funded Period</p>
                                <p className="text-sm font-bold text-gray-900">{data.fundedMonths} months ({data.fundedDays} days)</p>
                            </div>
                        </div>
                    ) : isCommercial ? (
                        /* Commercial Property - Show Income Metrics */
                        <div className="mb-3 space-y-2">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                                <p className="text-[10px] font-semibold text-blue-700 uppercase mb-1">Annual Income</p>
                                <p className="text-xs sm:text-sm font-bold text-gray-900">{formatValue(nettAnnualIncome)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2 border border-green-100">
                                    <p className="text-[10px] font-semibold text-green-700 uppercase mb-0.5">Monthly Income</p>
                                    <p className="text-xs sm:text-sm font-bold text-green-600">{formatValue(monthlyIncome)}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-100">
                                    <p className="text-[10px] font-semibold text-purple-700 uppercase mb-0.5">Net Yield</p>
                                    <p className="text-xs sm:text-sm font-bold text-purple-600">{data.annualYield || 'N/A'}%</p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-2 border border-orange-200">
                                <p className="text-[10px] font-semibold text-orange-700 uppercase mb-0.5">Value</p>
                                <p className="text-xs sm:text-sm font-bold text-orange-600">{formatValue(totalPropertyValue)}</p>
                            </div>
                        </div>
                    ) : (
                        /* Default - Residential Marketplace Property */
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-100">
                                <p className="text-[10px] font-semibold text-blue-700 uppercase mb-0.5">Value</p>
                                <p className="text-xs sm:text-sm font-bold text-gray-900">{formatValue(totalPropertyValue)}</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2 border border-green-100">
                                <p className="text-[10px] font-semibold text-green-700 uppercase mb-0.5">Raised</p>
                                <p className="text-xs sm:text-sm font-bold text-green-600">{formatValue(amountRaised)}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-100">
                                <p className="text-[10px] font-semibold text-purple-700 uppercase mb-0.5">Yield</p>
                                <p className="text-xs sm:text-sm font-bold text-purple-600">{data.annualYield || 'N/A'}%</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-auto">
                        {/* CTA Button - Compact with no bottom margin */}
                        <div className="mb-3 px-3">
                            <button className="w-full bg-gradient-to-r from-primary to-purple-600 text-white font-bold py-2 px-3 rounded-lg hover:from-primary-dark hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-xs">
                                {isBuyerProperty ? 'Manage Property →' : isInvestorProperty ? 'View Investment →' : 'Invest Now →'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default NFTTile;
