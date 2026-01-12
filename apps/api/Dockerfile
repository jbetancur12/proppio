# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json turbo.json ./

# Copy all workspaces
COPY packages ./packages
COPY apps ./apps

# Install dependencies (links workpaces)
RUN npm install

# Build API (using Turbo to build dependencies like @proppio/types)
RUN npx turbo run build --filter=api...

# Production Stage
FROM node:20-alpine

# Install Chromium and dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy node_modules from builder (includes symlinked workspaces)
COPY --from=builder /app/node_modules ./node_modules
# Copy source files (need to keep structure for symlinks to work)
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3000

# Set working directory to API to run scripts correctly
WORKDIR /app/apps/api

# Start the application
CMD ["npm", "run", "start"]
