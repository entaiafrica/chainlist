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

### ✅ Phase 1: Migration Package Export
- Created 7.2MB migration package from current server
- Exported contracts, scripts, frontend source, relayer, configs

### ✅ Phase 2: New Server Setup
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

### ✅ Phase 3: Infrastructure Deployment (Partial)
**Services Running:**
- ✅ PostgreSQL 15 - Running and healthy
- ✅ IPFS (Kubo) - Running and healthy
  - Gateway: http://localhost:8090
  - API: http://localhost:5001
- ❌ Besu nodes - NOT RUNNING (genesis issue)

**Network Configuration:**
- Chain ID: 12786 (0x31f2)
- Native Currency Symbol: BRK
- Consensus: IBFT2 (4 validators)

---

## Current Blocker: IBFT2 Genesis Configuration

### Problem
The IBFT2 genesis.json extraData field requires proper RLP encoding. Multiple manual encoding attempts failed with various RLP parsing errors.

### Attempted Solutions
1. ❌ Manual RLP encoding - Failed with "Expected list, got BYTE_ELEMENT"
2. ❌ Different RLP prefix combinations - Failed with parsing errors
3. ❌ Besu operator tool - Directory conflict issues preventing generation
4. 🔄 Currently exploring: Use Besu operator tool properly OR switch to Clique consensus

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
1. **BRKToken.sol** - ✅ Fixed
   - Removed non-existent ERC20URIStorage import
   - Added _contextSuffixLength override
   - ERC-2771 gasless support working

2. **MinimalForwarder.sol** - ✅ Ready
   - Standard ERC-2771 forwarder

3. **BrickMarketplace.sol** - ⚠️ Needs verification
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

### Phase 4: Smart Contract Deployment
**BLOCKED** - Requires working blockchain
- Deploy MinimalForwarder
- Deploy BRK Token
- Deploy BrickMarketplace
- Configure gasless system

### Phase 5: Relayer Service
**BLOCKED** - Requires deployed contracts
- Configure relayer/.env with forwarder address
- Setup PM2 for relayer (port 8549)
- Test gasless transactions

### Phase 6: Frontend Deployment
**BLOCKED** - Requires deployed contracts
- Update frontend .env with contract addresses
- Build production bundle
- Setup PM2 for frontend (port 3300)

### Phase 7: Nginx Configuration
**BLOCKED** - Requires services running
- Configure fb.entailabs.com → frontend
- Configure rpc.entailabs.com → RPC/IPFS
- Setup reverse proxy

### Phase 8: SSL Certificates
**BLOCKED** - Requires Nginx configured
- Install Certbot
- Obtain Lets Encrypt certificates
