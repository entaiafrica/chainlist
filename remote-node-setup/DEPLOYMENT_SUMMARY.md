# FirstBrick Remote Node & Explorer Deployment Summary

**Date**: January 13, 2026
**Status**: ✅ COMPLETED

---

## What Has Been Deployed

### 1. Explorer (Production)
- **URL**: https://explorer.firstbrick.cloud
- **Status**: ✅ LIVE and operational
- **Location**: `/opt/facebrick/explorer/dist`
- **Technology**: React + Vite (production build)
- **Features**:
  - Dashboard with network statistics
  - Block explorer
  - Transaction viewer
  - Token information (BRK, BRKG, GBRK)
  - Wallet connection (MetaMask)
  - Real-time updates every 30 seconds

### 2. Remote Node Setup Package
- **Location**: `/opt/facebrick/remote-node-setup/`
- **Contents**:
  - `docker-compose.yml` - Remote node configuration
  - `genesis.json` - Blockchain genesis file
  - `REMOTE_NODE_SETUP_INSTRUCTIONS.md` - Complete setup guide
  - `DEPLOYMENT_SUMMARY.md` - This file

---

## Network Configuration

### Main FirstBrick Server
- **Public IP**: 72.62.7.146
- **Domain**: firstbrick.cloud
- **Running Nodes**: 4 validator nodes (IBFT2 consensus)
- **Chain ID**: 12786
- **P2P Ports Exposed**: 30303-30306

### Bootnode Enodes (for remote connectivity)
```
enode://8c97411bc202fa3707ef550bc3c5d2953dec457b1afbafe1e97e7fed2e7b89443e490e0db96e64b6ff766a6a3f25e9c6160ae0bd13be7ea4c772f8b8b379689e@72.62.7.146:30303
enode://4e243142f9aead56a0ac87ac6b0bdc4c9674f5a58cd7d46ffd4ea7817c391f9acb5c954a8d686a8b9847243541c267d45e1bd662aaf45ba2c721588ebc2c8e51@72.62.7.146:30304
enode://64dd0fc1039736999d883c6fce986f98888267db0f0bc20a6084f4422ac64635c8ed2f74ecf8a84f3f4a9fa6f9eb96f8416685f237734fd1c7fc9aedd4dcdb71@72.62.7.146:30305
enode://d2d78350d29ebdd8d0f4711166a08afad474dee7a81498b3b332d41c7b71e5be5d926aa3788806b3de96966dcdd0315ed8eaa7858faf946b7ee23e317c0f1831@72.62.7.146:30306
```

---

## Remote Node Setup (Linux Mint Server)

### Target Server Information
- **Hostname**: entai-ThinkPad-X250
- **OS**: Linux Mint 22 / Ubuntu 24.04
- **Local IP**: 192.168.0.122
- **Network**: Private (behind NAT)
- **Docker**: Required (already installed)

### Setup Instructions
Complete instructions are in: `/opt/facebrick/remote-node-setup/REMOTE_NODE_SETUP_INSTRUCTIONS.md`

**Quick Start for Claude Agent on Remote Server:**
```bash
# 1. Create directory
mkdir -p ~/firstbrick-node && cd ~/firstbrick-node

# 2. Copy files from main server
scp root@72.62.7.146:/opt/facebrick/remote-node-setup/* ~/firstbrick-node/

# 3. Start the node
docker-compose up -d

# 4. Check logs
docker logs -f firstbrick-besu-remote

# 5. Verify connectivity
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
  http://localhost:8545
```

---

## Verification Steps

### Explorer Verification
```bash
# Check explorer is accessible
curl -I https://explorer.firstbrick.cloud

# Expected: HTTP/1.1 200 OK
```

### Remote Node Verification (after setup on Linux Mint)
```bash
# Check node is running
docker ps | grep firstbrick-besu-remote

# Check peer connections
curl -s -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"admin_peers","params":[],"id":1}' \
  http://localhost:8545 | jq

# Check block sync
curl -s -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545
```

---

## Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  FirstBrick Main Server (72.62.7.146)                       │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Besu Node1 │  │ Besu Node2 │  │ Besu Node3 │           │
│  │  :30303    │  │  :30304    │  │  :30305    │           │
│  │ Validator  │  │ Validator  │  │ Validator  │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│                                                              │
│  ┌────────────┐  ┌──────────────┐                          │
│  │ Besu Node4 │  │  Explorer    │                          │
│  │  :30306    │  │ :443 (HTTPS) │                          │
│  │ Validator  │  │              │                          │
│  └────────────┘  └──────────────┘                          │
│                                                              │
│  Public Endpoints:                                          │
│  - https://marketplace.firstbrick.cloud (Frontend)         │
│  - https://rpc.firstbrick.cloud (JSON-RPC)                 │
│  - https://explorer.firstbrick.cloud (Explorer)            │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ P2P Connection
                            │ (Outbound through NAT)
                            │
┌─────────────────────────────────────────────────────────────┐
│  Remote Server (192.168.0.122) - Behind NAT                 │
│                                                              │
│  ┌────────────────────────────────────┐                     │
│  │  FirstBrick Remote Node            │                     │
│  │  - Connects to bootnodes           │                     │
│  │  - Syncs blockchain                │                     │
│  │  - Local RPC: :8545                │                     │
│  │  - Local WS: :8546                 │                     │
│  └────────────────────────────────────┘                     │
│                                                              │
│  Local Network Access:                                      │
│  - http://192.168.0.122:8545 (JSON-RPC)                     │
│  - ws://192.168.0.122:8546 (WebSocket)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration Files

### Explorer Nginx Configuration
Location: `/etc/nginx/sites-available/firstbrick.cloud`

The explorer server block:
```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name explorer.firstbrick.cloud;

    ssl_certificate /etc/letsencrypt/live/explorer.firstbrick.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/explorer.firstbrick.cloud/privkey.pem;

    root /opt/facebrick/explorer/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Remote Node Docker Compose
Location: `/opt/facebrick/remote-node-setup/docker-compose.yml`

Key configuration:
- Image: hyperledger/besu:25.10.0
- Ports: 8545 (RPC), 8546 (WS), 30303 (P2P)
- Bootnodes: All 4 FirstBrick validators
- Miner: Enabled (non-validator)
- Network: firstbrick-remote bridge

---

## Maintenance

### Update Explorer
```bash
cd /opt/facebrick/explorer
npm run build
sudo systemctl reload nginx
```

### Check Explorer Logs
```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log | grep explorer

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Update Remote Node (on Linux Mint)
```bash
cd ~/firstbrick-node
docker-compose down
docker pull hyperledger/besu:25.10.0
docker-compose up -d
```

---

## Troubleshooting

### Explorer Not Loading
```bash
# Check nginx is running
sudo systemctl status nginx

# Check file permissions
ls -la /opt/facebrick/explorer/dist/

# Reload nginx
sudo systemctl reload nginx
```

### Remote Node Not Connecting
```bash
# Check connectivity to bootnodes
for port in 30303 30304 30305 30306; do
    echo "Testing port $port..."
    nc -zv 72.62.7.146 $port
done

# Check logs
docker logs firstbrick-besu-remote | tail -100

# Restart node
docker-compose restart
```

---

## URLs Summary

| Service | URL | Status |
|---------|-----|--------|
| Marketplace | https://marketplace.firstbrick.cloud | ✅ Live |
| RPC Endpoint | https://rpc.firstbrick.cloud | ✅ Live |
| Explorer | https://explorer.firstbrick.cloud | ✅ Live |
| Remote Node RPC | http://192.168.0.122:8545 | ⏳ Pending Setup |

---

## Next Steps

1. **On Remote Server (Linux Mint)**:
   - Follow instructions in `REMOTE_NODE_SETUP_INSTRUCTIONS.md`
   - Set up the remote node
   - Verify connectivity and sync

2. **Testing**:
   - Access explorer at https://explorer.firstbrick.cloud
   - Connect MetaMask to remote node (once set up)
   - Verify transactions work through both endpoints

3. **Monitoring**:
   - Check explorer regularly for updates
   - Monitor remote node sync status
   - Verify peer count remains stable

---

## Contact Information

**FirstBrick Support**
- Email: info@firstbrick.com
- Phone: 010 347 7827
- Location: Johannesburg, South Africa

**Technical Details**
- Chain ID: 12786
- Consensus: IBFT2
- Block Time: 2 seconds
- Network Type: Private/Consortium

---

**Deployment Completed**: January 13, 2026
**Deployed By**: Claude Code Assistant
**Version**: Production v1.0
