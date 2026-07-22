require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

// Enable CORS for frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Profile Registry Storage
const PROFILE_REGISTRY_FILE = path.join(__dirname, 'profile-registry.json');

// Load existing profile registry or create new one
let profileRegistry = {};
try {
    if (fs.existsSync(PROFILE_REGISTRY_FILE)) {
        const data = fs.readFileSync(PROFILE_REGISTRY_FILE, 'utf8');
        profileRegistry = JSON.parse(data);
        console.log(`Loaded ${Object.keys(profileRegistry).length} profiles from registry`);
    }
} catch (error) {
    console.error('Error loading profile registry:', error.message);
}

// Save profile registry to disk
function saveProfileRegistry() {
    try {
        fs.writeFileSync(PROFILE_REGISTRY_FILE, JSON.stringify(profileRegistry, null, 2));
    } catch (error) {
        console.error('Error saving profile registry:', error.message);
    }
}

// Load configuration
const PLATFORM_PRIVATE_KEY = process.env.PLATFORM_PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const FORWARDER_ADDRESS = process.env.FORWARDER_ADDRESS;

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const platformWallet = new ethers.Wallet(PLATFORM_PRIVATE_KEY, provider);

const forwarderABI = [
    "function execute(tuple(address from, address to, uint256 value, uint256 gas, uint256 nonce, bytes data) req, bytes signature) public payable returns (bool, bytes)"
];

// Relay endpoint
app.post('/relay', async (req, res) => {
    try {
        const { request, signature } = req.body;

        // Validate request
        if (!request || !signature) {
            return res.status(400).json({ error: 'Missing request or signature' });
        }

        // Connect to forwarder
        const forwarder = new ethers.Contract(
            FORWARDER_ADDRESS,
            forwarderABI,
            platformWallet
        );

        // Execute meta-transaction (platform pays gas)
        console.log('Relaying transaction for:', request.from);
        const tx = await forwarder.execute(request, signature);

        // Respond immediately with tx hash (don't wait for mining)
        console.log('Transaction sent:', tx.hash);

        res.json({
            success: true,
            transactionHash: tx.hash
        });

        // Wait for mining in background (for logging only)
        tx.wait().then(receipt => {
            console.log('Transaction mined in block:', receipt.blockNumber);
        }).catch(err => {
            console.error('Transaction failed:', err.message);
        });
    } catch (error) {
        console.error('Relay error:', error);
        res.status(500).json({
            error: 'Transaction failed',
            message: error.message
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Profile Registry Endpoints

// GET /profile/:address - Get profile IPFS hash for an address
app.get('/profile/:address', (req, res) => {
    try {
        const address = req.params.address.toLowerCase();
        const profileHash = profileRegistry[address];

        if (profileHash) {
            console.log(`Profile retrieved for ${address}: ${profileHash}`);
            res.json({
                success: true,
                address: address,
                ipfsHash: profileHash
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }
    } catch (error) {
        console.error('Error retrieving profile:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /profile - Save/update profile IPFS hash for an address
app.post('/profile', (req, res) => {
    try {
        const { address, ipfsHash } = req.body;

        if (!address || !ipfsHash) {
            return res.status(400).json({
                success: false,
                error: 'Missing address or ipfsHash'
            });
        }

        const normalizedAddress = address.toLowerCase();

        // Validate IPFS hash format (v0 or v1)
        const isValidHash = /^(Qm[a-zA-Z0-9]{44}|b[a-z0-9]{58,})$/.test(ipfsHash);
        if (!isValidHash) {
            return res.status(400).json({
                success: false,
                error: 'Invalid IPFS hash format'
            });
        }

        profileRegistry[normalizedAddress] = ipfsHash;
        saveProfileRegistry();

        console.log(`Profile saved for ${normalizedAddress}: ${ipfsHash}`);
        res.json({
            success: true,
            address: normalizedAddress,
            ipfsHash: ipfsHash
        });
    } catch (error) {
        console.error('Error saving profile:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /profiles - Get all profiles (for debugging)
app.get('/profiles', (req, res) => {
    res.json({
        success: true,
        count: Object.keys(profileRegistry).length,
        profiles: profileRegistry
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Relayer service running on port ${PORT}`);
    console.log(`Platform wallet: ${platformWallet.address}`);
    console.log(`Profile registry: ${Object.keys(profileRegistry).length} profiles loaded`);
});
