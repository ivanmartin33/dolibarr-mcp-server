# Dolibarr MCP Server

[![CI](https://github.com/ivanmartin33/dolibarr-mcp-server/workflows/CI/badge.svg)](https://github.com/ivanmartin33/dolibarr-mcp-server/actions/workflows/ci.yml)
[![Release](https://github.com/ivanmartin33/dolibarr-mcp-server/workflows/Release/badge.svg)](https://github.com/ivanmartin33/dolibarr-mcp-server/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Available-blue)](https://hub.docker.com/r/ivanmartin33/dolibarr-mcp-server)
[![npm](https://img.shields.io/npm/v/@dolibarr/n8n-nodes-dolibarr-mcp)](https://www.npmjs.com/package/@dolibarr/n8n-nodes-dolibarr-mcp)

A compliant [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that provides structured access to Dolibarr ERP/CRM API endpoints. Built with [Nitro](https://nitro.build/) and implementing the JSON-RPC 2.0 specification.

## Features

- ✅ **MCP Compliant**: Full implementation of the Model Context Protocol specification
- 🔧 **Complete CRUD Operations**: GET, POST, PUT, DELETE support for all Dolibarr endpoints
- 🚀 **Production Ready**: Built with Nitro for optimal performance and deployment flexibility
- 🔒 **Secure**: Environment-based configuration with API key authentication
- 📦 **Easy Integration**: Compatible with n8n, Claude, and other MCP clients
- 🌍 **Multi-runtime**: Supports Node.js, Bun, and Deno

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 9.0+
- Dolibarr instance with REST API enabled
- Valid Dolibarr API key

### Installation

```bash
# Clone the repository
git clone https://github.com/ivanmartin33/dolibarr-mcp-server.git
cd dolibarr-mcp-server

# Install dependencies
pnpm install

# Copy environment file for development
cp .env.example .env
# Edit .env with your Dolibarr configuration

# Start development server
pnpm run dev
```

### Environment Setup

#### Development
For development, create a `.env` file in your project root:

```env
NITRO_DOLI_URL=https://your-dolibarr-instance.com/api/index.php
NITRO_DOLI_KEY=your-dolibarr-api-key
NITRO_HOST=0.0.0.0
NITRO_PORT=3000
```

#### Production
In production, set environment variables at the system level. Nitro reads `.env` files only in development mode.

### Running the Server

```bash
# Development (uses .env file automatically)
pnpm run dev

# Production build
pnpm run build

# Start production server (basic - requires env vars)
pnpm run start

# Start production with env loading (recommended)
pnpm run start:prod        # Windows
pnpm run start:prod:linux  # Linux/macOS
```

The server will be available at `http://localhost:3000`

### Environment Variables Best Practices

1. **Development**: Use `.env` file (automatically loaded by Nitro)
2. **Production**: Use system environment variables or start scripts
3. **Docker**: Use Docker environment variables or `.env` file with docker-compose
4. **Never commit** real API keys to version control

## MCP Tools Available

The server exposes four main tools for interacting with Dolibarr:

### 1. dolibarr_get
Fetch data from Dolibarr API using GET method.

```json
{
  "name": "dolibarr_get",
  "arguments": {
    "endpoint": "thirdparties",
    "id": "1",
    "params": {
      "limit": "10"
    }
  }
}
```

### 2. dolibarr_post
Create new data in Dolibarr API using POST method.

```json
{
  "name": "dolibarr_post",
  "arguments": {
    "endpoint": "thirdparties",
    "data": {
      "name": "New Company",
      "client": 1
    }
  }
}
```

### 3. dolibarr_put
Update existing data in Dolibarr API using PUT method.

```json
{
  "name": "dolibarr_put",
  "arguments": {
    "endpoint": "thirdparties",
    "id": "1",
    "data": {
      "name": "Updated Company Name"
    }
  }
}
```

### 4. dolibarr_delete
Delete data from Dolibarr API using DELETE method.

```json
{
  "name": "dolibarr_delete",
  "arguments": {
    "endpoint": "thirdparties",
    "id": "1"
  }
}
```

## API Endpoints

### Main MCP Endpoint
- `POST /mcp` - Main JSON-RPC 2.0 endpoint for MCP communication

### Additional Endpoints
- `GET /mcp/describe` - Server information and tool descriptions
- `POST /mcp/tools/call` - Direct tool execution endpoint
- `GET /` - Landing page with server information

## MCP Protocol Examples

### Initialize Connection
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {},
    "id": 1
  }'
```

### List Available Tools
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 2
  }'
```

### Execute a Tool
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "dolibarr_get",
      "arguments": {
        "endpoint": "users"
      }
    },
    "id": 3
  }'
```

## Integration with n8n

The Dolibarr MCP Server can be easily integrated with n8n for workflow automation:

### Connection URLs
- **n8n in Docker**: `http://host.docker.internal:3000/mcp`
- **Local n8n**: `http://localhost:3000/mcp`

### Starting Server for Docker Access
```bash
NITRO_HOST=0.0.0.0 NITRO_PORT=3000 pnpm run dev
```

### HTTP Request Node Configuration

In your n8n workflow, add an **HTTP Request** node:

- **Method**: POST
- **URL**: `http://host.docker.internal:3000/mcp` (for Docker) or `http://localhost:3000/mcp` (local)
- **Headers**: 
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Body**:
  ```json
  {
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "dolibarr_get",
      "arguments": {
        "endpoint": "{{ $json.endpoint }}",
        "id": "{{ $json.id }}"
      }
    },
    "id": "{{ $runIndex }}"
  }
  ```

## Dolibarr Configuration

### API Setup in Dolibarr

1. **Enable REST API Module**:
   - Go to `Home > Setup > Modules/Applications`
   - Activate "Web services REST API"

2. **Create API User**:
   - Go to `Users & Groups`
   - Create a new user or select existing
   - Generate API key in user profile

3. **Set Permissions**:
   - Assign appropriate permissions to the API user
   - Recommended: Create dedicated API user with minimal required rights

### Common Dolibarr Endpoints

- `users` - User management
- `thirdparties` - Companies/customers
- `products` - Product catalog
- `orders` - Sales orders
- `invoices` - Customer invoices
- `proposals` - Commercial proposals
- `contracts` - Contracts
- `projects` - Project management

## Production Deployment

### Environment Variables

**Important**: In production, Nitro does not automatically read `.env` files. You must set environment variables at the system level.

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NITRO_DOLI_URL` | Dolibarr API base URL | ✅ | - |
| `NITRO_DOLI_KEY` | Dolibarr API key | ✅ | - |
| `NITRO_HOST` | Server host | ❌ | `localhost` |
| `NITRO_PORT` | Server port | ❌ | `3000` |

### Setting Environment Variables

#### Linux/macOS
```bash
export NITRO_DOLI_URL="https://your-dolibarr.com/api/index.php"
export NITRO_DOLI_KEY="your-api-key"
node .output/server/index.mjs
```

#### Windows PowerShell
```powershell
$env:NITRO_DOLI_URL="https://your-dolibarr.com/api/index.php"
$env:NITRO_DOLI_KEY="your-api-key"
node .output/server/index.mjs
```

#### Using Start Script (Recommended)
The repository includes production start scripts that automatically load variables from `.env` files:

```bash
# Linux/macOS
./scripts/start-production.sh

# Windows
PowerShell -ExecutionPolicy Bypass -File scripts/start-production.ps1
```

### Docker

#### Build and Run Manually
```bash
# Build the image
docker build -t dolibarr-mcp-server .

# Run with required environment variables
docker run -p 3000:3000 \
  -e NITRO_DOLI_URL="https://your-dolibarr.com/api/index.php" \
  -e NITRO_DOLI_KEY="your-api-key" \
  dolibarr-mcp-server
```

**Note**: The Docker image uses a multi-stage build for optimal size and includes automatic validation of required environment variables.

#### Using Docker Compose
Create a `.env` file in the same directory as `docker-compose.yml`:

```env
NITRO_DOLI_URL=https://your-dolibarr.com/api/index.php
NITRO_DOLI_KEY=your-api-key
```

Then run:
```bash
docker-compose up -d
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [Model Context Protocol Specification](https://modelcontextprotocol.io/specification/)
- [Dolibarr API Documentation](https://wiki.dolibarr.org/index.php/Module_Web_Services_API_REST_(developer))
- [Nitro Framework](https://nitro.build/)
- [n8n Workflow Automation](https://n8n.io/)