/**
 * Profile Service - IPFS-backed decentralized profile storage
 * Each user's profile is a separate JSON file on IPFS.
 * The IPFS hash for a user's profile is stored in the relayer's profile registry (shared).
 * LocalStorage is used as a cache.
 */

const IPFS_GATEWAY = 'https://rpc.firstbrick.cloud/ipfs/';
const IPFS_API = process.env.REACT_APP_IPFS_API_URL || 'https://rpc.firstbrick.cloud/ipfs-api';
const PROFILE_REGISTRY_API = 'https://rpc.firstbrick.cloud/relay/profile';

/**
 * Get profile for a specific address from relayer registry + IPFS
 * @param {string} address - Ethereum address
 * @returns {Promise<object>} Profile data
 */
export const getUserProfile = async (address) => {
  if (!address) {
    return { name: '', profilePicture: '', hasProfile: false };
  }

  const normalizedAddress = address.toLowerCase();

  // Try localStorage cache first
  const localData = localStorage.getItem(`profile_${normalizedAddress}`);
  let profileHash = null;

  // Check if cached data is a hash (new format) or JSON (old format)
  if (localData) {
    const isHash = /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,})$/.test(localData);

    if (isHash) {
      profileHash = localData;
    } else {
      try {
        // Old JSON format - migrate it
        const profileData = JSON.parse(localData);
        console.log('🔄 Migrating old profile format for', normalizedAddress);
        await updateUserProfile(address, profileData);
        return { ...profileData, hasProfile: true };
      } catch (e) {
        console.warn('Invalid cached profile data, will fetch from registry');
      }
    }
  }

  // If no cached hash, fetch from profile registry
  if (!profileHash) {
    try {
      const registryResponse = await fetch(`${PROFILE_REGISTRY_API}/${normalizedAddress}`);
      if (registryResponse.ok) {
        const registryData = await registryResponse.json();
        if (registryData.success && registryData.ipfsHash) {
          profileHash = registryData.ipfsHash;
          // Cache the hash locally for faster future lookups
          localStorage.setItem(`profile_${normalizedAddress}`, profileHash);
          console.log(`📥 Fetched profile hash from registry for ${normalizedAddress}:`, profileHash);
        }
      }
    } catch (error) {
      console.warn('Could not fetch from profile registry:', error.message);
    }
  }

  // If we have a hash (from cache or registry), fetch profile data from IPFS
  if (profileHash) {
    try {
      const response = await fetch(`${IPFS_GATEWAY}${profileHash}`);
      if (response.ok) {
        const profileData = await response.json();
        return { ...profileData, hasProfile: true };
      } else {
        console.error('Failed to fetch profile from IPFS with hash:', profileHash);
      }
    } catch (error) {
      console.error('Error fetching profile from IPFS:', error);
    }
  }

  // No profile found
  return { name: '', profilePicture: '', hasProfile: false };
};

/**
 * Update profile for current user and save to IPFS + Registry
 * @param {string} address - Ethereum address
 * @param {object} profileData - Profile data to save
 * @returns {Promise<boolean>} Success status
 */
export const updateUserProfile = async (address, profileData) => {
  if (!address) {
    throw new Error('Address is required');
  }

  try {
    const normalizedAddress = address.toLowerCase();
    console.log('🔄 Updating profile for:', normalizedAddress);
    console.log('📝 Profile data:', profileData);

    // Step 1: Upload profile JSON to IPFS
    const jsonBlob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', jsonBlob, `${normalizedAddress}.json`);

    console.log('📤 Uploading to IPFS API:', `${IPFS_API}/add`);
    const response = await fetch(`${IPFS_API}/add?stream-channels=true&cid-version=1&pin=true`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error uploading profile to IPFS:', errorText);
      console.error('❌ Response status:', response.status);
      return false;
    }

    const result = await response.json();
    const newHash = result.Hash;
    console.log(`✅ Profile uploaded to IPFS successfully`);
    console.log(`🔗 IPFS hash: ${newHash}`);
    console.log(`🌐 Gateway URL: ${IPFS_GATEWAY}${newHash}`);

    // Step 2: Save hash to profile registry (shared storage)
    try {
      const registryResponse = await fetch(PROFILE_REGISTRY_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: normalizedAddress,
          ipfsHash: newHash
        }),
      });

      if (registryResponse.ok) {
        const registryResult = await registryResponse.json();
        console.log('✅ Profile saved to registry:', registryResult);
      } else {
        console.warn('⚠️ Failed to save to profile registry, but IPFS upload succeeded');
      }
    } catch (registryError) {
      console.warn('⚠️ Could not save to profile registry:', registryError.message);
    }

    // Step 3: Save to localStorage as cache
    localStorage.setItem(`profile_${normalizedAddress}`, newHash);
    console.log('💾 Cached to localStorage: profile_' + normalizedAddress);

    // Dispatch event so other components can update
    window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { address: normalizedAddress } }));

    return true;
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    console.error('❌ Error details:', error.message);
    return false;
  }
};
