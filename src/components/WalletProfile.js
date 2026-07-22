import { useState, useEffect } from "react";

function WalletProfile({ walletAddress, isVerified, joinDate, reputationScore, totalInvestments, completedTransactions }) {
    const [profile, setProfile] = useState({
        name: "Anonymous User",
        profilePicture: "https://via.placeholder.com/150/4a5568/FFFFFF?text=A",
        walletAddress: walletAddress || "0x0000000000000000000000000000000000000000",
        isVerified: isVerified || false,
        joinDate: joinDate || new Date().toISOString().split('T')[0],
        reputationScore: reputationScore || 0,
        totalInvestments: totalInvestments || 0,
        completedTransactions: completedTransactions || 0
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        profilePicture: ""
    });

    useEffect(() => {
        if (walletAddress) {
            setProfile(prev => ({
                ...prev,
                walletAddress: walletAddress,
                isVerified: isVerified,
                joinDate: joinDate,
                reputationScore: reputationScore,
                totalInvestments: totalInvestments,
                completedTransactions: completedTransactions
            }));
        }
    }, [walletAddress, isVerified, joinDate, reputationScore, totalInvestments, completedTransactions]);

    const handleEdit = () => {
        if (isEditing) {
            // Save the changes
            setProfile(prev => ({
                ...prev,
                name: editForm.name || prev.name,
                profilePicture: editForm.profilePicture || prev.profilePicture
            }));
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-purple-400">Wallet Profile</h3>
                <button
                    onClick={handleEdit}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                    {isEditing ? 'Save' : 'Edit'}
                </button>
            </div>

            <div className="flex items-center space-x-4">
                <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="w-16 h-16 rounded-full border-2 border-purple-500 object-cover"
                />
                
                <div className="flex-1">
                    {isEditing ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                name="name"
                                value={editForm.name || profile.name}
                                onChange={handleInputChange}
                                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                                placeholder="Enter display name"
                            />
                            <input
                                type="text"
                                name="profilePicture"
                                value={editForm.profilePicture || ""}
                                onChange={handleInputChange}
                                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 text-sm"
                                placeholder="Image URL for profile picture"
                            />
                        </div>
                    ) : (
                        <div>
                            <h4 className="font-bold text-lg">{profile.name}</h4>
                            <p className="text-gray-400 text-sm break-all">{profile.walletAddress}</p>
                            <div className="flex items-center mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    profile.isVerified ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                                }`}>
                                    {profile.isVerified ? '✓ ID Verified' : 'Not Verified'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Additional Profile Stats */}
            <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-lg font-bold">{profile.totalInvestments}</div>
                        <div className="text-xs text-gray-400">Investments</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold">{profile.completedTransactions}</div>
                        <div className="text-xs text-gray-400">Transactions</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold">{profile.reputationScore}/100</div>
                        <div className="text-xs text-gray-400">Reputation</div>
                    </div>
                </div>
                
                <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span>Member since</span>
                        <span>{profile.joinDate}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{width: `${profile.reputationScore}%`}}
                        ></div>                    </div>
                </div>
            </div>

            {/* Profile Actions */}
            <div className="mt-4 flex space-x-2">
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-sm">
                    Send Message
                </button>
                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm">
                    View Portfolio
                </button>
            </div>
        </div>
    );
}

export default WalletProfile;