// FirstBrick Property NFT Metadata - Fetched from Blockchain IPFS
import { ethers } from 'ethers';

const MARKETPLACE_ADDRESS = '0x254dffcd3277c0b1660f6d42efbb754edababc2b';
const IPFS_GATEWAY = 'https://rpc.firstbrick.cloud/ipfs/';

// RPC Endpoints (Chain ID: 12786):
// Global: https://rpc.firstbrick.cloud (~150-200ms)
// South Africa: https://fb-rpc.entailabs.com (~10-50ms) - Better latency for African users
const RPC_ENDPOINT = 'https://rpc.firstbrick.cloud';

// Cache for fetched metadata
const metadataCache = {};

export const TOKEN_METADATA = {
  '0x5b1869d9a4c187f2eaa108f3062412ecf0526b24': {
    name: 'BRK Token',
    symbol: 'BRK',
    decimals: 18,
    type: 'ERC20',
    logo: '/brick-logo.png',
    description: 'FirstBrick utility token for property investments'
  },
  '0x254dffcd3277c0b1660f6d42efbb754edababc2b': {
    name: 'FirstBrick Properties',
    symbol: 'PROPERTY',
    decimals: 0,
    type: 'ERC1155',
    logo: '/brick-logo.png',
    description: 'Tokenized real estate properties on FirstBrick'
  }
};

// Fetch metadata from blockchain/IPFS
export async function fetchPropertyMetadata(tokenId) {
  const cacheKey = `property_${tokenId}`;

  // Return cached if available
  if (metadataCache[cacheKey]) {
    return metadataCache[cacheKey];
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
    const abi = ['function uri(uint256) view returns (string)'];
    const contract = new ethers.Contract(MARKETPLACE_ADDRESS, abi, provider);

    // Get URI from contract
    const uri = await contract.uri(tokenId);

    // Fetch metadata from IPFS
    const response = await fetch(uri);
    const metadata = await response.json();

    // Parse and structure the data
    const propertyData = {
      id: tokenId,
      name: metadata.name || `Property #${tokenId}`,
      description: metadata.description || '',
      location: metadata.properties?.propertyAddress || metadata.attributes?.find(a => a.trait_type === 'Location')?.value || 'Unknown Location',
      type: metadata.properties?.propertyType || metadata.attributes?.find(a => a.trait_type === 'Property Type')?.value || 'Real Estate',
      image: metadata.image?.replace('ipfs://', IPFS_GATEWAY) || '/brick-logo.png',
      images: metadata.properties?.images?.map(img => img.replace('ipfs://', IPFS_GATEWAY)) || [],
      totalShares: metadata.properties?.totalBricks || 0,
      propertyValue: metadata.properties?.totalPropertyValue || 0,
      attributes: metadata.attributes || [],
      features: metadata.properties?.propertyFeatures || [],
      stats: {
        bedrooms: metadata.properties?.bedrooms || metadata.attributes?.find(a => a.trait_type === 'Bedrooms')?.value || 0,
        bathrooms: metadata.properties?.bathrooms || metadata.attributes?.find(a => a.trait_type === 'Bathrooms')?.value || 0,
        garages: metadata.properties?.garages || 0,
        floor: metadata.properties?.floor || '',
        totalValue: metadata.attributes?.find(a => a.trait_type === 'Total Value')?.value || '',
        monthlyRepayment: metadata.attributes?.find(a => a.trait_type === 'Monthly Repayment')?.value || ''
      },
      videoUrl: metadata.properties?.videoUrl || metadata.external_url || null
    };

    // Cache the result
    metadataCache[cacheKey] = propertyData;
    return propertyData;

  } catch (error) {
    console.error(`Error fetching metadata for token ${tokenId}:`, error);

    // Return fallback data
    return {
      id: tokenId,
      name: `Property #${tokenId}`,
      location: 'Loading...',
      type: 'Real Estate',
      image: '/brick-logo.png',
      images: [],
      totalShares: 0,
      propertyValue: 0,
      attributes: [],
      features: [],
      stats: {},
      videoUrl: null
    };
  }
}

// Synchronous fallback for initial render
export function getPropertyMetadata(tokenId) {
  const cacheKey = `property_${tokenId}`;

  // Return cached if available
  if (metadataCache[cacheKey]) {
    return metadataCache[cacheKey];
  }

  // Return loading state
  return {
    id: tokenId,
    name: `Property #${tokenId}`,
    location: 'Loading from blockchain...',
    type: 'Real Estate',
    image: '/brick-logo.png',
    images: [],
    totalShares: 0,
    propertyValue: 0,
    attributes: [],
    features: [],
    stats: {},
    videoUrl: null,
    loading: true
  };
}

export function getTokenMetadata(address) {
  return TOKEN_METADATA[address.toLowerCase()] || {
    name: 'Unknown Token',
    symbol: 'TOKEN',
    decimals: 18,
    type: 'ERC20',
    logo: '/brick-logo.png'
  };
}
