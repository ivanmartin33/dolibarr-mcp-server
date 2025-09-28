# Docker test script for Dolibarr MCP Server (PowerShell)
# This script tests the Docker container functionality

param(
    [switch]$Help
)

if ($Help) {
    Write-Host "Docker Test Script for Dolibarr MCP Server"
    Write-Host ""
    Write-Host "Usage: PowerShell -ExecutionPolicy Bypass -File test-docker.ps1"
    Write-Host ""
    Write-Host "This script:"
    Write-Host "  1. Stops any existing containers"
    Write-Host "  2. Builds and starts the Docker services"
    Write-Host "  3. Tests the MCP endpoints"
    Write-Host "  4. Checks container health"
    return
}

Write-Host "Testing Dolibarr MCP Server Docker Container" -ForegroundColor Green

# Test if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Error: Docker is not running" -ForegroundColor Red
    exit 1
}

# Change to parent directory for docker-compose
Set-Location ..

# Stop any existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose down 2>$null

# Start the services
Write-Host "Starting Docker Compose services..." -ForegroundColor Yellow
docker-compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start Docker services" -ForegroundColor Red
    exit 1
}

# Wait for the service to be ready
Write-Host "Waiting for service to be ready..." -ForegroundColor Yellow
Start-Sleep 10

# Test the MCP describe endpoint
Write-Host "Testing MCP describe endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/mcp/describe" -TimeoutSec 5
    Write-Host "✓ MCP describe endpoint is working" -ForegroundColor Green
} catch {
    Write-Host "✗ MCP describe endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test the main MCP endpoint
Write-Host "Testing MCP JSON-RPC endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        jsonrpc = "2.0"
        id = 1
        method = "tools/list"
        params = @{}
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/mcp" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5
    Write-Host "✓ MCP JSON-RPC endpoint is working" -ForegroundColor Green
} catch {
    Write-Host "✗ MCP JSON-RPC endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check container status
Write-Host "Checking container status..." -ForegroundColor Yellow
$containerStatus = docker-compose ps --format json | ConvertFrom-Json
if ($containerStatus.State -eq "running") {
    Write-Host "✓ Container is running" -ForegroundColor Green
} else {
    Write-Host "Container status: $($containerStatus.State)" -ForegroundColor Yellow
}

# Show logs
Write-Host "Recent container logs:" -ForegroundColor Yellow
docker-compose logs --tail=10 dolibarr-mcp

Write-Host "Docker test completed successfully!" -ForegroundColor Green
Write-Host "The server is running at http://localhost:3000" -ForegroundColor Yellow
Write-Host "Use 'docker-compose down' to stop the services" -ForegroundColor Yellow