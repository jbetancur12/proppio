########################################
# ----------- BUILD STAGE --------------
########################################
FROM node:20-alpine AS builder

WORKDIR /app

# 1️⃣ Copiamos TODO el monorepo (clave para workspaces)
COPY . .

# 2️⃣ Instalamos dependencias (usa package-lock del root)
RUN npm ci

# 3️⃣ Build packages primero (dependencias de las apps)
RUN npm run build --workspace @proppio/types
RUN npm run build --workspace @proppio/schemas

# 3.5️⃣ Verificar que los .d.ts se generaron
RUN ls -la /app/packages/schemas/dist/ && \
    ls -la /app/packages/types/dist/ && \
    test -f /app/packages/schemas/dist/index.d.ts && \
    test -f /app/packages/types/dist/index.d.ts

# 4️⃣ Build apps
RUN npm run build --workspace api


########################################
# ----------- RUNTIME STAGE -------------
########################################
FROM ghcr.io/puppeteer/puppeteer:22.8.2

ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# 4️⃣ Copiamos SOLO lo necesario para runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

WORKDIR /app/apps/api

EXPOSE 3000

# 5️⃣ Arranque limpio
CMD ["node", "dist/main.js"]
