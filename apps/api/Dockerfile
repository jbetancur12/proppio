FROM node:20-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=api --docker

# Stage 2: Builder - Builds the app with pruned context
# Using slim (Debian) for glibc compatibility (bcrypt)
FROM node:20-slim AS builder
WORKDIR /app

# Copy lockfile and package.json's first to cache dependencies
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Copy the source code
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/full/turbo.json ./turbo.json

# Build API and its dependencies (schemas, types) using Turbo
# Run build for everything in the pruned context
RUN npx turbo run build

# Stage 3: Runner - Production image
FROM ghcr.io/puppeteer/puppeteer:22.8.2

ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# Switch to root to copy files and fix permissions
USER root

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Fix permissions for pptruser
RUN chown -R pptruser:pptruser /app

# Switch back to non-root user
USER pptruser

WORKDIR /app/apps/api
EXPOSE 3000

CMD ["node", "dist/index.js"]
