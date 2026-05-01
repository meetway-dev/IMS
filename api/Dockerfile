# Base Stage
FROM node:20-alpine AS base
RUN apk add --no-cache dumb-init wget
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080 \
    npm_config_update_notifier=false \
    npm_config_fund=false \
    npm_config_audit=false \
    npm_config_loglevel=warn
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Shared Package Build
FROM base AS shared-builder
COPY shared/package.json shared/tsconfig.json ./shared/
COPY shared/src ./shared/src
WORKDIR /app/shared
RUN npm install --include=dev && \
    npm run build && \
    npm cache clean --force

# Builder Stage
FROM base AS builder
ARG DATABASE_URL
ENV NODE_ENV=development \
    PATH=/app/node_modules/.bin:$PATH \
    DATABASE_URL=${DATABASE_URL}
COPY api/package*.json ./
RUN npm ci && \
    npm cache clean --force

COPY --from=shared-builder /app/shared/dist ./node_modules/@ims/shared
COPY shared/package.json ./node_modules/@ims/shared/package.json

COPY api/prisma ./prisma
COPY api/prisma.config.ts ./
COPY api/tsconfig.json api/tsconfig.build.json api/nest-cli.json ./
COPY api/src ./src
RUN npx prisma generate --schema=./prisma/schema.prisma && \
    nest build && \
    npx tsc

# Production Stage
FROM base AS production
COPY api/package*.json ./
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

COPY --from=shared-builder /app/shared/dist ./node_modules/@ims/shared
COPY shared/package.json ./node_modules/@ims/shared/package.json
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma.config.ts ./

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/health/live || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
