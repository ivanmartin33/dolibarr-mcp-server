#!/bin/bash

# Production start script for Dolibarr MCP Server
# This script loads environment variables from .env file if it exists
# and starts the production server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Dolibarr MCP Server (Production)${NC}"

# Check if .env file exists and load it
if [ -f ../.env ]; then
    echo -e "${YELLOW}Loading environment variables from .env file${NC}"
    # Export variables from .env file
    export $(grep -v '^#' ../.env | grep -v '^$' | xargs)
    echo -e "${GREEN}Environment variables loaded${NC}"
else
    echo -e "${YELLOW}No .env file found. Using system environment variables${NC}"
fi

# Check required environment variables
if [ -z "$NITRO_DOLI_URL" ]; then
    echo -e "${RED}Error: NITRO_DOLI_URL environment variable is required${NC}"
    exit 1
fi

if [ -z "$NITRO_DOLI_KEY" ]; then
    echo -e "${RED}Error: NITRO_DOLI_KEY environment variable is required${NC}"
    exit 1
fi

# Set default values for optional variables
export NITRO_HOST=${NITRO_HOST:-0.0.0.0}
export NITRO_PORT=${NITRO_PORT:-3000}

# Check if build exists
if [ ! -f ../.output/server/index.mjs ]; then
    echo -e "${RED}Error: Production build not found. Run 'pnpm build' first${NC}"
    exit 1
fi

echo -e "${GREEN}Starting server on ${NITRO_HOST}:${NITRO_PORT}${NC}"
echo -e "${YELLOW}Dolibarr URL: ${NITRO_DOLI_URL}${NC}"

# Change to parent directory and start the server
cd ..
node .output/server/index.mjs