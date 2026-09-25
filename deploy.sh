#!/usr/bin/env bash
# ==============================================================================
# Prompt Trending - One-Click Production Deployment Script
# Run on server: bash deploy.sh
# ==============================================================================

set -e

echo "=========================================================="
echo "🚀 STARTING PRODUCTION DEPLOYMENT: $(date)"
echo "=========================================================="

PROJECT_DIR="/var/www/prompt-backend"

if [ -d "$PROJECT_DIR" ]; then
  cd "$PROJECT_DIR"
else
  echo "⚠️ Project directory $PROJECT_DIR not found, using current directory."
fi

# Step 1: Git Pull Latest Changes
echo ""
echo "📥 1/5: Pulling latest changes from GitHub (origin/main)..."
git fetch origin main
git reset --hard origin/main

# Step 2: Backend Dependencies & Restart
echo ""
echo "🐍 2/5: Updating Backend & Dependencies..."
if [ -d "backend/venv" ]; then
  source backend/venv/bin/activate
  pip install --no-cache-dir -r backend/requirements.txt
elif [ -d "venv" ]; then
  source venv/bin/activate
  pip install --no-cache-dir -r backend/requirements.txt
fi

echo "🔄 3/5: Restarting Backend Service (prompt-backend)..."
sudo systemctl restart prompt-backend || true

# Step 3: Admin Build & Deploy
echo ""
echo "📦 4/5: Building & Deploying Admin Panel..."
if [ -d "admin" ]; then
  cd admin
  npm install
  npm run build
  echo "🚀 Copying Admin build to /var/www/html (Nginx web root)..."
  mkdir -p /var/www/html
  cp -r dist/* /var/www/html/
  cd ..
fi

# Step 4: Reload Nginx
echo ""
echo "🌐 5/5: Testing & Reloading Nginx Web Server..."
sudo nginx -t && sudo systemctl reload nginx

# Step 5: Verification & Status
echo ""
echo "=========================================================="
echo "🔍 SERVICE STATUS CHECK:"
echo "----------------------------------------------------------"
sudo systemctl is-active --quiet prompt-backend && echo "✅ Backend Service (prompt-backend) : RUNNING" || echo "❌ Backend Service : NOT RUNNING"
sudo systemctl is-active --quiet nginx && echo "✅ Web Server (Nginx)              : RUNNING" || echo "❌ Web Server : NOT RUNNING"
echo "=========================================================="
echo "🎉 DEPLOYMENT COMPLETE! Live at: https://prompttrending.online"
echo "=========================================================="
