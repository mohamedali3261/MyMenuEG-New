# ============================================
# Backend Dockerfile
# Multi-stage: Build TypeScript → Run compiled
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files (monorepo)
COPY package.json package-lock.json ./

# Copy backend source
COPY backend/server ./backend/server

# Install all deps (includes devDeps for tsc)
RUN npm ci

# Build TypeScript → dist-server
WORKDIR /app/backend/server
RUN npx prisma generate
WORKDIR /app
RUN npx tsc -b backend/server/tsconfig.json

# Stage 2: Production image
FROM node:20-alpine AS production

WORKDIR /app

# Install only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/backend/dist-server ./backend/dist-server

# Copy Prisma schema + generated client
COPY --from=builder /app/backend/server/prisma ./backend/server/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy public uploads folder (if exists)
COPY backend/public ./backend/public

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Start server
CMD ["node", "backend/dist-server/index.js"]
