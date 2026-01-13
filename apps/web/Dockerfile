########################################
# ----------- BUILD STAGE --------------
########################################
FROM node:20-alpine AS builder

WORKDIR /app

# 1️⃣ Copiamos manifests primero (mejor cache)
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/*/package.json ./packages/*/package.json

# 2️⃣ Instalamos dependencias (workspaces)
RUN npm ci

# 3️⃣ Copiamos el código
COPY packages ./packages
COPY apps/web ./apps/web

# 4️⃣ Variables de build (Vite)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# 5️⃣ Build completo (packages + web)
RUN npm run build --workspaces


########################################
# ----------- RUNTIME STAGE -------------
########################################
FROM nginx:alpine

# Config Nginx
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Build output
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
