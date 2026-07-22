# BRK Token Addition - Debugging Guide

**Date:** 2026-01-14
**Issue:** Token addition button not prompting wallet to add token

## What Was Fixed

### 1. ✅ Comprehensive Debugging Added
The button now logs detailed information to the browser console at every step:

**Console Output You'll See:**
```
🚀 Starting wallet setup...
📱 Device info: { isMobile: false, isIOS: false }
✓ Using preferred provider: Brave Wallet
🔐 Step 1/3: Requesting wallet connection...
✓ Wallet connected: 0x1234...
🌐 Step 2/3: Adding BrickChain network...
✓ BrickChain network added/switched
🪙 Step 3/3: Adding BRK token...
📸 Loading token logo...
✓ Logo loaded successfully
📤 Sending wallet_watchAsset request...
Token details: { address: '0x5b1869...', symbol: 'BRK', decimals: 18, imageLength: 12345 }
📊 Token add result: true
✅ All steps completed successfully!
```

### 2. ✅ Improved Error Handling
- Each step has try-catch blocks
- Detailed error messages shown to user
- Fallback logo URL if Base64 conversion fails
- Network addition errors are non-blocking (continues if network already exists)

### 3. ✅ One-Click Setup
The button now does **3 things in one click:**
1. **Connects wallet** (eth_requestAccounts)
2. **Adds BrickChain network** (wallet_addEthereumChain)
3. **Adds BRK token with logo** (wallet_watchAsset)

## How to Debug

### Step 1: Hard Refresh Your Browser
```bash
# Windows/Linux
Ctrl + Shift + R

# Mac
Cmd + Shift + R
```

### Step 2: Open Browser Console
```bash
# Press F12 or:
Right-click anywhere → Inspect → Console tab
```

### Step 3: Click the Button
Click either:
- **"Connect Wallet & Add BRK"** (Section 3 - Investors)
- **"Complete Wallet Setup"** (Section 4 - Wallet Screenshots)
- **"Add BRK Token to Wallet"** (Profile page - WalletBalance component)

### Step 4: Watch Console Output
Look for the emoji icons (🚀 📱 ✓ ❌ ⚠️) in the console to track progress.

## Common Issues & Solutions

### Issue 1: No Console Output at All
**Problem:** Button click not triggering function

**Solution:**
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Try incognito mode
4. Check if JavaScript is enabled

### Issue 2: "❌ No provider found"
**Problem:** No wallet extension detected

**Solution:**
- Install MetaMask, Brave Wallet, or Rabby
- Ensure wallet extension is enabled
- Refresh page after installing wallet

### Issue 3: "❌ Wallet connection was cancelled"
**Problem:** User rejected connection request

**Solution:**
- Click button again
- Approve the connection prompt in your wallet

### Issue 4: Network Error But Continues
**Problem:** `⚠️ Network error (may already exist)`

**This is NORMAL** - Means BrickChain network is already added to your wallet.
The function continues to add the token.

### Issue 5: "⚠️ Logo loading failed"
**Problem:** Base64 logo conversion failed

**This is OK** - Function uses fallback URL and continues.
Token will still be added (maybe without logo).

### Issue 6: No MetaMask Popup for Token
**Problem:** wallet_watchAsset not showing popup

**Possible Causes:**
1. **Popup Blocker:** Disable popup blocker for this site
2. **Already Added:** Token already exists in wallet
3. **Wrong Network:** Not on BrickChain network
4. **Wallet Bug:** Try closing and reopening wallet

**Debugging Steps:**
```javascript
// Look for this in console:
📤 Sending wallet_watchAsset request...
Token details: {...}

// If you see this but NO popup, check:
// 1. Popup blocker settings
// 2. Wallet extension is responsive
// 3. Try different browser
```

### Issue 7: Token Adds But No Logo
**Problem:** Generic token icon appears instead of BRK logo

**This is OK** - Token works perfectly, just missing logo.

**Why:**
- Logo conversion may have failed
- Wallet doesn't support custom logos
- Wallet cache issue

**Fix:** Logo functionality doesn't affect token usage.

## Manual Token Addition

If the button fails completely, add manually:

### Token Details:
```
Contract Address: 0x5b1869D9A4C187F2EAa108f3062412ecf0526b24
Token Symbol: BRK
Decimals: 18
Network: BrickChain (Chain ID: 12786)
```

### Steps:
1. **Add Network First** (if not added):
   - Network Name: BrickChain
   - RPC URL: https://rpc.firstbrick.cloud
   - Chain ID: 12786 (or hex: 0x31f2)
   - Currency Symbol: BRK
   - Block Explorer: https://explorer.firstbrick.cloud

2. **Add Token**:
   - Open wallet → Import tokens
   - Paste contract address: `0x5b1869D9A4C187F2EAa108f3062412ecf0526b24`
   - Symbol auto-fills: BRK
   - Decimals auto-fill: 18
   - Import

## Files Updated

1. **src/components/Landing.js** (Lines 24-151)
   - Enhanced debugging
   - 3-step setup process
   - Detailed console logging

2. **src/components/WalletBalance.js** (Lines 14-139)
   - Same enhancements as Landing.js
   - Used in Profile page

## Button Locations

1. **Landing Page - Section 3** (After investors)
   - Text: "Connect Wallet & Add BRK"
   - Purple-pink gradient button

2. **Landing Page - Section 4** (After wallet screenshots)
   - Text: "Complete Wallet Setup"
   - Description: "Connect wallet • Add BrickChain • Add BRK Token"

3. **Profile Page** (WalletBalance component)
   - Text: "Add BRK Token to Wallet"
   - Shows when wallet is connected

## Testing Checklist

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Open console (F12)
- [ ] Click button
- [ ] See "🚀 Starting wallet setup..." in console
- [ ] Approve wallet connection
- [ ] Approve network addition (or see warning if exists)
- [ ] See token popup from wallet
- [ ] Approve token addition
- [ ] See success message
- [ ] Verify token appears in wallet

## Expected Console Output (Success)

```
🚀 Starting wallet setup...
📱 Device info: { isMobile: false, isIOS: false }
✓ Using preferred provider: MetaMask
🔐 Step 1/3: Requesting wallet connection...
✓ Wallet connected: 0xYourAddress...
🌐 Step 2/3: Adding BrickChain network...
✓ BrickChain network added/switched
🪙 Step 3/3: Adding BRK token...
📸 Loading token logo...
✓ Logo loaded successfully
📤 Sending wallet_watchAsset request...
Token details: { address: '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24', symbol: 'BRK', decimals: 18, imageLength: 50000 }
📊 Token add result: true
✅ All steps completed successfully!
```

## What to Share for Support

If the button still fails after trying everything, share:

1. **Console Output** (screenshot or copy-paste)
2. **Browser:** Chrome/Brave/Firefox + version
3. **Wallet:** MetaMask/Brave/Rabby + version
4. **Device:** Desktop/Mobile, OS
5. **Network:** Were you already on BrickChain or Ethereum?
6. **Error Messages:** Any alerts or popups shown

## Status

✅ **Code Deployed and Compiled**
- Detailed logging active
- Error handling improved
- Fallback mechanisms in place
- Ready for testing

---

**Next Step:** Try the button with browser console open (F12) and share the console output!

