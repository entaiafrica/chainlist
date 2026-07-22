import { useState, useEffect } from 'react';
import { connectAndSetupWallet, getCurrentAddress } from '../walletUtils';

export default function AddBrkToken() {
    const [status, setStatus] = useState('');
    const [buttonText, setButtonText] = useState('Connect Wallet & Add BRK Token');
    const [buttonDisabled, setButtonDisabled] = useState(false);

    useEffect(() => {
        const checkWallet = async () => {
            const address = await getCurrentAddress();
            if (address) {
                setStatus(`✓ Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
            }
        };
        checkWallet();
    }, []);

    const handleSetup = async () => {
        setButtonDisabled(true);
        setStatus('Please follow the prompts in your wallet...');
        setButtonText('Connecting...');

        const result = await connectAndSetupWallet();

        if (result.success) {
            let successMessage = `✅ Wallet connected successfully to ${result.walletName}!`;
            if (result.tokenAdded) {
                successMessage += ' BRK Token was also added to your wallet.';
            }
            setStatus(successMessage);
            setButtonText('Setup Complete!');
        } else {
            setStatus(`❌ ${result.error || 'An unknown error occurred.'}`);
            setButtonText('Try Again');
            setButtonDisabled(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
            <div className="card bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full">
                <img src="/brick-logo.png" alt="BRK Token" className="logo w-24 h-24 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Add BRK Token to Your Wallet</h1>
                <p className="text-center text-gray-500 mb-6">FirstBrick Token (ERC2771-Compatible)</p>

                <div className="info bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500 mb-6">
                    <div className="info-item flex justify-between text-sm mb-2">
                        <span className="info-label font-semibold text-gray-600">Contract Address:</span>
                        <span className="info-value font-mono text-gray-800">0x70e0bA...525FFC49</span>
                    </div>
                    <div className="info-item flex justify-between text-sm mb-2">
                        <span className="info-label font-semibold text-gray-600">Symbol:</span>
                        <span className="info-value font-mono text-gray-800">BRK</span>
                    </div>
                    <div className="info-item flex justify-between text-sm">
                        <span className="info-label font-semibold text-gray-600">Network:</span>
                        <span className="info-value font-mono text-gray-800">BrickChain (12786)</span>
                    </div>
                </div>

                <div className="note bg-yellow-100 p-4 rounded-lg border-l-4 border-yellow-500 mb-6 text-sm text-yellow-800">
                    <strong>Note:</strong> If you have the old BRK token, remove it from your wallet before adding this new version.
                </div>

                <button onClick={handleSetup} id="addButton" disabled={buttonDisabled} className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-800 disabled:opacity-50 transition-all">
                    {buttonText}
                </button>

                {status && <div id="status" className={`status mt-4 p-3 text-center rounded-lg ${status.startsWith('❌') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{status}</div>}
            </div>
        </div>
    );
}
