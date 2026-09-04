#!/bin/bash
set -e

SERVER_IP="66.116.249.117"
SERVER_USER="root"
REMOTE_PATH="/var/www/html"

echo "🚀 Starting Admin Panel Build & Deploy..."

# 1. Build Admin
echo "📦 Building Admin Panel..."
cd admin
npm run build
cd ..

# 2. Upload to Server
echo "📤 Uploading dist files to $SERVER_USER@$SERVER_IP:$REMOTE_PATH ..."
scp -r admin/dist/* $SERVER_USER@$SERVER_IP:$REMOTE_PATH/

echo "✅ Admin Panel Successfully Deployed to https://prompttrending.online !"
