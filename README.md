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

# Copy environment file
cp .env.example .env
# Edit .env with your Dolibarr configuration

# Start development server
pnpm run dev
```

### Environment Setup

Create a `.env` file in your project root:

```env
DOLI_URL=https://your-dolibarr-instance.com/api/index.php
DOLI_KEY=your-dolibarr-api-key
```

### Running the Server

```bash
# Development
pnpm run dev

# Production build
pnpm run build

# Start production server
pnpm run start
```

The server will be available at `http://localhost:3000`

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

| Variable | Description | Default |
|----------|-------------|---------|
| `NITRO_DOLI_URL` | Dolibarr API base URL | `http://localhost/api/index.php` |
| `NITRO_DOLI_KEY` | Dolibarr API key | `super_api_key` |
| `NITRO_HOST` | Server host | `localhost` |
| `NITRO_PORT` | Server port | `3000` |

### Docker

```dockerfile
FROM node:18-alpine

# Enable corepack for pnpm
RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY . .
RUN pnpm run build

ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  dolibarr-mcp:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NITRO_DOLI_URL=http://host.docker.internal:4000/api/index.php
      - NITRO_DOLI_KEY=your-api-key
      - NITRO_HOST=0.0.0.0
      - NITRO_PORT=3000
    restart: unless-stopped
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [Model Context Protocol Specification](https://modelcontextprotocol.io/specification/)
- [Dolibarr API Documentation](https://wiki.dolibarr.org/index.php/Module_Web_Services_API_REST_(developer))
- [Nitro Framework](https://nitro.build/)
- [n8n Workflow Automation](https://n8n.io/)