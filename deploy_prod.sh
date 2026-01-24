#!/bin/bash
set -e

BRANCH=${1:-main}

# Zero/Minimal Downtime Deployment Script
# Usage: ./deploy_prod.sh

echo "🚀 Starting Deployment for branch $BRANCH ..."

# 1. Pull latest changes
echo "📥 Pulling latest code..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# 2. Build images WITHOUT stopping containers (minimizes downtime)
# Build one service at a time to save RAM on small VPS
export COMPOSE_PARALLEL_LIMIT=1
echo "🏗️  Building images (Background)..."
# Use dotenvx to decrypt .env vars into the shell environment for Docker substitution
npx dotenvx run -f .env --quiet -- docker compose -f docker-compose.prod.yml build

# 3. Apply changes (Restart containers)
# Only initiates restart after a successful build.
# Downtime is reduced to just the container restart time (seconds).
echo "🔄 Recreating containers..."
npx dotenvx run -f .env --quiet -- docker compose -f docker-compose.prod.yml up -d

# 4. Optional: Run Migrations
# Only run if you suspect schema changes, or uncomment to always run.
echo "🗄️  Checking for database migrations..."
# docker compose -f docker-compose.prod.yml exec -T api npm run migration:up

# 5. Cleanup
echo "🧹 Cleaning up unused images..."
docker image prune -f

echo "✅ Deployment Complete!"