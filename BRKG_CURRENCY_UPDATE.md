# Native Currency Update: BRK → BRKG

**Date:** December 20, 2025
**Build:** main.b7fbcbd4.js
**Status:** ✅ Complete

## Summary

Updated the native blockchain currency from **BRK** to **BRKG** (Brick Gas) to distinguish it from the BRK ERC-20 token. Added a logo to help users visually identify the native currency in their wallets.

## Changes Made

### 1. Currency Symbol
- **Old:** BRK (same as ERC-20 token - confusing)
- **New:** BRKG (Brick Gas - distinct from token)

### 2. Currency Name
- **Old:** "Brick"
- **New:** "Brick Gas"

### 3. Currency Logo
- **Added:** https://i.ibb.co/XrdkJtFX/brick-white.png
- Logo displays in wallet when adding network
- Helps distinguish BRKG (gas) from BRK (token)

## Token vs Gas Currency Comparison

| Currency | Symbol | Type | Purpose | Contract Address |
|----------|--------|------|---------|------------------|
| **Brick Gas** | BRKG | Native | Pay gas fees | N/A (native currency) |
| **Brick Token** | BRK | ERC-20 | Utility token | 0x5b1869D9A4C187F2EAa108f3062412ecf0526b24 |

## Files Modified

### Core Configuration
- `src/walletUtils.js` - Updated `getBrickChainConfig()` function
  - Changed symbol: "BRK" → "BRKG"
  - Changed name: "Brick" → "Brick Gas"
  - Added iconUrls with logo

### Wallet Integration
- `src/components/BuyBricks.js` - Updated `wallet_addEthereumChain` call
  - Added iconUrls parameter
  - Updated symbol to BRKG

### UI Display Text
- `src/components/NFTpage.js` - "ETH Balance" → "BRKG Balance"
- `src/components/WalletBalance.js` - "ETH Balance" → "BRKG Balance"
- `src/components/Profile.js` - Updated balance labels
- `src/components/Troubleshooting.js` - Updated help text
  - "Currency Symbol: ETH" → "Currency Symbol: BRKG"
  - "Insufficient Gas (ETH)" → "Insufficient Gas (BRKG)"

## Network Configuration

When users click "Add BrickChain Network", they now see:

```
Network Name: BrickChain
RPC URL: https://rpc.firstbrick.cloud
Chain ID: 12786
Currency Symbol: BRKG
Currency Name: Brick Gas
Logo: [brick-white.png icon]
```

## Verification

```bash
# Check BRKG symbol in compiled JS
grep -o "symbol:\"BRKG\"" /opt/facebrick/build/static/js/main.b7fbcbd4.js | head -3
# Result: symbol:"BRKG" (3 instances found)

# Check logo URL in compiled JS
grep -o "i.ibb.co/XrdkJtFX/brick-white.png" /opt/facebrick/build/static/js/main.b7fbcbd4.js | head -2
# Result: logo URL found (2 instances)

# Verify no ETH Balance references remain
grep -c "ETH Balance" /opt/facebrick/build/static/js/main.b7fbcbd4.js
# Result: 0 (all removed)
```

## User Impact

### Before (Confusing):
- Native currency: BRK
- Token currency: BRK
- Users couldnt distinguish between gas and tokens
