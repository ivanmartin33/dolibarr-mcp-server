# Production start script for Dolibarr MCP Server (Windows PowerShell)
# This script loads environment variables from .env file if it exists
# and starts the production server

param(
    [switch]$Help
)

if ($Help) {
    Write-Host "Dolibarr MCP Server - Production Start Script" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: PowerShell -ExecutionPolicy Bypass -File start-production.ps1"
    Write-Host ""
    Write-Host "This script:"
    Write-Host "  1. Loads environment variables from .env file (if exists)"
    Write-Host "  2. Validates required variables"
    Write-Host "  3. Starts the production server"
    Write-Host ""
    Write-Host "Required environment variables:"
    Write-Host "  NITRO_DOLI_URL - Dolibarr API base URL"
    Write-Host "  NITRO_DOLI_KEY - Dolibarr API key"
    return
}

Write-Host "Starting Dolibarr MCP Server (Production)" -ForegroundColor Green

# Load environment variables from .env file if it exists
if (Test-Path "../.env") {
    Write-Host "Loading environment variables from .env file" -ForegroundColor Yellow
    Get-Content "../.env" | ForEach-Object {
        if ($_ -match "^([^#=]+)=(.*)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"').Trim("'")
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "Set environment variable: $name" -ForegroundColor Cyan
        }
    }
    Write-Host "Environment variables loaded" -ForegroundColor Green
} else {
    Write-Host "No .env file found. Using system environment variables" -ForegroundColor Yellow
}

# Validate required environment variables
if (-not $env:NITRO_DOLI_URL) {
    Write-Host "Error: NITRO_DOLI_URL environment variable is required" -ForegroundColor Red
    Write-Host "Example: `$env:NITRO_DOLI_URL='https://your-dolibarr.com/api/index.php'" -ForegroundColor Yellow
    exit 1
}

if (-not $env:NITRO_DOLI_KEY) {
    Write-Host "Error: NITRO_DOLI_KEY environment variable is required" -ForegroundColor Red
    Write-Host "Example: `$env:NITRO_DOLI_KEY='your-api-key'" -ForegroundColor Yellow
    exit 1
}

# Set default values for optional variables
if (-not $env:NITRO_HOST) { $env:NITRO_HOST = "0.0.0.0" }
if (-not $env:NITRO_PORT) { $env:NITRO_PORT = "3000" }

# Check if build exists
if (-not (Test-Path "../.output/server/index.mjs")) {
    Write-Host "Error: Production build not found. Run 'pnpm build' first" -ForegroundColor Red
    exit 1
}

Write-Host "Starting server on $env:NITRO_HOST`:$env:NITRO_PORT" -ForegroundColor Green
Write-Host "Dolibarr URL: $env:NITRO_DOLI_URL" -ForegroundColor Yellow

# Change to parent directory and start the server
Set-Location ..
try {
    node .output/server/index.mjs
} catch {
    Write-Host "Failed to start server: $_" -ForegroundColor Red
    exit 1
}