# Native Currency Update: BRK to BRKG

Date: December 20, 2025
Build: main.b7fbcbd4.js
Status: Complete

## Summary

Updated native blockchain currency from BRK to BRKG (Brick Gas) to distinguish from BRK ERC-20 token.
Added logo: https://i.ibb.co/XrdkJtFX/brick-white.png

## Changes

Currency Symbol: BRK → BRKG
Currency Name: Brick → Brick Gas
Logo: Added brick-white.png icon

## Token vs Gas

Native Currency BRKG - Pay gas fees
ERC-20 Token BRK - Utility token (0x5b1869D9A4C187F2EAa108f3062412ecf0526b24)

## Files Modified

- walletUtils.js - Updated getBrickChainConfig with BRKG and logo
- BuyBricks.js - Added iconUrls to wallet_addEthereumChain
- NFTpage.js, WalletBalance.js, Profile.js - ETH Balance → BRKG Balance
- Troubleshooting.js - Updated currency symbol from ETH to BRKG

## Network Display

Network Name: BrickChain
RPC URL: https://rpc.firstbrick.cloud
Chain ID: 12786
Currency Symbol: BRKG
Logo: brick-white.png

## Verification

Build verified - BRKG symbol and logo present in main.b7fbcbd4.js
No ETH Balance references remain
Frontend deployed at marketplace.firstbrick.cloud
