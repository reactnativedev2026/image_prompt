#!/bin/bash
set -e

SERVER_IP="66.116.249.117"
SERVER_USER="root"

echo "🚀 Connecting to server $SERVER_USER@$SERVER_IP to pull and build Admin..."

ssh $SERVER_USER@$SERVER_IP << 'EOF'
  cd /var/www/prompt-backend
  git pull origin main
  cd admin
  npm install
  npm run build
  systemctl reload nginx
  echo "✅ Admin Deployed Successfully on https://prompttrending.online !"
EOF
