#!/bin/bash
set -e


# Zero/Minimal Downtime Deployment Script
# Usage: ./deploy_prod.sh

echo "🚀 Starting Deployment..."

# 1. Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# 2. Build images WITHOUT stopping containers (minimizes downtime)
# Build one service at a time to save RAM on small VPS
export COMPOSE_PARALLEL_LIMIT=1
echo "🏗️  Building images (Background)..."
docker compose --env-file .env.production -f docker-compose.prod.yml build

# 3. Apply changes (Restart containers)
# Only initiates restart after a successful build.
# Downtime is reduced to just the container restart time (seconds).
echo "🔄 Recreating containers..."
docker compose --env-file .env.production -f docker-compose.prod.yml up -d

# 4. Optional: Run Migrations
# Only run if you suspect schema changes, or uncomment to always run.
echo "🗄️  Checking for database migrations..."
# docker compose -f docker-compose.prod.yml exec -T api npm run migration:up

# 5. Cleanup
echo "🧹 Cleaning up unused images..."
docker image prune -f

echo "✅ Deployment Complete!"
