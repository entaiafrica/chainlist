# FirstBrick Explorer - Quick Reference Card
**Last Updated**: January 13, 2026

---

## 🌐 Production URLs

### Public Pages:
- **Main Explorer**: https://explorer.firstbrick.cloud/
- **Properties**: https://explorer.firstbrick.cloud/properties
- **Dashboard**: https://explorer.firstbrick.cloud/dashboard
- **Blocks**: https://explorer.firstbrick.cloud/blocks
- **Transactions**: https://explorer.firstbrick.cloud/transactions
- **Tokens**: https://explorer.firstbrick.cloud/tokens

### API Endpoints:
- **Stats**: https://explorer.firstbrick.cloud/api/stats
- **Token Holders**: https://explorer.firstbrick.cloud/api/tokens/:address/holders
- **Token Transfers**: https://explorer.firstbrick.cloud/api/tokens/:address/transfers?tokenId=X
- **Address Details**: https://explorer.firstbrick.cloud/api/addresses/:address

---

## 🔗 Network Configuration

### RPC Endpoints:
- **Global**: https://rpc.firstbrick.cloud
  - Latency: ~150-200ms
  - Best for: International users

- **South Africa**: https://fb-rpc.entailabs.com
  - Latency: ~10-50ms
  - Best for: African users

### Network Details:
- **Chain ID**: 12786 (0x31f2 in hex)
- **Network Name**: FirstBrick Network
- **Native Currency**: BRK (18 decimals)
- **Block Explorer**: https://explorer.firstbrick.cloud

---

## 📋 Smart Contract Addresses

### Core Contracts:
```
BRK Token (ERC20):
0x5b1869D9A4C187F2EAa108f3062412ecf0526b24

FirstBrick Properties (ERC1155):
0x254dffcd3277c0b1660f6d42efbb754edababc2b

Treasury/Marketplace Wallet:
0x712820b679400dacbb5c9eeccfb785378fc9b9b6
```

---

## 📊 Current Stats (Property #1)

### Funding Status:
- **Property**: 272 Ss Canvas Eighty2, Noordhang
- **Total Value**: R900,000
- **Amount Raised**: R240,400
- **Funding**: 26.71%
- **Investors**: 20
- **Shares Sold**: 240,400 / 900,000

### Network Health:
- **Total Nodes**: 6
- **Connected Peers**: 5
- **Latest Block**: ~915,000+
- **Status**: ✅ Healthy

---

## 🛠️ Server Management

### Services:
```bash
# Check status
pm2 list

# View logs
pm2 logs explorer-indexer

# Restart services
pm2 restart explorer-indexer
pm2 restart facebrick-marketplace
pm2 restart facebrick-relayer

# Reload nginx
sudo systemctl reload nginx
```

### Deployment:
```bash
# Build frontend
cd /opt/facebrick/explorer
npm run build

# Deploy
sudo cp -r dist/* /var/www/explorer.firstbrick.cloud/
sudo systemctl reload nginx
```

---

## 🔍 Common Tasks

### Check Block Sync:
```bash
curl -s https://rpc.firstbrick.cloud \
  -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Check Peer Count:
```bash
curl -s https://rpc.firstbrick.cloud \
  -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}'
```

### Check Property Funding:
```bash
curl -s "https://explorer.firstbrick.cloud/api/tokens/0x254dffcd3277c0b1660f6d42efbb754edababc2b/holders?limit=1000" | jq '[.holders[] | select(.token_id == "1")] | length'
```

---

## 📁 Important Files

### Frontend:
```
/opt/facebrick/explorer/
├── src/
│   ├── components/
│   │   ├── Properties.jsx          (New - 660 lines)
│   │   ├── Dashboard.jsx           (Updated)
│   │   ├── NetworkSetup.jsx        (Updated)
│   │   └── ...
│   ├── utils/
│   │   └── propertyMetadata.js     (Updated)
│   └── App.jsx                     (Updated)
└── dist/                            (Built files)
```

### Backend:
```
/opt/facebrick/indexer/
├── src/
│   ├── api/
│   │   └── routes/
│   │       ├── stats.js            (Updated)
│   │       └── tokens.js           (Updated)
│   └── indexer/
│       └── syncManager.js
└── package.json
```

### Documentation:
```
/opt/facebrick/explorer/
├── SESSION_SUMMARY_JAN13_2026.md
├── PROGRESS_REPORT_JAN13_2026.md
└── QUICK_REFERENCE.md             (This file)
```

---

## 🎯 Key Features

### Wallet Integration:
- ✅ BRK balance displayed in header
- ✅ Property count button
- ✅ Auto-refresh every 30 seconds
- ✅ Links to address page

### Properties Page:
- ✅ Lists all properties
- ✅ Expandable details
- ✅ Real funding data
- ✅ Top 10 investors per property
- ✅ Transfer history
- ✅ Dividend tracking (R0.00)

### Data Accuracy:
- ✅ Treasury wallets excluded from funding
- ✅ Real-time blockchain data
- ✅ IPFS property metadata
- ✅ Accurate investor counts

---

## ⚠️ Important Notes

### Treasury Wallet:
The address `0x712820b679400dacbb5c9eeccfb785378fc9b9b6` holds unsold property shares and is **excluded** from funding calculations. This is correct behavior.

### Chain ID:
All nodes use Chain ID **12786**. The old Chain ID (1337) is deprecated.

### Currency:
All amounts are displayed in **Rands (R)**, not Dollars ($).

### Dividends:
Currently showing **R0.00** - this is correct as no dividends have been distributed yet (property still funding).

---

## 🐛 Troubleshooting

### Frontend not updating:
```bash
# Clear browser cache or hard refresh
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### API errors:
```bash
# Check indexer logs
pm2 logs explorer-indexer --lines 50

# Restart if needed
pm2 restart explorer-indexer
```

### Balance not showing:
- Ensure MetaMask is connected
- Check correct network (Chain ID 12786)
- Wait 30 seconds for auto-refresh

---

## 📞 Support

### For Technical Issues:
- Check PM2 logs: `pm2 logs explorer-indexer`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check database: `psql -U explorer -d explorer`

### For Data Issues:
- Verify blockchain sync: Check latest block number
- Check API responses: Use curl commands above
- Verify contract addresses: Ensure using correct addresses

---

## 🎉 Latest Updates (Jan 13, 2026)

✅ Chain ID fixed to 12786
✅ SA RPC node added
✅ BRK balance in header
✅ Property count button
✅ Properties page created
✅ Treasury wallet filtering
✅ Real blockchain data
✅ Currency changed to Rands

---

**Quick Access**: Bookmark this file for fast reference!

*FirstBrick Explorer - Your gateway to blockchain property investment*
