# FirstBrick Remote Node - Peer Connectivity Solutions

**Problem**: Remote node at 192.168.0.122 is behind NAT and cannot receive incoming connections from FirstBrick validators at 72.62.7.146.

**Status**:
- ✅ Remote node is running and healthy
- ✅ RPC endpoints working (8545, 8546)
- ✅ Remote node can reach FirstBrick bootnodes
- ⏳ Peer connections pending (NAT issue)

---

## Solution 1: Port Forwarding (Recommended)

This is the simplest and most standard solution.

### On Remote Network (192.168.0.122 side)

**Steps for the user to configure their router:**

1. **Access Router Admin Panel**
   - Usually at: http://192.168.0.1 or http://192.168.0.254
   - Login with admin credentials

2. **Navigate to Port Forwarding**
   - Look for: "Port Forwarding", "NAT", "Virtual Servers", or "Applications"

3. **Create Port Forwarding Rule**
   ```
   Service Name: FirstBrick P2P
   External Port: 30303
   Internal IP: 192.168.0.122
   Internal Port: 30303
   Protocol: TCP and UDP (or create two rules)
   ```

4. **Save and Apply**

5. **Restart Remote Node**
   ```bash
   cd ~/firstbrick-node
   docker-compose restart
   ```

6. **Verify Port is Open**
   ```bash
   # From an external server, test connectivity
   # (Replace YOUR_PUBLIC_IP with actual public IP)
   nc -zv YOUR_PUBLIC_IP 30303
   ```

### On FirstBrick Server (72.62.7.146 side)

Once port forwarding is configured, add the remote node as a static peer:

**Get Remote Node's Public IP and Enode:**
```bash
# Remote side should provide:
# 1. Their public IP address
# 2. Their enode ID from: ~/firstbrick-node/node-commands.sh enode
```

**Add as Static Peer via RPC:**
```bash
# On FirstBrick server
REMOTE_PUBLIC_IP="YOUR_REMOTE_PUBLIC_IP"
REMOTE_ENODE_ID="YOUR_REMOTE_ENODE_ID"

curl -X POST -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"admin_addPeer\",\"params\":[\"enode://${REMOTE_ENODE_ID}@${REMOTE_PUBLIC_IP}:30303\"],\"id\":1}" \
  http://localhost:8545
```

---

## Solution 2: SSH Reverse Tunnel (If Port Forwarding Not Possible)

If the remote user cannot configure port forwarding, use an SSH tunnel.

### On Remote Server (192.168.0.122)

**Create SSH Tunnel to FirstBrick Server:**
```bash
# Forward remote port 30303 to FirstBrick server
ssh -R 30307:localhost:30303 root@72.62.7.146 -N -f

# Or create a persistent tunnel with autossh
sudo apt-get install autossh
autossh -M 0 -f -N -R 30307:localhost:30303 root@72.62.7.146 \
  -o "ServerAliveInterval 30" \
  -o "ServerAliveCountMax 3"
```

This creates a tunnel where:
- FirstBrick server port 30307 → Remote node port 30303

### On FirstBrick Server

**Expose the tunneled port and add as peer:**
```bash
# The remote node is now accessible at localhost:30307
# Get the remote node's enode ID (they need to send it)

REMOTE_ENODE_ID="<enode_id_from_remote>"

# Add as peer using localhost:30307
curl -X POST -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"admin_addPeer\",\"params\":[\"enode://${REMOTE_ENODE_ID}@127.0.0.1:30307\"],\"id\":1}" \
  http://localhost:8545
```

---

## Solution 3: Static Nodes Configuration (Persistent)

Make the peer connection permanent by configuring static-nodes.json.

### On FirstBrick Server

**Method A: Update static-nodes.json and restart nodes**
```bash
# Backup current configuration
cp /opt/facebrick/besu-config/static-nodes.json \
   /opt/facebrick/besu-config/static-nodes.json.backup

# Edit static-nodes.json to add remote node
# (After port forwarding is set up)
nano /opt/facebrick/besu-config/static-nodes.json
```

