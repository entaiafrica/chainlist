
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const IPFS_GATEWAY = 'https://rpc.firstbrick.cloud/ipfs/';
const IPFS_API = 'https://rpc.entailabs.com/ipfs-api';
const DEFAULT_PROFILES_HASH = 'QmNhgV7Jy8fWSNUTuVYBQVLDGqB2FY5uYsLyH8dFAyYk98';

async function updateProfiles() {
  try {
    // 1. Fetch current profiles from IPFS
    console.log('Fetching current profiles from IPFS...');
    const response = await axios.get(`${IPFS_GATEWAY}${DEFAULT_PROFILES_HASH}`);
    const currentProfiles = response.data;
    console.log(`Fetched ${Object.keys(currentProfiles).length} profiles.`);

    // 2. Read updated investor data
    console.log('Reading updated investor data...');
    const updatedData = JSON.parse(fs.readFileSync('updated_investor_data.json', 'utf8'));
    console.log(`Read ${Object.keys(updatedData).length} updated profiles.`);

    // 3. Merge profiles
    console.log('Merging profiles...');
    const mergedProfiles = { ...currentProfiles };
    for (const address in updatedData) {
        mergedProfiles[address.toLowerCase()] = updatedData[address];
    }
    console.log(`Merged profiles. Total: ${Object.keys(mergedProfiles).length}`);

    // 4. Save merged profiles to IPFS
    console.log('Saving merged profiles to IPFS...');
    const jsonBuffer = Buffer.from(JSON.stringify(mergedProfiles, null, 2));
    const formData = new FormData();
    formData.append('file', jsonBuffer, {
        filename: 'profiles.json',
        contentType: 'application/json'
    });

    const uploadResponse = await axios.post(`${IPFS_API}/add?pin=true`, formData, {
        headers: {
            ...formData.getHeaders()
        }
    });

    const newIpfsHash = uploadResponse.data.Hash;
    console.log('New IPFS Hash:', newIpfsHash);

    // 5. Update profileService.js
    console.log('Updating profileService.js...');
    const profileServicePath = 'src/profileService.js';
    let profileServiceContent = fs.readFileSync(profileServicePath, 'utf8');
    profileServiceContent = profileServiceContent.replace(DEFAULT_PROFILES_HASH, newIpfsHash);
    fs.writeFileSync(profileServicePath, profileServiceContent);
    console.log('profileService.js updated.');

  } catch (error) {
    console.error('Error updating profiles:', error);
  }
}

updateProfiles();
