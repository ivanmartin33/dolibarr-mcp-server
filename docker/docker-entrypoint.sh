#!/bin/sh

# Docker entrypoint script for Dolibarr MCP Server
# Validates required environment variables and starts the server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Dolibarr MCP Server${NC}"

# Validate required environment variables
if [ -z "$NITRO_DOLI_URL" ]; then
    echo -e "${RED}Error: NITRO_DOLI_URL environment variable is required${NC}"
    echo -e "${YELLOW}Example: docker run -e NITRO_DOLI_URL=https://your-dolibarr.com/api/index.php ...${NC}"
    exit 1
fi

if [ -z "$NITRO_DOLI_KEY" ]; then
    echo -e "${RED}Error: NITRO_DOLI_KEY environment variable is required${NC}"
    echo -e "${YELLOW}Example: docker run -e NITRO_DOLI_KEY=your-api-key ...${NC}"
    exit 1
fi

echo -e "${GREEN}Configuration validated${NC}"
echo -e "${YELLOW}Server: ${NITRO_HOST}:${NITRO_PORT}${NC}"
echo -e "${YELLOW}Dolibarr: ${NITRO_DOLI_URL}${NC}"

# Start the server
exec "$@"