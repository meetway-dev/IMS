# IMS - Inventory Management System
# Production-Ready Dockerfile for Next.js Frontend
# Author: DevOps Team
# Version: 2.0.0

# ============================================
# Base Stage - Common dependencies
# ============================================
FROM node:20-alpine AS base

# Install dumb-init for proper signal handling and wget for health checks
RUN apk add --no-cache dumb-init wget

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \
    PORT=3001 \
    # Disable telemetry
    NEXT_TELEMETRY_DISABLED=1 \
    # Improve npm performance
    npm_config_update_notifier=false \
    npm_config_fund=false \
    npm_config_audit=false \
    npm_config_loglevel=warn \
    # Next.js specific optimizations
    NEXT_PRIVATE_SKIP_VALIDATION=1

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
RUN npm install --legacy-peer-deps && \
    npm cache clean --force

# ============================================
# Builder Stage - Build the application
# ============================================
FROM base AS builder

# Set build environment to development to ensure devDependencies are installed
ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1

# Copy package files (only package.json to ensure fresh install)
COPY package.json ./

# Install all dependencies including dev dependencies for build
RUN npm install --legacy-peer-deps && \
    npm cache clean --force

# Set build environment to production for proper build behavior
ENV NODE_ENV=production

# Copy source code explicitly
COPY src ./src
COPY tsconfig.json next.config.js postcss.config.js tailwind.config.ts ./

# Copy environment file for build (create from example if needed)
COPY .env.local.example .env.local

# Verify source files were copied correctly
RUN ls -la src/ && \
    ls -la src/components/ui/ && \
    ls -la src/hooks/

# Verify dev dependencies are available
RUN ls -la node_modules/ | grep -E "(tailwindcss|autoprefixer|postcss)" || (echo "Required CSS modules not found" && exit 1)

# Build the application with standalone output for smaller image
RUN npm run build

# ============================================
# Production Stage - Minimal runtime image
# ============================================
FROM base AS production

# Copy package files for production dependencies only
COPY package*.json ./

# Install all dependencies (including dev) for Next.js to work properly
# Next.js needs dev dependencies like tailwindcss, autoprefixer, postcss for runtime
RUN npm install --legacy-peer-deps && \
    npm cache clean --force

# Copy built application from builder
# Next.js standalone mode includes only necessary files
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001 || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run the application
CMD ["node", "server.js"]

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
EXPOSE 3001

# Run in development mode
CMD ["npm", "run", "dev"]
