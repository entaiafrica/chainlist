# FirstBrick Remote Node Setup Instructions

## For: Claude Agent on Linux Mint Server (entai-ThinkPad-X250)

---

## Server Information
- **Hostname**: entai-ThinkPad-X250
- **OS**: Linux Mint 22 (Wilma) / Ubuntu 24.04
- **Local IP**: 192.168.0.122
- **Network**: Private (behind NAT)
- **Docker**: Installed and running

---

## Overview

You will be setting up a **remote Besu node** that connects to the FirstBrick blockchain network. The main FirstBrick server is at **72.62.7.146** (firstbrick.cloud) and runs 4 validator nodes. Your remote node will:

1. Connect to the FirstBrick bootnodes (outbound connections work through NAT)
2. Sync the blockchain
3. Participate in the network (non-validator)
4. Provide local RPC access on your network

---

## Prerequisites Check

Before starting, verify:

```bash
# Check Docker is installed and running
docker --version
docker ps

# Check network connectivity to FirstBrick
ping -c 4 72.62.7.146

# Check P2P port connectivity
nc -zv 72.62.7.146 30303
nc -zv 72.62.7.146 30304
nc -zv 72.62.7.146 30305
nc -zv 72.62.7.146 30306

# If nc command not found, install it:
sudo apt-get install netcat-openbsd
```

---

## Step 1: Create Project Directory

```bash
# Create the project directory
mkdir -p ~/firstbrick-node
cd ~/firstbrick-node

# Create data directory for blockchain data
mkdir -p data
```

---

## Step 2: Download Configuration Files

You need two files:
1. `docker-compose.yml` - Docker configuration
2. `genesis.json` - Blockchain genesis configuration

### Method A: Direct Transfer (if you have access to the main server)

```bash
# From your Linux Mint server, SSH to the main server and copy files
scp root@72.62.7.146:/opt/facebrick/remote-node-setup/* ~/firstbrick-node/
```

### Method B: Manual Creation

Create these files manually if direct transfer isn't available.

**Create `genesis.json`:**

```bash
cat > ~/firstbrick-node/genesis.json << 'EOF'
{
  "config" : {
    "chainId" : 12786,
    "berlinBlock" : 0,
    "ibft2" : {
      "blockperiodseconds" : 2,
      "epochlength" : 30000,
      "requesttimeoutseconds" : 4
    }
  },
  "nonce" : "0x0",
  "timestamp" : "0x58ee40ba",
  "gasLimit" : "0x47b760",
  "difficulty" : "0x1",
  "mixHash" : "0x63746963616c2062797a616e74696e65206661756c7420746f6c6572616e6365",
  "coinbase" : "0x0000000000000000000000000000000000000000",
  "alloc" : {
    "90F8bf6A479f320ead074411a4B0e7944Ea8c9C1" : {
      "balance" : "0xd3c21bcecceda1000000"
    },
    "FFcf8FDEE72ac11b5c542428B35EEF5769C409f0" : {
      "balance" : "0xd3c21bcecceda1000000"
    },
    "22d491Bde2303f2f43325b2108D26f1eAbA1e32b" : {
      "balance" : "0xd3c21bcecceda1000000"
    },
    "E11BA2b4D45Eaed5996Cd0823791E0C93114882d" : {
      "balance" : "0xd3c21bcecceda1000000"
    },
    "d03ea8624C8C5987235048901fB614fDcA89b117" : {
      "balance" : "0xd3c21bcecceda1000000"
    }
  },
  "extraData" : "0xf87ea00000000000000000000000000000000000000000000000000000000000000000f8549410527b2901ddeeba48cf796f00764f5dc65b728d9460da5f8c9e2038f00b29b1519de8c8cabae9138c9493976758f834c2da3ce66174384a7cb4d1752cf99464290b7d2617ac580bc11d476c770fb6acd22248808400000000c0"
}
EOF
```

**Create `docker-compose.yml`:**

