# Facebrick Migration Progress - December 20, 2025

## Session Summary

**Objective:** Complete migration of Facebrick blockchain and marketplace from current server to new Hostinger VPS.

**Server Details:**
- IP: 72.62.7.146
- Hostname: srv1210740.hstgr.cloud
- Location: London, UK
- OS: Ubuntu 24.04 LTS
- Specs: 4 CPU, 16GB RAM, 200GB disk

---

## Completed Tasks

### Phase 1: Migration Package Export - COMPLETED
- Created 7.2MB migration package from current server
- Exported contracts, scripts, frontend source, relayer, configs

### Phase 2: New Server Setup - COMPLETED
**Software Installed:**
- Docker 29.1.3
- Docker Compose v5.0.1
- Node.js v20.19.6
- npm 10.8.2
- OpenJDK 21.0.9
- Nginx 1.24.0
- PM2 6.0.14
- UFW firewall configured

**Directory Structure:**
```
/opt/facebrick/
├── contracts/              # Smart contracts
├── scripts/                # Deployment scripts
├── src/                    # Frontend source
├── build/                  # Frontend build
├── relayer/                # Relayer service
├── besu-config/            # Blockchain genesis
├── data/
│   ├── node1/             # Node 1 data
│   ├── node2/             # Node 2 data
│   ├── node3/             # Node 3 data
│   ├── node4/             # Node 4 data
│   ├── postgres/          # Database
│   └── ipfs/              # IPFS data
├── ibft2-config/          # IBFT2 generation attempts
└── docker-compose.yml     # Container orchestration
```

### Phase 3: Infrastructure Deployment - PARTIAL
**Services Running:**
- PostgreSQL 15 - Running and healthy
- IPFS (Kubo) - Running and healthy
  - Gateway: http://localhost:8090
  - API: http://localhost:5001
- Besu nodes - NOT RUNNING (genesis issue)

**Network Configuration:**
- Chain ID: 12786 (0x31f2)
- Native Currency Symbol: BRK
- Consensus: IBFT2 (4 validators)

---

## Current Blocker: IBFT2 Genesis Configuration

### Problem
The IBFT2 genesis.json extraData field requires proper RLP encoding. Multiple manual encoding attempts failed with various RLP parsing errors.

### Attempted Solutions
1. Manual RLP encoding - Failed with "Expected list, got BYTE_ELEMENT"
2. Different RLP prefix combinations - Failed with parsing errors
3. Besu operator tool - Directory conflict issues preventing generation
4. Currently exploring: Use Besu operator tool properly OR switch to Clique consensus

### Current Genesis Configuration
Location: `/opt/facebrick/besu-config/genesis.json`

**Validator Addresses (4 nodes):**
- 0xeec7951081b3f888b80bd1daaf26aa6b79a79ee7
- 0x9e508ee45662436d07b80c5c89965853e7d64c76
- 0x32aba300925263523e6b0f24f5a353a2c055b2cc
- 0xfc2eda88a003679d920a53e87b1b03765b532115

**Pre-funded Accounts:**
- 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1 (Deployer - 1M BRK)
- 4 additional accounts with large balances

### Docker Compose Configuration
Location: `/opt/facebrick/docker-compose.yml`

**Services Defined:**
- besu-node1 (RPC on 8545, WS on 8546, P2P on 30303)
- besu-node2 (P2P on 30304)
- besu-node3 (P2P on 30305)
- besu-node4 (P2P on 30306)
- postgres (port 5432)
- ipfs (ports 4001, 5001, 8090)

**Status:** Nodes crash on startup due to genesis extraData parsing errors.

---

## Smart Contract Status

### Files Ready for Deployment
1. **BRKToken.sol** - FIXED
   - Removed non-existent ERC20URIStorage import
   - Added _contextSuffixLength override
   - ERC-2771 gasless support working

2. **MinimalForwarder.sol** - READY
   - Standard ERC-2771 forwarder

3. **BrickMarketplace.sol** - NEEDS VERIFICATION
   - Fixed constructor parameter shadowing
   - Attempted _contextSuffixLength override

### Deployment Configuration
**File:** `/opt/facebrick/.env`
```
PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
RPC_URL=http://localhost:8545
NETWORK=localhost
CHAIN_ID=12786
```

**Deployer Account:** 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1

---

## Pending Tasks (Not Started)

### Phase 4: Smart Contract Deployment - BLOCKED
Requires working blockchain
- Deploy MinimalForwarder
- Deploy BRK Token
- Deploy BrickMarketplace
- Configure gasless system

### Phase 5: Relayer Service - BLOCKED
Requires deployed contracts
- Configure relayer/.env with forwarder address
- Setup PM2 for relayer (port 8549)
- Test gasless transactions

### Phase 6: Frontend Deployment - BLOCKED
Requires deployed contracts
- Update frontend .env with contract addresses
- Build production bundle
- Setup PM2 for frontend (port 3300)

