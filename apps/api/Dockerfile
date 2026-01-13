########################################
# ----------- BUILD STAGE --------------
########################################
FROM node:20-alpine AS builder

WORKDIR /app

# 1️⃣ Copiamos manifests primero (cache)
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/*/package.json ./packages/*/package.json

# 2️⃣ Instalamos dependencias (workspaces)
RUN npm ci

# 3️⃣ Copiamos el código
COPY packages ./packages
COPY apps/api ./apps/api

# 4️⃣ Build completo respetando dependencias
# (contracts / schemas / api en el orden correcto)
RUN npm run build --workspaces


########################################
# ----------- RUNTIME STAGE -------------
########################################
FROM node:20-alpine

# Puppeteer deps
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# 5️⃣ Copiamos SOLO lo necesario
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

WORKDIR /app/apps/api

EXPOSE 3000

# 6️⃣ Ejecutamos con dotenvx (sin instalar global)
CMD ["npx", "dotenvx", "run", "--", "node", "dist/main.js"]