```bash
cat > ~/firstbrick-node/docker-compose.yml << 'EOF'
version: "3.8"

services:
  besu-node-remote:
    image: hyperledger/besu:25.10.0
    container_name: firstbrick-besu-remote
    restart: unless-stopped
    ports:
      - "8545:8545"
      - "8546:8546"
      - "30303:30303"
    volumes:
      - ./data:/data
      - ./genesis.json:/genesis.json
    command:
      - --genesis-file=/genesis.json
      - --data-path=/data
      - --rpc-http-enabled
      - --rpc-http-host=0.0.0.0
      - --rpc-http-port=8545
      - --rpc-http-cors-origins=*
      - --rpc-http-api=ETH,NET,WEB3,DEBUG,TXPOOL,ADMIN,MINER,TRACE,IBFT
      - --rpc-ws-enabled
      - --rpc-ws-host=0.0.0.0
      - --rpc-ws-port=8546
      - --rpc-ws-api=ETH,NET,WEB3,DEBUG,TXPOOL,ADMIN,IBFT
      - --host-allowlist=*
      - --min-gas-price=0
      - --miner-enabled
      - --miner-coinbase=0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
      - --logging=INFO
      - --p2p-host=0.0.0.0
      - --p2p-port=30303
      - --discovery-enabled=true
      - --bootnodes=enode://8c97411bc202fa3707ef550bc3c5d2953dec457b1afbafe1e97e7fed2e7b89443e490e0db96e64b6ff766a6a3f25e9c6160ae0bd13be7ea4c772f8b8b379689e@72.62.7.146:30303,enode://4e243142f9aead56a0ac87ac6b0bdc4c9674f5a58cd7d46ffd4ea7817c391f9acb5c954a8d686a8b9847243541c267d45e1bd662aaf45ba2c721588ebc2c8e51@72.62.7.146:30304,enode://64dd0fc1039736999d883c6fce986f98888267db0f0bc20a6084f4422ac64635c8ed2f74ecf8a84f3f4a9fa6f9eb96f8416685f237734fd1c7fc9aedd4dcdb71@72.62.7.146:30305,enode://d2d78350d29ebdd8d0f4711166a08afad474dee7a81498b3b332d41c7b71e5be5d926aa3788806b3de96966dcdd0315ed8eaa7858faf946b7ee23e317c0f1831@72.62.7.146:30306
    networks:
      - firstbrick-remote

networks:
  firstbrick-remote:
    driver: bridge
EOF
```

---

## Step 3: Start the Remote Node

```bash
cd ~/firstbrick-node

# Pull the Besu image
docker pull hyperledger/besu:25.10.0

# Start the node
docker-compose up -d

# Check the logs to verify it's connecting
docker logs -f firstbrick-besu-remote
```

**What to look for in logs:**
- "Connecting to bootnode" messages
- "Peer connected" messages
- "Importing blocks" or "Syncing" messages
- Block numbers increasing

Press `Ctrl+C` to exit log view.

---

## Step 4: Verify Node Connection

```bash
# Check if container is running
docker ps | grep firstbrick

# Check node info via RPC
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545

# Check peer count (should be > 0)
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
  http://localhost:8545

# Check connected peers
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"admin_peers","params":[],"id":1}' \
  http://localhost:8545 | jq

# If jq not installed:
sudo apt-get install jq
```

---

## Step 5: Monitor Synchronization

```bash
# Create a simple monitoring script
cat > ~/firstbrick-node/check-sync.sh << 'EOF'
#!/bin/bash
echo "Checking FirstBrick Node Status..."
echo "=================================="

# Get block number
BLOCK=$(curl -s -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545 | jq -r '.result')

# Convert hex to decimal
BLOCK_DEC=$((16#${BLOCK:2}))

# Get peer count
PEERS=$(curl -s -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
  http://localhost:8545 | jq -r '.result')

PEERS_DEC=$((16#${PEERS:2}))

# Get syncing status
SYNCING=$(curl -s -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
  http://localhost:8545)

echo "Current Block: $BLOCK_DEC"
echo "Connected Peers: $PEERS_DEC"
echo "Syncing Status: $SYNCING"
echo ""
echo "Expected: Peers should be 1-4 (FirstBrick bootnodes)"
EOF

chmod +x ~/firstbrick-node/check-sync.sh

# Run the monitoring script
~/firstbrick-node/check-sync.sh
```

