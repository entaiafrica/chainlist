

export const GetIpfsUrlFromPinata = (pinataUrl) => {
    if (!pinataUrl) {
        return null;
    }

    // If the URL already uses our desired gateway, return it as is.
    if (pinataUrl.startsWith('https://rpc.firstbrick.cloud/ipfs/')) {
        return pinataUrl;
    }

    // Look for an IPFS hash in the URL.
    // Supports v0 (Qm...) and v1 (b...) CIDs
    const ipfsHashMatch = pinataUrl.match(/(?:\/ipfs\/|ipfs:\/\/|^)(Qm[a-zA-Z0-9]{44}|b[a-z0-9]{58,})/);

    if (ipfsHashMatch && ipfsHashMatch[1]) {
        return `https://rpc.firstbrick.cloud/ipfs/${ipfsHashMatch[1]}`;
    }

    // If it's a regular HTTP URL that we haven't converted, return it.
    if (pinataUrl.startsWith('http')) {
        return pinataUrl;
    }

    // Return null if no valid IPFS hash or URL can be parsed.
    return null;
};