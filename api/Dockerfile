# IMS - Inventory Management System
# Production-Ready Dockerfile for NestJS API
# Author: DevOps Team
# Version: 2.0.0

# ============================================
# Base Stage - Common dependencies
# ============================================
FROM node:20-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init wget

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \
    PORT=8080 \
    # Disable telemetry
    NEXT_TELEMETRY_DISABLED=1 \
    # Improve npm performance
    npm_config_update_notifier=false \
    npm_config_fund=false \
    npm_config_audit=false \
    npm_config_loglevel=warn

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# ============================================
# Dependencies Stage - Install dependencies
# ============================================
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --ignore-scripts && \
    npm cache clean --force

# ============================================
# Builder Stage - Build the application
# ============================================
FROM dependencies AS builder

# Set build environment
ENV NODE_ENV=development \
    PATH=/app/node_modules/.bin:$PATH

# Install dev dependencies for building
RUN npm ci --ignore-scripts && \
    npm cache clean --force

# Copy source code
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build the application using nest CLI
RUN nest build

# Verify build output
RUN ls -la dist && \
    test -f dist/src/main.js || (echo "Build failed: dist/src/main.js not found" && exit 1)

# ============================================
# Production Stage - Minimal runtime image
# ============================================
FROM base AS production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

# Copy Prisma client and migrations from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma.config.ts ./

# Copy docker entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/health/live || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]

# ============================================
# Development Stage - For local development
# ============================================
FROM base AS development

# Install development dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Run in development mode
CMD ["npm", "run", "start:dev"]