Add the remote node enode:
```json
[
  "enode://8c97411bc202fa3707ef550bc3c5d2953dec457b1afbafe1e97e7fed2e7b89443e490e0db96e64b6ff766a6a3f25e9c6160ae0bd13be7ea4c772f8b8b379689e@facebrick-besu-node1:30303",
  "enode://4e243142f9aead56a0ac87ac6b0bdc4c9674f5a58cd7d46ffd4ea7817c391f9acb5c954a8d686a8b9847243541c267d45e1bd662aaf45ba2c721588ebc2c8e51@facebrick-besu-node2:30303",
  "enode://64dd0fc1039736999d883c6fce986f98888267db0f0bc20a6084f4422ac64635c8ed2f74ecf8a84f3f4a9fa6f9eb96f8416685f237734fd1c7fc9aedd4dcdb71@facebrick-besu-node3:30303",
  "enode://d2d78350d29ebdd8d0f4711166a08afad474dee7a81498b3b332d41c7b71e5be5d926aa3788806b3de96966dcdd0315ed8eaa7858faf946b7ee23e317c0f1831@facebrick-besu-node4:30303",
  "enode://<REMOTE_ENODE_ID>@<REMOTE_PUBLIC_IP>:30303"
]
```

**Copy to all node data directories:**
```bash
# Copy to each node
cp /opt/facebrick/besu-config/static-nodes.json /opt/facebrick/data/node1/static-nodes.json
cp /opt/facebrick/besu-config/static-nodes.json /opt/facebrick/data/node2/static-nodes.json
cp /opt/facebrick/besu-config/static-nodes.json /opt/facebrick/data/node3/static-nodes.json
cp /opt/facebrick/besu-config/static-nodes.json /opt/facebrick/data/node4/static-nodes.json

# Restart all nodes
cd /opt/facebrick
docker-compose restart
```

**Method B: Use RPC to add peer without restart**
```bash
# Add peer dynamically (connection lost on restart)
REMOTE_ENODE="enode://<ENODE_ID>@<PUBLIC_IP>:30303"

curl -X POST -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"admin_addPeer\",\"params\":[\"${REMOTE_ENODE}\"],\"id\":1}" \
  http://localhost:8545
```

---

## Solution 4: VPN Connection (Most Secure)

Set up a VPN between the networks for secure, direct connectivity.

### Option A: WireGuard (Recommended)

**On FirstBrick Server:**
```bash
sudo apt-get install wireguard

# Generate keys
wg genkey | tee /etc/wireguard/privatekey | wg pubkey > /etc/wireguard/publickey

# Create config: /etc/wireguard/wg0.conf
[Interface]
Address = 10.0.0.1/24
PrivateKey = <server_private_key>
ListenPort = 51820

[Peer]
PublicKey = <remote_public_key>
AllowedIPs = 10.0.0.2/32

# Start WireGuard
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0
```

**On Remote Server:**
```bash
sudo apt-get install wireguard

# Generate keys
wg genkey | tee /etc/wireguard/privatekey | wg pubkey > /etc/wireguard/publickey

# Create config: /etc/wireguard/wg0.conf
[Interface]
Address = 10.0.0.2/24
PrivateKey = <remote_private_key>

[Peer]
PublicKey = <server_public_key>
Endpoint = 72.62.7.146:51820
AllowedIPs = 10.0.0.1/32
PersistentKeepalive = 25

# Start WireGuard
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0
```

**Configure Besu to use VPN IP:**
```bash
# On remote node, use VPN IP in bootnode config
# Edit docker-compose.yml:
--bootnodes=enode://<node1_id>@10.0.0.1:30303,...
```

### Option B: OpenVPN

Similar setup but more complex. WireGuard is recommended for simplicity.

---

## Solution 5: Cloud Relay Node (Advanced)

Deploy a cloud VM with public IP as a relay/bootnode.

1. Deploy Besu node on cloud VM (e.g., DigitalOcean, AWS, GCP)
2. Configure it to connect to FirstBrick validators
3. Configure remote node to connect to cloud relay
4. Cloud relay bridges the connection

---

## Quick Test Commands

### Check Remote Node Can Reach FirstBrick

**On Remote Server (192.168.0.122):**
```bash
# Test connectivity to all bootnodes
for port in 30303 30304 30305 30306; do
  echo "Testing 72.62.7.146:$port..."
  nc -zv 72.62.7.146 $port
  echo "---"
done

# Check if node is trying to connect
docker logs firstbrick-besu-remote 2>&1 | grep -i "peer\|connect"
```

