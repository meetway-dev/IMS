# Base Stage
FROM node:20-alpine AS base
RUN apk add --no-cache dumb-init wget
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3001 \
    npm_config_update_notifier=false \
    npm_config_fund=false \
    npm_config_audit=false \
    npm_config_loglevel=warn
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Builder Stage
FROM base AS builder
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps && \
    npm cache clean --force

ENV NODE_ENV=production
COPY src ./src
COPY tsconfig.json next.config.js postcss.config.js tailwind.config.ts ./
RUN npm run build

# Production Stage
FROM base AS production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps --ignore-scripts && \
    npm cache clean --force

COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001 || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
