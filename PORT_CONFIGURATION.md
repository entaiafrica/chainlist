# Port Configuration - Facebrick System

This document lists all ports used in the Facebrick ecosystem for reference.

## Frontend Services

- **3300** - Marketplace React Development Server (marketplace.firstbrick.cloud proxied)
  - Development server for the main marketplace frontend
  - Managed by PM2 as `facebrick-marketplace`
  - Accessed via nginx proxy from marketplace.firstbrick.cloud

- **3500** - Production Build Server (if needed)
  - Static file server for production builds
  - Not typically used in development

## Backend Services

- **8545** - Besu RPC Node (Primary)
  - Ethereum JSON-RPC endpoint on Docker container (172.18.0.4)
  - Proxied through nginx at rpc.entailabs.com/
  - Used for blockchain read/write operations

- **8546** - Besu WebSocket
  - WebSocket endpoint for real-time blockchain events
  - Running on Besu validator node

- **8549** - Gasless Transaction Relayer
  - Meta-transaction relayer service
  - Proxied at marketplace.firstbrick.cloud/relay
  - Managed by PM2 as `facebrick-relayer`

## IPFS Services

- **5001** - IPFS API
  - Local IPFS node API endpoint
  - Used for file uploads (metadata, images, profiles)
  - Proxied at rpc.entailabs.com/ipfs-api/

- **8090** - IPFS Gateway
  - HTTP gateway for retrieving IPFS content
  - Proxied at rpc.entailabs.com/ipfs/

## Explorer & Indexer

- **3015** - Block Explorer
  - Blockchain explorer frontend
  - Proxied at rpc.entailabs.com/explorer

- **3010** - Indexer Service (assumed)
  - Blockchain indexer for the explorer
  - Managed by PM2 as `explorer-indexer`

## Game Services

- **4000** - BrickX Game Server
  - Game backend/frontend
  - Managed by PM2 as `brickx-game`

## Standard Ports

- **80** - HTTP (redirects to HTTPS)
- **443** - HTTPS (nginx handling SSL for all domains)
- **30303** - Besu P2P Discovery
  - Peer-to-peer network communication between Besu nodes

## Environment Variables

The React app uses these environment variables to connect to services:

```bash
REACT_APP_RPC_URL=https://rpc.firstbrick.cloud    # Blockchain RPC endpoint (with contracts)
# Alternative: https://fb-rpc.entailabs.com
REACT_APP_CHAIN_ID=12786                          # BrickChain ID
REACT_APP_RELAYER_URL=/relay                      # Gasless transaction relay
REACT_APP_IPFS_GATEWAY=/ipfs/                     # IPFS gateway (relative to nginx)
```

## PM2 Process Management

View all services:
```bash
pm2 list
```

Restart marketplace (picks up new .env variables):
```bash
pm2 restart facebrick-marketplace
```

View logs:
```bash
pm2 logs facebrick-marketplace
```

## Important Notes

1. **Port 3300** is the correct port for marketplace development
2. Nginx proxies external traffic from marketplace.firstbrick.cloud to localhost:3300
3. RPC calls should use `https://rpc.entailabs.com` not relative paths like `/`
4. WebSocket connections at `wss://marketplace.firstbrick.cloud:3300/ws` are for hot-reload (optional)
