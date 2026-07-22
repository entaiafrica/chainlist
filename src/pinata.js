const axios = require('axios');
const FormData = require('form-data');

const getIpfsApiUrl = () => {
    // Check for Node.js environment (used by Hardhat scripts) vs. React app
    const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
    return isNode
        ? (process.env.IPFS_API_URL || 'https://rpc.firstbrick.cloud/ipfs-api')
        : (process.env.REACT_APP_IPFS_API_URL || 'https://rpc.firstbrick.cloud/ipfs-api');
};

const uploadJSONToIPFS = async (JSONBody) => {
    const apiUrl = getIpfsApiUrl();
    const url = `${apiUrl}/add?stream-channels=true&cid-version=1`;
    try {
        const response = await axios.post(url, JSON.stringify(JSONBody), {
            headers: { 'Content-Type': 'application/json' }
        });
        const ipfsHash = response.data.Hash;
        if (!ipfsHash) throw new Error('IPFS hash not found in API response.');
        // Fix: Return correct IPFS gateway URL (not API URL)
        const gatewayUrl = apiUrl.replace('/ipfs-api', '/ipfs');
        return { success: true, pinataURL: `${gatewayUrl}/${ipfsHash}` };
    } catch (error) {
        console.error("Error uploading JSON to IPFS:", error.response ? error.response.data : error.message);
        return { success: false, message: error.message };
    }
};

const uploadFileToIPFS = async (file) => {
    const apiUrl = getIpfsApiUrl();
    const url = `${apiUrl}/add?stream-channels=true&cid-version=1`;
    let data = new FormData();

    // The 'file' can be a browser File object or a buffer from a Node.js script
    if (file.buffer) { // From Node.js script
        data.append('file', file.buffer, file.originalname);
    } else { // From browser
        data.append('file', file);
    }

    try {
        const response = await axios.post(url, data, {
            headers: { 'Content-Type': `multipart/form-data; boundary=${data._boundary}` }
        });
        const ipfsHash = response.data.Hash;
        if (!ipfsHash) throw new Error('IPFS hash not found in API response.');
        // Fix: Return correct IPFS gateway URL (not API URL)
        const gatewayUrl = apiUrl.replace('/ipfs-api', '/ipfs');
        return { success: true, pinataURL: `${gatewayUrl}/${ipfsHash}` };
    } catch (error) {
        console.error("Error uploading file to IPFS:", error.response ? error.response.data : error.message);
        return { success: false, message: error.message };
    }
};

// Use module.exports for compatibility with Hardhat's require()
module.exports = { uploadJSONToIPFS, uploadFileToIPFS };
