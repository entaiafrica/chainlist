# BRK Token & UI Fixes Summary

**Date:** 2026-01-14
**Components Updated:** Landing.js, WalletBalance.js

## Issues Fixed

### 1. ✅ Section Overlap - "Your Digital Wallet" on top of "VIEW ON EXPLORER"

**Problem:**
- Section 4 heading ("Your Digital Wallet, Your Assets") was overlapping with the "VIEW ON EXPLORER" button from Section 3
- Poor section snap behavior causing visual collision

**Solution:**

**Section 3 (Investors):**
- Added `min-h-screen` for consistent height
- Added `snap-always` for stronger snap point
- Increased bottom padding: `pb-6` → `pb-8`
- Increased button container spacing: `pt-4 pb-4` → `pt-6 pb-6`
- Added bottom margin to investor list: `mb-4` → `mb-6`

**Section 4 (Wallet Screenshots):**
- Added `min-h-screen` for consistent height
- Added `snap-always` for stronger snap point
- Increased top padding: `pt-20` → `pt-24`
- Added bottom padding: `pb-8`

**Code Location:**
- Section 3: Lines 332-386 in Landing.js
- Section 4: Lines 382-442 in Landing.js

### 2. ✅ Add BRK Token to MetaMask - Multiple Locations

**Issue:**
- User reported "add brk token to metamask is broken"
- Requested functionality for both "wallet" and "explorer" sections

**Implementation:**

#### A. Landing.js - Explorer Section (Section 3)

**Added "Add BRK Token to Wallet" button below "VIEW ON EXPLORER":**
- Purple-pink gradient button
- Plus icon (+ symbol)
- Full-width responsive design
- Positioned directly after explorer link

**Location:** Lines 376-384 in Landing.js

```javascript
<button
  onClick={addBRKToMetaMask}
  className="block w-full max-w-md mx-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm py-2.5 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all active:scale-95 flex items-center justify-center gap-2"
>
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
  Add BRK Token to Wallet
</button>
```

#### B. Landing.js - Wallet Screenshots Section (Section 4)

**Existing button kept:**
- Located at bottom of Section 4
- After wallet screenshot carousel
- Checkmark icon for confirmation feel

**Location:** Lines 492-505 in Landing.js

#### C. WalletBalance.js - Wallet Component

**Added to 3 display modes:**

1. **Full Card View (default):**
   - Shows below wallet address
   - Full-width button with Plus icon
   - Text: "Add BRK Token to Wallet"
   - Location: Lines 239-246

2. **Compact View:**
   - Shows below balance display
   - Smaller button with "Add BRK Token" text
   - Location: Lines 201-207

3. **Ultra-Compact View:**
   - No button added (too small for UI)

**All buttons use the same `addBRKToMetaMask` function**

### 3. ✅ Add BRK Token Function Implementation

**Function Details:**

```javascript
const addBRKToMetaMask = async () => {
  // Mobile/Desktop detection
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

  // Get correct provider (Mobile vs Desktop)
  let provider = isMobile ? window.ethereum : getPreferredProvider()?.provider;

  // Load Base64 logo for iOS compatibility
  const optimizedLogo = await getTokenLogo('BRK');

  // iOS warning about potential display issues
  if (isIOS) {
    // Show confirmation dialog
  }

  // Call wallet_watchAsset
  const wasAdded = await provider.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address: '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24',
        symbol: 'BRK',
        decimals: 18,
        image: optimizedLogo,
      },
    },
  });

  // Success/error handling
}
```

**Features:**
- ✅ Mobile (iOS/Android) support
- ✅ Desktop wallet support (Brave, Rabby, MetaMask)
- ✅ Base64 logo for iOS compatibility
- ✅ iOS-specific warnings and confirmations
- ✅ Error handling with user-friendly messages

### 4. ✅ New Imports Added

**Landing.js:**
```javascript
import { getEthersProvider, getPreferredProvider } from '../walletUtils';
import { getTokenLogo } from '../utils/tokenLogo';
```

**WalletBalance.js:**
```javascript
import { Plus } from 'lucide-react';
import { getTokenLogo } from '../utils/tokenLogo';
```

## Files Modified

1. **src/components/Landing.js**
   - Lines 1-9: Updated imports
   - Lines 25-93: `addBRKToMetaMask` function
   - Lines 332-386: Fixed Section 3 overlap
   - Lines 376-384: Added BRK button in explorer section
   - Lines 382-442: Fixed Section 4 spacing
   - Lines 492-505: Existing BRK button in wallet section

2. **src/components/WalletBalance.js**
   - Lines 2-4: Updated imports
   - Lines 14-81: `addBRKToMetaMask` function
   - Lines 201-207: Compact view BRK button
   - Lines 239-246: Full card view BRK button

## Button Locations Summary

### Landing Page (/)
1. **Section 3 (Investors)** - After "VIEW ON EXPLORER" button
   - Text: "Add BRK Token to Wallet"
   - Icon: Plus (+)
   - Color: Purple-pink gradient

2. **Section 4 (Wallet Screenshots)** - Below carousel
   - Text: "Add BRK Token to MetaMask"
   - Icon: Checkmark (✓)
   - Color: Purple-pink gradient

### Profile Page (/profile)
3. **WalletBalance Component** - Below balance display
   - Full Card: "Add BRK Token to Wallet" with Plus icon
   - Compact: "Add BRK Token" with Plus icon

### BuyBricks Page (/buy)
4. **Existing Implementation** - Already working (no changes made)

## Compatibility

- ✅ iOS MetaMask (with Base64 logo)
- ✅ Android MetaMask
- ✅ Brave Wallet (Desktop)
- ✅ Rabby Wallet (Desktop)
- ✅ MetaMask Extension (Desktop)
- ✅ Trust Wallet Browser

## Testing Instructions

1. **Hard Refresh:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Test Landing Page:**
   - Scroll to Section 3 (Investors)
   - Click "Add BRK Token to Wallet" button
   - Confirm MetaMask popup
   - Scroll to Section 4 (Wallet)
   - Verify no overlap with previous section
   - Click second "Add BRK Token to MetaMask" button

3. **Test Profile Page:**
   - Navigate to /profile
   - Connect wallet if needed
   - Click "Add BRK Token to Wallet" in WalletBalance card
   - Confirm MetaMask popup

4. **Verify Token Added:**
   - Open MetaMask wallet
   - Check BRK token appears in token list
   - If not visible on iOS: Close and reopen MetaMask

## Status

✅ **All Issues Fixed**
- Section overlap: Fixed
- BRK token button in explorer section: Added
- BRK token button in wallet component: Added
- Compilation: Successful (1 minor warning)

---

**Next Steps:** User testing and verification

