# ============================================
# Frontend Dockerfile
# Multi-stage: Build Vite → Serve via Nginx
# ============================================

# Stage 1: Build React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Copy frontend source
COPY frontend ./frontend

# Install all deps
RUN npm ci

# Build Vite production bundle
RUN cd frontend && npx vite build

# Stage 2: Serve with nginx
FROM nginx:1.25-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY nginx/spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
