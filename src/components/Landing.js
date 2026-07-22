import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useState, useEffect } from 'react';
import MarketplaceJSON from '../Marketplace_new.json';
import { getUserProfile } from '../profileService';
import { getEthersProvider, getPreferredProvider } from '../walletUtils';
import { GetIpfsUrlFromPinata } from "../utils";
import { getTokenLogo } from '../utils/tokenLogo';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import the new images
import TokensInWallet from '../assets/images/tokens-in-wallet.jpg';
import NftInWallet1 from '../assets/images/nft-in-wallet-1.jpg';
import NftInWallet2 from '../assets/images/nft-in-wallet-2.png';

function Landing() {
  const [blockchainProperties, setBlockchainProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState({});
  const [userAddress, setUserAddress] = useState(null);
  const [activeHeroImage, setActiveHeroImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Determine hero images from the first blockchain property or fallback
  const heroImages = blockchainProperties.length > 0 && blockchainProperties[0].images && blockchainProperties[0].images.length > 0
    ? blockchainProperties[0].images.map(img => GetIpfsUrlFromPinata(img)?.replace(/Crop\d+x\d+/, 'Ensure1280x720'))
    : [
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=2940&auto=format&fit=crop"
    ];

  // Auto-scroll hero images
  useEffect(() => {
    if (isHovering || heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovering, heroImages]);

  const nextHeroImage = () => setActiveHeroImage((prev) => (prev + 1) % heroImages.length);
  const prevHeroImage = () => setActiveHeroImage((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1));

  const BRK_TOKEN_ADDRESS = "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24";

  const addBRKToMetaMask = async () => {
    console.log('🚀 ========================================');
    console.log('🚀 STARTING WALLET SETUP');
    console.log('🚀 Timestamp:', new Date().toISOString());
    console.log('🚀 ========================================');

    try {
      // Detect device
      const userAgent = navigator.userAgent;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
      const isIOS = /iPhone|iPad|iPod/.test(userAgent);
      const isAndroid = /Android/i.test(userAgent);

      console.log('📱 DEVICE DETECTION:');
      console.log('   - User Agent:', userAgent);
      console.log('   - Is Mobile:', isMobile);
      console.log('   - Is iOS:', isIOS);
      console.log('   - Is Android:', isAndroid);

      // Step 1: Check for wallet provider
      console.log('\n🔍 STEP 1: CHECKING FOR WALLET PROVIDER');
      console.log('   - window.ethereum exists:', !!window.ethereum);
      console.log('   - window.ethereum.isMetaMask:', window.ethereum?.isMetaMask);
      console.log('   - window.ethereum.isBraveWallet:', window.ethereum?.isBraveWallet);
      console.log('   - window.ethereum.isRabby:', window.ethereum?.isRabby);

      let provider = null;
      let providerName = 'Unknown';

      if (isMobile) {
        provider = window.ethereum;
        providerName = 'Mobile Wallet';
        console.log('   ✓ Using window.ethereum for mobile');
      } else {
        const preferredProvider = getPreferredProvider();
        console.log('   - Preferred provider result:', preferredProvider);

        if (preferredProvider && preferredProvider.provider) {
          provider = preferredProvider.provider;
          providerName = preferredProvider.name;
          console.log('   ✓ Using preferred provider:', providerName);
        } else if (window.ethereum) {
          provider = window.ethereum;
          providerName = 'window.ethereum (fallback)';
          console.log('   ✓ Using window.ethereum as fallback');
        }
      }

      if (!provider) {
        console.error('❌ CRITICAL ERROR: No wallet provider found!');
        console.error('   - window.ethereum:', window.ethereum);
        console.error('   - This usually means no wallet extension is installed');

        alert(
          "❌ NO WALLET DETECTED\n\n" +
          "We couldn't find any wallet extension in your browser.\n\n" +
          "SOLUTIONS:\n" +
          "1. Install MetaMask from metamask.io\n" +
          "2. Install Brave Wallet (if using Brave browser)\n" +
          "3. Install Rabby Wallet from rabby.io\n\n" +
          "After installing, refresh this page and try again."
        );
        return;
      }

      console.log('   ✅ Provider found:', providerName);

      // Step 2: Request wallet connection
      console.log('\n🔐 STEP 2: REQUESTING WALLET CONNECTION');
      console.log('   - Calling provider.request({ method: "eth_requestAccounts" })');

      let accounts;
      try {
        accounts = await provider.request({ method: 'eth_requestAccounts' });
        console.log('   ✅ Wallet connection approved!');
        console.log('   - Connected account:', accounts[0]);
        console.log('   - Total accounts:', accounts.length);
      } catch (connectError) {
        console.error('❌ WALLET CONNECTION FAILED');
        console.error('   - Error code:', connectError.code);
        console.error('   - Error message:', connectError.message);
        console.error('   - Error object:', connectError);

        let errorMsg = "❌ WALLET CONNECTION FAILED\n\n";

        if (connectError.code === 4001) {
          errorMsg += "You rejected the connection request.\n\n";
          errorMsg += "WHAT TO DO:\n";
          errorMsg += "1. Click the button again\n";
          errorMsg += "2. Click 'Connect' when your wallet asks\n";
          errorMsg += "3. Approve the connection";
        } else if (connectError.code === -32002) {
          errorMsg += "A connection request is already pending.\n\n";
          errorMsg += "WHAT TO DO:\n";
          errorMsg += "1. Check your wallet extension (click the icon)\n";
          errorMsg += "2. Look for a pending connection request\n";
          errorMsg += "3. Approve or reject it\n";
          errorMsg += "4. Then try again";
        } else {
          errorMsg += "Error: " + connectError.message + "\n";
          errorMsg += "Error code: " + connectError.code + "\n\n";
          errorMsg += "WHAT TO DO:\n";
          errorMsg += "1. Make sure your wallet extension is unlocked\n";
          errorMsg += "2. Try refreshing the page\n";
          errorMsg += "3. Try restarting your browser";
        }

        alert(errorMsg);
        return;
      }

      // Step 3: Check current network
      console.log('\n🌐 STEP 3: CHECKING CURRENT NETWORK');
      let currentChainId;
      try {
        currentChainId = await provider.request({ method: 'eth_chainId' });
        console.log('   - Current chain ID:', currentChainId);
        console.log('   - Current chain ID (decimal):', parseInt(currentChainId, 16));
        console.log('   - Target chain ID: 0x31f2 (12786)');
      } catch (chainError) {
        console.warn('   ⚠️ Could not get current chain ID:', chainError.message);
      }

      // Step 4: Add/Switch to BrickChain network
      console.log('\n🌐 STEP 4: ADDING/SWITCHING TO BRICKCHAIN NETWORK');
      console.log('   - Calling wallet_addEthereumChain...');

      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x31f2', // 12786 in hex
            chainName: 'BrickChain',
            nativeCurrency: {
              name: 'Brick Gas',
              symbol: 'BRK',
              decimals: 18
            },
            rpcUrls: ['https://rpc.firstbrick.cloud'],
            blockExplorerUrls: ['https://explorer.firstbrick.cloud'],
            iconUrls: ['https://rpc.firstbrick.cloud/ipfs/Qmdc7gosuFCSUJrhAZH7mupAUuG88heWEBV9W7MQraqRXU']
          }]
        });
        console.log('   ✅ BrickChain network added/switched successfully');
      } catch (networkError) {
        console.warn('   ⚠️ NETWORK ADD ERROR (may be okay)');
        console.warn('   - Error code:', networkError.code);
        console.warn('   - Error message:', networkError.message);

        if (networkError.code === 4001) {
          console.warn('   - User rejected network addition');
          alert(
            "⚠️ NETWORK ADDITION CANCELLED\n\n" +
            "You rejected adding the BrickChain network.\n\n" +
            "We'll continue anyway, but you may need to:\n" +
            "1. Manually switch to BrickChain network\n" +
            "2. Or add it manually later\n\n" +
            "Click OK to continue adding the token..."
          );
        } else if (networkError.code === -32602) {
          console.warn('   - Invalid parameters (shouldn\'t happen)');
        } else {
          console.warn('   - Network may already exist, continuing...');
        }
      }

      // Verify we're on the right network
      try {
        const finalChainId = await provider.request({ method: 'eth_chainId' });
        console.log('   - Final chain ID:', finalChainId);
        if (finalChainId !== '0x31f2') {
          console.warn('   ⚠️ WARNING: Not on BrickChain network!');
          console.warn('   - Current network:', parseInt(finalChainId, 16));
          console.warn('   - Expected network: 12786');
        }
      } catch (e) {
        console.warn('   - Could not verify final network');
      }

      // Step 5: Load token logo
      console.log('\n🖼️ STEP 5: LOADING TOKEN LOGO');
      let logoImage;
      try {
        console.log('   - Calling getTokenLogo("BRK")...');
        const startTime = Date.now();
        logoImage = await getTokenLogo('BRK');
        const loadTime = Date.now() - startTime;

        console.log('   ✅ Logo loaded successfully');
        console.log('   - Load time:', loadTime + 'ms');
        console.log('   - Logo type:', typeof logoImage);
        console.log('   - Logo length:', logoImage?.length || 'N/A');
        console.log('   - Is Base64:', logoImage?.startsWith('data:') || false);
      } catch (logoError) {
        console.warn('   ⚠️ LOGO LOADING FAILED');
        console.warn('   - Error:', logoError.message);
        console.warn('   - Using fallback URL instead');
        logoImage = 'https://rpc.firstbrick.cloud/ipfs/Qmdc7gosuFCSUJrhAZH7mupAUuG88heWEBV9W7MQraqRXU';
        console.log('   - Fallback URL:', logoImage);
      }

      // Step 6: Add BRK Token
      console.log('\n🪙 STEP 6: ADDING BRK TOKEN');
      console.log('   - Token contract:', BRK_TOKEN_ADDRESS);
      console.log('   - Token symbol: BRK');
      console.log('   - Token decimals: 18');
      console.log('   - Logo ready:', !!logoImage);
      console.log('   - Calling wallet_watchAsset...');

      let wasAdded;
      try {
        wasAdded = await provider.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: BRK_TOKEN_ADDRESS,
              symbol: 'BRK',
              decimals: 18,
              image: logoImage,
            },
          },
        });

        console.log('   - wallet_watchAsset returned:', wasAdded);
      } catch (tokenError) {
        console.error('❌ TOKEN ADDITION FAILED');
        console.error('   - Error code:', tokenError.code);
        console.error('   - Error message:', tokenError.message);
        console.error('   - Error object:', tokenError);

        let errorMsg = "❌ TOKEN ADDITION FAILED\n\n";

        if (tokenError.code === 4001) {
          errorMsg += "You rejected adding the token.\n\n";
          errorMsg += "MANUAL SETUP:\n";
          errorMsg += "1. Open your wallet\n";
          errorMsg += "2. Go to 'Import tokens'\n";
          errorMsg += "3. Paste: 0x5b1869D9A4C187F2EAa108f3062412ecf0526b24\n";
          errorMsg += "4. Symbol: BRK, Decimals: 18";
        } else if (tokenError.code === -32602) {
          errorMsg += "Invalid token parameters.\n\n";
          errorMsg += "This is a bug. Please report:\n";
          errorMsg += "- Contract: " + BRK_TOKEN_ADDRESS + "\n";
          errorMsg += "- Error: " + tokenError.message;
        } else {
          errorMsg += "Error: " + tokenError.message + "\n\n";
          errorMsg += "MANUAL SETUP:\n";
          errorMsg += "Contract: 0x5b1869D9A4C187F2EAa108f3062412ecf0526b24\n";
          errorMsg += "Symbol: BRK\n";
          errorMsg += "Decimals: 18\n";
          errorMsg += "Network: BrickChain (12786)";
        }

        alert(errorMsg);
        return;
      }

      // Final result
      console.log('\n✅ ========================================');
      console.log('✅ SETUP COMPLETED');
      console.log('✅ ========================================');
      console.log('   - Wallet connected: ✓');
      console.log('   - Network added: ✓');
      console.log('   - Token added:', wasAdded ? '✓' : '✗ (user cancelled)');
      console.log('   - Account:', accounts[0]);

      if (wasAdded) {
        alert(
          '✅ SETUP COMPLETE!\n\n' +
          '✓ Wallet connected\n' +
          '✓ BrickChain network added\n' +
          '✓ BRK token added successfully\n\n' +
          'You\'re ready to invest!'
        );
      } else {
        alert(
          '⚠️ SETUP PARTIALLY COMPLETE\n\n' +
          '✓ Wallet connected\n' +
          '✓ BrickChain network added\n' +
          '✗ Token not added (you cancelled)\n\n' +
          'To add token manually:\n' +
          'Contract: 0x5b1869D9A4C187F2EAa108f3062412ecf0526b24'
        );
      }

    } catch (error) {
      console.error('\n❌ ========================================');
      console.error('❌ UNEXPECTED ERROR');
      console.error('❌ ========================================');
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', error);

      let errorMsg = "❌ UNEXPECTED ERROR\n\n";
      errorMsg += "Something went wrong that we didn't expect.\n\n";
      errorMsg += "ERROR DETAILS:\n";
      errorMsg += "Type: " + error.name + "\n";
      errorMsg += "Message: " + error.message + "\n";
      if (error.code) errorMsg += "Code: " + error.code + "\n";
      errorMsg += "\n";
      errorMsg += "WHAT TO DO:\n";
      errorMsg += "1. Open browser console (F12)\n";
      errorMsg += "2. Screenshot the red error messages\n";
      errorMsg += "3. Share with support\n\n";
      errorMsg += "MANUAL SETUP:\n";
      errorMsg += "Network: BrickChain\n";
      errorMsg += "RPC: https://rpc.firstbrick.cloud\n";
      errorMsg += "Chain ID: 12786\n";
      errorMsg += "Token: 0x5b1869D9A4C187F2EAa108f3062412ecf0526b24";

      alert(errorMsg);
    }
  };

  useEffect(() => {
    async function fetchPropertyData() {
      setLoading(true);
      const ethers = require("ethers");
      try {
        let provider;
        let fetchedUserAddress = null;

        const CORRECT_RPC = "https://rpc.firstbrick.cloud";
        try {
          provider = getEthersProvider();
          const signer = provider.getSigner();
          fetchedUserAddress = await signer.getAddress();
          setUserAddress(fetchedUserAddress);
        } catch (err) {
          provider = new ethers.providers.StaticJsonRpcProvider(CORRECT_RPC, { chainId: 12786, name: 'BrickChain' });
        }

        const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, provider);

        const allTokenIds = await contract.getAllProperties();

        const propertiesToFetch = allTokenIds.slice(-2).reverse();

        const propertyPromises = propertiesToFetch.map(tokenId => (async () => {
          try {
            const propertyData = await contract.getPropertyData(tokenId);
            if (propertyData.totalBricks.eq(0)) return null;

            const metadataUri = await contract.uri(tokenId);
            const metadata = await (await fetch(GetIpfsUrlFromPinata(metadataUri))).json();

            const buyer = await contract.propertyBuyer(tokenId);
            const depositAmount = parseFloat(ethers.utils.formatEther(propertyData.depositAmount));
            const pricePerBrick = parseFloat(ethers.utils.formatEther(propertyData.pricePerBrick));

            const investors = [];
            const investorAddresses = await contract.getInvestorList(tokenId);
            const trustWallet = await contract.propertyTrustWallet(tokenId);
            for (const address of investorAddresses) {
              if (address.toLowerCase() === trustWallet.toLowerCase()) continue;
              const balance = await contract.balanceOf(address, tokenId);
              const bricks = parseInt(ethers.utils.formatUnits(balance, 0));
              if (bricks > 0) {
                investors.push({ address, bricks, amount: bricks * pricePerBrick });
              }
            }
            investors.sort((a, b) => b.bricks - a.bricks);

            let userBricks = 0;
            if (fetchedUserAddress) {
              const balance = await contract.balanceOf(fetchedUserAddress, tokenId);
              userBricks = parseInt(ethers.utils.formatUnits(balance, 0));
            }

            return {
              tokenId: tokenId,
              image: metadata.image,
              name: metadata.name,
              location: metadata.properties?.propertyAddress || 'N/A',
              totalPropertyValue: ethers.utils.formatUnits(propertyData.totalBricks, 0),
              bricksToSell: ethers.utils.formatUnits(propertyData.bricksAvailable, 0),
              pricePerBrick: ethers.utils.formatEther(propertyData.pricePerBrick),
              buyer,
              buyerDeposit: depositAmount,
              investors,
              otpDeadline: ethers.utils.formatUnits(propertyData.otpDeadline, 0),
              userBricks,
            };
          } catch (err) {
            console.error(`Failed to load property ${tokenId}:`, err);
            return null;
          }
        })());

        const items = (await Promise.all(propertyPromises)).filter(Boolean);
        setBlockchainProperties(items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchPropertyData();
  }, []);

  useEffect(() => {
    if (blockchainProperties.length === 0) return;
    async function loadProfiles() {
      const addresses = new Set();
      blockchainProperties.forEach(prop => {
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
  }, [blockchainProperties]);

  const getProfileData = (address) => profiles[address.toLowerCase()] || {};
  const getInitials = (nameOrAddress) => {
    if (!nameOrAddress) return '?';
    if (nameOrAddress.startsWith('0x')) return nameOrAddress.substring(2, 4).toUpperCase();
    const parts = nameOrAddress.trim().split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : nameOrAddress.substring(0, 2).toUpperCase();
  };

  const featuredProperty = blockchainProperties[0];

  return (
    <div className="bg-black text-white h-screen w-full snap-y snap-mandatory overflow-y-scroll overflow-x-hidden">
      <Navbar />

      {/* Section 1: Hero */}
      <section className="h-screen w-full snap-start flex flex-col justify-between items-center text-center relative p-4">
        {/* Carousel Background */}
        <div className="absolute inset-0 bg-black overflow-hidden transition-all duration-1000">
          {heroImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Hero ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === activeHeroImage ? 'opacity-50' : 'opacity-0'}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>

        {/* Carousel Controls */}
        <button
          onClick={prevHeroImage}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all z-20 hidden md:block"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button
          onClick={nextHeroImage}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all z-20 hidden md:block"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
        <div className="relative z-10 flex flex-col justify-center items-center h-full pt-16">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Own real estate, <br /><span className="text-yellow-400">one brick at a time.</span></h1>
          <p className="text-md sm:text-lg text-gray-200 max-w-md mx-auto mb-8">Invest in premium property fractions, earn passive mortgage income, and build wealth with as little as R105.</p>
        </div>
        <div className="relative z-10 w-full pb-8">
          <Link to="/marketplace" className="bg-white text-gray-900 font-bold py-3 px-8 rounded-full text-lg w-full max-w-xs mx-auto block">Browse Properties</Link>
        </div>
      </section>

      {/* Loading State for Properties - Brick Animation */}
      {loading && (
        <section className="h-screen w-full snap-start flex flex-col justify-center items-center bg-gray-900">
          <div className="relative">
            {/* Brick Loading Animation */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2 items-end">
                <div className="w-16 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-sm animate-brick-stack" style={{ animationDelay: '0s' }}></div>
                <div className="w-16 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-sm animate-brick-stack" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-16 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-sm animate-brick-stack" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <div className="flex gap-2 items-end">
                <div className="w-16 h-10 bg-gradient-to-br from-orange-600 to-red-700 rounded-sm animate-brick-stack" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-16 h-10 bg-gradient-to-br from-orange-600 to-red-700 rounded-sm animate-brick-stack" style={{ animationDelay: '0.4s' }}></div>
                <div className="w-16 h-10 bg-gradient-to-br from-orange-600 to-red-700 rounded-sm animate-brick-stack" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <div className="flex gap-2 items-end">
                <div className="w-16 h-10 bg-gradient-to-br from-orange-700 to-red-800 rounded-sm animate-brick-stack" style={{ animationDelay: '0.6s' }}></div>
                <div className="w-16 h-10 bg-gradient-to-br from-orange-700 to-red-800 rounded-sm animate-brick-stack" style={{ animationDelay: '0.7s' }}></div>
                <div className="w-16 h-10 bg-gradient-to-br from-orange-700 to-red-800 rounded-sm animate-brick-stack" style={{ animationDelay: '0.8s' }}></div>
              </div>
            </div>
            <p className="text-white text-center mt-6 text-lg font-semibold animate-brick-pulse">Building your property...</p>
          </div>
        </section>
      )}

      {/* Section 2 & 3: Property Details */}
      {!loading && featuredProperty && (
        <>
          {/* Section 2: Property Details - Compact Version */}
          <section className="h-screen w-full snap-start flex flex-col relative bg-gray-900">
            {/* Image: 2/3 of screen */}
            <div className="h-2/3 relative">
              <img src={GetIpfsUrlFromPinata(featuredProperty.image)} alt={featuredProperty.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
            </div>

            {/* Info: 1/3 of screen */}
            <div className="h-1/3 relative z-10 flex flex-col justify-center px-3 pb-3 -mt-8">
              <div className="bg-black/80 backdrop-blur-md rounded-xl p-3">
                <h2 className="text-lg font-bold mb-0.5 leading-tight">{featuredProperty.name}</h2>
                <p className="text-gray-400 text-xs mb-2 leading-tight truncate">{featuredProperty.location}</p>

                {(() => {
                  const totalValue = parseFloat(featuredProperty.totalPropertyValue) * parseFloat(featuredProperty.pricePerBrick);
                  const raised = featuredProperty.buyerDeposit + featuredProperty.investors.reduce((sum, inv) => sum + inv.amount, 0);

                  // Consistent Percentage Calculation (matches Marketplace.js)
                  const percentage = totalValue > 0 ? (raised / totalValue) * 100 : 0;

                  const daysLeft = Math.max(0, Math.ceil((parseInt(featuredProperty.otpDeadline) * 1000 - Date.now()) / (1000 * 60 * 60 * 24)));
                  const hoursLeft = Math.max(0, Math.ceil((parseInt(featuredProperty.otpDeadline) * 1000 - Date.now()) / (1000 * 60 * 60)) % 24);

                  return (
                    <>
                      {/* Compact Progress Bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white font-semibold">{percentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Compact VALUE, RAISED, TIMER Grid */}
                      <div className="grid grid-cols-3 gap-1.5 mb-2 text-white">
                        <div className="bg-blue-600/30 backdrop-blur-sm p-1.5 rounded-lg border border-blue-500/30">
                          <p className="text-[10px] uppercase text-blue-200 font-medium leading-tight">Value</p>
                          <p className="text-xs font-bold leading-tight">R{totalValue.toLocaleString()}</p>
                        </div>
                        <div className="bg-green-600/30 backdrop-blur-sm p-1.5 rounded-lg border border-green-500/30">
                          <p className="text-[10px] uppercase text-green-200 font-medium leading-tight">Raised</p>
                          <p className="text-xs font-bold leading-tight">R{raised.toLocaleString()}</p>
                        </div>
                        <div className="bg-orange-600/30 backdrop-blur-sm p-1.5 rounded-lg border border-orange-500/30">
                          <p className="text-[10px] uppercase text-orange-200 font-medium leading-tight">Timer</p>
                          <p className="text-xs font-bold leading-tight">{daysLeft}D {hoursLeft}H</p>
                        </div>
                      </div>

                      {/* Compact INVEST Button */}
                      <Link
                        to={`/nftPage/${featuredProperty.tokenId}`}
                        className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm py-2.5 rounded-lg shadow-lg transition-all duration-200 active:scale-95"
                      >
                        INVEST NOW
                      </Link>
                    </>
                  );
                })()}
              </div>
            </div>
          </section>

          {/* Section 3: Compact Investors */}
          <section className="h-screen w-full snap-start snap-always flex flex-col bg-gray-900 text-white">
            <div className="flex-1 overflow-y-auto p-3 pt-20">
              <h3 className="text-lg font-bold text-center mb-3">Top Investors</h3>
              <div className="space-y-1.5 max-w-md mx-auto">
                {featuredProperty.buyer && featuredProperty.buyerDeposit > 0 && (() => {
                  const profile = getProfileData(featuredProperty.buyer);
                  const displayName = profile.name || `${featuredProperty.buyer.substring(0, 6)}...`;
                  return (
                    <div className="flex items-center justify-between bg-blue-500/20 p-2 rounded-lg border border-blue-500/30">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {profile.profilePicture ? <img src={GetIpfsUrlFromPinata(profile.profilePicture)} alt={displayName} className="w-8 h-8 rounded-full flex-shrink-0" /> : <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{getInitials(profile.name || featuredProperty.buyer)}</div>}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">
                            {displayName}
                            {!!profile.name && <span className="text-gray-400 font-normal text-[10px] ml-1">({featuredProperty.buyer.substring(0, 4)}...{featuredProperty.buyer.substring(38)})</span>}
                          </p>
                          <span className="text-[10px] text-blue-300 font-medium">BUYER</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white flex-shrink-0 ml-2">R{featuredProperty.buyerDeposit.toLocaleString()}</span>
                    </div>
                  );
                })()}
                {featuredProperty.investors.slice(0, 5).map((inv) => {
                  const profile = getProfileData(inv.address);
                  const displayName = profile.name || `${inv.address.substring(0, 6)}...`;
                  return (
                    <div key={inv.address} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-lg border border-gray-600/30">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {profile.profilePicture ? <img src={GetIpfsUrlFromPinata(profile.profilePicture)} alt={displayName} className="w-8 h-8 rounded-full flex-shrink-0" /> : <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold flex-shrink-0">{getInitials(profile.name || inv.address)}</div>}
                        <p className="text-xs font-bold truncate flex-1">
                          {displayName}
                          {!!profile.name && <span className="text-gray-400 font-normal text-[10px] ml-1">({inv.address.substring(0, 4)}...{inv.address.substring(38)})</span>}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-white flex-shrink-0 ml-2">R{inv.amount.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Buttons Container - Fixed at bottom with safe spacing */}
            <div className="flex-shrink-0 p-3 pb-safe space-y-2 bg-gray-900">
              <a
                href={`https://explorer.firstbrick.cloud/token/0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B/instance/${featuredProperty.tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full max-w-md mx-auto text-center bg-gray-800 border-2 border-gray-600 text-white font-bold text-sm py-2.5 rounded-lg hover:bg-gray-700 transition-all active:scale-95"
              >
                VIEW ON EXPLORER
              </a>
              <button
                onClick={addBRKToMetaMask}
                className="block w-full max-w-md mx-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm py-2.5 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                Connect Wallet & Add BRK
              </button>
            </div>
          </section>
        </>
      )}

      {/* Section 4: Wallet Screenshots with Floating Effect */}
      <section className="h-screen w-full snap-start snap-always flex flex-col justify-center items-center bg-black p-6 pb-8 text-center">
        <div className="w-full max-w-sm mx-auto">
          <div className="relative h-[32rem]">
            {/* Floating Carousel Container */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="flex h-full w-[300%] animate-carousel-smooth">
                <div className="w-1/3 h-full flex items-center justify-center p-4">
                  <img
                    src={TokensInWallet}
                    alt="BRK Tokens in wallet"
                    className="w-full h-auto max-h-full object-contain rounded-3xl shadow-2xl hover:shadow-purple-500/20 transition-shadow duration-500 animate-float"
                    style={{ animationDelay: '0s' }}
                  />
                </div>
                <div className="w-1/3 h-full flex items-center justify-center p-4">
                  <img
                    src={NftInWallet1}
                    alt="Property NFT in wallet"
                    className="w-full h-auto max-h-full object-contain rounded-3xl shadow-2xl hover:shadow-purple-500/20 transition-shadow duration-500 animate-float"
                    style={{ animationDelay: '0.3s' }}
                  />
                </div>
                <div className="w-1/3 h-full flex items-center justify-center p-4">
                  <img
                    src={NftInWallet2}
                    alt="Property NFT details in wallet"
                    className="w-full h-auto max-h-full object-contain rounded-3xl shadow-2xl hover:shadow-purple-500/20 transition-shadow duration-500 animate-float"
                    style={{ animationDelay: '0.6s' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Wallet Setup Button */}
        <div className="w-full max-w-sm mx-auto mt-8">
          <button
            onClick={addBRKToMetaMask}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Complete Wallet Setup
          </button>
          <p className="text-gray-500 text-xs text-center mt-2">
            Connect wallet • Add BrickChain • Add BRK Token
          </p>
        </div>
      </section>

      {/* Section 5: Footer */}
      <section className="h-screen w-full snap-start flex flex-col">
        <Footer />
      </section>
    </div>
  );
}

export default Landing;
