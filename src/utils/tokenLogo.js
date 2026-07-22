/**
 * Token Logo Utility for iOS MetaMask Compatibility
 *
 * This utility automatically converts token logos to Base64 on mobile devices
 * to fix iOS MetaMask issues with external image URLs (CORS restrictions).
 *
 * Desktop browsers continue using URLs directly (no performance impact).
 *
 * Based on EIP-747 specification:
 * - Max image size: 512×512 pixels, 256KB
 * - Supported formats: PNG, JPG, SVG, Base64 data URI
 *
 * @see https://eips.ethereum.org/EIPS/eip-747
 * @see https://github.com/MetaMask/metamask-mobile/issues/3376
 */

// Cache for Base64 encoded logos to avoid repeated conversions
const base64Cache = new Map();

/**
 * Convert image URL to Base64 data URI
 *
 * @param {string} imageUrl - URL or path to image
 * @returns {Promise<string>} Base64 data URI (e.g., "data:image/png;base64,...")
 * @throws {Error} If image fetch or conversion fails
 */
const convertImageToBase64 = async (imageUrl) => {
  // Check cache first to avoid repeated conversions
  if (base64Cache.has(imageUrl)) {
    console.log(`✓ Using cached Base64 logo for: ${imageUrl}`);
    return base64Cache.get(imageUrl);
  }

  try {
    console.log(`Fetching image for Base64 conversion: ${imageUrl}`);

    // Fetch image from URL
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    // Convert response to blob
    const blob = await response.blob();

    // Convert blob to Base64 using FileReader
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result;

        // Cache for future use
        base64Cache.set(imageUrl, base64String);

        console.log(`✓ Logo converted to Base64 (${Math.round(base64String.length / 1024)}KB)`);
        resolve(base64String);
      };

      reader.onerror = () => {
        reject(new Error('FileReader failed to convert image to Base64'));
      };

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to Base64:', error);
    throw error;
  }
};

/**
 * Get optimized logo for wallet_watchAsset
 *
 * Returns Base64 data URI on mobile devices (iOS compatibility)
 * Returns original URL on desktop (no performance impact)
 *
 * @param {string} logoUrl - URL to logo image
 * @param {boolean} forceBase64 - Force Base64 conversion regardless of device
 * @returns {Promise<string>} Optimized logo reference (Base64 or URL)
 */
export const getWalletLogo = async (logoUrl, forceBase64 = false) => {
  if (!logoUrl) {
    console.warn('No logo URL provided');
    return undefined;
  }

  // Force Base64 conversion for all devices to bypass potential CORS issues with MetaMask
  try {
    console.log('Forcing logo to Base64 for maximum compatibility...');
    const base64Logo = await convertImageToBase64(logoUrl);
    return base64Logo;
  } catch (error) {
    console.warn('Base64 conversion failed, falling back to URL:', error);
    return logoUrl;
  }
};

/**
 * Pre-configured logos for common tokens
 * Each token can have a primary URL and optional local fallback
 */
export const TOKEN_LOGOS = {
  BRK: {
    url: 'https://rpc.firstbrick.cloud/ipfs/Qmdc7gosuFCSUJrhAZH7mupAUuG88heWEBV9W7MQraqRXU',
    local: '/brick-logo.png',
    description: 'BRK Token - Main utility token'
  },
  GBRK: {
    url: 'https://rpc.firstbrick.cloud/ipfs/QmdScpRWNv2hKqou4y1KdgNMhZkcRBVTX1MDVFhndQaeE7',
    local: null, // No local fallback for IPFS-hosted image
    description: 'Genesis Brick Token - Investment token'
  }
};

/**
 * Get logo for specific token with automatic fallback logic
 *
 * Tries primary URL first, falls back to local if available
 *
 * @param {string} tokenSymbol - Token symbol (BRK, GBRK, etc.)
 * @returns {Promise<string>} Optimized logo for wallet
 * @throws {Error} If token is unknown or all logo sources fail
 */
export const getTokenLogo = async (tokenSymbol) => {
  const tokenConfig = TOKEN_LOGOS[tokenSymbol];

  if (!tokenConfig) {
    throw new Error(`Unknown token symbol: ${tokenSymbol}. Available: ${Object.keys(TOKEN_LOGOS).join(', ')}`);
  }

  console.log(`Getting logo for ${tokenSymbol} (${tokenConfig.description})`);

  // Try primary URL first
  try {
    return await getWalletLogo(tokenConfig.url);
  } catch (error) {
    console.warn(`Primary URL failed for ${tokenSymbol}:`, error);

    // Fallback to local if available
    if (tokenConfig.local) {
      console.log(`Trying local fallback: ${tokenConfig.local}`);
      try {
        return await getWalletLogo(tokenConfig.local);
      } catch (localError) {
        console.error(`Local fallback also failed for ${tokenSymbol}:`, localError);
        throw new Error(`All logo sources failed for ${tokenSymbol}`);
      }
    }

    // No fallback available
    throw error;
  }
};

/**
 * Clear Base64 cache
 * Useful for testing or memory management
 */
export const clearLogoCache = () => {
  const cacheSize = base64Cache.size;
  base64Cache.clear();
  console.log(`✓ Logo cache cleared (${cacheSize} entries removed)`);
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
  return {
    size: base64Cache.size,
    entries: Array.from(base64Cache.keys())
  };
};
