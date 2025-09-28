# Multi-stage build for smaller production image
FROM node:18-alpine AS builder

# Enable corepack for pnpm
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:18-alpine AS production

# Install wget for healthcheck
RUN apk add --no-cache wget

# Enable corepack for pnpm
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder stage
COPY --from=builder /app/.output ./.output

# Copy entrypoint script
COPY docker/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Set default environment variables (override at runtime)
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
# Required variables - must be provided at runtime:
# ENV NITRO_DOLI_URL=https://your-dolibarr.com/api/index.php
# ENV NITRO_DOLI_KEY=your-api-key

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/mcp/describe || exit 1

# Set entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]

# Start the application
CMD ["node", ".output/server/index.mjs"]