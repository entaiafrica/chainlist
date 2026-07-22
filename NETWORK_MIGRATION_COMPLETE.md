# FirstBrick Network Migration - Complete

**Date:** December 20, 2025
**Chain ID:** 12786 (0x31f2)  
**Network Name:** BrickChain
**Status:** Production Ready ✅

## Network Configuration

### Production Network Details

- **Network Name:** BrickChain
- **Chain ID (Decimal):** 12786
- **Chain ID (Hex):** 0x31f2
- **RPC URL:** https://rpc.firstbrick.cloud
- **Native Currency:** BRK (Brick)
- **Light Explorer:** https://explorer.firstbrick.cloud
- **IPFS Gateway:** https://rpc.firstbrick.cloud/ipfs/
- **Relayer Service:** https://rpc.firstbrick.cloud/relay
- **Consensus:** IBFT2 (4 validators)
- **Block Time:** 2 seconds

### Deployed Smart Contracts

```
MinimalForwarder: 0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab
BRKToken:         0x5b1869D9A4C187F2EAa108f3062412ecf0526b24
BrickMarketplace: 0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B
```

Deployed by: 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
Initial BRK Supply: 100,000,000 tokens

## Changes Completed

### 1. Contract Address Updates
- Replaced old BRK token address (0x70e0bA845...) with new address (0x5b1869D9A4C187F2EA...)
- Updated 7 instances across 5 source files

### 2. Network Configuration Updates  
- Chain ID: 1337 → 12786
- RPC URL: rpc.entailabs.com → rpc.firstbrick.cloud
- Currency: ETH → BRK
- Explorer: explorer.entailabs.com → explorer.firstbrick.cloud (Light Explorer)

### 3. Files Modified
- walletUtils.js (core network config)
- NetworkMismatchModal.js
- Navbar.js, BuyBricks.js, Marketplace.js
- NFTpage.js, Profile.js, Troubleshooting.js
- GenesisModal.js, GenesisInvestor.js, GenesisPopup.js

## Verification

Frontend build: main.453dbb98.js
Deployed at: https://marketplace.firstbrick.cloud

Test wallet connection:
1. Visit marketplace.firstbrick.cloud
2. Click "Connect Wallet"
3. Add BrickChain network when prompted
4. Verify: Chain 12786, RPC rpc.firstbrick.cloud, Currency BRK

## Services Status

PM2 Services:
- facebrick-frontend (port 3300) - Running
- facebrick-relayer (port 8549) - Running

Docker Services:
- besu-node1 (RPC port 8545) - Running
- besu-node2, node3, node4 - Running
- postgres, ipfs - Running

## Outstanding Items

1. GBRK Genesis Token - Not deployed (contract address 0x17F8376935... does not exist)
2. Light Explorer - Successfully deployed and configured

## Support

Server: root@72.62.7.146
Documentation: /opt/facebrick/NETWORK_MIGRATION_COMPLETE.md
Deployment Info: /opt/facebrick/deployment.json
