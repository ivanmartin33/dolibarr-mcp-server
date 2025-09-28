# Dolibarr MCP n8n Nodes

This package contains custom n8n nodes for interacting with the Dolibarr MCP Server.

## Installation

### Option 1: Local Development Installation

1. Build the package:
```bash
cd n8n-nodes
npm install
npm run build
```

2. Link the package locally:
```bash
npm link
```

3. In your n8n installation, link the package:
```bash
cd ~/.n8n
npm link @dolibarr/n8n-nodes-dolibarr-mcp
```

### Option 2: Installation via n8n Interface

1. Access your n8n instance settings
2. Go to "Community Nodes"
3. Install the package: `@dolibarr/n8n-nodes-dolibarr-mcp`

## Available Nodes

### 1. Dolibarr (MCP)
Specialized node for Dolibarr with user-friendly interface:
- **Operations**: Get, Create, Update, Delete
- **Predefined Endpoints**: Third Parties, Products, Users, Invoices, etc.
- **Simplified Interface** for common operations

### 2. MCP Client
Generic node for interacting with any MCP server:
- **Automatic Discovery** of available tools
- **Dynamic Execution** of MCP tools
- **Compatible** with all compliant MCP servers

## Configuration

1. **Start the Dolibarr MCP Server**:
```bash
# From the project root directory
NITRO_HOST=0.0.0.0 npm run dev
```

2. **Configure the nodes**:
   - MCP Server URL: `http://host.docker.internal:3000/mcp` (for n8n in Docker)
   - Or: `http://localhost:3000/mcp` (for local n8n)

## Usage Examples

### Get all third parties (customers/suppliers)
```json
{
  "operation": "get",
  "endpoint": "thirdparties"
}
```

### Create a new customer
```json
{
  "operation": "create",
  "endpoint": "thirdparties",
  "data": {
    "name": "New Company",
    "client": 1
  }
}
```

### Update an existing customer
```json
{
  "operation": "update",
  "endpoint": "thirdparties",
  "resourceId": "123",
  "data": {
    "name": "Updated Company"
  }
}
```

## Troubleshooting

### Connection Error
1. Verify the MCP server is running
2. Use `NITRO_HOST=0.0.0.0` for Docker
3. Test with curl:
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "params": {}, "id": 1}'
```

### Dependency Issues
```bash
npm install --legacy-peer-deps
```

## Development

### Build
```bash
npm run build
```

### Watch mode
```bash
npm run dev
```

### Lint
```bash
npm run lint
```