#!/usr/bin/env bash
# ==============================================================================
# Prompt Trending - Remote Deployment Trigger Script
# Run from local Git Bash / Terminal: bash deploy-admin.sh
# ==============================================================================

set -e

SERVER_IP="66.116.249.117"
SERVER_USER="root"

echo "🚀 Connecting to server $SERVER_USER@$SERVER_IP for deployment..."

ssh $SERVER_USER@$SERVER_IP << 'EOF'
  cd /var/www/prompt-backend
  bash deploy.sh
EOF
