# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json turbo.json ./

# Accept build argument BEFORE copying source files
ARG VITE_API_URL
# Set as environment variable for Vite to read during build
ENV VITE_API_URL=$VITE_API_URL

# Debug: Print the variable to verify it's set
RUN echo "Building with VITE_API_URL=$VITE_API_URL"

# Copy all workspaces
COPY packages ./packages
COPY apps ./apps

# Install dependencies
RUN npm install

# Build Web (using Turbo)
RUN npx turbo run build --filter=web...

# Production Stage - Nginx
FROM nginx:alpine

# Copy built assets from the correct location
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY --from=builder /app/apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