### Check FirstBrick Can Reach Remote Node (After Port Forwarding)

**On FirstBrick Server:**
```bash
# Replace with remote's public IP
REMOTE_PUBLIC_IP="x.x.x.x"

# Test TCP connection
nc -zv $REMOTE_PUBLIC_IP 30303

# Test UDP connection (P2P discovery)
nc -zuv $REMOTE_PUBLIC_IP 30303
```

### Verify Peer Connection

**On Either Side:**
```bash
# Check peer count
curl -s -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
  http://localhost:8545

# List connected peers
curl -s -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"admin_peers","params":[],"id":1}' \
  http://localhost:8545 | jq
```

---

## Troubleshooting

### Issue: "Connection refused" from FirstBrick to Remote

**Cause**: Port forwarding not configured or router firewall blocking

**Solution**:
1. Verify port forwarding rule is active
2. Check router firewall allows incoming on 30303
3. Verify remote node is listening:
   ```bash
   docker exec firstbrick-besu-remote netstat -tuln | grep 30303
   ```

### Issue: Remote node logs show "Connection timeout"

**Cause**: FirstBrick firewall blocking or nodes not advertising correct IP

**Solution**:
```bash
# On FirstBrick server, verify ports are open
sudo ufw status | grep 3030

# Check nodes are listening
netstat -tuln | grep 3030
```

### Issue: Peers connect then disconnect immediately

**Cause**: Genesis mismatch or network ID mismatch

**Solution**:
1. Verify genesis.json is identical on both sides
2. Check chain ID matches (12786)
3. Compare genesis hash:
   ```bash
   # Should return same hash on both sides
   curl -s -X POST -H "Content-Type: application/json" \
     --data '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["0x0",false],"id":1}' \
     http://localhost:8545 | jq -r '.result.hash'
   ```

### Issue: "Invalid enode URL" error

**Cause**: Incorrect enode format

**Solution**:
Enode format must be:
```
enode://[64-char-hex-node-id]@[ip-or-hostname]:[port]
```

Example:
```
enode://8c97411bc202fa3707ef550bc3c5d2953dec457b1afbafe1e97e7fed2e7b89443e490e0db96e64b6ff766a6a3f25e9c6160ae0bd13be7ea4c772f8b8b379689e@72.62.7.146:30303
```

---

## Recommended Approach

**For Production: Solution 1 (Port Forwarding) + Solution 3 (Static Nodes)**

1. User configures port forwarding on their router
2. Admin adds remote node to static-nodes.json on FirstBrick validators
3. Connection is persistent and survives restarts

**For Development/Testing: Solution 2 (SSH Tunnel)**

1. Quick to set up
2. No router configuration needed
3. Secured by SSH

**For High Security: Solution 4 (VPN)**

1. Encrypted tunnel
2. Works like direct connection
3. Best for production with security requirements

---

## Next Steps

1. **Choose Solution** based on your requirements and constraints
2. **Implement Solution** following the steps above
3. **Verify Connection** using test commands
4. **Monitor Sync** - Remote node should start syncing once peers connect

---

## Support Information

**Remote Node Details:**
- Local IP: 192.168.0.122
- RPC Port: 8545
- WebSocket Port: 8546
- P2P Port: 30303
- Chain ID: 12786

**FirstBrick Server Details:**
- Public IP: 72.62.7.146
- Domain: firstbrick.cloud
- P2P Ports: 30303-30306
- RPC: https://rpc.firstbrick.cloud
- Explorer: https://explorer.firstbrick.cloud

**Required Information from Remote User:**
1. Public IP address (from: `curl ifconfig.me`)
2. Enode ID (from: `~/firstbrick-node/node-commands.sh enode`)
3. Port forwarding status
4. Preferred connectivity solution

---

**Once connectivity is established, the remote node will:**
- Sync blockchain from FirstBrick validators
- Provide local RPC access for development
- Participate in network consensus (non-validator)
- Relay transactions to validators

**Estimated sync time**: Depends on blockchain size, typically 10-30 minutes for initial sync.
