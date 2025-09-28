#!/bin/bash

# Docker test script for Dolibarr MCP Server
# This script tests the Docker container functionality

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Testing Dolibarr MCP Server Docker Container${NC}"

# Test if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Change to parent directory for docker-compose
cd ..

# Stop any existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down || true

# Start the services
echo -e "${YELLOW}Starting Docker Compose services...${NC}"
docker-compose up -d --build

# Wait for the service to be ready
echo -e "${YELLOW}Waiting for service to be ready...${NC}"
sleep 10

# Test the MCP describe endpoint
echo -e "${YELLOW}Testing MCP describe endpoint...${NC}"
if curl -f -s "http://localhost:3000/mcp/describe" > /dev/null; then
    echo -e "${GREEN}✓ MCP describe endpoint is working${NC}"
else
    echo -e "${RED}✗ MCP describe endpoint failed${NC}"
    exit 1
fi

# Test the main MCP endpoint
echo -e "${YELLOW}Testing MCP JSON-RPC endpoint...${NC}"
if curl -f -s -X POST "http://localhost:3000/mcp" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' > /dev/null; then
    echo -e "${GREEN}✓ MCP JSON-RPC endpoint is working${NC}"
else
    echo -e "${RED}✗ MCP JSON-RPC endpoint failed${NC}"
    exit 1
fi

# Check container health
echo -e "${YELLOW}Checking container health...${NC}"
HEALTH=$(docker-compose ps --format json | jq -r '.[0].Health // "unknown"')
if [ "$HEALTH" = "healthy" ]; then
    echo -e "${GREEN}✓ Container is healthy${NC}"
else
    echo -e "${YELLOW}Container health: $HEALTH${NC}"
fi

# Show logs
echo -e "${YELLOW}Recent container logs:${NC}"
docker-compose logs --tail=10 dolibarr-mcp

echo -e "${GREEN}Docker test completed successfully!${NC}"
echo -e "${YELLOW}The server is running at http://localhost:3000${NC}"
echo -e "${YELLOW}Use 'docker-compose down' to stop the services${NC}"