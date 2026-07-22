const fs = require('fs');
const path = require('path');

// Function to generate a simple SVG avatar
const generateAvatar = (name, address) => {
    const initials = name
        ? name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : address.substring(2, 4).toUpperCase();

    // Simple hashing function to get a color from the address
    const getColor = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return "00000".substring(0, 6 - c.length) + c;
    };

    const bgColor = `#${getColor(address)}`;
    const textColor = '#FFFFFF'; // White text is generally good contrast

    const svg = `
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}" />
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="90" fill="${textColor}">
    ${initials}
  </text>
</svg>
`;
    return svg;
};

// Main function to process investors
async function main() {
    const investorDataPath = 'data/ipfs/blocks/JW/CIQBDOIK7QLQTG5RHCKWTMUBWYQ32PAV6XP4LO5E2LTIZP7L54BNJWI.data';
    let rawContent = fs.readFileSync(investorDataPath, 'utf8');
    const firstBrace = rawContent.indexOf('{');
    const lastBrace = rawContent.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("Could not find a valid JSON object in the data file.");
    }
    const jsonString = rawContent.substring(firstBrace, lastBrace + 1);
    const investors = JSON.parse(jsonString);

    const outputDir = path.join('/opt/facebrick', 'generated_avatars');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    console.log("Generating avatars for investors with non-IPFS profile pictures...");

    for (const address in investors) {
        const investor = investors[address];
        const pic = investor.profilePicture || '';

        // Check if the profile picture is already on a trusted IPFS gateway or is an IPFS URI
        if (!pic.startsWith('ipfs://') && !pic.startsWith('https://rpc.entailabs.com/ipfs/')) {
            console.log(`- Generating avatar for ${investor.name} (${address})`);
            const avatarSvg = generateAvatar(investor.name, address);
            const filePath = path.join(outputDir, `${address}.svg`);
            fs.writeFileSync(filePath, avatarSvg);
            console.log(`  - Saved to ${filePath}`);
        } else {
            console.log(`- Skipping ${investor.name} (${address}), already has an IPFS picture.`);
        }
    }

    console.log("\nAvatar generation complete.");
}

main().catch(error => {
    console.error("Error generating avatars:", error);
    process.exit(1);
});
