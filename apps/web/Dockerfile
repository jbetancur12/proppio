# Stage 1: Pruner
FROM node:20-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=web --docker

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lockfile and package.json's first
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Copy source code
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/full/turbo.json ./turbo.json

# Build Web and its dependencies using Turbo
# Run build for everything in the pruned context (which is just web + deps)
RUN npx turbo run build

# Stage 3: Runner
FROM nginx:alpine

# Config Nginx
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Build output
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
