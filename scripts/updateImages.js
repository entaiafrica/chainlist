const { ethers } = require("hardhat");
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { uploadFileToIPFS, uploadJSONToIPFS } = require('../src/pinata.js'); // Using our IPFS upload functions
const MarketplaceJSON = require('../artifacts/contracts/BrickMarketplace.sol/BrickMarketplace.json');

// --- CONFIGURATION ---
const MARKETPLACE_ADDRESS = process.env.REACT_APP_MARKETPLACE_ADDRESS || "0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B";
const TEMP_DOWNLOAD_DIR = path.join(__dirname, 'temp_images');

// --- HELPER FUNCTIONS ---

// Helper to download an image from a URL
async function downloadImage(url, filepath) {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });
        const writer = require('fs').createWriteStream(filepath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Failed to download ${url}: ${error.message}`);
        return null;
    }
}

// Main function to execute the script
async function main() {
    console.log("--- Starting Image & Metadata Migration Script ---");

    // Ensure temp directory exists
    await fs.mkdir(TEMP_DOWNLOAD_DIR, { recursive: true });

    // 1. Connect to the blockchain
    const [deployer] = await ethers.getSigners();
    if (!deployer) {
        throw new Error("Could not get a signer from Hardhat. Ensure your Hardhat network is running and configured correctly.");
    }
    console.log("🔑 Using account:", deployer.address);

    if (!MARKETPLACE_ADDRESS) {
        throw new Error("MARKETPLACE_ADDRESS is not set in your environment. Please check your .env file.");
    }
    console.log(`📝 Marketplace Contract Address: ${MARKETPLACE_ADDRESS}`);
    
    const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceJSON.abi, deployer);

    // 2. Get all property IDs
    const propertyIds = await marketplace.getAllProperties();
    console.log(`🔎 Found ${propertyIds.length} properties to process.`);

    // 3. Loop through each property
    for (const tokenId of propertyIds) {
        console.log(`
--- Processing Token ID: ${tokenId.toString()} ---`);

        try {
            // 4. Fetch existing metadata URI
            const oldUri = await marketplace.uri(tokenId);
            if (!oldUri || !oldUri.startsWith('ipfs://')) {
                console.log("⚠️ Skipping: No valid IPFS URI found.");
                continue;
            }

            // Convert ipfs:// to a gateway URL to fetch the metadata
            const metadataUrl = `https://rpc.firstbrick.cloud/ipfs/${oldUri.replace('ipfs://', '')}`;
            const { data: metadata } = await axios.get(metadataUrl);
            console.log("📄 Fetched old metadata:", metadata.name);

            // 5. Download, re-upload images, and update metadata
            let imagesUpdated = false;
            if (metadata.properties && metadata.properties.images && metadata.properties.images.length > 0) {
                const newImageUris = [];
                for (const imageUrl of metadata.properties.images) {
                    if (imageUrl.includes('prop24.com')) {
                        const filename = path.basename(new URL(imageUrl).pathname);
                        const localPath = path.join(TEMP_DOWNLOAD_DIR, filename);

                        console.log(`  Downloading ${imageUrl}...`);
                        await downloadImage(imageUrl, localPath);

                        // Check if file exists before uploading
                        try {
                            await fs.access(localPath);
                            const fileContent = await fs.readFile(localPath);
                            
                            console.log(`  Uploading ${filename} to IPFS...`);
                            // We need to simulate a 'File' object for uploadFileToIPFS
                            const uploadResponse = await uploadFileToIPFS({
                                buffer: fileContent,
                                originalname: filename,
                                mimetype: 'image/jpeg' // Adjust mimetype if needed
                            });

                            if (uploadResponse.success) {
                                // We need just the IPFS hash for the metadata, not the full gateway URL
                                const ipfsHash = uploadResponse.pinataURL.split('/ipfs/')[1];
                                newImageUris.push(`ipfs://${ipfsHash}`);
                                imagesUpdated = true;
                                console.log(`  ✅ Re-uploaded to: ipfs://${ipfsHash}`);
                            } else {
                                console.error(`  ❌ Failed to re-upload ${filename}:`, uploadResponse.message);
                                newImageUris.push(imageUrl); // Keep old URL on failure
                            }
                        } catch (error) {
                             console.error(`  ❌ Could not read downloaded file ${localPath}. Keeping old URL.`);
                             newImageUris.push(imageUrl);
                        }

                    } else {
                        newImageUris.push(imageUrl); // Keep existing non-prop24 URLs
                    }
                }
                 metadata.properties.images = newImageUris;
                 // Also update the primary 'image' field
                 if (newImageUris.length > 0 && metadata.image.includes('prop24.com')) {
                    metadata.image = newImageUris[0];
                 }
            }

            // 6. If images were updated, upload new metadata and update contract
            if (imagesUpdated) {
                console.log("  Uploading new metadata to IPFS...");
                const newMetadataResponse = await uploadJSONToIPFS(metadata);
                if (newMetadataResponse.success) {
                    const newMetadataHash = newMetadataResponse.pinataURL.split('/ipfs/')[1];
                    const newMetadataUri = `ipfs://${newMetadataHash}`;
                    console.log(`  ✅ New metadata URI: ${newMetadataUri}`);

                    console.log("  Updating contract with new metadata URI...");
                    const tx = await marketplace.updateMetadataURI(tokenId, newMetadataUri);
                    await tx.wait();
                    console.log("  ✅ Contract updated successfully! Transaction:", tx.hash);
                } else {
                    console.error("  ❌ Failed to upload new metadata:", newMetadataResponse.message);
                }
            } else {
                console.log("  No images from prop24.com found. No updates needed.");
            }

        } catch (error) {
            console.error(`❌ An error occurred processing Token ID ${tokenId.toString()}:`, error.message);
        }
    }

    // 7. Clean up temp directory
    await fs.rm(TEMP_DOWNLOAD_DIR, { recursive: true, force: true });
    console.log("\n--- ✅ Migration Script Finished ---");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
