# Relay Service Fix - January 23, 2026

## Problem
- "Invest in Property" transactions were hanging on the marketplace
- Transactions were failing on the marketplace but wallet-to-wallet BRK transfers worked fine
- Root cause: Relay service not properly configured in nginx for marketplace.firstbrick.cloud

## Root Cause Analysis
The relayer service was running correctly on port 8549, but the nginx configuration for `marketplace.firstbrick.cloud` was missing the `/relay` endpoint proxy configuration. The `/relay` endpoint was only configured on `rpc.firstbrick.cloud`, not on the marketplace domain where the frontend was trying to send requests.

## Solution Applied
Updated `/etc/nginx/sites-available/firstbrick.cloud` to add the relay proxy configuration to the marketplace.firstbrick.cloud server block:

### Added Configuration:
1. **Relay endpoint** (`/relay`): Proxies gasless transaction requests to the relayer service
2. **Health check** (`/health`): Proxies health check requests to verify relayer status

### Configuration Details:
```nginx
# Relayer Service for gasless transactions
location /relay {
    proxy_pass http://localhost:8549/relay;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # CORS for relayer
    proxy_hide_header Access-Control-Allow-Origin;
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;

    if ($request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        return 204;
    }
}

# Relayer Health Check
location /health {
    proxy_pass http://localhost:8549/health;
    proxy_http_version 1.1;
    proxy_set_header Host $host;

    proxy_hide_header Access-Control-Allow-Origin;
    add_header Access-Control-Allow-Origin * always;
}
```

## Verification
After applying the fix:
- ✅ Direct relay access: `http://localhost:8549/health` → `{"status":"ok"}`
- ✅ Via nginx: `https://marketplace.firstbrick.cloud/health` → `{"status":"ok"}`
- ✅ Relay endpoint: `https://marketplace.firstbrick.cloud/relay` → Properly accepts POST requests
- ✅ Relayer service running: PID 1925453 on port 8549

## System Architecture
```
User Browser (marketplace.firstbrick.cloud)
    ↓
    POST /relay (meta-transaction request)
    ↓
Nginx (port 443)
    ↓
    proxy_pass to localhost:8549/relay
    ↓
Relayer Service (Node.js, port 8549)
    ↓
    Signs and submits transaction
    ↓
Blockchain RPC (Besu, port 8545)
```

## Services Status
- **Relayer Service**: Running on port 8549 (PID: 1925453)
- **Platform Wallet**: 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
- **Forwarder Contract**: 0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab
- **Marketplace**: Running on port 3300 (React dev server)
- **Nginx**: Reloaded with new configuration

## Testing
To test the relay service:
```bash
# Health check
curl https://marketplace.firstbrick.cloud/health

# Relay endpoint (should return error without valid signature)
curl -X POST https://marketplace.firstbrick.cloud/relay \
  -H "Content-Type: application/json" \
  -d '{"request":{},"signature":""}'
```

## Impact
- Marketplace transactions (buyBricks, approve, etc.) will now work correctly with gasless transactions
- Users can invest in properties without needing native currency for gas
- The relayer pays gas fees using the platform wallet

## Files Modified
1. `/etc/nginx/sites-available/firstbrick.cloud` - Added relay and health endpoints to marketplace server block
2. Reloaded nginx configuration

## Next Steps
- Monitor relayer logs for any errors: `tail -f /opt/facebrick/relayer/relayer.log`
- Verify marketplace transactions work end-to-end
- Check platform wallet gas balance periodically
