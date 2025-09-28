FROM node:18-alpine

# Enable corepack for pnpm
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Set environment variables
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
ENV NITRO_DOLI_URL=http://localhost/api/index.php
ENV NITRO_DOLI_KEY=super_api_key

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/mcp/describe || exit 1

# Start the application
CMD ["node", ".output/server/index.mjs"]