### Phase 7: Nginx Configuration - BLOCKED
Requires services running
- Configure fb.entailabs.com → frontend
- Configure rpc.entailabs.com → RPC/IPFS
- Setup reverse proxy

### Phase 8: SSL Certificates - BLOCKED
Requires Nginx configured
- Install Certbot
- Obtain Let's Encrypt certificates
- Configure HTTPS redirects

### Phase 9: Testing - BLOCKED
Requires full stack running
- Test RPC endpoint
- Test IPFS uploads
- Test gasless transactions
- Test frontend functionality

### Phase 10: DNS Cutover - BLOCKED
Requires successful testing
- Update DNS A records
- Monitor propagation
- Validate production traffic

### Phase 11: Monitoring & Security - BLOCKED
Requires production deployment
- Setup backup scripts
- Configure monitoring
- Security hardening

### Phase 12: Decommission Old Server - BLOCKED
Requires 1-2 weeks validation
- Archive old server data
- Cancel hosting subscription

---

## Key Technical Decisions

1. Chain ID: 12786 (not 1337) - Avoids testnet conflicts
2. Currency Symbol: BRK (not ETH) - Reduces user confusion
3. Consensus: IBFT2 with 4 validators - User explicitly requested multiple nodes
4. Gasless Transactions: ALL BRK transfers including wallet-to-wallet
5. IPFS: Local node (not Pinata) - Self-hosted storage

---

## Next Steps

### Immediate Priority
**Resolve IBFT2 Genesis Issue** (Choose ONE approach):

**Option A: Use Besu Operator Tool Properly**
```bash
# Clean slate
cd /opt/facebrick
rm -rf ibft2-new
mkdir ibft2-new && cd ibft2-new

# Create config file
# Run operator tool to generate network
# Copy genesis.json
# Distribute node keys
```

**Option B: Switch to Clique Consensus**
- Simpler than IBFT2
- Better documented
- Single node can start immediately
- Add more sealers later

**Option C: Reference Working Production Genesis**
- Access current production server
- Copy working IBFT2 genesis structure
- Adapt for new chain ID and accounts

### After Blockchain is Running
1. Verify blocks are being produced
2. Deploy smart contracts (Phase 4)
3. Setup relayer (Phase 5)
4. Deploy frontend (Phase 6)
5. Configure Nginx and SSL (Phase 7-8)
6. Full stack testing (Phase 9)
7. DNS cutover (Phase 10)

---

## Errors Encountered

### Compilation Errors (RESOLVED)
1. BRKToken.sol - ERC20URIStorage does not exist
2. Constructor parameter shadowing
3. Missing _contextSuffixLength override
4. Wrong deployer account (no funds)

### Blockchain Errors (ONGOING)
1. IBFT2 extraData RLP encoding - Multiple format attempts failed
2. Besu operator tool - Directory exists conflicts
3. Manual RLP encoding - Various parsing errors

### Latest Error
```
Expected current item to be a list, but it is: LONG_ELEMENT
(at bytes 121-188)
```

---

## Files Modified This Session

1. `/opt/facebrick/contracts/BRKToken.sol` - Fixed imports and overrides
2. `/opt/facebrick/contracts/BrickMarketplace.sol` - Partial fixes
3. `/opt/facebrick/besu-config/genesis.json` - Multiple iterations
4. `/opt/facebrick/docker-compose.yml` - Evolved to 4-node setup
5. `/opt/facebrick/hardhat.config.js` - Updated chain ID, accounts
6. `/opt/facebrick/.env` - Created with deployer key

---

## Important Notes

### User Requirements
- Must use chain ID 12786 (not testnet 1337)
- Native currency MUST display as "BRK" not "ETH"
- ALL BRK transfers must be gasless (including wallet-to-wallet)
- User explicitly requested multiple validator nodes

### Working Production System
- Current production: https://fb.entailabs.com
- Current RPC: https://rpc.entailabs.com
- Chain ID: 1337 (different from new server)
- Already has deployed contracts and working gasless system

### Migration Strategy
- Fresh blockchain (no state preservation)
- Test on new server first
- DNS cutover only after full validation
- Old server stays online during testing

---

## Contact Information

**Server Access:**
- IP: 72.62.7.146
- Username: root
- Password: 209288693-Hr

**Current Production:**
- Frontend: https://fb.entailabs.com
- RPC: https://rpc.entailabs.com

---

## Estimated Completion Time

**If genesis is resolved:** 6-8 hours remaining
- Phase 4: Smart contracts - 1-2 hours
- Phase 5: Relayer - 30 minutes
- Phase 6: Frontend - 1 hour
- Phase 7: Nginx - 30 minutes
- Phase 8: SSL - 30 minutes
- Phase 9: Testing - 2-3 hours
- Phase 10: DNS - 30 minutes

**Total:** Remaining 8-10 hours after genesis issue is resolved.

---

**Last Updated:** December 20, 2025 12:45 UTC
**Status:** Phase 3 blocked on IBFT2 genesis configuration
**Next Action:** Resolve genesis extraData RLP encoding or switch consensus mechanism
