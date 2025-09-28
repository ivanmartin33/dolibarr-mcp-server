# Environment Variables Configuration - Changes Summary

This document summarizes the corrections made to handle environment variables properly according to Nitro best practices.

## Problem Identified

Nitro only reads `.env` files automatically in **development mode**. In production, after `nitro build`, the runtime configuration is inlined during build time and `.env` files are ignored.

## Changes Made

### 1. Documentation Updates (`README.md`)

- **Environment Setup**: Clarified difference between development (`.env` file) and production (system variables)
- **Production Deployment**: Added comprehensive section with examples for different platforms
- **Docker Documentation**: Updated with proper environment variable handling
- **Best Practices**: Added section explaining when to use `.env` vs system variables

### 2. Configuration Files

#### `.env.example`
- Added comprehensive comments explaining development vs production usage
- Clarified that `.env` is only for development
- Added security warnings about not committing real credentials

#### `nitro.config.ts`
- Kept default values for development convenience
- Added comments explaining override behavior

### 3. Production Scripts

#### `start-production.sh` (Linux/macOS)
- Loads variables from `.env` file if present
- Validates required environment variables
- Provides colored output and error handling
- Sets sensible defaults for optional variables

#### `start-production.ps1` (Windows PowerShell)
- Same functionality as Linux script but for Windows
- Includes help parameter
- Better error messages with examples
- Robust error handling

### 4. Docker Configuration

#### `Dockerfile`
- Removed hardcoded sensitive environment variables
- Added validation entrypoint script
- Added comments explaining runtime requirements
- Made scripts executable during build

#### `docker-entrypoint.sh`
- Validates required environment variables at container startup
- Provides clear error messages with examples
- Prevents container from starting with invalid config

#### `docker-compose.yml`
- Removed default values for sensitive variables
- Added comments explaining required vs optional variables
- Made it clear that variables must be provided

### 5. Package.json Scripts

Added convenience scripts:
- `start:prod` - Windows production start with env loading
- `start:prod:linux` - Linux/macOS production start with env loading

## Usage Instructions

### Development
1. Copy `.env.example` to `.env`
2. Edit `.env` with your configuration
3. Run `pnpm dev` (automatically loads `.env`)

### Production

#### Option 1: System Environment Variables
```bash
export NITRO_DOLI_URL="https://your-dolibarr.com/api/index.php"
export NITRO_DOLI_KEY="your-api-key"
pnpm build
pnpm start
```

#### Option 2: Using Start Scripts (Recommended)
```bash
# Create .env file with production values
pnpm build
pnpm run start:prod        # Windows
pnpm run start:prod:linux  # Linux/macOS
```

#### Option 3: Docker
```bash
# Using environment variables
docker run -e NITRO_DOLI_URL="..." -e NITRO_DOLI_KEY="..." dolibarr-mcp

# Using docker-compose with .env file
docker-compose up
```

## Security Benefits

1. **No hardcoded credentials** in Docker images
2. **Clear separation** between development and production configuration
3. **Validation** of required variables at startup
4. **Proper error messages** when configuration is missing
5. **Following Nitro best practices** for environment handling

## Validation

The configuration has been tested to ensure:
- Development mode works with `.env` files
- Production mode works with system environment variables
- Docker containers fail fast with clear error messages when misconfigured
- Start scripts properly load and validate configuration