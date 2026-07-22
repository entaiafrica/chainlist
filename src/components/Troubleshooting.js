import Navbar from "./Navbar";
import Footer from "./Footer";
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Marketplace from '../Marketplace_new.json';

const AccordionItem = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4 px-6 focus:outline-none"
            >
                <span className="text-lg font-semibold text-gray-800">{title}</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="px-6 pb-4 text-gray-600 space-y-4">
                    {children}
                </div>
            )}
        </div>
    );
};

export default function Troubleshooting() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto py-12 pt-24 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Troubleshooting & FAQ</h1>
                    <p className="mt-4 text-xl text-gray-600">Your guide to solving common issues on the FirstBrick platform.</p>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <AccordionItem title="How do I set up a new crypto wallet?">
                        <p>A crypto wallet is necessary to interact with our platform. We recommend using MetaMask, a popular and secure browser extension.</p>
                        <ol className="list-decimal list-inside space-y-2">
                            <li><strong>Download MetaMask:</strong> Go to <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">metamask.io</a> and install the extension for your browser (e.g., Chrome, Firefox).</li>
                            <li><strong>Create a Wallet:</strong> Open the extension and click "Create a new wallet". Follow the on-screen instructions.</li>
                            <li><strong>Secure Your Seed Phrase:</strong> Write down your 12-word "secret recovery phrase" and store it somewhere safe and offline. This is the master key to your wallet. Never share it with anyone.</li>
                            <li><strong>Pin for Easy Access:</strong> Pin the MetaMask extension to your browser's toolbar for quick access.</li>
                        </ol>
                    </AccordionItem>

                    <AccordionItem title="How do I add the BrickChain Network to MetaMask?">
                        <p>To see your assets and interact with our marketplace, you need to connect to our custom blockchain, "BrickChain".</p>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Open MetaMask and click on the network dropdown at the top (it usually says "Ethereum Mainnet").</li>
                            <li>Click "Add network" or "Add a network manually".</li>
                            <li>Enter the following information into the fields:</li>
                        </ol>
                        <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono my-2">
                            <p><strong>Network Name:</strong> BrickChain</p>
                            <p><strong>New RPC URL:</strong> https://rpc.firstbrick.cloud</p>
                            <p><strong>Chain ID:</strong> 12786</p>
                            <p><strong>Currency Symbol:</strong> BRK</p>
                            <p><strong>Block Explorer URL (Optional):</strong> (leave blank)</p>
                        </div>
                        <p>Click "Save". Your MetaMask should now be connected to BrickChain.</p>
                    </AccordionItem>

                    <AccordionItem title="How do I add the BRK token to my wallet?">
                        <p>If you've purchased BRK tokens but don't see them in your wallet, you may need to add the token manually.</p>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Open MetaMask and make sure you are on the "BrickChain" network.</li>
                            <li>Click the "Import tokens" link at the bottom of the asset list.</li>
                            <li>Enter the following BRK Token Contract Address:</li>
                        </ol>
                        <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono my-2 break-all">
                            <p><strong>0x5b1869D9A4C187F2EAa108f3062412ecf0526b24</strong></p>
                        </div>
                        <p>The "Token symbol" (BRK) and "Token decimal" (18) should fill in automatically. Click "Add custom token" and then "Import tokens".</p>
                    </AccordionItem>

                    <AccordionItem title="How do I manually import my Property NFT?">
                        <p>After investing, your property shares (bricks) are represented as an NFT. If it doesn't appear automatically, you can import it.</p>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Go to the property page of your investment.</li>
                            <li>In the "Contract Information" section, find the **NFT Contract Address** and the **Token ID**.</li>
                            <li>Open MetaMask and go to the "NFTs" tab.</li>
                            <li>Click "Import NFT".</li>
                            <li>Paste the **NFT Contract Address** and the **Token ID** into the respective fields.</li>
                            <li>Click "Import". Your property NFT should now be visible in your wallet.</li>
                        </ol>
                        <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono my-2 break-all">
                            <p><strong>NFT Contract Address (for all properties):</strong> {Marketplace.address}</p>
                        </div>
                    </AccordionItem>

                    <AccordionItem title="Why is my transaction failing?">
                        <p>Transactions can fail for several reasons. Here are the most common ones:</p>
                        <ul className="list-disc list-inside space-y-3">
                            <li><strong>Insufficient Gas (BRK):</strong> Even with gasless transactions, some wallet actions might require a small amount of BRK for gas fees. Ensure you have a little BRK in your wallet (e.g., 0.01 BRK).</li>
                            <li><strong>Insufficient BRK Tokens:</strong> If you are buying bricks, make sure you have enough BRK tokens to cover the total cost of the transaction.</li>
                            <li><strong>Transaction Rejected:</strong> You may have accidentally clicked "Reject" in the MetaMask popup. Simply try the transaction again.</li>
                            <li><strong>Relayer Error:</strong> If you see a "gasless transaction failed" or "relayer" error, our gas station might be temporarily offline. Please wait a few minutes and try again.</li>
                        </ul>
                    </AccordionItem>
                </div>
            </div>
            <Footer />
        </div>
    );
}
