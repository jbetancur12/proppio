# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build shared package first
COPY apps/shared ./apps/shared
RUN cd apps/shared && npm install && npm run build

# Build web app
COPY apps/web/package*.json ./apps/web/
WORKDIR /app/apps/web
RUN npm install

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY apps/web .
RUN npm run build

# Production Stage - Nginx
FROM nginx:alpine

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY --from=builder /app/apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
