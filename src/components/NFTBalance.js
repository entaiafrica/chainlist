import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import MarketplaceJSON from '../Marketplace_new.json';

export default function NFTBalance({ tokenId = 1 }) {
    const [balance, setBalance] = useState('0');
    const [loading, setLoading] = useState(true);
    const [address, setAddress] = useState('');

    useEffect(() => {
        loadBalance();
    }, [tokenId]);

    async function loadBalance() {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const addr = await signer.getAddress();
            setAddress(addr);

            const marketplace = new ethers.Contract(
                MarketplaceJSON.address,
                MarketplaceJSON.abi,
                provider
            );

            const bal = await marketplace.balanceOf(addr, tokenId);
            setBalance(ethers.utils.formatUnits(bal, 0)); // No decimals for brick count
            setLoading(false);
        } catch (error) {
            console.error("Error loading balance:", error);
            setLoading(false);
        }
    }

    if (loading) return <div className="text-gray-400">Loading balance...</div>;

    return (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg shadow-lg">
            <h3 className="text-white text-lg font-bold mb-2">Your Brick Balance</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">
                    {Number(balance).toLocaleString()}
                </span>
                <span className="text-xl text-blue-200">Bricks</span>
            </div>
            <p className="text-blue-100 text-sm mt-2">
                Property: Chic Sandton Apartment (Token ID: {tokenId})
            </p>
            <p className="text-blue-200 text-xs mt-1 break-all">
                Wallet: {address.substring(0, 6)}...{address.substring(38)}
            </p>
        </div>
    );
}
