server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name rpc.entailabs.com;

    # Let's Encrypt SSL Certificate
    ssl_certificate /etc/letsencrypt/live/rpc.entailabs.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rpc.entailabs.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Logging
    access_log /var/log/nginx/rpc-entailabs-access.log;
    error_log /var/log/nginx/rpc-entailabs-error.log;

    # IPFS Gateway Proxy (for profile data and images)
    location /ipfs/ {
        proxy_pass http://127.0.0.1:8090/ipfs/;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CRITICAL: Hide ALL CORS headers from upstream to prevent duplicates
        proxy_hide_header Access-Control-Allow-Origin;
        proxy_hide_header Access-Control-Allow-Methods;
        proxy_hide_header Access-Control-Allow-Headers;
        proxy_hide_header Access-Control-Expose-Headers;
        proxy_hide_header Access-Control-Request-Method;

        # Add clean CORS headers (only once)
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Range, User-Agent, X-Requested-With" always;
        add_header Access-Control-Expose-Headers "Content-Length, Content-Range, X-Ipfs-Path, X-Ipfs-Roots" always;

        # Handle preflight requests
        if ($request_method = OPTIONS) {
            return 204;
        }

        # Cache IPFS content
        proxy_cache_valid 200 7d;
        expires 7d;
    }

    # IPFS API Proxy (for file uploads - profile persistence)
    location /ipfs-api/ {
        proxy_pass http://127.0.0.1:5001/api/v0/;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CRITICAL: Hide any upstream CORS headers to prevent duplicates
        proxy_hide_header Access-Control-Allow-Origin;
        proxy_hide_header Access-Control-Allow-Methods;
        proxy_hide_header Access-Control-Allow-Headers;

        # Add clean CORS headers for API (only once)
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;

        # Handle preflight requests
        if ($request_method = OPTIONS) {
            return 204;
        }

        # Increase timeouts and size limits for uploads
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        client_max_body_size 100M;
    }

    # Block Explorer Proxy
    location /explorer {
        proxy_pass http://127.0.0.1:3015;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Remove /explorer prefix when proxying
        rewrite ^/explorer/(.*)$ /$1 break;
        rewrite ^/explorer$ / break;
    }

    # NFT Metadata Endpoints
    location ~ ^/metadata/(.+)$ {
        alias /var/www/metadata-serve/$1;
        default_type application/json;

        # CORS headers for metadata
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type" always;
        add_header Cache-Control "public, must-revalidate" always;
        
        # Handle OPTIONS requests
        if ($request_method = OPTIONS) {
            return 204;
        }
        
        expires 1h;
    }

    # RPC Endpoint (root path) - CORS for dapp interaction
    location / {
        proxy_pass http://172.18.0.4:8545;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Hide upstream CORS headers to prevent duplicates
        proxy_hide_header Access-Control-Allow-Origin;
        proxy_hide_header Access-Control-Allow-Methods;
        proxy_hide_header Access-Control-Allow-Headers;

        # Add clean CORS headers
        add_header Access-Control-Allow-Origin "https://marketplace.firstbrick.cloud" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;

        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://marketplace.firstbrick.cloud';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name rpc.entailabs.com;

    return 301 https://$server_name$request_uri;
}
