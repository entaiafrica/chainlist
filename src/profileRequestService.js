/**
 * Profile Request Service - Submit profile update requests for admin approval
 * This allows users to request profile updates which are then batch-approved by admins
 */

const PROFILE_REQUESTS_API = 'https://rpc.firstbrick.cloud/profile-requests';

/**
 * Submit a profile update request
 * @param {string} address - User's wallet address
 * @param {object} profileData - Profile data (name, profilePicture)
 * @returns {Promise<boolean>} Success status
 */
export const submitProfileRequest = async (address, profileData) => {
  try {
    const normalizedAddress = address.toLowerCase();

    // Create request object
    const request = {
      address: normalizedAddress,
      name: profileData.name,
      profilePicture: profileData.profilePicture,
      timestamp: Date.now()
    };

    // Save to localStorage immediately for user to see
    localStorage.setItem(`profile_${normalizedAddress}`, JSON.stringify(profileData));

    // Also save to pending requests in localStorage
    const pendingRequests = JSON.parse(localStorage.getItem('pending_profile_requests') || '[]');

    // Remove any existing request for this address
    const filteredRequests = pendingRequests.filter(req => req.address !== normalizedAddress);

    // Add new request
    filteredRequests.push(request);
    localStorage.setItem('pending_profile_requests', JSON.stringify(filteredRequests));

    // Try to submit to backend API (if available)
    try {
      const response = await fetch(PROFILE_REQUESTS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (response.ok) {
        console.log('✅ Profile request submitted to backend');
        return true;
      }
    } catch (apiError) {
      // API not available, that's okay - request is saved locally
      console.log('ℹ️  Backend API not available, profile request saved locally');
    }

    // Profile is saved locally and in pending requests
    console.log('✅ Profile request saved locally for admin approval');
    return true;

  } catch (error) {
    console.error('Error submitting profile request:', error);
    throw error;
  }
};

/**
 * Get all pending profile requests from localStorage
 * @returns {Array} Array of pending requests
 */
export const getPendingRequests = () => {
  try {
    return JSON.parse(localStorage.getItem('pending_profile_requests') || '[]');
  } catch (e) {
    console.error('Error reading pending requests:', e);
    return [];
  }
};

/**
 * Export pending requests as JSON for admin
 * @returns {string} JSON string of pending requests
 */
export const exportPendingRequests = () => {
  const requests = getPendingRequests();
  return JSON.stringify(requests, null, 2);
};

/**
 * Clear pending requests after admin has processed them
 */
export const clearPendingRequests = () => {
  localStorage.setItem('pending_profile_requests', '[]');
  console.log('✅ Cleared pending profile requests');
};

/**
 * Download pending requests as a file
 */
export const downloadPendingRequests = () => {
  const requests = getPendingRequests();

  if (requests.length === 0) {
    alert('No pending profile requests to download');
    return;
  }

  const json = JSON.stringify(requests, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `profile-requests-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  console.log(`✅ Downloaded ${requests.length} pending request(s)`);
};