---

## Step 6: Test RPC Connectivity

```bash
# Test from local network (from your laptop on same network)
# Replace 192.168.0.122 with your actual IP if different

# From another machine on your network:
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://192.168.0.122:8545

# Test transaction
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1","latest"],"id":1}' \
  http://localhost:8545
```

---

## Troubleshooting

### Issue: No peers connecting

```bash
# Check if P2P ports are accessible from main server
# You may need to configure port forwarding on your router
# Forward external port 30303 to 192.168.0.122:30303

# For now, the node should work as a client (outbound only)
# It will connect to FirstBrick bootnodes
```

### Issue: Cannot connect to bootnodes

```bash
# Test connectivity
telnet 72.62.7.146 30303
# or
nc -zv 72.62.7.146 30303

# If blocked, check firewall
sudo ufw status
```

### Issue: Slow synchronization

```bash
# Check logs for errors
docker logs firstbrick-besu-remote | tail -100

# Check disk space
df -h

# Check memory
free -h
```

### View detailed logs

```bash
# Follow logs in real-time
docker logs -f --tail 100 firstbrick-besu-remote

# Save logs to file
docker logs firstbrick-besu-remote > ~/besu-logs.txt
```

---

## Node Management

### Stop the node
```bash
cd ~/firstbrick-node
docker-compose down
```

### Restart the node
```bash
cd ~/firstbrick-node
docker-compose restart
```

### Update the node
```bash
cd ~/firstbrick-node
docker-compose down
docker pull hyperledger/besu:25.10.0
docker-compose up -d
```

### Remove everything (WARNING: Deletes blockchain data)
```bash
cd ~/firstbrick-node
docker-compose down -v
rm -rf data/*
```

---

## Network Configuration (Chain ID: 12786)

To use this node with MetaMask or other wallets:

**Network Name**: FirstBrick Blockchain
**RPC URL**: http://192.168.0.122:8545
**Chain ID**: 12786
**Currency Symbol**: ETH (or custom)
**Block Explorer**: https://explorer.firstbrick.cloud

---

## Success Indicators

Your node is working correctly when:

1. ✅ Container is running: `docker ps` shows firstbrick-besu-remote
2. ✅ Peers connected: Peer count is 1 or more
3. ✅ Blocks syncing: Block number is increasing
4. ✅ RPC accessible: curl commands return valid responses
5. ✅ No errors in logs: `docker logs` shows normal operation

---

## Useful Commands Summary

```bash
# Check status
docker ps
docker logs firstbrick-besu-remote --tail 50

# Check sync
~/firstbrick-node/check-sync.sh

# Restart
cd ~/firstbrick-node && docker-compose restart

# Stop
cd ~/firstbrick-node && docker-compose down

# Start
cd ~/firstbrick-node && docker-compose up -d
```

---

## Support

If you encounter issues:
1. Check logs: `docker logs firstbrick-besu-remote`
2. Verify network connectivity to 72.62.7.146:30303-30306
3. Ensure genesis.json matches the main network
4. Contact FirstBrick support with log excerpts

---

## Next Steps

Once your node is synced and running:
1. Use it as your local RPC endpoint for transactions
2. Configure applications to use http://192.168.0.122:8545
3. Monitor with the check-sync.sh script
4. Access the blockchain explorer at https://explorer.firstbrick.cloud

---

**Important Notes:**
- This node is a **non-validator node** - it syncs and participates but doesn't validate blocks
- The miner is enabled but won't produce blocks (IBFT2 only validators produce blocks)
- Keep Docker running for continuous operation
- The node will sync from block 0 on first start (may take some time)
- Expected peer count: 1-4 (connecting to FirstBrick validators)

---

Generated for FirstBrick Blockchain Platform
Server: firstbrick.cloud (72.62.7.146)
Chain ID: 12786
Consensus: IBFT2
