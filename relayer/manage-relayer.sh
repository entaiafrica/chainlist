#!/bin/bash

# Relayer Management Script
# Quick commands to manage the gasless transaction relayer

case "$1" in
    status)
        echo "=== Relayer Status ==="
        pm2 status relayer
        echo ""
        echo "Health check:"
        curl -s http://localhost:8549/health | jq . || curl -s http://localhost:8549/health
        ;;

    logs)
        pm2 logs relayer
        ;;

    restart)
        echo "Restarting relayer..."
        pm2 restart relayer
        sleep 2
        curl -s http://localhost:8549/health && echo " ✓ Relayer is healthy"
        ;;

    stop)
        echo "Stopping relayer..."
        pm2 stop relayer
        ;;

    start)
        echo "Starting relayer..."
        pm2 start relayer
        sleep 2
        curl -s http://localhost:8549/health && echo " ✓ Relayer is healthy"
        ;;

    balance)
        echo "=== Platform Wallet Balance ==="
        node -e "
        const ethers = require('ethers');
        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
        provider.getBalance('0x8da6CE40Bf4F1c5333D7316e789c755384c290d5').then(b => {
            const balance = ethers.utils.formatEther(b);
            console.log('Address: 0x8da6CE40Bf4F1c5333D7316e789c755384c290d5');
            console.log('Balance:', balance, 'ETH');
            console.log('Estimated transactions remaining:', Math.floor(parseFloat(balance) / 0.01));
        });
        "
        ;;

    test)
        echo "=== Testing Gasless Setup ==="
        cd /home/enterai/L2R/NFT-Marketplace
        node test-gasless.js
        ;;

    *)
        echo "Relayer Management Script"
        echo ""
        echo "Usage: $0 {status|logs|restart|stop|start|balance|test}"
        echo ""
        echo "Commands:"
        echo "  status   - Show relayer status and health"
        echo "  logs     - Show live logs (Ctrl+C to exit)"
        echo "  restart  - Restart the relayer"
        echo "  stop     - Stop the relayer"
        echo "  start    - Start the relayer"
        echo "  balance  - Check platform wallet ETH balance"
        echo "  test     - Run full gasless setup test"
        exit 1
        ;;
esac
