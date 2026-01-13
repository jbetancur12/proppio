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
RUN npm run build --workspace @proppio/types
RUN npm run build --workspace @proppio/schemas

# 4.5️⃣ Verificar que los .d.ts se generaron
RUN ls -la /app/packages/schemas/dist/ && \
    ls -la /app/packages/types/dist/ && \
    test -f /app/packages/schemas/dist/index.d.ts && \
    test -f /app/packages/types/dist/index.d.ts

# 5️⃣ Build web
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
