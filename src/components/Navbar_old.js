import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

function Navbar() {

const [connected, toggleConnect] = useState(false);
const location = useLocation();
const [currAddress, updateAddress] = useState('0x');
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

async function getAddress() {
  const ethers = require("ethers");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const addr = await signer.getAddress();
  updateAddress(addr);
}

function updateButton() {
  const ethereumButton = document.querySelector('.enableEthereumButton');
  ethereumButton.innerHTML = "<span class='text-xs font-normal text-purple-200'>Connected</span><span class='font-mono text-xs'>" + currAddress.substring(0,6) + "..." + currAddress.substring(currAddress.length-4) + "</span>";
}

async function connectWebsite() {

    // Convert chain ID 1337 to hex (0x31f2)
    const targetChainId = '0x31f2'; // 12786 in hexadecimal
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if(chainId !== targetChainId)
    {
      //alert('Incorrect network! Switch your metamask network to local blockchain (1337)');
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
     })
    }
    await window.ethereum.request({ method: 'eth_requestAccounts' })
      .then(() => {
        updateButton();
        console.log("here");
        getAddress();
        window.location.replace(location.pathname)
      });
}

  useEffect(() => {
    if(window.ethereum == undefined)
      return;

    const handleAccountsChanged = (accounts) => {
      if(accounts.length > 0) {
        getAddress();
        toggleConnect(true);
        updateButton();
      } else {
        toggleConnect(false);
        // Reset button text to "Connect Wallet" when disconnected
        const ethereumButton = document.querySelector('.enableEthereumButton');
        if(ethereumButton) {
          ethereumButton.textContent = "Connect Wallet";
          ethereumButton.classList.remove("hover:bg-blue-70");
          ethereumButton.classList.remove("bg-blue-500");
          ethereumButton.classList.add("hover:bg-blue-70");
          ethereumButton.classList.add("bg-blue-500");
        }
      }
      window.location.replace(location.pathname);
    };

    let val = window.ethereum.isConnected();
    if(val) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if(accounts.length > 0) {
            console.log("here");
            getAddress();
            toggleConnect(true);
            updateButton();
          }
        });
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      if(window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [location.pathname]);

    return (
      <div className="sticky top-0 z-50 bg-gradient-to-r from-black via-gray-900 to-black border-b border-gray-800 backdrop-blur-md">
        <nav className="w-full">
          <ul className='flex flex-row items-center justify-between py-3 md:py-4 px-4 md:px-6 text-white w-full'>
              <li className='flex items-center flex-shrink-0'>
                <Link to="/" className="group flex flex-row items-center space-x-2">
                    <img
                      src="/brick-logo.png"
                      alt="FirstBrick Logo"
                      className="h-8 w-8 md:h-10 md:w-10 group-hover:scale-110 transition-transform"
                    />
                    <span className="logo-font text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text group-hover:from-pink-500 group-hover:to-purple-400 transition-all whitespace-nowrap">
                      FirstBrick
                    </span>
                </Link>
              </li>

              {/* Desktop Navigation */}
              <li className='flex flex-row items-center gap-2 md:gap-4 flex-wrap justify-center w-full md:w-auto md:flex-grow overflow-x-auto'>
              {location.pathname === "/" ?
              <Link to="/" className='border-b-2 border-purple-500 pb-1 px-3 py-2.5 text-sm md:text-sm font-semibold whitespace-nowrap active:scale-95 transition-all'>Home</Link>
              :
              <Link to="/" className='hover:border-b-2 hover:border-purple-400 hover:pb-1 px-3 py-2.5 text-sm md:text-sm font-medium transition-all whitespace-nowrap active:scale-95'>Home</Link>
              }
              {location.pathname === "/marketplace" ?
              <Link to="/marketplace" className='border-b-2 border-purple-500 pb-1 px-3 py-2.5 text-sm md:text-sm font-semibold whitespace-nowrap active:scale-95 transition-all'>Market</Link>
              :
              <Link to="/marketplace" className='hover:border-b-2 hover:border-purple-400 hover:pb-1 px-3 py-2.5 text-sm md:text-sm font-medium transition-all whitespace-nowrap active:scale-95'>Market</Link>
              }
              {location.pathname === "/buy-bricks" ?
              <Link to="/buy-bricks" className='border-b-2 border-purple-500 pb-1 px-3 py-2.5 text-sm md:text-sm font-semibold whitespace-nowrap active:scale-95 transition-all'>Buy</Link>
              :
              <Link to="/buy-bricks" className='hover:border-b-2 hover:border-purple-400 hover:pb-1 px-3 py-2.5 text-sm md:text-sm font-medium transition-all whitespace-nowrap active:scale-95'>Buy</Link>
              }
              {location.pathname === "/sellNFT" ?
              <Link to="/sellNFT" className='border-b-2 border-purple-500 pb-1 px-3 py-2.5 text-sm md:text-sm font-semibold whitespace-nowrap active:scale-95 transition-all'>Finance</Link>
              :
              <Link to="/sellNFT" className='hover:border-b-2 hover:border-purple-400 hover:pb-1 px-3 py-2.5 text-sm md:text-sm font-medium transition-all whitespace-nowrap active:scale-95'>Finance</Link>
              }
              {location.pathname === "/profile" ?
              <Link to="/profile" className='border-b-2 border-purple-500 pb-1 px-3 py-2.5 text-sm md:text-sm font-semibold whitespace-nowrap active:scale-95 transition-all'>Profile</Link>
              :
              <Link to="/profile" className='hover:border-b-2 hover:border-purple-400 hover:pb-1 px-3 py-2.5 text-sm md:text-sm font-medium transition-all whitespace-nowrap active:scale-95'>Profile</Link>
              }
              </li>
              {/* Connect Wallet on Desktop (Right Side) */}
              <li className='hidden md:flex flex-shrink-0'>
                <button className="enableEthereumButton bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:scale-95 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all shadow-lg shadow-purple-500/50 flex flex-col items-center leading-tight whitespace-nowrap" onClick={connectWebsite}>
                  {connected? (
                    <>
                      <span className="text-[10px] font-normal text-purple-200">Connected</span>
                      <span className="font-mono text-[10px]">{currAddress.substring(0,6)}...{currAddress.substring(currAddress.length-4)}</span>
                    </>
                  ) : "Connect Wallet"}
                </button>
              </li>
            </ul>
        </nav>
      </div>
    );
  }

  export default Navbar;

