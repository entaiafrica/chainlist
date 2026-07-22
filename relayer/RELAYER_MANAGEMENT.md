# Relayer Management Guide

The gasless transaction relayer is now running permanently with PM2 process manager.

## Current Status

The relayer is running on **port 8549** and will:
- ✓ Automatically restart if it crashes
- ✓ Keep running after you close the terminal
- ✓ Restart automatically after server reboot
- ✓ Pay gas fees from platform wallet: `0x8da6CE40Bf4F1c5333D7316e789c755384c290d5`

## Management Commands

### View Status
```bash
pm2 status relayer
```

### View Logs
```bash
# Live logs (Ctrl+C to exit)
pm2 logs relayer

# Last 50 lines
pm2 logs relayer --lines 50 --nostream
```

### Restart Relayer
```bash
pm2 restart relayer
```

### Stop Relayer
```bash
pm2 stop relayer
```

### Start Relayer (if stopped)
```bash
pm2 start relayer
```

### Delete Relayer from PM2
```bash
pm2 delete relayer
```

## Check Health

```bash
curl http://localhost:8549/health
```

Should return: `{"status":"ok"}`

## Platform Wallet Balance

Check how much ETH the platform wallet has for gas fees:

```bash
cd /home/enterai/L2R/NFT-Marketplace
node -e "
const ethers = require('ethers');
const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
provider.getBalance('0x8da6CE40Bf4F1c5333D7316e789c755384c290d5').then(b => {
  console.log('Platform Wallet Balance:', ethers.utils.formatEther(b), 'ETH');
});
"
```

## Troubleshooting

### Relayer not responding?
```bash
# Check if it's running
pm2 status relayer

# Check logs for errors
pm2 logs relayer --err --lines 50

# Restart it
pm2 restart relayer
```

### Port already in use?
```bash
# Find what's using port 8549
lsof -i :8549

# Stop the relayer first, then restart
pm2 restart relayer
```

### Platform wallet running low on ETH?
When balance drops below 1 ETH, you need to send more ETH to:
```
0x8da6CE40Bf4F1c5333D7316e789c755384c290d5
```

## Configuration Files

- **Environment**: `/home/enterai/L2R/NFT-Marketplace/relayer/.env`
- **Server**: `/home/enterai/L2R/NFT-Marketplace/relayer/server.js`
- **Logs**: `/root/.pm2/logs/relayer-*.log`

## Security Notes

⚠️ The platform wallet private key is stored in `.env` file.
⚠️ Keep this file secure and never commit it to git!
⚠️ This wallet pays for ALL user transactions.

## Cost Monitoring

Typical gas costs per transaction: ~0.002-0.01 ETH
Current balance: 14.99 ETH
Estimated capacity: 1,500-7,500 transactions

Monitor usage regularly to avoid service disruption!
