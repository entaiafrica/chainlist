import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';
import {
  connectWallet,
  getCurrentAddress,
  onAccountsChanged,
  onChainChanged,
  isWalletInstalled,
  getWalletInstallUrl,
  formatAddress,
  detectWalletProviders,
  getCurrentChainId
} from '../walletUtils';
import NetworkMismatchModal from './NetworkMismatchModal';

function Navbar() {
  const [connected, toggleConnect] = useState(false);
  const location = useLocation();
  const [currAddress, updateAddress] = useState('0x');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasWallet, setHasWallet] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [walletInfo, setWalletInfo] = useState({ name: '', url: '' });
  const [isConnecting, setIsConnecting] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  const isLandingPage = location.pathname === '/';

  // Determine if the navbar should be in its "light" text state
  const useLightText = isLandingPage && !isScrolled && !mobileMenuOpen;

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function connectWebsite() {
    if (isConnecting) return; // Prevent multiple connection attempts

    setIsConnecting(true);
    const targetChainId = '0x31f2'; // 12786 in hex (localhost)

    try {
      const result = await connectWallet(targetChainId);

      if (result.success) {
        updateAddress(result.address);
        toggleConnect(true);

        // Optional: Show which wallet is connected
        if (result.walletName) {
          console.log(`Connected to ${result.walletName}`);
        }

        // Reload to update page state
        window.location.replace(location.pathname);
      } else {
        if (result.shouldInstall) {
          setHasWallet(false);
        }

        // Check if network doesn't exist (error code 4902)
        if (result.errorCode === 4902) {
          console.warn("Network not found in wallet - showing network mismatch modal");
          setShowNetworkModal(true);
        } else {
          console.error("Connection failed:", result.error);
          alert(result.error || "Failed to connect wallet");
        }
      }
    } catch (error) {
      console.error("Unexpected error during connection:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  }

  useEffect(() => {
    // Check wallet installation and get install URL
    async function checkWallet() {
      const installed = isWalletInstalled();
      setHasWallet(installed);

      if (!installed) {
        const installInfo = await getWalletInstallUrl();
        setWalletInfo(installInfo);
      } else {
        // Detect which wallets are available
        const providers = detectWalletProviders();
        if (providers.length > 0) {
          setWalletInfo({ name: providers[0].name, icon: providers[0].icon });
        }
      }
    }

    checkWallet();

    if (!isWalletInstalled()) {
      return;
    }

    // Check for existing connection and network
    getCurrentAddress().then(async address => {
      if (address) {
        updateAddress(address);
        toggleConnect(true);

        // Check if user is on correct network
        try {
          const currentChainId = await getCurrentChainId();
          const targetChainId = '0x31f2'; // 12786 in hex

          if (currentChainId !== targetChainId) {
            console.warn(`Wrong network detected: ${currentChainId}, expected: ${targetChainId}`);
            setShowNetworkModal(true);
          }
        } catch (err) {
          console.error('Error checking network:', err);
        }
      }
    });

    // Listen for account changes with cleanup
    const accountCleanup = onAccountsChanged((address) => {
      if (address) {
        updateAddress(address);
        toggleConnect(true);
      } else {
        updateAddress('0x');
        toggleConnect(false);
      }
    });

    // Listen for chain changes
    const chainCleanup = onChainChanged((chainId) => {
      const targetChainId = '0x31f2'; // 12786 in hex
      console.log('Chain changed to:', chainId);

      if (chainId !== targetChainId) {
        setShowNetworkModal(true);
      } else {
        setShowNetworkModal(false);
        // Reload page when correct network is selected
        window.location.reload();
      }
    });

    return () => {
      if (accountCleanup) accountCleanup();
      if (chainCleanup) chainCleanup();
    };
  }, [location.pathname]);

  const navLinks = [
    { path: "/about", label: "About" },
    { path: "/marketplace", label: "Market" },
    { path: "/buy-bricks", label: "Buy Bricks" },
    { path: "/sellNFT", label: "Finance" },
    { path: "/genesis-investor", label: "Genesis", isHighlighted: true },
    { path: "/profile", label: "Profile" }
  ];

  const navClasses = `fixed top-0 z-50 w-full transition-all duration-300 ${isLandingPage && !isScrolled && !mobileMenuOpen ? 'bg-transparent' : 'bg-white/80 shadow-md backdrop-blur-lg'
    }`;
  const linkColor = useLightText ? 'text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]' : 'text-gray-800';
  const activeLinkColor = useLightText ? 'border-white' : 'border-primary';

  return (
    <div className={navClasses}>
      <nav className="w-full">
        <div className='max-w-7xl mx-auto flex flex-row items-center justify-between py-4 px-4 md:px-6'>
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0 group">
            <div className="relative flex items-center justify-center">
              <img
                src="/brick-logo.png"
                alt="FirstBrick Logo"
                className="h-9 w-9 transition-transform group-hover:scale-110 object-contain z-10"
              />
              {/* Glow effect for visibility on all backgrounds */}
              <div className="absolute inset-0 bg-white/20 blur-md rounded-full scale-75 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className={`text-2xl font-bold transition-colors font-['Cairo_Play'] tracking-tight text-black`} style={{ textShadow: '0 0 5px white, 0 0 10px white' }}>
              FirstBrick
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex flex-row items-center gap-6 flex-grow justify-center'>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium pb-1 transition-all relative ${link.isHighlighted
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 rounded-lg hover:from-yellow-600 hover:to-orange-600'
                    : `${linkColor} hover:border-b-2 hover:${activeLinkColor} ${location.pathname === link.path ? `border-b-2 ${activeLinkColor}` : 'border-transparent'
                    }`
                  }`}
              >
                {link.label}
                {link.isHighlighted && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1 rounded-full animate-pulse">
                    NEW
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Wallet Button */}
          <div className="hidden md:flex items-center gap-3">
            {!hasWallet ? (
              <a
                href={walletInfo.url || "https://metamask.io/download/"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-all"
              >
                {walletInfo.message || "Install Wallet"}
              </a>
            ) : (
              <button
                className={`enableEthereumButton font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${useLightText ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                onClick={connectWebsite}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Connecting...
                  </span>
                ) : connected ? (
                  <span className="flex items-center gap-2">
                    {walletInfo.icon && <span>{walletInfo.icon}</span>}
                    {formatAddress(currAddress)}
                  </span>
                ) : (
                  "Connect Wallet"
                )}
              </button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-all ${linkColor}`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="flex flex-col py-2 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 text-base font-semibold transition-all flex items-center justify-between ${link.isHighlighted
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 rounded-lg mb-2'
                      : `text-gray-800 ${location.pathname === link.path ? 'text-primary' : ''}`
                    }`}
                >
                  <span>{link.label}</span>
                  {link.isHighlighted && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                      NEW
                    </span>
                  )}
                </Link>
              ))}
              <div className="mt-4">
                {!hasWallet ? (
                  <a
                    href={walletInfo.url || "https://metamask.io/download/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center block bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-all"
                  >
                    {walletInfo.message || "Install Wallet"}
                  </a>
                ) : (
                  <button
                    className="enableEthereumButton w-full bg-primary text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={connectWebsite}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Connecting...
                      </span>
                    ) : connected ? (
                      <span className="flex items-center justify-center gap-2">
                        {walletInfo.icon && <span>{walletInfo.icon}</span>}
                        {formatAddress(currAddress)}
                      </span>
                    ) : (
                      "Connect Wallet"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Network Mismatch Modal */}
      <NetworkMismatchModal
        isOpen={showNetworkModal}
        onClose={() => setShowNetworkModal(false)}
        currentNetwork="Unknown"
        targetNetwork="BrickChain"
      />
    </div>
  );
}

export default Navbar;
