# Stage 1: Pruner
FROM node:20-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=web --docker

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy lockfile and package.json's first
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Copy source code
COPY --from=pruner /app/out/full/ .

# Build arguments
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build Web and its dependencies using Turbo
RUN npx turbo run build --filter=web

# Stage 3: Runner
FROM nginx:alpine

# Config Nginx
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Build output
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
