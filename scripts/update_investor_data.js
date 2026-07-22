const fs = require('fs');
const path = require('path');

async function main() {
    // 1. Read the IPFS hashes for the new avatars
    const hashesFilePath = '/root/.gemini/tmp/be5ed5ab6e2ce44ea4d006e76c732ba80dfe0074ac3ca2fcd687a98a16cf1a93/ipfs_upload/avatar_hashes.txt';
    const hashesData = fs.readFileSync(hashesFilePath, 'utf8');
    const hashesMap = new Map();
    hashesData.split('\n').forEach(line => {
        if (line) {
            const [address, hash] = line.split(',');
            hashesMap.set(address.toLowerCase(), hash);
        }
    });

    // 2. Read and parse the investor data file
    const investorDataPath = 'data/ipfs/blocks/JW/CIQBDOIK7QLQTG5RHCKWTMUBWYQ32PAV6XP4LO5E2LTIZP7L54BNJWI.data';
    let rawContent = fs.readFileSync(investorDataPath, 'utf8');
    const firstBrace = rawContent.indexOf('{');
    const lastBrace = rawContent.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("Could not find a valid JSON object in the data file.");
    }
    const jsonString = rawContent.substring(firstBrace, lastBrace + 1);
    const investors = JSON.parse(jsonString);

    console.log("Updating investor profile pictures...");

    // 3. Update the profile pictures
    for (const address in investors) {
        const lowerAddr = address.toLowerCase();
        if (hashesMap.has(lowerAddr)) {
            const newHash = hashesMap.get(lowerAddr);
            console.log(`- Updating profile picture for ${investors[address].name} (${address}) to ipfs://${newHash}`);
            investors[address].profilePicture = `ipfs://${newHash}`;
        }
    }

    // 4. Save the updated investor data
    const newInvestorDataPath = path.join('/opt/facebrick', 'updated_investor_data.json');
    fs.writeFileSync(newInvestorDataPath, JSON.stringify(investors, null, 2));

    console.log(`\nUpdated investor data saved to: ${newInvestorDataPath}`);
    console.log("Please upload this file to IPFS to get the new root hash for your application.");
}

main().catch(error => {
    console.error("Error updating investor data:", error);
    process.exit(1);
});
