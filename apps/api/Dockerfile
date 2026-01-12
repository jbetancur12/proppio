# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared package
COPY apps/shared ./apps/shared
RUN cd apps/shared && npm install && npm run build

# Copy and build API
COPY apps/api/package*.json ./apps/api/
WORKDIR /app/apps/api
RUN npm install

COPY apps/api .
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

# Copy package.json and install production dependencies
COPY --from=builder /app/apps/api/package*.json ./
# Copy shared package to parent directory (for file:../shared reference)
COPY --from=builder /app/apps/shared ../shared
RUN npm ci --only=production

# Copy compiled code and source files
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/src ./src
COPY --from=builder /app/apps/api/tsconfig.json ./

EXPOSE 3000

CMD ["npm", "run", "start"]
