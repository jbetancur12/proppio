########################################
# ----------- BUILD STAGE --------------
########################################
FROM node:20-alpine AS builder

WORKDIR /app

# 1️⃣ Copiamos TODO el monorepo (obligatorio para workspaces)
COPY . .

# 2️⃣ Instalamos dependencias
RUN npm ci

# 3️⃣ Variables de build (Vite)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# 4️⃣ Build packages primero (dependencias de web)
RUN npm run build:packages

# 5️⃣ Build Web
RUN npm run build --workspace web


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
