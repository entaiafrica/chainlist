# FirstBrick Blockchain Platform

## ⚠️ CRITICAL NOTICE FOR ALL AGENTS AND DEVELOPERS ⚠️

### DO NOT MODIFY OR DELETE THIS WORKING ENVIRONMENT

**This is a LIVE production environment that is currently working correctly. Any changes to the system configuration, especially nginx, Docker containers, or blockchain services, may break the system.**

### Current Working State (as of January 6, 2026)
- Besu nodes are running and communicating correctly.
- Transactions are working as expected.
- Marketplace frontend: `https://marketplace.firstbrick.cloud` (Now loading properties)
- RPC endpoint: `https://rpc.firstbrick.cloud`
- WebSocket connections: `wss://marketplace.firstbrick.cloud:3300/ws`
- Explorer (not currently active): `https://explorer.firstbrick.cloud`

### RESTORE POINTS
- **Nginx configuration backup**: `/etc/nginx/sites-available/firstbrick.cloud.backup`
- **Fixed nginx configuration (CORS fix)**: `/opt/facebrick/fixed_nginx_config` (also copied to `/etc/nginx/sites-available/firstbrick.cloud`)
- **Marketplace nginx config**: `/opt/facebrick/nginx-configs/marketplace.firstbrick.cloud`
- **Docker containers**: All blockchain nodes and services are running in Docker containers

### KNOWN ISSUES
- **React Environment Variables**: The React application is currently not loading the `REACT_APP_RPC_URL` from the `.env` file. As a temporary workaround, the RPC URL has been hardcoded in `src/components/Marketplace.js`. A permanent solution is required to properly manage environment variables.

### FIXED ISSUES (January 6, 2026)
- **Marketplace Property Loading**: Fixed a critical bug preventing properties from displaying on the marketplace page. The issue was a misconfigured CORS policy on the `rpc.firstbrick.cloud` NGINX server, which blocked requests from the marketplace frontend. The `Access-Control-Allow-Origin` header has been updated to permit requests from `https://marketplace.firstbrick.cloud`.
- **Frontend RPC Endpoint**: As a temporary but effective fix, the RPC URL was hardcoded into `src/components/Marketplace.js` to bypass a persistent issue with the `.env` file not being loaded correctly by the React build process.

### FIXED ISSUES (December 31, 2025 - 19:00 UTC)
- **CORS Error**: Fixed duplicate Access-Control-Allow-Origin header in nginx configuration for RPC endpoint
- **Marketplace Property Loading**: Improved error handling in Marketplace.js to gracefully handle contract call failures
- **WebSocket Connection**: Fixed WebSocket endpoint configuration issues
- **Blockchain Contract Calls**: Enhanced error handling for contract methods in Marketplace.js

### AGENT INSTRUCTIONS
1. **ALWAYS** note the current restore point before starting ANY task
2. **NEVER** break the working environment - this is a live system
3. **ALWAYS** test changes in a separate environment first
4. **ONLY** make changes that are necessary and have been thoroughly tested
5. **IMMEDIATELY** revert any changes that break functionality
6. **DOCUMENT** any changes made with clear rollback instructions

### Configuration Files Location
- Nginx configurations: `/etc/nginx/sites-available/` and `/opt/facebrick/nginx-configs/`
- Docker configuration: `docker-compose.yml`
- Blockchain configs: `/opt/facebrick/besu-config/`
- Smart contracts: `/opt/facebrick/contracts/`

### Services Overview
- **Blockchain nodes**: Multiple Besu nodes running in Docker
- **Frontend**: React application on port 3300
- **Relayer**: Gasless transaction service on port 8549
- **IPFS**: Kubo node for decentralized storage
- **PostgreSQL**: Database for application data

### Emergency Recovery
If the system breaks:
1. Check nginx configuration: `sudo nginx -t`
2. Restart nginx: `sudo systemctl restart nginx`
3. Check Docker containers: `docker ps`
4. Restore nginx from backup if needed: `sudo cp /etc/nginx/sites-available/firstbrick.cloud.backup /etc/nginx/sites-available/firstbrick.cloud`

### Important: DO NOT INSTALL OTTERSCAN OR SIMILAR SERVICES WITHOUT PROPER TESTING
The system was broken on December 31, 2025 when otterscan was installed, causing nginx configuration conflicts. This has been fixed by removing conflicting configurations.

---

**This environment is critical infrastructure. Any agent that modifies this environment without proper authorization and testing will cause significant disruption.**