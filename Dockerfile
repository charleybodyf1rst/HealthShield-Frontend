# syntax=docker/dockerfile:1

# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Dependencies stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables
ARG NEXT_PUBLIC_API_URL=https://systemsf1rst-backend-887571186773.us-central1.run.app
ARG NEXT_PUBLIC_BUILD_ID=dev
ARG NEXT_PUBLIC_REVERB_APP_KEY=""
ARG NEXT_PUBLIC_REVERB_HOST=""
ARG NEXT_PUBLIC_BANANABOAT_ORG_ID=100
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_BUILD_ID=${NEXT_PUBLIC_BUILD_ID}
ENV NEXT_PUBLIC_REVERB_APP_KEY=${NEXT_PUBLIC_REVERB_APP_KEY}
ENV NEXT_PUBLIC_REVERB_HOST=${NEXT_PUBLIC_REVERB_HOST}
ENV NEXT_PUBLIC_BANANABOAT_ORG_ID=${NEXT_PUBLIC_BANANABOAT_ORG_ID}
ENV NEXT_PUBLIC_REVERB_PORT=443
ENV NEXT_PUBLIC_REVERB_SCHEME=https
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
