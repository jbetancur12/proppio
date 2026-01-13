# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files and install dependencies (includes workspaces)
COPY package*.json ./
COPY packages ./packages
# Shared apps no longer exist
# COPY apps/shared ./apps/shared (removed)
COPY apps/web/package.json ./apps/web/package.json

# Instalar dependencias para todo el workspace
RUN npm install

# Build @proppio/types
RUN cd packages/types && npm run build

# Build @proppio/schemas
RUN cd packages/schemas && npm run build

# Build web app
COPY apps/web ./apps/web
WORKDIR /app/apps/web

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production Stage - Nginx
FROM nginx:alpine

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY --from=builder /app/apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
