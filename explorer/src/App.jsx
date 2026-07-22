import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Blocks from './components/Blocks';
import Transactions from './components/Transactions';
import Tokens from './components/Tokens';
import WalletTransactions from './components/WalletTransactions';
import TransactionDetail from './components/TransactionDetail';
import BlockDetail from './components/BlockDetail';
import AddressDetail from './components/AddressDetail';
import TokenHolders from './components/TokenHolders';
import Properties from './components/Properties';
import { ThemeProvider } from './components/theme-provider';
import { ThemeToggle } from './components/theme-toggle';
import { ethers } from 'ethers';

function App() {
  const [connected, setConnected] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasWallet, setHasWallet] = useState(true);
  const [brkBalance, setBrkBalance] = useState('0');
  const [propertyCount, setPropertyCount] = useState(0);

  // Check for existing wallet connection on component mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setCurrentAddress(accounts[0]);
            setConnected(true);
          }
        } catch (error) {
          console.error('Error checking existing connection:', error);
        }
      } else {
        setHasWallet(false);
      }
    };

    checkExistingConnection();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // MetaMask is unlocked but no account is set
          setConnected(false);
          setCurrentAddress('');
        } else if (accounts[0] !== currentAddress) {
          // New account selected
          setCurrentAddress(accounts[0]);
          setConnected(true);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Clean up listener
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [currentAddress]);

  const connectWallet = async () => {
    if (isConnecting) return;

    setIsConnecting(true);

    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setCurrentAddress(accounts[0]);
        setConnected(true);
      } else {
        setHasWallet(false);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        // User rejected request
        console.log('User rejected wallet connection');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Fetch BRK token balance
  const fetchBrkBalance = async (address) => {
    if (!address) {
      setBrkBalance('0');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const BRK_TOKEN_ADDRESS = '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24';
      const abi = ['function balanceOf(address) view returns (uint256)'];
      const contract = new ethers.Contract(BRK_TOKEN_ADDRESS, abi, provider);

      const balance = await contract.balanceOf(address);
      const formattedBalance = ethers.formatEther(balance);

      // Format with commas and 2 decimal places
      const numBalance = parseFloat(formattedBalance);
      setBrkBalance(numBalance.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 }));
    } catch (error) {
      console.error('Error fetching BRK balance:', error);
      setBrkBalance('0');
    }
  };

  // Fetch property/NFT count
  const fetchPropertyCount = async (address) => {
    if (!address) {
      setPropertyCount(0);
      return;
    }

    try {
      const response = await fetch(`https://explorer.firstbrick.cloud/api/addresses/${address}/tokens`);
      const data = await response.json();

      // Count unique NFTs (tokens with token_id)
      const nftCount = data.tokens?.filter(token => token.token_id !== null).length || 0;
      setPropertyCount(nftCount);
    } catch (error) {
      console.error('Error fetching property count:', error);
      setPropertyCount(0);
    }
  };

  // Fetch balance when address changes
  useEffect(() => {
    if (connected && currentAddress) {
      fetchBrkBalance(currentAddress);
      fetchPropertyCount(currentAddress);

      // Refresh balances every 30 seconds
      const interval = setInterval(() => {
        fetchBrkBalance(currentAddress);
        fetchPropertyCount(currentAddress);
      }, 30000);

      return () => clearInterval(interval);
    } else {
      setBrkBalance('0');
      setPropertyCount(0);
    }
  }, [connected, currentAddress]);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <ThemeProvider defaultTheme="light">
      <Router>
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
          {/* Header with wallet connection */}
          <header className="bg-card/80 backdrop-blur-lg shadow-md border-b border-border fixed w-full top-0 z-50">
            <div className="flex flex-row items-center justify-between py-4 px-4 md:px-6">
              <Link to="/" className="flex items-center space-x-2 flex-shrink-0 group">
                <div className="relative flex items-center justify-center">
                  <img
                    src="/brick-logo.png"
                    alt="FirstBrick Logo"
                    className="h-9 w-9 transition-transform group-hover:scale-110 object-contain z-10"
                  />
                  <div className="absolute inset-0 bg-primary/20 blur-md rounded-full scale-75 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <span className="text-2xl font-bold gradient-text font-cairo tracking-tight">
                  FirstBrick Explorer
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="font-medium text-foreground hover:text-primary transition-colors">Home</Link>
                <Link to="/blocks" className="font-medium text-foreground hover:text-primary transition-colors">Blocks</Link>
                <Link to="/transactions" className="font-medium text-foreground hover:text-primary transition-colors">Transactions</Link>
                <Link to="/tokens" className="font-medium text-foreground hover:text-primary transition-colors">Tokens</Link>
                <Link to="/properties" className="font-medium text-foreground hover:text-primary transition-colors">Properties</Link>
                {connected && (
                  <Link to="/wallet" className="font-medium text-foreground hover:text-primary transition-colors">My Transactions</Link>
                )}
              </div>

              <div className="hidden md:flex items-center gap-3">
                <ThemeToggle />
                {!hasWallet ? (
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="metamask-button"
                  >
                    Install Wallet
                  </a>
                ) : connected ? (
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/address/${currentAddress}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-all"
                    >
                      <Home className="w-4 h-4 text-accent" />
                      <span className="font-bold text-accent">{propertyCount} {propertyCount === 1 ? 'Property' : 'Properties'}</span>
                    </Link>
                    <div className="flex flex-col items-end gap-1 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-2">
                        <img src="/brick-logo.png" alt="BRK" className="w-4 h-4" />
                        <span className="font-bold text-primary">{brkBalance} BRK</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatAddress(currentAddress)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    className="px-4 py-2 rounded-lg font-medium gradient-primary text-white hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                    onClick={connectWallet}
                    disabled={isConnecting}
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                )}
              </div>
            </div>
          </header>

        {/* Main content area */}
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/blocks" element={<Blocks />} />
            <Route path="/block/:number" element={<BlockDetail />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/tx/:hash" element={<TransactionDetail />} />
            <Route path="/address/:address" element={<AddressDetail />} />
            <Route path="/tokens" element={<Tokens />} />
            <Route path="/tokens/brk" element={<Tokens />} />
            <Route path="/tokens/nft" element={<Tokens />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/token/:address/holders" element={<TokenHolders />} />
            <Route path="/wallet" element={<WalletTransactions walletAddress={currentAddress} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 w-full mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Brand Section */}
              <div className="col-span-1 md:col-span-1">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl font-bold text-white">FirstBrick Explorer</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Blockchain explorer for the FirstBrick ecosystem.
                  Explore blocks, transactions, and token activity.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-bold mb-4">Explorer</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/blocks" className="text-gray-400 hover:text-primary transition-colors">
                      Blocks
                    </Link>
                  </li>
                  <li>
                    <Link to="/transactions" className="text-gray-400 hover:text-primary transition-colors">
                      Transactions
                    </Link>
                  </li>
                  <li>
                    <Link to="/tokens" className="text-gray-400 hover:text-primary transition-colors">
                      Tokens
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Token Links */}
              <div>
                <h3 className="text-white font-bold mb-4">Tokens</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/tokens/brk" className="text-gray-400 hover:text-primary transition-colors">
                      BRK Token
                    </Link>
                  </li>
                  <li>
                    <Link to="/tokens/brkg" className="text-gray-400 hover:text-primary transition-colors">
                      BRKG Token
                    </Link>
                  </li>
                  <li>
                    <Link to="/tokens/gbrk" className="text-gray-400 hover:text-primary transition-colors">
                      GBRK Token
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-white font-bold mb-4">FirstBrick</h3>
                <ul className="space-y-3">
                  <li className="text-gray-400 text-sm">
                    Johannesburg, South Africa
                  </li>
                  <li>
                    <a href="mailto:info@firstbrick.com" className="text-gray-400 hover:text-primary transition-colors text-sm">
                      info@firstbrick.com
                    </a>
                  </li>
                  <li className="text-gray-400 text-sm">
                    010 347 7827
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} FirstBrick. All rights reserved.
                  </p>
                </div>
                <div className="flex flex-wrap gap-6 justify-center">
                  <a href="/disclaimer" className="text-gray-400 hover:text-primary transition-colors text-sm">
                    Terms & Conditions
                  </a>
                  <a href="/disclaimer" className="text-gray-400 hover:text-primary transition-colors text-sm">
                    Privacy Policy
                  </a>
                  <a href="/disclaimer" className="text-gray-400 hover:text-primary transition-colors text-sm">
                    Risk Disclosure
                  </a>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-xs">
                  FirstBrick Explorer - Blockchain transparency for property tokenization.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
    </ThemeProvider>
  );
}

export default App;