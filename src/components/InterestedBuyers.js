import { useState } from "react";

function InterestedBuyers({ propertyData, onAddBuyer }) {
    const [showBuyers, setShowBuyers] = useState(false);
    const [newBuyer, setNewBuyer] = useState({
        walletAddress: "",
        name: "",
        score: 0,
        date: new Date().toISOString().split('T')[0]
    });
    const [showAddForm, setShowAddForm] = useState(false);

    // Mock data for interested buyers - in a real app this would come from blockchain/smart contract
    const [interestedBuyers, setInterestedBuyers] = useState([
        {
            id: 1,
            walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            name: "John Smith",
            score: 85,
            profilePicture: "https://randomuser.me/api/portraits/men/32.jpg",
            date: "2023-10-15",
            status: "Pre-approved"
        },
        {
            id: 2,
            walletAddress: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
            name: "Sarah Johnson",
            score: 92,
            profilePicture: "https://randomuser.me/api/portraits/women/44.jpg",
            date: "2023-10-18",
            status: "Verified"
        },
        {
            id: 3,
            walletAddress: "0x4587A34a3c021522b44E1dB9322c327C48b86517",
            name: "Michael Williams",
            score: 78,
            profilePicture: "https://randomuser.me/api/portraits/men/67.jpg",
            date: "2023-10-20",
            status: "Pending"
        }
    ]);

    const handleAddBuyer = () => {
        if (newBuyer.walletAddress && newBuyer.name) {
            const buyer = {
                id: interestedBuyers.length + 1,
                ...newBuyer,
                profilePicture: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
                status: "New"
            };
            setInterestedBuyers([...interestedBuyers, buyer]);
            setNewBuyer({
                walletAddress: "",
                name: "",
                score: 0,
                date: new Date().toISOString().split('T')[0]
            });
            setShowAddForm(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 85) return "text-green-500";
        if (score >= 70) return "text-yellow-500";
        return "text-red-500";
    };

    const getScoreLabel = (score) => {
        if (score >= 85) return "High";
        if (score >= 70) return "Medium";
        return "Low";
    };

    return (
        <div className="mt-6">
            <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-purple-400">Interested Buyers</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                            {showAddForm ? 'Cancel' : 'Add Buyer'}
                        </button>
                        <button
                            onClick={() => setShowBuyers(!showBuyers)}
                            className={`px-3 py-1 rounded text-sm ${
                                showBuyers ? 'bg-purple-700 text-white' : 'bg-gray-700 text-gray-300'
                            }`}
                        >
                            {showBuyers ? 'Hide' : 'Show'} Buyers
                        </button>
                    </div>
                </div>

                {/* Add Buyer Form */}
                {showAddForm && (
                    <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                        <h4 className="font-medium mb-3">Add Interested Buyer</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-400">Wallet Address</label>
                                <input
                                    type="text"
                                    value={newBuyer.walletAddress}
                                    onChange={(e) => setNewBuyer({...newBuyer, walletAddress: e.target.value})}
                                    className="w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
                                    placeholder="0x..."
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Name</label>
                                <input
                                    type="text"
                                    value={newBuyer.name}
                                    onChange={(e) => setNewBuyer({...newBuyer, name: e.target.value})}
                                    className="w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
                                    placeholder="Buyer name"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Score (0-100)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={newBuyer.score}
                                    onChange={(e) => setNewBuyer({...newBuyer, score: parseInt(e.target.value) || 0})}
                                    className="w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <button
                                onClick={handleAddBuyer}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                            >
                                Add to Interested Buyers
                            </button>
                        </div>
                    </div>
                )}

                {/* Interested Buyers List */}
                {showBuyers && (
                    <div>
                        <div className="mb-4 text-sm text-gray-300">
                            <span className="font-medium">{interestedBuyers.length}</span> interested buyers
                        </div>

                        <div className="space-y-3">
                            {interestedBuyers.map((buyer) => (
                                <div key={buyer.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={buyer.profilePicture}
                                            alt={buyer.name}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
                                        />
                                        <div>
                                            <div className="font-medium">{buyer.name}</div>
                                            <div className="text-xs text-gray-400 break-all max-w-xs">{buyer.walletAddress}</div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Added: {buyer.date} • Status: {buyer.status}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-bold ${getScoreColor(buyer.score)}`}>
                                            {buyer.score}/100
                                        </div>
                                        <div className={`text-xs ${getScoreColor(buyer.score)}`}>
                                            {getScoreLabel(buyer.score)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Buyer Score Explanation */}
                        <div className="mt-6 pt-4 border-t border-gray-700">
                            <h4 className="font-medium mb-2">Buyer Score System</h4>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                                <div className="p-2 bg-green-900 bg-opacity-50 rounded text-center">
                                    <div className="text-green-400 font-bold">85-100</div>
                                    <div className="text-xs">High Trust</div>
                                </div>
                                <div className="p-2 bg-yellow-900 bg-opacity-50 rounded text-center">
                                    <div className="text-yellow-400 font-bold">70-84</div>
                                    <div className="text-xs">Medium Trust</div>
                                </div>
                                <div className="p-2 bg-red-900 bg-opacity-50 rounded text-center">
                                    <div className="text-red-400 font-bold">0-69</div>
                                    <div className="text-xs">Low Trust</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!showBuyers && (
                    <div className="text-center py-4 text-gray-400">
                        Click "Show Buyers" to view interested buyers for this property
                    </div>
                )}
            </div>
        </div>
    );
}

export default InterestedBuyers;