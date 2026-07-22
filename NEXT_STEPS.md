# Next Steps to Continue Migration

## Current Status
- Phase 1 & 2: COMPLETED
- Phase 3: BLOCKED on IBFT2 genesis configuration
- PostgreSQL & IPFS: Running
- Besu nodes: Crashing due to genesis extraData RLP errors

## Immediate Action Required

Choose one of these three options to fix the genesis issue:

### Option 1: Use Besu Operator Tool (Recommended)

Generate a proper IBFT2 network configuration:

```bash
cd /opt/facebrick
rm -rf ibft2-new && mkdir ibft2-new && cd ibft2-new

# This will generate a proper 4-node IBFT2 network
# Then copy the genesis.json and node keys to the right locations
```

### Option 2: Switch to Clique Consensus

Simpler alternative to IBFT2:

```bash
# Use Clique genesis (simpler format, no RLP issues)
# Single node can start immediately
# Can add more validators later
```

### Option 3: Copy Working Genesis from Production

If production server is accessible, copy its working IBFT2 genesis and adapt it.

## After Blockchain Starts

1. Verify blocks are being produced
2. Deploy smart contracts (Forwarder, BRK Token, Marketplace)
3. Setup relayer service with PM2
4. Build and deploy frontend with PM2
5. Configure Nginx reverse proxy
6. Setup SSL certificates
7. Full stack testing
8. DNS cutover

## Key Files

- Genesis: `/opt/facebrick/besu-config/genesis.json`
- Docker Compose: `/opt/facebrick/docker-compose.yml`
- Environment: `/opt/facebrick/.env`
- Progress: `/opt/facebrick/MIGRATION_PROGRESS_20251220.md`

## Deployer Account

Address: 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
Private Key: In `/opt/facebrick/.env`
Balance: 1,000,000 BRK (from genesis)

---
Last Updated: December 20, 2025
