const fs = require('fs');
const path = require('path');

async function updateMetadata() {
    // 1. Read the IPFS hashes
    const hashesFilePath = '/root/.gemini/tmp/be5ed5ab6e2ce44ea4d006e76c732ba80dfe0074ac3ca2fcd687a98a16cf1a93/ipfs_upload/ipfs_hashes.txt';
    const hashesData = fs.readFileSync(hashesFilePath, 'utf8');
    const hashesMap = new Map();
    hashesData.split('\n').forEach(line => {
        if (line) {
            const [filename, hash] = line.split(',');
            hashesMap.set(filename.split('.')[0], hash); // Store filename without extension
        }
    });

    // 2. Read the metadata file
    const metadataFilePath = process.argv[2];
    if (!metadataFilePath) {
        console.error("Please provide the path to the metadata file.");
        process.exit(1);
    }
    const metadata = JSON.parse(fs.readFileSync(metadataFilePath, 'utf8'));

    // 3. Update the image URLs
            const updateImageUrl = (url) => {
                // If the URL is already an IPFS URL, return it as is.
                if (url.startsWith('ipfs://')) {
                    return url;
                }
        
                        // Try to match prop24.com URLs (including subdomains like images.prop24.com) and extract the numeric ID
                        const prop24Match = url.match(/(?:images\.)?prop24\.com\/(\d+)/);
                        if (prop24Match && prop24Match[1]) {                    const filename = prop24Match[1];
                    if (hashesMap.has(filename)) {
                        return `ipfs://${hashesMap.get(filename)}`;
                    }
                }
        
                // Fallback for other URLs that might contain a numeric ID or need cropping removed
                // This catches cases like the top-level 'image' which might not have 'prop24.com/' directly preceding the ID
                const cleanUrl = url.replace(/\/(Crop|Ensure)\d+x\d+/g, ''); // Remove all cropping parameters
                const genericFilenameMatch = cleanUrl.match(/(\d+)/); // Extract the numeric part as filename
        
                if (genericFilenameMatch && genericFilenameMatch[1]) {
                    const filename = genericFilenameMatch[1];
                    if (hashesMap.has(filename)) {
                        return `ipfs://${hashesMap.get(filename)}`;
                    }
                }
        
                return url; // Return original URL if no match or hash not found
            };    if (metadata.image) {
        // Explicitly handle the top-level image field first
        const prop24MatchTopLevel = metadata.image.match(/(?:images\.)?prop24\.com\/(\d+)/);
        if (prop24MatchTopLevel && prop24MatchTopLevel[1]) {
            const filename = prop24MatchTopLevel[1];
            if (hashesMap.has(filename)) {
                metadata.image = `ipfs://${hashesMap.get(filename)}`;
            }
        } else {
            // If not a prop24 URL, still try the generic update (for cropping removal, etc.)
            metadata.image = updateImageUrl(metadata.image);
        }
    }
    if (metadata.properties && metadata.properties.images) {
        metadata.properties.images = metadata.properties.images.map(updateImageUrl);
    }

    // 4. Save the updated metadata
    const newMetadataFilePath = path.join(path.dirname(metadataFilePath), 'updated_' + path.basename(metadataFilePath));
    fs.writeFileSync(newMetadataFilePath, JSON.stringify(metadata, null, 2));

    console.log(`Updated metadata saved to: ${newMetadataFilePath}`);
}

updateMetadata();
