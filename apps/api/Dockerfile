# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files and workspace packages
COPY package*.json ./
COPY packages ./packages
COPY apps/shared ./apps/shared
COPY apps/api/package.json ./apps/api/package.json
RUN npm install

# Build shared types package
RUN cd packages/types && npm run build

# Build shared package
RUN cd apps/shared && npm run build

# Copy and build API
COPY apps/api ./apps/api
WORKDIR /app/apps/api
RUN npm run build

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

# Tell Puppeteer to skip downloading Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy root package.json
COPY package*.json ./

# Copy node_modules from builder (already has workspaces installed)
COPY --from=builder /app/node_modules ./node_modules

# Prune dev dependencies
RUN npm prune --production

# Copy compiled code and source files
# Copy compiled code and source files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/src ./apps/api/src
COPY --from=builder /app/apps/api/tsconfig.json ./apps/api/
COPY --from=builder /app/apps/api/package.json ./apps/api/

EXPOSE 3000

WORKDIR /app/apps/api
RUN npm install -g @dotenvx/dotenvx
CMD ["npm", "run", "start"]
