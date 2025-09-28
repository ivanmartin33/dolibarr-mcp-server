# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a compliant Dolibarr MCP (Model Context Protocol) Server built with Nitro. It implements the JSON-RPC 2.0 based MCP specification to provide structured access to Dolibarr ERP/CRM API endpoints for AI-assisted development.

## Development Commands

- `pnpm run dev` - Start development server on http://localhost:3000
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run typecheck` - Check TypeScript types

For n8n Docker integration, start the server with host binding:
```bash
NITRO_HOST=0.0.0.0 NITRO_PORT=3000 pnpm run dev
```

## Architecture

- **Framework**: Nitro (TypeScript-based)
- **Protocol**: JSON-RPC 2.0 (MCP compliant)
- **Source Directory**: `server/` (configured in nitro.config.ts)
- **Package Manager**: Uses pnpm for package management and execution
- **Main Routes**:
  - `/` - Default homepage route
  - `/mcp` - Main MCP JSON-RPC endpoint (supports initialize, tools/list, tools/call)
  - `/mcp/describe` - HTTP GET endpoint for server information
  - `/mcp/tools/call` - Direct tool execution endpoint
  - `/mcp/proxy/[...path]` - Legacy HTTP proxy route (deprecated)

## Environment Configuration

The server requires these environment variables (configured in nitro.config.ts runtime config):
- `NITRO_DOLI_URL` - Dolibarr API base URL (default: "http://localhost/api/index.php")
- `NITRO_DOLI_KEY` - Dolibarr API key (default: "super_api_key")

For Docker/n8n integration:
- `NITRO_HOST` - Server host binding (use "0.0.0.0" for Docker access)
- `NITRO_PORT` - Server port (default: 3000)

## MCP Protocol Implementation

The server implements the following MCP methods via JSON-RPC 2.0:

### Initialization
```json
{"jsonrpc": "2.0", "method": "initialize", "params": {}, "id": 1}
```

### Tools Listing
```json
{"jsonrpc": "2.0", "method": "tools/list", "params": {}, "id": 2}
```

### Tool Execution
```json
{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "dolibarr_get", "arguments": {"endpoint": "thirdparties"}}, "id": 3}
```

## MCP Tools Provided

The server exposes four main tools:

1. **dolibarr_get** - Fetch data from Dolibarr API
   - Parameters: endpoint (required), id (optional), params (optional object)
   
2. **dolibarr_post** - Create new data in Dolibarr API
   - Parameters: endpoint (required), data (required object)
   
3. **dolibarr_put** - Update existing data in Dolibarr API
   - Parameters: endpoint (required), id (required), data (required object)
   
4. **dolibarr_delete** - Delete data from Dolibarr API
   - Parameters: endpoint (required), id (required)

## Code Structure

- `server/routes/index.ts` - Landing page handler
- `server/routes/mcp/index.ts` - Main MCP JSON-RPC endpoint with full tool implementations
- `server/routes/mcp/describe.ts` - Server description (HTTP GET) with duplicate tool implementations
- `server/routes/mcp/tools/call.ts` - Direct tool execution endpoint with hardcoded environment variables
- `server/routes/mcp/proxy/[...path].ts` - Legacy HTTP proxy (deprecated)

**Important**: The codebase has some inconsistencies:
- `server/routes/mcp/index.ts` uses `useRuntimeConfig()` for environment variables
- `server/routes/mcp/tools/call.ts` uses hardcoded `process.env` variables
- Both files implement similar tool logic but with different configuration approaches

## Dependencies and Package Management

- **Package Manager**: Uses pnpm for all dependencies and scripts
- **Key Dependencies**:
  - `nitropack` - Web server framework
  - `h3` - HTTP framework (used by Nitro)
  - `@types/node` - Node.js TypeScript definitions
  - `n8n-workflow` - n8n workflow types (for potential n8n integration)

## TypeScript Configuration

The project uses strict TypeScript settings with ESNext modules and bundler resolution. No auto-imports are configured (imports: false in nitro.config.ts).

## n8n Integration

The server is designed for n8n workflow integration:

### Connection URLs
- **n8n in Docker**: `http://host.docker.internal:3000/mcp`
- **Local n8n**: `http://localhost:3000/mcp`

### Required Headers
```json
{
  "Content-Type": "application/json"
}
```

### Common Troubleshooting
- Start server with `NITRO_HOST=0.0.0.0` for Docker access
- Use machine IP instead of localhost for Docker networking issues
- Set adequate timeout (60s) for HTTP requests in n8n

## Technology Documentation References

### Model Context Protocol (MCP)
- **Official Specification**: https://modelcontextprotocol.io/specification/2025-06-18
- **GitHub Repository**: https://github.com/modelcontextprotocol/modelcontextprotocol
- **Key Concepts**:
  - JSON-RPC 2.0 based protocol for LLM-external system communication
  - Three main components: Tools (model-controlled actions), Resources (context data), Prompts (user interactions)
  - Security-first design with explicit user consent and data privacy protection
  - Supports sampling, roots, elicitation, and various utilities (progress, cancellation, logging)

### Nitro Framework
- **Official Documentation**: https://nitro.build/guide
- **Key Features**:
  - Open-source web server framework built on h3
  - Automatic routing via `server/routes/` and `server/api/` directories
  - Multi-runtime support (Node.js, Bun, Deno)
  - Built-in TypeScript support with flexible configuration
  - Production-ready builds in `.output` directory

### Dolibarr API
- **API Explorer**: Available at `/api/index.php/explorer` on Dolibarr instances
- **Wiki Documentation**: https://wiki.dolibarr.org/index.php/Module_Web_Services_API_REST_(developer)
- **Key Information**:
  - REST API available since Dolibarr 7.0+
  - Authentication via `DOLAPIKEY` header with user-generated API tokens
  - Standard HTTP methods: GET, POST, PUT, DELETE
  - Common endpoints: `/thirdparties`, `/products`, `/orders`, `/invoices`, `/users`
  - Built-in Swagger documentation for testing and exploration
  - Requires dedicated API users with appropriate permissions for security