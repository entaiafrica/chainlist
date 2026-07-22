const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function uploadToIPFS() {
    // Get metadata file from command line argument
    const metadataFile = process.argv[2];
    if (!metadataFile) {
        console.log("\n❌ ERROR: Please provide the path to the metadata file.");
        console.log("\nUsage: node scripts/uploadMetadataToIPFS.js <metadata-file>");
        console.log("Example: node scripts/uploadMetadataToIPFS.js metadata/brk-token.json");
        return;
    }

    const metadataPath = path.isAbsolute(metadataFile)
        ? metadataFile
        : path.join(__dirname, '..', metadataFile);

    if (!fs.existsSync(metadataPath)) {
        console.log("\n❌ ERROR: Metadata file not found:", metadataPath);
        return;
    }

    const metadataContent = fs.readFileSync(metadataPath);
    const metadata = JSON.parse(metadataContent);

    console.log("\n" + "=".repeat(70));
    console.log("UPLOADING METADATA TO SELF-HOSTED IPFS");
    console.log("=".repeat(70));
    console.log("\nMetadata file:", metadataPath);
    console.log("Content:", metadata.name);

    const url = `https://rpc.entailabs.com/ipfs-api/add`;
    const form = new FormData();
    form.append('file', metadataContent, {
        filepath: path.basename(metadataPath)
    });

    try {
        const response = await axios.post(url, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        const ipfsHash = response.data.Hash;
        const entailabsURL = `https://rpc.entailabs.com/ipfs/${ipfsHash}`;
        const ipfsURI = `ipfs://${ipfsHash}`;

        console.log("\n" + "=".repeat(70));
        console.log("✅ SUCCESS - METADATA UPLOADED TO IPFS!");
        console.log("=".repeat(70));
        console.log("\nIPFS Hash:", ipfsHash);
        console.log("\nURIs:");
        console.log("  - IPFS URI (for smart contract):", ipfsURI);
        console.log("  - Entailabs Gateway:", entailabsURL);
        console.log("\n" + "=".repeat(70));
        console.log("\n📋 Next Steps:");
        console.log("1. Copy the IPFS hash above");
        console.log("2. Use this hash to update the tokenURI in the BRKToken contract.");
        console.log("=".repeat(70));

        // Save to file for easy reference
        fs.writeFileSync(
            path.join(__dirname, '../metadata/ipfs-hash.txt'),
            `IPFS Hash: ${ipfsHash}\nIPFS URI: ${ipfsURI}\nEntailabs URL: ${entailabsURL}\n`
        );
        console.log("\n✓ IPFS details saved to: metadata/ipfs-hash.txt");

        return ipfsHash;
    } catch (error) {
        console.error("\n❌ Upload failed:", error.message);
        if (error.response) {
            console.error("Response:", error.response.data);
        }
    }
}

uploadToIPFS();
