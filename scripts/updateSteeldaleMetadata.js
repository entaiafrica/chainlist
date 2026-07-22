
import { uploadJSONToIPFS } from '../src/pinata.js';
import fs from 'fs';

async function uploadMetadata() {
    try {
        const jsonString = fs.readFileSync('metadata/steeldale-mall.json', 'utf8');
        const jsonData = JSON.parse(jsonString);
        
        console.log("Uploading metadata to IPFS...");
        const result = await uploadJSONToIPFS(jsonData);
        
        if (result.success) {
            console.log("✅ Successfully uploaded to Pinata!");
            console.log("New IPFS URL:", result.pinataURL);
        } else {
            console.error("❌ Failed to upload to Pinata:", result.message);
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

uploadMetadata();
