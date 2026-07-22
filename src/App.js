import './App.css';
import Landing from './components/Landing';
import Marketplace from './components/Marketplace';
import Profile from './components/Profile';
import SellNFT from './components/SellNFT';
import NFTPage from './components/NFTpage';
import BuyBricks from './components/BuyBricks';
import GenesisInvestor from './components/GenesisInvestor';
import Disclaimer from './components/Disclaimer';
import About from './components/About';
import Troubleshooting from './components/Troubleshooting';
import AddBrkToken from './components/AddBrkToken';
import {
  Routes,
  Route,
} from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen w-full">
        <Routes>
          <Route path="/" element={<Landing />}/>
          <Route path="/about" element={<About />}/>
          <Route path="/marketplace" element={<Marketplace />}/>
          <Route path="/buy-bricks" element={<BuyBricks />}/>
          <Route path="/add-brk-token" element={<AddBrkToken />}/>
          <Route path="/genesis-investor" element={<GenesisInvestor />}/>
          <Route path="/disclaimer" element={<Disclaimer />}/>
          <Route path="/troubleshooting" element={<Troubleshooting />}/>
          <Route path="/nftPage/:propertyAddress" element={<NFTPage />}/>
          <Route path="/profile" element={<Profile />}/>
          <Route path="/sellNFT" element={<SellNFT />}/>
        </Routes>
    </div>
  );
}

export default App;
