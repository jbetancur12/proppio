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

WORKDIR /app

COPY --from=builder /app/apps/api/package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/src ./src
COPY --from=builder /app/apps/api/tsconfig.json ./
COPY --from=builder /app/apps/shared ./apps/shared

EXPOSE 3000

CMD ["node", "dist/index.js"]
